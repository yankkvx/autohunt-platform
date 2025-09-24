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
    price: number;
    year: number;
    user: {
        id: number;
        account_type: string;
        first_name: string;
        company_name: string;
    };
    images: CarImage[];
}

interface AdsState {
    cars: Car[];
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    loading: boolean;
    error: string | null;
}

const initialState: AdsState = {
    cars: [],
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    loading: false,
    error: null,
};

export const fetchAds = createAsyncThunk(
    "/ads/fetchAds",
    async ({ page = 1, filters = {} }: { page?: number; filters?: any }) => {
        const params = new URLSearchParams();
        params.append("page", String(page));

        // Filters
        if (filters.brand) params.append("brand", filters.brand.value);
        if (filters.model) params.append("model", filters.model.value);
        if (filters.bodyType?.length)
            filters.bodyType.forEach((v: any) => params.append("body_type", v));
        if (filters.fuelType)
            params.append("fuel_type", filters.fuelType.value);
        if (filters.driveType?.length)
            filters.driveType.forEach((v: any) =>
                params.append("drive_type", v)
            );
        if (filters.transmission?.length)
            filters.transmission.forEach((v: any) =>
                params.append("transmission", v)
            );
        if (filters.exteriorColor?.length)
            filters.exteriorColor.forEach((v: any) =>
                params.append("exterior_color", v)
            );
        if (filters.interiorColor?.length)
            filters.interiorColor.forEach((v: any) =>
                params.append("interior_color", v)
            );
        if (filters.interiorMaterial?.length)
            filters.interiorMaterial.forEach((v: any) =>
                params.append("interior_material", v)
            );
        if (filters.conditions?.length)
            filters.conditions.forEach((v: any) =>
                params.append("condition", v)
            );

        // Numeric value range filters
        if (filters.yearFrom) params.append("year_min", filters.yearFrom.value);
        if (filters.yearTo) params.append("year_max", filters.yearTo.value);
        if (filters.priceFrom)
            params.append("price_min", filters.priceFrom.value);
        if (filters.priceTo) params.append("price_max", filters.priceTo.value);
        if (filters.mileageFrom)
            params.append("mileage_min", filters.mileageFrom.value);
        if (filters.mileageTo)
            params.append("mileage_max", filters.mileageTo.value);
        if (filters.powerFrom)
            params.append("power_min", filters.powerFrom.value);
        if (filters.powerTo) params.append("power_max", filters.powerTo.value);
        if (filters.capacityFrom)
            params.append("capacity_min", filters.capacityFrom.value);
        if (filters.capacityTo)
            params.append("capacity_max", filters.capacityTo.value);
        if (filters.batteryPowerFrom)
            params.append("battery_power_min", filters.batteryPowerFrom.value);
        if (filters.batteryPowerTo)
            params.append("battery_power_max", filters.batteryPowerTo.value);
        if (filters.batteryCapacityFrom)
            params.append(
                "battery_capacity_min",
                filters.batteryCapacityFrom.value
            );
        if (filters.batteryCapacityTo)
            params.append(
                "battery_capacity_max",
                filters.batteryCapacityTo.value
            );
        if (filters.numberOfSeats)
            params.append("number_of_seats", filters.numberOfSeats.value);
        if (filters.numberOfDoors)
            params.append("number_of_doors", filters.numberOfDoors.value);
        if (filters.ownerCountFrom)
            params.append("owner_count_min", filters.ownerCountFrom.value);
        if (filters.ownerCountTo)
            params.append("owner_count_max", filters.ownerCountTo.value);

        // Boolean filters
        // if (typeof filters.warranty === "boolean")
        //     params.append("warranty", String(filters.warranty));
        // if (typeof filters.airbag === "boolean")
        //     params.append("airbag", String(filters.airbag));
        // if (typeof filters.air_conditioning === "boolean")
        //     params.append("air_conditioning", String(filters.air_conditioning));
        // if (typeof filters.is_first_owner === "boolean")
        //     params.append("is_first_owner", String(filters.is_first_owner));

        if (filters.warranty) params.append("warranty", "true");
        if (filters.airbag) params.append("airbag", "true");
        if (filters.air_conditioning) params.append("air_conditioning", "true");
        if (filters.is_first_owner) params.append("is_first_owner", "true");

        console.log("Fetching ads with params:", params.toString());

        const response = await axios.get(`${MAIN_URL}/ads/`, {
            params: params,
        });
        return response.data;
    }
);

const adsSlice = createSlice({
    name: "ads",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAds.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAds.fulfilled, (state, action) => {
                state.loading = false;
                state.cars = action.payload.results;
                state.count = action.payload.count;
                state.next = action.payload.next;
                state.previous = action.payload.previous;
                state.currentPage = action.meta.arg.page || 1;
            })
            .addCase(fetchAds.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch ads.";
            });
    },
});

export default adsSlice.reducer;
