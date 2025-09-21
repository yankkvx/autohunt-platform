import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";

interface Brand {
    id: number;
    name: string;
}

interface Model {
    id: number;
    name: string;
    brand: Brand;
}

interface BodyType {
    id: number;
    name: string;
}

interface FuelType {
    id: number;
    name: string;
}

interface DriveType {
    id: number;
    name: string;
}

interface Transmission {
    id: number;
    name: string;
}

interface CatalogState {
    brands: Brand[];
    models: Model[];
    bodyTypes: BodyType[];
    fuelTypes: FuelType[];
    driveTypes: DriveType[];
    transmissions: Transmission[];
    loading: boolean;
    error: string | null;
}

const initialState: CatalogState = {
    brands: [],
    models: [],
    bodyTypes: [],
    fuelTypes: [],
    driveTypes: [],
    transmissions: [],
    loading: false,
    error: null,
};

export const fetchCatalog = createAsyncThunk(
    "catalog/fetchCatalog",
    async () => {
        const [
            brands,
            models,
            bodyTypes,
            fuelTypes,
            driveTypes,
            transmissions,
        ] = await Promise.all([
            axios.get(`${MAIN_URL}/catalog/brands/`),
            axios.get(`${MAIN_URL}/catalog/models/`),
            axios.get(`${MAIN_URL}/catalog/body-types/`),
            axios.get(`${MAIN_URL}/catalog/fuel-types/`),
            axios.get(`${MAIN_URL}/catalog/drive-types/`),
            axios.get(`${MAIN_URL}/catalog/transmissions/`),
        ]);
        return {
            brands: brands.data.results || brands.data,
            models: models.data.results || models.data,
            bodyTypes: bodyTypes.data.results || bodyTypes.data,
            fuelTypes: fuelTypes.data.results || fuelTypes.data,
            driveTypes: driveTypes.data.results || driveTypes.data,
            transmissions: transmissions.data.results || transmissions.data,
        };
    }
);

const catalogSlice = createSlice({
    name: "catalog",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCatalog.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCatalog.fulfilled, (state, action) => {
                state.loading = false;
                Object.assign(state, action.payload);
            })
            .addCase(fetchCatalog.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch catalog.";
            });
    },
});

export default catalogSlice.reducer;
