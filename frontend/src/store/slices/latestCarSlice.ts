import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";

interface CarImage {
    id: number;
    image: string;
}

interface Car {
    id: number;
    title: string;
    description: string;
    brand: { id: number; name: string };
    model: { id: number; name: string; brand: { id: number; name: string } };
    body_type?: { id: number; name: string } | null;
    fuel_type?: { id: number; name: string } | null;
    drive_type?: { id: number; name: string } | null;
    transmission?: { id: number; name: string } | null;
    exterior_color?: { id: number; name: string } | null;
    interior_color?: { id: number; name: string } | null;
    interior_material?: { id: number; name: string } | null;
    year: number;
    mileage?: number | null;
    power?: number | null;
    capacity?: number | null;
    battery_power?: number | null;
    battery_capacity?: string | null;
    price: string;
    vin?: string | null;
    location: string;
    warranty: boolean;
    airbag: boolean;
    air_conditioning: boolean;
    number_of_seats?: number | null;
    number_of_doors?: number | null;
    condition: string;
    owner_count?: number | null;
    is_first_owner: boolean;
    created_at: string;
    updated_at: string;
    images: CarImage[];
}

interface LatestCarState {
    cars: Car[];
    loading: boolean;
    error: string | null;
}

const initialState: LatestCarState = {
    cars: [],
    loading: false,
    error: null,
};

export const fetchLatestCars = createAsyncThunk(
    "latestCars/fetchLatestCars",
    async () => {
        const response = await axios.get(`${MAIN_URL}/ads/recent_ads/`);
        return response.data;
    }
);

const latestCarSlice = createSlice({
    name: "latestCars",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLatestCars.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLatestCars.fulfilled, (state, action) => {
                state.loading = false;
                state.cars = action.payload;
            })
            .addCase(fetchLatestCars.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch latest cars.";
            });
    },
});

export default latestCarSlice.reducer;
