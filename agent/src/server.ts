import { createServer, IncomingMessage, ServerResponse } from "http";
import { IMessageSDK } from "@photon-ai/imessage-kit";
import { normalizePhone, CORS_HEADERS } from "./utils.js";

export class MessageServer {
  private sdk: IMessageSDK;
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;

  constructor(port = 3456) {
    this.sdk = new IMessageSDK();
    this.port = port;
  }

  private async parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });
      req.on("error", reject);
    });
  }

  private sendJson(res: ServerResponse, status: number, data: any): void {
    res.writeHead(status, { "Content-Type": "application/json", ...CORS_HEADERS });
    res.end(JSON.stringify(data));
  }

  private async handleSendMessage(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const { phoneNumber, message } = await this.parseBody(req);
      if (!phoneNumber) {
        this.sendJson(res, 400, { success: false, error: "phoneNumber required" });
        return;
      }
      if (!message) {
        this.sendJson(res, 400, { success: false, error: "message required" });
        return;
      }

      const phone = normalizePhone(phoneNumber);
      const result = await this.sdk.send(phone, message);
      this.sendJson(res, 200, { success: true, sentAt: result.sentAt.toISOString() });
    } catch (err: any) {
      console.error("Send error:", err);
      this.sendJson(res, 500, { success: false, error: err.message || "Failed" });
    }
  }

  async sendExternal(phoneNumber: string, message: string): Promise<void> {
    const phone = normalizePhone(phoneNumber);
    await this.sdk.send(phone, message);
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = req.url || "/";
    const method = req.method || "GET";

    if (method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    if (url === "/api/send" && method === "POST") {
      await this.handleSendMessage(req, res);
    } else if (url === "/api/health" && method === "GET") {
      this.sendJson(res, 200, { status: "ok" });
    } else if (url === "/" && method === "GET") {
      this.sendJson(res, 200, { service: "Photon Agent", endpoints: ["/api/send", "/api/health"] });
    } else {
      this.sendJson(res, 404, { error: "Not found" });
    }
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = createServer((req, res) => {
        this.handleRequest(req, res).catch(() => this.sendJson(res, 500, { error: "Server error" }));
      });
      this.server.listen(this.port, () => {
        console.log(`API server on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((r) => this.server!.close(() => r()));
    }
    await this.sdk.close();
  }
}
