import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    account_type: string;
    company_name: string;
    profile_image: string;
    about?: string;
    company_website?: string;
    company_office?: string;
    telegram?: string;
    instagram?: string;
    twitter?: string;
    access?: string;
    refresh?: string;
    token?: string;
    is_active: boolean;
    is_staff: boolean;
}

export interface RegisterUser {
    email: string;
    password: string;
    password_confirm: string;
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

export interface GoogleAuthData {
    credential: string;
    account_type?: "private" | "company";
    company_name?: string;
}

export interface GoogleUserInfo {
    email: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
}

interface RegistrationRequiredError {
    type: "REGISTRATION_REQUIRED";
    data: {
        detail: string;
        user_info: GoogleUserInfo;
    };
}

export interface UpdateUserData extends Partial<Omit<User, "profile_image">> {
    password?: string;
    profile_image?: File;
    about?: string;
    company_website?: string;
    company_office?: string;
    telegram?: string;
    instagram?: string;
    twitter?: string;
}

interface DeleteUser {
    password: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | Record<string, string[]> | null;
}

const storedUser = localStorage.getItem("user");

const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    loading: false,
    error: null,
};

const formatErrors = (errors: any): string | Record<string, string[]> => {
    if (typeof errors === "string") {
        return errors;
    }

    if (typeof errors === "object" && errors !== null) {
        if (errors.detail) {
            return errors.detail;
        }
        return errors;
    }
    return "An unknown error occured.";
};

export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData: RegisterUser, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${MAIN_URL}/sign-up/`, userData);
            return response.data;
        } catch (err: any) {
            if (err.response?.data) {
                return rejectWithValue(formatErrors(err.response.data));
            }
            return rejectWithValue("Registation failed.");
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
            if (err.response?.data) {
                return rejectWithValue(formatErrors(err.response.data));
            }
            return rejectWithValue("Login failed.");
        }
    }
);

export const googleAuth = createAsyncThunk(
    "auth/googleAuth",
    async (authData: GoogleAuthData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${MAIN_URL}/auth/google/`,
                authData
            );
            return response.data;
        } catch (err: any) {
            if (err.response?.status === 400 && err.response.data.user_info) {
                return rejectWithValue({
                    type: "REGISTRATION_REQUIRED",
                    data: err.response.data,
                } as RegistrationRequiredError);
            }
            if (err.response?.data) {
                return rejectWithValue(formatErrors(err.response.data));
            }
            return rejectWithValue("Google authentication failed.");
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue, getState }) => {
        const state: any = getState();
        const token = state.auth.user?.access;
        if (!token) {
            return rejectWithValue("No authentication token found.");
        }
        try {
            const response = await axios.get(`${MAIN_URL}/user-management/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err: any) {
            if (err.response?.data) {
                return rejectWithValue(formatErrors(err.response.data));
            }
            return rejectWithValue("Failed to fetch user.");
        }
    }
);
export const updateUser = createAsyncThunk(
    "auth/updateUser",
    async (userData: UpdateUserData, { rejectWithValue, getState }) => {
        const state: any = getState();
        const token = state.auth.user?.access;
        if (!token) {
            return rejectWithValue("No authentication token found.");
        }
        try {
            const formData = new FormData();
            Object.entries(userData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });
            const response = await axios.put(
                `${MAIN_URL}/user-management/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (err: any) {
            if (err.response?.data) {
                return rejectWithValue(formatErrors(err.response.data));
            }
            return rejectWithValue("Failed to update user.");
        }
    }
);

export const deleteUser = createAsyncThunk(
    "auth/deleteUser",
    async (data: DeleteUser, { rejectWithValue, getState }) => {
        const state: any = getState();
        const token = state.auth.user?.access;
        if (!token) {
            return rejectWithValue("No authentication token found.");
        }
        try {
            const response = await axios.delete(
                `${MAIN_URL}/user-management/`,
                { headers: { Authorization: `Bearer ${token}` }, data: data }
            );
            return response.data;
        } catch (err: any) {
            if (err.response?.data) {
                return rejectWithValue(formatErrors(err.response.data));
            }
            return rejectWithValue("Failed to delete account.");
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
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                const userData = {
                    ...action.payload,
                    access: action.payload.token || action.payload.access,
                    refresh: action.payload.refresh,
                };
                state.user = userData;
                localStorage.setItem("user", JSON.stringify(userData));
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as
                    | string
                    | Record<string, string[]>;
            })

            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                const userData = {
                    ...action.payload,
                    access: action.payload.token || action.payload.access,
                    refresh: action.payload.refresh,
                };

                state.user = userData;
                localStorage.setItem("user", JSON.stringify(userData));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as
                    | string
                    | Record<string, string[]>;
            })

            // Google auth
            .addCase(googleAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleAuth.fulfilled, (state, action) => {
                state.loading = false;
                const userData = {
                    ...action.payload,
                    access: action.payload.token || action.payload.access,
                    refresh: action.payload.refresh,
                };
                state.user = userData;
                localStorage.setItem("user", JSON.stringify(userData));
            })
            .addCase(googleAuth.rejected, (state, action) => {
                state.loading = false;
                const errorPayload = action.payload as any;
                if (
                    !errorPayload?.type ||
                    errorPayload.type !== "REGISTRATION_REQUIRED"
                ) {
                    state.error = errorPayload as string;
                }
            })

            // Fetch current user
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                const tokens = {
                    access: state.user?.access,
                    refresh: state.user?.refresh,
                };
                state.user = {
                    ...action.payload,
                    access: tokens.access,
                    refresh: tokens.refresh,
                };
                localStorage.setItem("user", JSON.stringify(state.user));
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as
                    | string
                    | Record<string, string[]>;
            })

            // Update user
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const tokens = {
                    access: state.user?.access,
                    refresh: state.user?.refresh,
                };
                state.user = {
                    ...action.payload,
                    access: action.payload.token || tokens.access,
                    refresh: tokens.refresh,
                };
                localStorage.setItem("user", JSON.stringify(state.user));
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as
                    | string
                    | Record<string, string[]>;
            })

            // Delete user
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.error = null;
                localStorage.removeItem("user");
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as
                    | string
                    | Record<string, string[]>;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
