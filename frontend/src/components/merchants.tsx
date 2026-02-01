import { useState, useCallback, useEffect } from "react";
import { MdAdd } from 'react-icons/md';

// Import merchant logos - Only active merchants from active_merchants.csv
import UberLogo from '../public/Uber.svg';
import SpotifyLogo from '../public/Spotify.svg';
import DoordashLogo from '../public/DoorDash.svg';
import GrubhubLogo from '../public/Grubhub.svg';
import AmazonLogo from '../public/Amazon.svg';
import AppleLogo from '../public/Apple.svg';

interface ConnectedMerchant {
    merchant_id: number;
    name: string;
    logo_url?: string;
    top_of_file_payment: string;
    connected_at?: string;
    last_transaction_at?: string;
}

interface MerchantInfo {
    id: number;
    name: string;
    logo: string;
    bgColor: string;
}

// Active merchants from active_merchants.csv - matched with Knot API IDs
const MERCHANT_DATA: MerchantInfo[] = [
    { id: 10, name: "Uber", logo: UberLogo, bgColor: "#000000" },
    { id: 13, name: "Spotify", logo: SpotifyLogo, bgColor: "#1DB954" },
    { id: 19, name: "DoorDash", logo: DoordashLogo, bgColor: "#FF3008" },
    { id: 38, name: "Grubhub", logo: GrubhubLogo, bgColor: "#F63440" },
    { id: 44, name: "Amazon", logo: AmazonLogo, bgColor: "#FF9900" },
    { id: 60, name: "Apple", logo: AppleLogo, bgColor: "#000000" },
];

const PAYMENT_METHODS = [
    { value: "paypal", label: "PayPal", icon: "💳" },
    { value: "visa", label: "Visa", icon: "💳" },
    { value: "mastercard", label: "Mastercard", icon: "💳" },
    { value: "amex", label: "Amex", icon: "💳" },
    { value: "discover", label: "Discover", icon: "💳" },
];

export default function Merchants() {
    const [clientId, setClientId] = useState("");
    const [merchantId, setMerchantId] = useState("");
    const [userId] = useState("aman");
    const [product] = useState("transaction_link");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Ready");
    const [connectedMerchants, setConnectedMerchants] = useState<ConnectedMerchant[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    const PYTHON_SERVER_URL = "http://localhost:5001";

    // Fetch client ID and connected merchants
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [configRes, merchantsRes] = await Promise.all([
                    fetch(`${PYTHON_SERVER_URL}/api/knot/config`),
                    fetch(`${PYTHON_SERVER_URL}/api/merchants?user_id=${userId}`)
                ]);

                const configData = await configRes.json();
                if (configData.client_id) {
                    setClientId(configData.client_id);
                }

                const merchantsData = await merchantsRes.json();
                setConnectedMerchants(merchantsData.merchants || []);
            } catch (err) {
                console.error("Failed to fetch initial data:", err);
            }
        };
        fetchInitialData();
    }, [userId]);

    const refreshMerchants = async () => {
        try {
            const res = await fetch(`${PYTHON_SERVER_URL}/api/merchants?user_id=${userId}`);
            const data = await res.json();
            setConnectedMerchants(data.merchants || []);
        } catch (err) {
            console.error("Failed to refresh merchants:", err);
        }
    };

    const saveMerchantToBackend = async (merchantIdNum: number, merchantName: string) => {
        try {
            await fetch(`${PYTHON_SERVER_URL}/api/merchants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    merchant_id: merchantIdNum,
                    name: merchantName
                })
            });
            await refreshMerchants();
        } catch (err) {
            console.error("Failed to save merchant:", err);
        }
    };

    const updatePaymentMethod = async (merchantIdNum: number, paymentMethod: string) => {
        try {
            await fetch(`${PYTHON_SERVER_URL}/api/merchants/${merchantIdNum}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    payment_method: paymentMethod
                })
            });
            await refreshMerchants();
        } catch (err) {
            console.error("Failed to update payment:", err);
        }
    };

    const launchKnotSDK = useCallback(async (merchantIdOverride?: number, merchantName?: string) => {
        const targetMerchantId = merchantIdOverride?.toString() || merchantId;

        if (!clientId.trim()) {
            setError("Client ID not loaded from backend");
            return;
        }
        if (!targetMerchantId.trim()) {
            setError("Please enter a Merchant ID");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setStatus("Creating session...");

            const response = await fetch(`${PYTHON_SERVER_URL}/api/knot/create-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    product: product
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.error_message || "Failed to create session");
            }

            const sid = data.session_id || data.session;
            setSessionId(sid);
            setStatus("Session created, launching SDK...");

            const KnotapiJS = (await import("knotapi-js")).default;
            const knotapi = new KnotapiJS();

            knotapi.open({
                sessionId: sid,
                clientId: clientId,
                environment: "production",
                product: product as any,
                merchantIds: [parseInt(targetMerchantId)],
                entryPoint: "test",
                onEvent: (eventData: any) => {
                    console.log("🔹 SDK Event:", eventData);
                    setStatus(`Event: ${JSON.stringify(eventData)}`);
                },
                onSuccess: async (successData: any) => {
                    console.log("Success:", successData);
                    setStatus("Success! Merchant connected.");
                    // Save to Snowflake
                    await saveMerchantToBackend(
                        parseInt(targetMerchantId),
                        merchantName || `Merchant ${targetMerchantId}`
                    );
                    setLoading(false);
                    setShowAddModal(false);
                },
                onError: (err: any) => {
                    console.error("Error:", err);
                    setError(`SDK Error: ${JSON.stringify(err)}`);
                    setLoading(false);
                },
                onExit: () => {
                    setStatus("SDK closed");
                    setLoading(false);
                },
            });
        } catch (err) {
            console.error("Launch error:", err);
            setError(err instanceof Error ? err.message : "Failed to launch SDK");
            setLoading(false);
        }
    }, [clientId, merchantId, userId, product, saveMerchantToBackend]);

    const isMerchantConnected = (id: number) => {
        return connectedMerchants.some(cm => cm.merchant_id === id);
    };

    const handleMerchantClick = (merchant: MerchantInfo) => {
        if (!isMerchantConnected(merchant.id)) {
            launchKnotSDK(merchant.id, merchant.name);
        }
    };

    return (
        <div style={{ marginTop: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#9ca3af', fontSize: '20px', margin: 0 }}>merchants</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#2A2A2A',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3A3A3A'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
                >
                    <MdAdd size={20} />
                </button>
            </div>

            {/* Merchant Grid */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                {MERCHANT_DATA.map((merchant) => {
                    const isConnected = isMerchantConnected(merchant.id);
                    return (
                        <div
                            key={merchant.id}
                            onClick={() => handleMerchantClick(merchant)}
                            style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '16px',
                                backgroundColor: merchant.bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isConnected ? 'default' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: isConnected ? '0 0 0 3px #22c55e' : 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (!isConnected && !loading) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = isConnected ? '0 0 0 3px #22c55e' : 'none';
                            }}
                            title={merchant.name}
                        >
                            <img
                                src={merchant.logo}
                                alt={merchant.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '16px',
                                }}
                            />
                            {isConnected && (
                                <div style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: '#22c55e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}>
                                    ✓
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Merchant Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '16px',
                            padding: '24px',
                            width: '90%',
                            maxWidth: '500px',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>
                            Add New Merchant
                        </h3>

                        {/* Available Merchants */}
                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '12px' }}>
                                Click to connect:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {MERCHANT_DATA.filter(m => !isMerchantConnected(m.id)).map((merchant) => (
                                    <button
                                        key={merchant.id}
                                        onClick={() => launchKnotSDK(merchant.id, merchant.name)}
                                        disabled={loading}
                                        style={{
                                            padding: '10px 16px',
                                            backgroundColor: '#2A2A2A',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.6 : 1,
                                            fontSize: '14px',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3A3A3A'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
                                    >
                                        {merchant.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Merchant ID Input */}
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
                                Or enter a custom Merchant ID:
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={merchantId}
                                    onChange={(e) => setMerchantId(e.target.value)}
                                    placeholder="Merchant ID (e.g., 44)"
                                    style={{
                                        flex: 1,
                                        padding: '12px 14px',
                                        backgroundColor: '#2A2A2A',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '14px',
                                    }}
                                />
                                <button
                                    onClick={() => launchKnotSDK()}
                                    disabled={loading || !merchantId}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: loading || !merchantId ? '#555' : '#8B5CF6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: loading || !merchantId ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loading ? '...' : 'Connect'}
                                </button>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '13px',
                                marginBottom: '16px',
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Status Display */}
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#2A2A2A',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#9ca3af',
                        }}>
                            <strong>Status:</strong> {status}
                            {sessionId && (
                                <div style={{ marginTop: '4px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '10px' }}>
                                    Session: {sessionId.slice(0, 20)}...
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowAddModal(false)}
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '10px',
                                color: '#9ca3af',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Connected Merchants Details (hidden, for payment selection) */}
            {connectedMerchants.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '12px' }}>
                        Connected ({connectedMerchants.length}):
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {connectedMerchants.map((merchant) => (
                            <div
                                key={merchant.merchant_id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                <span style={{ color: '#fff', fontSize: '13px' }}>{merchant.name}</span>
                                <select
                                    value={merchant.top_of_file_payment}
                                    onChange={(e) => updatePaymentMethod(merchant.merchant_id, e.target.value)}
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        backgroundColor: '#2A2A2A',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {PAYMENT_METHODS.map((pm) => (
                                        <option key={pm.value} value={pm.value}>{pm.label}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
