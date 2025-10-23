import { useEffect, useRef, useCallback, use } from "react";
import { useAppDispatch } from "../store/hooks";
import { addMessage } from "../store/slices/chatSlice";
import { WS_ROOT } from "../api-config";

interface UseChatWebsocketProps {
    chatId: number | null;
    token: string | undefined;
    onConnectionChange?: (connected: boolean) => void;
}

export const useChatWebsocket = ({
    chatId,
    token,
    onConnectionChange,
}: UseChatWebsocketProps) => {
    const dispatch = useAppDispatch();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    const connect = useCallback(() => {
        if (!chatId || !token) return;

        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsUrl = `${WS_ROOT}/ws/chat/${chatId}/?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("Websocket connected");
            onConnectionChange?.(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "chat_message") {
                    dispatch(addMessage(data.message));
                } else if (data.type === "messages_read") {
                    console.log("Messages read by user: ", data.user_id);
                }
            } catch (error) {
                console.error("Failed to oarse websocket message.");
            }
        };

        ws.onerror = (error) => {
            console.error("Websocket error: ", error);
        };

        ws.onclose = () => {
            console.log("Websocket disconnected.");
            onConnectionChange?.(false);
        };

        wsRef.current = ws;
    }, [chatId, token, dispatch, onConnectionChange]);

    const sendMessage = useCallback((message: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({ type: "chat_message", message })
            );
            return true;
        }
        return false;
    }, []);

    const markAsRead = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "mark_read" }));
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    return {
        sendMessage,
        markAsRead,
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    };
};
