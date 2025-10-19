import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";
import type { CarDetailes } from "./adsSlice";
import { logout } from "./authSlice";

export interface Favourite {
    id: number;
    ad: CarDetailes;
    user: number;
}

interface FavouritesState {
    favourites: Favourite[];
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    loading: boolean;
    error: string | null;
    adding: boolean;
    removing: boolean;
}

const initialState: FavouritesState = {
    favourites: [],
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    loading: false,
    error: null,
    adding: false,
    removing: false,
};

export const fetchFavourites = createAsyncThunk(
    "favourites/fetchFavourites",
    async (page: number = 1, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;
            const response = await axios.get(
                `${MAIN_URL}/favourites/?page=${page}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch favourites"
            );
        }
    }
);

export const addFavourite = createAsyncThunk(
    "favourite/add",
    async (adId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;
            const response = await axios.post(
                `${MAIN_URL}/favourites/`,
                { ad_id: adId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to add favourites."
            );
        }
    }
);

export const removeFavourite = createAsyncThunk(
    "favourite/remove",
    async (adId: number, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;
            await axios.delete(`${MAIN_URL}/favourites/${adId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return adId;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail ||
                    "Failed to remove from favourite."
            );
        }
    }
);

const favouritesSlice = createSlice({
    name: "favourites",
    initialState,
    reducers: {
        resetStatus: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFavourites.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFavourites.fulfilled, (state, action) => {
                state.loading = false;
                state.favourites = action.payload.results;
                state.count = action.payload.count;
                state.next = action.payload.next;
                state.previous = action.payload.previous;
            })
            .addCase(fetchFavourites.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(addFavourite.pending, (state) => {
                state.adding = true;
                state.error = null;
            })
            .addCase(addFavourite.fulfilled, (state, action) => {
                state.adding = false;

                state.favourites.push(action.payload);
            })
            .addCase(addFavourite.rejected, (state, action) => {
                state.adding = false;
                state.error = action.payload as string;
            })

            .addCase(removeFavourite.pending, (state) => {
                state.removing = true;

                state.error = null;
            })
            .addCase(removeFavourite.fulfilled, (state, action) => {
                state.removing = false;

                state.favourites = state.favourites.filter(
                    (fav) => fav.ad.id != action.payload
                );
            })
            .addCase(removeFavourite.rejected, (state, action) => {
                state.removing = false;

                state.error = action.payload as string;
            })

            .addCase(logout, (state) => {
                state.favourites = [];
                state.count = 0;
                state.next = null;
                state.previous = null;
                state.currentPage = 1;
                state.loading = false;
                state.error = null;
                state.adding = false;
                state.removing = false;
            });
    },
});

export const { resetStatus } = favouritesSlice.actions;
export default favouritesSlice.reducer;
