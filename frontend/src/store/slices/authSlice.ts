import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";

interface User {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    account_type: string;
    company_name: string;
    access?: string;
    refresh?: string;
}

export interface RegisterUser {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    account_type: "private" | "company";
    company_name?: string;
}

export interface LoginUser {
    email: string;
    password: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const storedUser = localStorage.getItem("user");

const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    loading: false,
    error: null,
};

export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData: RegisterUser, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${MAIN_URL}/sign-up/`, userData);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(
                err.response.data.detail || "Registration failed"
            );
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (userData: LoginUser, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${MAIN_URL}/login/`, userData);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data.detail || "Login failed");
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue, getState }) => {
        const state: any = getState();
        const token = state.auth.user?.access;
        try {
            const response = await axios.get(`${MAIN_URL}/user-management/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue("Failed to fetch user");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Logout
        logout: (state) => {
            state.user = null;
            state.error = null;
            state.loading = false;
            localStorage.removeItem("user");
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                (state.loading = false), (state.user = action.payload);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    (action.payload as string) || "Failed to register user.";
            })

            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                (state.loading = false), (state.user = action.payload);
                localStorage.setItem("user", JSON.stringify(action.payload));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    (action.payload as string) || "Failed to login user.";
            })

            // Fetch current user
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    (action.payload as string) || "Failed to fetch user.";
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
