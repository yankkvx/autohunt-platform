import {
    Box,
    Paper,
    TextField,
    IconButton,
    Avatar,
    Typography,
    CircularProgress,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { format } from "date-fns";
import SendIcon from "@mui/icons-material/Send";

interface Message {
    id: number;
    sender: {
        id: number;
        first_name: string;
        last_name: string;
        company_name?: string;
        email: string;
        profile_image: string;
    };
    content: string;
    is_read: boolean;
    created_at: string;
}

interface ChatComponentProps {
    messages: Message[];
    otherUser: {
        id: number;
        account_type: string;
        first_name: string;
        last_name: string;
        company_name?: string;
        email: string;
        profile_image: string;
    };
    ad: {
        id: number;
        title: string;
        price: number;
        images: { id: number; image: string }[];
    };
    onSendMessage: (message: string) => void;
    loading?: boolean;
    connected?: boolean;
}

const ChatComponent = ({
    messages,
    otherUser,
    ad,
    onSendMessage,
    loading,
    connected,
}: ChatComponentProps) => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user: currentUser } = useAppSelector((state) => state.auth);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (input.trim() && connected) {
            onSendMessage(input.trim());
            setInput("");
        }
    };

    const handleEnterPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const userName =
        otherUser.account_type === "company"
            ? otherUser.company_name
            : `${otherUser.first_name} ${otherUser.last_name}`;

    return (
        <Paper
            elevation={3}
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "600px",
                border: "1px solid",
                borderColor: "divider",
            }}
        >
            <Box
                sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar src={otherUser.profile_image} />
                    <Box>
                        <Typography variant="h6">{userName}</Typography>
                        <Typography
                            variant="caption"
                            color={
                                connected ? "success.main" : "text.secondary"
                            }
                        >
                            {connected ? "Connected" : "Connecting..."}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                    {ad.images[0] && (
                        <Box
                            component="img"
                            src={ad.images[0].image}
                            sx={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 2,
                            }}
                        />
                    )}
                    <Box>
                        <Typography variant="body2">{ad.title}</Typography>
                        <Typography variant="body2" color="primary">
                            ${ad.price}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <CircularProgress size={60} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            No messages yet. Start the conversation.
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message) => {
                        const isCurrentUser =
                            Number(message.sender.id) ===
                            Number(currentUser?.id);
                        return (
                            <Box
                                key={message.id}
                                sx={{
                                    display: "flex",
                                    justifyContent: isCurrentUser
                                        ? "flex-end"
                                        : "flex-start",
                                    gap: 2,
                                }}
                            >
                                {!isCurrentUser && (
                                    <Avatar
                                        src={message.sender.profile_image}
                                        sx={{ height: 32, width: 32 }}
                                    />
                                )}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        textAlign: "justify",
                                        alignContent: isCurrentUser
                                            ? "flex-end"
                                            : "flex-start",
                                    }}
                                >
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            borderRadius: 3,
                                            p: 1.2,
                                            maxWidth: "450px",
                                            bgcolor: "background.paper",
                                            color: "text.primary",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 300 }}
                                        >
                                            {message.content}
                                        </Typography>
                                    </Paper>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.5,
                                            px: 0.5,
                                            textAlign: isCurrentUser
                                                ? "right"
                                                : "left",
                                        }}
                                    >
                                        {format(
                                            new Date(message.created_at),
                                            "HH:mm"
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })
                )}
                <Box ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={5}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleEnterPress}
                        placeholder="Type a message..."
                        disabled={!connected}
                        size="small"
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={!input.trim() || !connected}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    );
};

export default ChatComponent;
