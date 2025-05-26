"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import { useAuth } from "@/lib/providers/auth-provider";
import { useToastConfigStore } from "@/lib/stores/toast-store";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

interface WebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  send: (message: any) => boolean;
  onMessage: (callback: (message: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isToastEnabled } = useToastConfigStore();
  const pathname = usePathname();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const listeners = useRef<Set<(message: any) => void>>(new Set());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn(
      "[WebSocket] Cannot send message, connection not open:",
      message
    );
    return false;
  }, []);

  const onMessage = useCallback((callback: (message: any) => void) => {
    listeners.current.add(callback);
    return () => listeners.current.delete(callback);
  }, []);

  const notifyListeners = useCallback((message: any) => {
    listeners.current.forEach((listener) => listener(message));
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!user?.id) {
      console.log("[WebSocket] No user ID, skipping connection attempt");
      return;
    }

    const wsUrl = `${
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3333"
    }/ws/user/${user.id}`;
    console.log("[WebSocket] Attempting to connect to:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WebSocket] Connected successfully");
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0; // Reset on success
      send({ type: "identify", userId: user.id });
      send({ type: "online_connections" });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[WebSocket] Message received:", message);

        if (
          isToastEnabled &&
          pathname !== "/messages" &&
          (message.type === "new_message" ||
            message.type === "chat_message" ||
            message.type === "new_conversation") &&
          message.data?.senderMetadata.id !== user.id
        ) {
          const senderName = message.data?.senderMetadata.name || "Someone";
          toast.message(`${senderName}:`, {
            description: message.data.content || "Sent an attachment",
            duration: 4000,
            icon: "✉️",
            richColors: true,
            action: {
              label: "View",
              onClick: () => {
                window.location.href = `/messages/${message.data.conversationId}`;
              },
            },
          });
        }

        notifyListeners(message);
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("[WebSocket] Connection error:", error);
      setConnectionError("WebSocket connection failed");
    };

    ws.onclose = (event) => {
      console.log("[WebSocket] Disconnected:", {
        code: event.code,
        reason: event.reason,
      });
      setIsConnected(false);
      setConnectionError("Disconnected from WebSocket");

      // Reconnect logic
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000); // Exponential backoff
        console.log(
          `[WebSocket] Reconnecting in ${delay}ms (Attempt ${
            reconnectAttempts.current + 1
          })`
        );
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, delay);
      } else {
        console.error("[WebSocket] Max reconnection attempts reached");
        setConnectionError("Failed to reconnect after multiple attempts");
      }
    };
  }, [user?.id, send, notifyListeners, isToastEnabled, pathname]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        console.log("[WebSocket] Cleaning up connection");
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const value = { isConnected, connectionError, send, onMessage };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
