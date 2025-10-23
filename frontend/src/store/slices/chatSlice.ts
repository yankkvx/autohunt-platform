import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";
import { type User } from "./authSlice";
import { type Car } from "./adsSlice";

interface Message {
    id: number;
    sender: User;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Chat {
    id: number;
    ad: Car;
    buyer: User;
    seller: User;
    other_user: User;
    last_message?: {
        content: string;
        sender_id: number;
        created_at: string;
    };
    unread_count: number;
    created_at: string;
    updated_at: string;
}

interface ChatDetail extends Chat {
    messages: Message[];
}

interface ChatState {
    chats: Chat[];
    currentChat: ChatDetail | null;
    loading: boolean;
    error: string | null;
    sending: boolean;
    sendError: string | null;
}

const initialState: ChatState = {
    chats: [],
    currentChat: null,
    loading: false,
    error: null,
    sending: false,
    sendError: null,
};

export const fetchChats = createAsyncThunk(
    "chat/fetchChats",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.get(`${MAIN_URL}/chats/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response.data.detail || "Failed to fetch chats."
            );
        }
    }
);

export const getOrCreateChat = createAsyncThunk(
    "chat/getOrCreateChat",
    async (adId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.post(
                `${MAIN_URL}/chats/get_or_create/`,
                { ad_id: adId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response.data.detail || "Failed to create chat."
            );
        }
    }
);

export const fetchChatByid = createAsyncThunk(
    "chat/fetchChatById",
    async (chatId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;
            const response = await axios.get(`${MAIN_URL}/chats/${chatId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response.data.detail || "Failed to fetch chat."
            );
        }
    }
);

export const markAsRead = createAsyncThunk(
    "chat/markAsRead",
    async (chatId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            await axios.post(
                `${MAIN_URL}/chats/${chatId}/mark_as_read/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return chatId;
        } catch (error: any) {
            return rejectWithValue("Failed to mark as read.");
        }
    }
);

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage: (state, action) => {
            if (state.currentChat) {
                state.currentChat.messages.push(action.payload);
            }
        },
        clearCurrentChat: (state) => {
            state.currentChat = null;
        },
        clearError: (state) => {
            state.error = null;
            state.sendError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.loading = false;
                state.chats = action.payload;
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(getOrCreateChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrCreateChat.fulfilled, (state, action) => {
                state.loading = false;
                state.currentChat = action.payload;
            })
            .addCase(getOrCreateChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchChatByid.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChatByid.fulfilled, (state, action) => {
                state.loading = false;
                state.currentChat = action.payload;
            })
            .addCase(fetchChatByid.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(markAsRead.fulfilled, (state, action) => {
                const chat = state.chats.find((c) => c.id === action.payload);
                if (chat) {
                    chat.unread_count = 0;
                }
            });
    },
});

export const { addMessage, clearCurrentChat, clearError } = chatSlice.actions;
export default chatSlice.reducer;
