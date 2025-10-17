import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";
import { type User } from "./authSlice";

interface CatalogItem {
    id: number;
    name: string;
}

interface ModelItem extends CatalogItem {
    brand: {
        id: number;
        name: string;
    };
}

interface AdminState {
    users: User[];
    usersLoading: boolean;
    usersError: string | null;

    catalogLoading: boolean;
    catalogError: string | null;

    actionLoading: boolean;
    actionError: string | null;
}

const initialState: AdminState = {
    users: [],
    usersLoading: false,
    usersError: null,
    catalogLoading: false,
    catalogError: null,
    actionLoading: false,
    actionError: null,
};

export const fetchAllUsers = createAsyncThunk(
    "admin/FetchAllUsers",
    async (
        filters: {
            search?: string;
            account_type?: string;
            is_active?: boolean;
        } = {},
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const params = new URLSearchParams();
            if (filters.search) params.append("search", filters.search);
            if (filters.account_type)
                params.append("account_type", filters.account_type);
            if (filters.is_active)
                params.append("is_active", String(filters.is_active));

            const response = await axios.get(`${MAIN_URL}/admin/users/`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Failed to fetch users"
            );
        }
    }
);

export const toggleUserActive = createAsyncThunk(
    "admin/toggleUserActive",
    async (userId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.post(
                `${MAIN_URL}/admin/users/${userId}/toggle-active/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return { userId, ...response.data };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Failed to change user status."
            );
        }
    }
);

export const toggleUserStaff = createAsyncThunk(
    "admin/toggleUserStaff",
    async (userId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.post(
                `${MAIN_URL}/admin/users/${userId}/toggle-staff/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return { userId, ...response.data };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Failed to change staff status"
            );
        }
    }
);

export const deleteUserByAdmin = createAsyncThunk(
    "admin/deleteUser",
    async (userId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            await axios.delete(`${MAIN_URL}/admin/users/${userId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return userId;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Failed to delete user."
            );
        }
    }
);

export const createCatalogItem = createAsyncThunk(
    "admin/createCatalogItem",
    async (
        { type, data }: { type: string; data: any },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.post(
                `${MAIN_URL}/catalog/${type}/`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return { type, item: response.data };
        } catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.name) {
                    return rejectWithValue(
                        Array.isArray(errorData.name)
                            ? errorData.name[0]
                            : errorData.name
                    );
                }

                if (errorData.detail) {
                    return rejectWithValue(errorData.detail);
                }

                if (typeof errorData === "object") {
                    const firstError = Object.values(errorData)[0];
                    return rejectWithValue(
                        Array.isArray(firstError) ? firstError[0] : firstError
                    );
                }
            }
            return rejectWithValue("Failed to create item.");
        }
    }
);

export const editCatalogItem = createAsyncThunk(
    "admin/editCatalogItem",
    async (
        { type, id, data }: { type: string; id: number; data: any },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.put(
                `${MAIN_URL}/catalog/${type}/${id}/`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return { type, item: response.data };
        } catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.name) {
                    return rejectWithValue(
                        Array.isArray(errorData.name)
                            ? errorData.name[0]
                            : errorData.name
                    );
                }

                if (errorData.detail) {
                    return rejectWithValue(errorData.detail);
                }

                if (typeof errorData === "object") {
                    const firstError = Object.values(errorData)[0];
                    return rejectWithValue(
                        Array.isArray(firstError) ? firstError[0] : firstError
                    );
                }
            }
            return rejectWithValue("Failed to create item.");
        }
    }
);

export const deleteCatalogItem = createAsyncThunk(
    "admin/deleteCatalogItem",
    async (
        { type, id }: { type: string; id: number },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            await axios.delete(`${MAIN_URL}/catalog/${type}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { type, id };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Failed to delete item."
            );
        }
    }
);

export const deleteAdByAdmin = createAsyncThunk(
    "admin/deleteAd",
    async (adId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            await axios.delete(`${MAIN_URL}/ads/${adId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return adId;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Failed to delete ad."
            );
        }
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearErrors: (state) => {
            (state.usersError = null),
                (state.catalogError = null),
                (state.actionError = null);
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all users
            .addCase(fetchAllUsers.pending, (state) => {
                state.usersLoading = true;
                state.usersError = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.usersLoading = false;
                state.usersError = action.payload as string;
            })

            // Toggle active
            .addCase(toggleUserActive.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(toggleUserActive.fulfilled, (state, action) => {
                state.actionLoading = false;
                const user = state.users.find(
                    (u) => u.id === action.payload.userId
                );
                if (user) {
                    user.is_active = action.payload.is_active;
                }
            })
            .addCase(toggleUserActive.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload as string;
            })

            // Toggle staff
            .addCase(toggleUserStaff.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(toggleUserStaff.fulfilled, (state, action) => {
                state.actionLoading = false;
                const user = state.users.find(
                    (u) => u.id === action.payload.userId
                );
                if (user) {
                    user.is_staff = action.payload.is_staff;
                }
            })
            .addCase(toggleUserStaff.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload as string;
            })

            // Delete user
            .addCase(deleteUserByAdmin.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(deleteUserByAdmin.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.users = state.users.filter(
                    (u) => u.id !== action.payload
                );
            })
            .addCase(deleteUserByAdmin.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload as string;
            })

            // Catalog actions
            .addCase(createCatalogItem.pending, (state) => {
                state.catalogLoading = true;
                state.catalogError = null;
            })
            .addCase(createCatalogItem.fulfilled, (state) => {
                state.catalogLoading = false;
                state.catalogError = null;
            })
            .addCase(createCatalogItem.rejected, (state, action) => {
                state.catalogLoading = false;
                state.catalogError = action.payload as string;
            })

            .addCase(editCatalogItem.pending, (state) => {
                state.catalogLoading = true;
                state.catalogError = null;
            })
            .addCase(editCatalogItem.fulfilled, (state) => {
                state.catalogLoading = false;
                state.catalogError = null;
            })
            .addCase(editCatalogItem.rejected, (state, action) => {
                state.catalogLoading = false;
                state.catalogError = action.payload as string;
            })

            .addCase(deleteCatalogItem.pending, (state) => {
                state.catalogLoading = true;
                state.catalogError = null;
            })
            .addCase(deleteCatalogItem.fulfilled, (state) => {
                state.catalogLoading = false;
                state.catalogError = null;
            })
            .addCase(deleteCatalogItem.rejected, (state, action) => {
                state.catalogLoading = false;
                state.catalogError = action.payload as string;
            });
    },
});

export const { clearErrors } = adminSlice.actions;
export default adminSlice.reducer;
