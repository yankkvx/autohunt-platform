import {
    createSlice,
    createAsyncThunk,
    type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import { MAIN_URL } from "../../api-config";

interface NestedField {
    id: number;
    name: string;
}

interface UserBase {
    id: number;
    account_type: string;
    first_name: string;
    company_name?: string;
}

export interface UserDetail extends UserBase {
    last_name?: string;
    email: string;
    phone_number: string;
    profile_image: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Model {
    id: number;
    name: string;
    brand: Brand;
}

export interface CarImage {
    id: number;
    image: string;
}

export interface Car {
    id: number;
    title: string;
    price: number;
    year: number;
    user: UserBase;
    condition: string;
    images: CarImage[];
}

export interface CarDetailes extends Car {
    user: UserDetail;
    description: string;
    brand: Brand;
    model: Model;
    mileage?: number;
    power?: number;
    capacity?: number;
    battery_power?: number;
    battery_capacity?: number;
    vin?: string;
    location?: string;
    warranty?: boolean;
    airbag?: boolean;
    air_conditioning?: boolean;
    number_of_seats?: number;
    number_of_doors?: number;
    owner_count?: number;
    is_first_owner?: boolean;
    body_type?: NestedField;
    fuel_type?: NestedField;
    drive_type?: NestedField;
    transmission?: NestedField;
    exterior_color?: NestedField;
    interior_color?: NestedField;
    interior_material?: NestedField;
}

export interface CreateAdData {
    title: string;
    description: string;
    brand_id: number;
    model_id: number;
    year: number;
    mileage?: number;
    power?: number | null;
    capacity?: number | null;
    battery_power?: number | null;
    battery_capacity?: number | null;
    vin?: string | null;
    location: string | null;
    price: number | string;
    warranty?: boolean;
    airbag?: boolean;
    air_conditioning?: boolean;
    number_of_seats?: number | null;
    number_of_doors?: number | null;
    owner_count?: number | null;
    is_first_owner?: boolean;
    condition?: string;
    body_type_id?: number | null;
    fuel_type_id?: number | null;
    drive_type_id?: number | null;
    transmission_id?: number | null;
    exterior_color_id?: number | null;
    interior_color_id?: number | null;
    interior_material_id?: number | null;
}

export interface UpdateAdData extends CreateAdData {}

interface AdsState {
    cars: Car[];
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    loading: boolean;
    error: string | null;
    currentAd: CarDetailes | null;
    creating: boolean;
    createError: string | null;
    createSuccess: boolean;
    createdAd: CarDetailes | null;
    uploadingImages: boolean;
    uploadError: string | null;
    updating: boolean;
    updateError: string | null;
    updateSuccess: boolean;
    deletingImage: boolean;
    deletingImageError: string | null;
    deleteAd: boolean;
    deleteError: string | null;
    deleteSuccess: boolean;
}

const initialState: AdsState = {
    cars: [],
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    loading: false,
    error: null,
    currentAd: null,
    creating: false,
    createError: null,
    createSuccess: false,
    createdAd: null,
    uploadingImages: false,
    uploadError: null,
    updating: false,
    updateError: null,
    updateSuccess: false,
    deletingImage: false,
    deletingImageError: null,
    deleteAd: false,
    deleteError: null,
    deleteSuccess: false,
};

export const fetchAds = createAsyncThunk(
    "/ads/fetchAds",
    async ({ page = 1, filters = {} }: { page?: number; filters?: any }) => {
        const params = new URLSearchParams();
        params.append("page", String(page));

        // Search filter
        if (filters.search) {
            params.append("search", filters.search);
        }

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

export const fetchAdById = createAsyncThunk(
    "/ads/fetchAdById",
    async (id: number) => {
        const response = await axios.get(`${MAIN_URL}/ads/${id}/`);
        return response.data;
    }
);

export const createAd = createAsyncThunk(
    "/ads/createAd/",
    async (adData: CreateAdData, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.post(`${MAIN_URL}/ads/`, adData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: "Failed to create ad." });
        }
    }
);

export const uploadAdImages = createAsyncThunk(
    "ads/uploadImages",
    async (
        { adId, images }: { adId: number; images: File[] },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const formData = new FormData();

            images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await axios.post(
                `${MAIN_URL}/ads/${adId}/add_image/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: "Failed to upload images." });
        }
    }
);

export const updateAd = createAsyncThunk(
    "/ads/updateAd",
    async (
        { adId, adData }: { adId: number; adData: UpdateAdData },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.put(
                `${MAIN_URL}/ads/${adId}/`,
                adData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: "Failed to update ad." });
        }
    }
);

export const deleteAdByOwner = createAsyncThunk(
    "ads/deleteAdByOwner",
    async ({ adId }: { adId: number }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            await axios.delete(`${MAIN_URL}/ads/${adId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { adId };
        } catch (error: any) {
            if (error.response?.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue("Failed to delete ad.");
        }
    }
);

export const deleteAdImage = createAsyncThunk(
    "ads/deleteImage",
    async (
        { adId, imageId }: { adId: number; imageId: number },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as {
                auth: { user?: { access?: string } };
            };
            const token = state.auth.user?.access;

            const response = await axios.delete(
                `${MAIN_URL}/ads/${adId}/remove_image/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: { image_id: imageId },
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: "Failed to delete image." });
        }
    }
);

const adsSlice = createSlice({
    name: "ads",
    initialState,
    reducers: {
        resetCreateState: (state) => {
            state.creating = false;
            state.createError = null;
            state.createSuccess = false;
            state.createdAd = null;
            (state.uploadingImages = false), (state.uploadError = null);
        },
        clearCreateError: (state) => {
            state.createError = null;
            state.uploadError = null;
        },
        resetUpdateState: (state) => {
            state.updating = false;
            state.updateError = null;
            state.updateSuccess = false;
            state.uploadingImages = false;
            state.uploadError = null;
        },
        resetDeleteState: (state) => {
            state.deleteAd = false;
            state.deleteError = null;
            state.deleteSuccess = false;
        },
    },
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
            })

            // fetchAdById
            .addCase(fetchAdById.pending, (state) => {
                state.loading = true;
            })
            .addCase(
                fetchAdById.fulfilled,
                (state, action: PayloadAction<CarDetailes>) => {
                    state.loading = false;
                    state.currentAd = action.payload;
                }
            )
            .addCase(fetchAdById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch ad.";
            })

            // createAd
            .addCase(createAd.pending, (state) => {
                state.creating = true;
                state.createError = null;
                state.createSuccess = false;
            })
            .addCase(
                createAd.fulfilled,
                (state, action: PayloadAction<CarDetailes>) => {
                    state.creating = false;
                    state.createSuccess = true;
                    state.createdAd = action.payload;
                }
            )
            .addCase(createAd.rejected, (state, action) => {
                state.creating = false;
                state.createSuccess = false;
                const payload = action.payload as any;
                state.createError =
                    payload?.detail ||
                    payload?.message ||
                    "Failed to create ad";
            })

            // upload images
            .addCase(uploadAdImages.pending, (state) => {
                state.uploadingImages = true;
                state.uploadError = null;
            })
            .addCase(uploadAdImages.fulfilled, (state) => {
                state.uploadingImages = false;
            })
            .addCase(uploadAdImages.rejected, (state, action) => {
                state.uploadingImages = false;
                const payload = action.payload as any;
                state.uploadError =
                    payload?.detail ||
                    payload?.message ||
                    "Failed to upload images";
            })

            // Update ad
            .addCase(updateAd.pending, (state) => {
                state.updating = true;
                state.updateError = null;
                state.updateSuccess = false;
            })
            .addCase(
                updateAd.fulfilled,
                (state, action: PayloadAction<CarDetailes>) => {
                    state.updating = false;
                    state.updateSuccess = true;
                    state.currentAd = action.payload;
                }
            )
            .addCase(updateAd.rejected, (state, action) => {
                state.updating = false;
                state.updateSuccess = false;
                const payload = action.payload as any;
                state.updateError =
                    payload?.detail ||
                    payload?.message ||
                    "Failed to update ad.";
            })

            // Delete image
            .addCase(deleteAdImage.pending, (state) => {
                state.deletingImage = true;
                state.deletingImageError = null;
            })
            .addCase(deleteAdImage.fulfilled, (state) => {
                state.deletingImage = false;
            })
            .addCase(deleteAdImage.rejected, (state, action) => {
                state.deletingImage = false;
                const payload = action.payload as any;
                state.deletingImageError =
                    payload?.detail ||
                    payload?.message ||
                    "Failed to delete image.";
            })

            // Delete ad
            .addCase(deleteAdByOwner.pending, (state) => {
                state.deleteAd = true;
                state.deleteError = null;
                state.deleteSuccess = false;
            })
            .addCase(deleteAdByOwner.fulfilled, (state, action) => {
                (state.deleteAd = false), (state.deleteSuccess = true);
                state.cars = state.cars.filter(
                    (car) => car.id !== action.payload.adId
                );
                state.count = state.count - 1;
            })
            .addCase(deleteAdByOwner.rejected, (state, action) => {
                state.deleteAd = false;
                state.deleteSuccess = true;
                const payload = action.payload as any;
                state.deleteError =
                    payload?.detail ||
                    payload.message ||
                    "Failed to delete ad.";
            });
    },
});

export const {
    resetCreateState,
    resetUpdateState,
    clearCreateError,
    resetDeleteState,
} = adsSlice.actions;
export default adsSlice.reducer;
