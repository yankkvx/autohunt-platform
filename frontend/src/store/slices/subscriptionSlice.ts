import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    additional_ads: number;
    price: string;
    duration_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserSubscription {
    id: number;
    plan: number;
    plan_details?: SubscriptionPlan;
    plan_name: string;
    additional_ads: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    days_remaining: number;
    is_expired: boolean;
    created_at: string;
}

export interface AdStats {
    limit: number;
    usage: number;
    remaining: number;
    can_create: boolean;
    account_type: "private" | "company";
    active_subscriptions: UserSubscription[];
}

interface ActivateSubscriptionPayload {
    plan_id: number;
    paypal_order_id?: string;
    paypal_payer_id?: string;
}

interface SubscriptionState {
    plans: SubscriptionPlan[];
    plansLoading: boolean;
    plansError: string | null;

    mySubscriptions: UserSubscription[];
    subscriptionsLoading: boolean;
    subscriptionsError: string | null;

    adStats: AdStats | null;
    statsLoading: boolean;
    statsError: string | null;

    activating: boolean;
    activatingError: string | null;
}

const initialState: SubscriptionState = {
    plans: [],
    plansLoading: false,
    plansError: null,

    mySubscriptions: [],
    subscriptionsLoading: false,
    subscriptionsError: null,

    adStats: null,
    statsLoading: false,
    statsError: null,

    activating: false,
    activatingError: null,
};

export const fetchSubscriptionPlans = createAsyncThunk(
    "subscription/fetchPlans",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${MAIN_URL}/subscriptions/plans/`
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch plans."
            );
        }
    }
);

export const fetchMySubscriptions = createAsyncThunk(
    "subscription/fetchMySubscription",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.get(
                `${MAIN_URL}/subscriptions/my-subscriptions/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch subscriptions."
            );
        }
    }
);

export const fetchAdStats = createAsyncThunk(
    "subscription/fetchAdStats",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.get(
                `${MAIN_URL}/subscriptions/my-subscriptions/stats/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to fetch ad stats."
            );
        }
    }
);

export const activateSubscription = createAsyncThunk(
    "subscription/activateSubscription",
    async (
        payload: ActivateSubscriptionPayload,
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.post(
                `${MAIN_URL}/subscriptions/my-subscriptions/activate/`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail || "Failed to activate plan."
            );
        }
    }
);

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.plansError = null;
            state.subscriptionsError = null;
            state.statsError = null;
            state.activatingError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubscriptionPlans.pending, (state) => {
                state.plansLoading = true;
                state.plansError = null;
            })
            .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
                state.plansLoading = false;
                state.plans = action.payload;
            })
            .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
                state.plansLoading = false;
                state.plansError = action.payload as string;
            })

            .addCase(fetchMySubscriptions.pending, (state) => {
                state.subscriptionsLoading = true;
                state.subscriptionsError = null;
            })
            .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
                state.subscriptionsLoading = false;
                state.mySubscriptions = action.payload;
            })
            .addCase(fetchMySubscriptions.rejected, (state, action) => {
                state.subscriptionsLoading = false;
                state.subscriptionsError = action.payload as string;
            })

            .addCase(fetchAdStats.pending, (state) => {
                state.statsLoading = true;
                state.statsError = null;
            })
            .addCase(fetchAdStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.adStats = action.payload;
            })
            .addCase(fetchAdStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.statsError = action.payload as string;
            })

            .addCase(activateSubscription.pending, (state) => {
                state.activating = true;
                state.activatingError = null;
            })
            .addCase(activateSubscription.fulfilled, (state, action) => {
                state.activating = false;
                state.mySubscriptions.push(action.payload);
            })
            .addCase(activateSubscription.rejected, (state, action) => {
                state.activating = false;
                state.activatingError = action.payload as string;
            });
    },
});

export const { clearErrors } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
