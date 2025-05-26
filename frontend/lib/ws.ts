class IWebSocket {
    private static connection: WebSocket | null = null;
    private static messageCallbacks: Array<(data: any) => void> = [];
    private static url: string | null = null;
    private static reconnectAttempts: number = 0;
    private static maxReconnectAttempts: number = 5;
    private static reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private static userId: string | null = null;
    private static isConnecting: boolean = false;
    private static messageQueue: any[] = [];
    private static intentionalDisconnect: boolean = false; // Track intentional disconnects

    public static connect(url: string): WebSocket | null {
        if (IWebSocket.connection?.readyState === WebSocket.OPEN) {
            return IWebSocket.connection;
        }

        if (IWebSocket.url === url && IWebSocket.isConnecting) {
            return IWebSocket.connection;
        }

        if (IWebSocket.url && IWebSocket.url !== url) {
            IWebSocket.disconnect();
        }

        IWebSocket.url = url;
        IWebSocket.userId = url.split('/').pop() || null;
        IWebSocket.reconnectAttempts = 0;
        IWebSocket.intentionalDisconnect = false; // Reset on new connection
        IWebSocket.createConnection();
        return IWebSocket.connection;
    }

    private static createConnection(): void {
        if (!IWebSocket.url) {
            return;
        }

        IWebSocket.isConnecting = true;

        try {
            const ws = new WebSocket(IWebSocket.url);
            IWebSocket.connection = ws;

            ws.onopen = () => {
                console.log(`[IWebSocket] Connected to ${IWebSocket.url}`);
                IWebSocket.isConnecting = false;
                IWebSocket.reconnectAttempts = 0;

                if (IWebSocket.userId) {
                    IWebSocket.send({ type: "identify", userId: IWebSocket.userId });
                    IWebSocket.send({ type: "online_connections" });
                }
                IWebSocket.flushMessageQueue();
            };

            ws.onmessage = (event: MessageEvent) => {
                console.log("[IWebSocket] Received:", event.data);
                try {
                    const parsedData = JSON.parse(event.data);
                    console.log("[IWebSocket] Parsed data:", parsedData);
                    IWebSocket.messageCallbacks.forEach(callback => callback(parsedData));
                } catch (error) {
                    console.log(`[IWebSocket] Error parsing message: ${error}`);
                }
            };

            ws.onerror = (error: Event) => {
                console.log(`[IWebSocket] Error:`, error);
                IWebSocket.isConnecting = false;
            };

            ws.onclose = (event: CloseEvent) => {
                console.log(`[IWebSocket] Closed: Code ${event.code}, Reason: ${event.reason}`);
                IWebSocket.connection = null;
                IWebSocket.isConnecting = false;
                if (!IWebSocket.intentionalDisconnect && event.code !== 1000) {
                    IWebSocket.attemptReconnect();
                } else {
                    console.log(`[IWebSocket] Intentional disconnect or normal closure, no reconnect`);
                }
            };
        } catch (error) {
            console.log(`[IWebSocket] Connection creation failed: ${error}`);
            IWebSocket.isConnecting = false;
            IWebSocket.attemptReconnect();
        }
    }

    private static attemptReconnect(): void {
        if (IWebSocket.reconnectAttempts >= IWebSocket.maxReconnectAttempts) {
            console.log("[IWebSocket] Max reconnect attempts reached");
            return;
        }

        IWebSocket.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, IWebSocket.reconnectAttempts - 1), 10000);
        console.log(`[IWebSocket] Reconnecting in ${delay / 1000}s (Attempt ${IWebSocket.reconnectAttempts}/${IWebSocket.maxReconnectAttempts})`);

        if (IWebSocket.reconnectTimeout) clearTimeout(IWebSocket.reconnectTimeout);
        IWebSocket.reconnectTimeout = setTimeout(() => {
            if (!IWebSocket.isConnected() && !IWebSocket.intentionalDisconnect) {
                IWebSocket.createConnection();
            } else {
                console.log("[IWebSocket] Reconnect skipped: Already connected or intentional disconnect");
            }
        }, delay);
    }

    public static send(data: any): boolean {
        if (IWebSocket.connection?.readyState === WebSocket.OPEN) {
            try {
                const messageString = JSON.stringify(data);
                IWebSocket.connection.send(messageString);
                console.log("[IWebSocket] Sent:", data);
                return true;
            } catch (error) {
                console.log(`[IWebSocket] Send error: ${error}`);
                IWebSocket.queueMessage(data);
                return false;
            }
        }
        console.log("[IWebSocket] Queuing message: Not connected");
        IWebSocket.queueMessage(data);
        return false;
    }

    public static disconnect(): void {
        if (IWebSocket.connection && IWebSocket.connection.readyState !== WebSocket.CLOSED) {
            console.log("[IWebSocket] Disconnecting...");
            IWebSocket.intentionalDisconnect = true; // Mark as intentional
            IWebSocket.connection.close(1000, "Normal closure");
        }
        if (IWebSocket.reconnectTimeout) {
            clearTimeout(IWebSocket.reconnectTimeout);
            IWebSocket.reconnectTimeout = null;
        }
        IWebSocket.connection = null;
        IWebSocket.isConnecting = false;
        IWebSocket.reconnectAttempts = 0;
        IWebSocket.messageCallbacks = [];
        IWebSocket.messageQueue = [];
    }

    public static isConnected(): boolean {
        return IWebSocket.connection?.readyState === WebSocket.OPEN;
    }

    public static onMessage(callback: (data: any) => void): () => void {
        if (!IWebSocket.messageCallbacks.some(cb => cb.toString() === callback.toString())) {
            IWebSocket.messageCallbacks.push(callback);
        } else {
            console.log("[IWebSocket] Duplicate message callback detected (based on string comparison).");
        }

        return () => {
            IWebSocket.messageCallbacks = IWebSocket.messageCallbacks.filter(cb => cb.toString() !== callback.toString());
        };
    }

    public static getConnectionState(): number {
        return IWebSocket.connection?.readyState ?? WebSocket.CLOSED;
    }

    public static getReconnectAttempts(): number {
        return IWebSocket.reconnectAttempts;
    }

    public static getMaxReconnectAttempts(): number {
        return IWebSocket.maxReconnectAttempts;
    }

    public static setMaxReconnectAttempts(attempts: number): void {
        IWebSocket.maxReconnectAttempts = Math.max(1, attempts);
    }

    private static flushMessageQueue(): void {
        while (IWebSocket.messageQueue.length > 0 && IWebSocket.isConnected()) {
            const message = IWebSocket.messageQueue.shift();
            IWebSocket.send(message);
        }
    }

    public static queueMessage(data: any): void {
        if (IWebSocket.messageQueue.length < 100) {
            IWebSocket.messageQueue.push(data);
        } else {
            console.log("[IWebSocket] Message queue full, discarding message:", data);
        }
    }

    public static getQueueLength(): number {
        return IWebSocket.messageQueue.length;
    }

    public static clearQueue(): void {
        IWebSocket.messageQueue = [];
    }

    public static clearAllListeners(): void {
        IWebSocket.messageCallbacks = [];
    }
}

export default IWebSocket;