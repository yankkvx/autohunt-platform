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

interface Colors {
    id: number;
    name: string;
}

interface interiorMaterials {
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
    colors: Colors[];
    interiorMaterials: interiorMaterials[];
    conditions: { value: string; label: string }[];
    loading: boolean;
    extendedLoading: boolean;
    error: string | null;
}

const initialState: CatalogState = {
    brands: [],
    models: [],
    bodyTypes: [],
    fuelTypes: [],
    driveTypes: [],
    transmissions: [],
    colors: [],
    interiorMaterials: [],
    conditions: [],
    loading: false,
    extendedLoading: false,
    error: null,
};

export const CONDITION_OPTIONS = [
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "damaged", label: "Damaged" },
    { value: "restored", label: "Restored" },
    { value: "drowned", label: "Drowned" },
];

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

export const fetchExtendedFilters = createAsyncThunk(
    "catalog/fetchExtendedFilters",
    async () => {
        const [colors, interiorMaterials] = await Promise.all([
            axios.get(`${MAIN_URL}/catalog/colors/`),
            axios.get(`${MAIN_URL}/catalog/interior-materials/`),
        ]);
        return {
            colors: colors.data.results || colors.data,
            interiorMaterials:
                interiorMaterials.data.results || interiorMaterials.data,
            conditions: CONDITION_OPTIONS,
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
            })

            .addCase(fetchExtendedFilters.pending, (state) => {
                state.extendedLoading = true;
            })
            .addCase(fetchExtendedFilters.fulfilled, (state, action) => {
                state.extendedLoading = false;
                state.colors = action.payload.colors;
                state.interiorMaterials = action.payload.interiorMaterials;
                state.conditions = action.payload.conditions;
            })
            .addCase(fetchExtendedFilters.rejected, (state, action) => {
                state.extendedLoading = false;
                state.error =
                    action.error.message || "Failed to fetch extended filters.";
            });
    },
});

export default catalogSlice.reducer;
