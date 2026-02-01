import { IMessageSDK } from "@photon-ai/imessage-kit";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { config } from "./config.js";
import { normalizePhone, isReactionMessage, isImageFile, getMimeType } from "./utils.js";
import type { ReceivedMessage } from "./types.js";

export class MessageListener {
  private sdk: IMessageSDK;
  private monitoredPhone: string;
  private normalizedMonitoredPhone: string;
  private processedIds: Set<string> = new Set();
  private startTime: Date;

  constructor(monitoredPhone?: string) {
    this.monitoredPhone = monitoredPhone || config.MONITORED_PHONE;
    this.normalizedMonitoredPhone = this.monitoredPhone ? normalizePhone(this.monitoredPhone) : "";
    this.sdk = new IMessageSDK();
    this.startTime = new Date();
    console.log(`MessageListener initialized at ${this.startTime.toISOString()}`);
  }

  private isFromMonitoredPhone(sender: string): boolean {
    if (!this.normalizedMonitoredPhone) return true;
    return normalizePhone(sender) === this.normalizedMonitoredPhone;
  }

  async getNewMessages(): Promise<ReceivedMessage[]> {
    const newMessages: ReceivedMessage[] = [];

    try {
      const result = await this.sdk.getMessages({ limit: 50, excludeOwnMessages: true });

      for (const msg of result.messages) {
        const msgId = msg.guid || String(msg.id);
        if (!msgId || this.processedIds.has(msgId)) continue;

        // CRITICAL: Ignore historical messages (only process messages after startup)
        if (msg.date < this.startTime) {
          this.processedIds.add(msgId);
          continue;
        }

        // Ignore reactions/tapbacks
        const text = msg.text || "";
        if (isReactionMessage(text)) {
          this.processedIds.add(msgId);
          continue;
        }

        const sender = msg.sender || "";
        if (!sender || !this.isFromMonitoredPhone(sender) || msg.isFromMe) {
          this.processedIds.add(msgId);
          continue;
        }

        const hasAttachments = msg.attachments && msg.attachments.length > 0;

        // Text-only message
        if (!hasAttachments && msg.text) {
          newMessages.push({ messageId: msgId, senderPhone: sender, receivedAt: msg.date, text: msg.text });
          this.processedIds.add(msgId);
          console.log(`New text from ${sender}: ${msg.text.slice(0, 40)}...`);
          continue;
        }

        // Image attachments - process asynchronously
        if (hasAttachments) {
          for (const attachment of msg.attachments!) {
            if (!isImageFile(attachment.filename)) continue;

            const imagePath = attachment.path;
            if (!imagePath || !existsSync(imagePath)) continue;

            try {
              const imageData = await readFile(imagePath);
              const mimeType = getMimeType(attachment.filename!);
              newMessages.push({
                messageId: msgId,
                senderPhone: sender,
                receivedAt: msg.date,
                imagePath,
                imageData,
                mimeType,
                text: msg.text || undefined,
              });
              this.processedIds.add(msgId);
              console.log(`New receipt from ${sender}: ${attachment.filename}`);
              break; // Only process first image per message
            } catch (err) {
              console.error(`Failed to read image:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }

    return newMessages;
  }

  markProcessed(messageId: string): void {
    this.processedIds.add(messageId);
  }

  loadProcessedIds(ids: Set<string>): void {
    ids.forEach((id) => this.processedIds.add(id));
    console.log(`Loaded ${ids.size} previously processed message IDs`);
  }

  async close(): Promise<void> {
    await this.sdk.close();
  }
}
