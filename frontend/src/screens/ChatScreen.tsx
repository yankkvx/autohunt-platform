import {
    Container,
    Box,
    Paper,
    Grid,
    Typography,
    Alert,
    Drawer,
    Button,
    IconButton,
    Fade,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchChats, fetchChatByid } from "../store/slices/chatSlice";
import { useChatWebsocket } from "../hooks/useChatWebsocket";
import MainLayout from "../layouts/MainLayout";
import ChatList from "../components/Chat/ChatList";
import ChatComponent from "../components/Chat/ChatComponent";
import CloseIcon from "@mui/icons-material/Close";

const ChatScreen = () => {
    const dispatch = useAppDispatch();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { chatId } = useParams<{ chatId: string }>();
    const { chats, currentChat, loading, error } = useAppSelector(
        (state) => state.chat
    );
    const { user } = useAppSelector((state) => state.auth);
    const [isConnected, setIsConnected] = useState(false);

    const { sendMessage, markAsRead } = useChatWebsocket({
        chatId: chatId ? Number(chatId) : null,
        token: user?.access,
        onConnectionChange: setIsConnected,
    });

    useEffect(() => {
        dispatch(fetchChats());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchChatByid(Number(chatId)));
    }, [chatId, dispatch]);

    useEffect(() => {
        if (chatId && isConnected) {
            markAsRead();
        }
    }, [chatId, isConnected, markAsRead]);

    const handleSendMessage = (message: string) => {
        sendMessage(message);
    };

    return (
        <MainLayout>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography
                        variant="h4"
                        gutterBottom
                        fontWeight={900}
                        sx={{ justifyContent: "flex-start" }}
                    >
                        Messages
                    </Typography>
                    <Box
                        sx={{
                            mb: 1,
                            display: { xs: "flex", md: "none" },
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => setDrawerOpen(true)}
                        >
                            Chats
                        </Button>
                    </Box>
                </Box>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid
                        size={{ xs: 12, md: 4 }}
                        sx={{ display: { xs: "none", md: "block" } }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                overflow: "auto",
                                height: "600px",
                            }}
                        >
                            <ChatList
                                chats={chats}
                                currentChatId={
                                    chatId ? Number(chatId) : undefined
                                }
                            />
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        {currentChat ? (
                            <ChatComponent
                                messages={currentChat.messages}
                                otherUser={currentChat.other_user}
                                ad={currentChat.ad}
                                onSendMessage={handleSendMessage}
                                loading={loading}
                                connected={isConnected}
                            />
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    Select a chat to start messaging.
                                </Typography>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
                <Drawer
                    anchor="top"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    transitionDuration={300}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: "100vw",
                            height: "100vh",
                            display: "flex",
                            flexDirection: "column",
                            px: 0.5,
                            pt: { xs: 13 },
                            overflowY: "hidden",
                            overflowX: "hidden",
                        },
                    }}
                >
                    <IconButton
                        onClick={() => setDrawerOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 80,
                            right: 15,
                            zIndex: 1201,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Fade in={drawerOpen} timeout={300}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                height: "100%",
                                maxWidth: "100%",
                                overflow: "hidden",
                            }}
                        >
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    width: "100%",
                                }}
                            >
                                <ChatList
                                    chats={chats}
                                    currentChatId={
                                        chatId ? Number(chatId) : undefined
                                    }
                                    onChatSelect={() => setDrawerOpen(false)}
                                />
                            </Box>
                        </Box>
                    </Fade>
                </Drawer>
            </Container>
        </MainLayout>
    );
};

export default ChatScreen;
