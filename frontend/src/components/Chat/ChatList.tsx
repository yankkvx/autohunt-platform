import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    Typography,
    Badge,
    Divider,
    Button,
    ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import type { Chat } from "../../store/slices/chatSlice";

interface ChatListProps {
    chats: Chat[];
    currentChatId?: number;
    onChatSelect?: () => void;
}

const ChatList = ({ chats, currentChatId, onChatSelect }: ChatListProps) => {
    const navigate = useNavigate();
    const handleChatClick = (chatId: number) => {
        navigate(`/chat/${chatId}/`);

        if (onChatSelect) {
            onChatSelect();
        }
    };

    if (chats.length === 0) {
        return (
            <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                    No chats yet
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Start a conversation from an ad
                </Typography>
            </Box>
        );
    }

    return (
        <List sx={{ p: 0 }}>
            {chats.map((chat, index) => {
                const isActive = chat.id === currentChatId;
                const userName =
                    chat.other_user.account_type === "company"
                        ? chat.other_user.company_name
                        : `${chat.other_user.first_name} ${chat.other_user.last_name}`;

                return (
                    <Box key={chat.id}>
                        <ListItem
                            component={Button}
                            onClick={() => handleChatClick(chat.id)}
                        >
                            <ListItemAvatar>
                                <Badge
                                    badgeContent={
                                        chat.unread_count > 0
                                            ? chat.unread_count
                                            : null
                                    }
                                    color="info"
                                >
                                    <Avatar
                                        src={chat.other_user.profile_image}
                                    />
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText
                                disableTypography
                                primary={
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography variant="subtitle2" noWrap>
                                            {userName}
                                        </Typography>
                                        {chat.last_message && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {formatDistanceToNow(
                                                    new Date(
                                                        chat.last_message.created_at
                                                    ),
                                                    { addSuffix: true }
                                                )}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            noWrap
                                            display="block"
                                        >
                                            {chat.ad.title}
                                        </Typography>
                                        {chat.last_message && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondaty"
                                                noWrap
                                            >
                                                {chat.last_message.content}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                        {index < chats.length - 1 && <Divider component="li" />}
                    </Box>
                );
            })}
        </List>
    );
};

export default ChatList;
