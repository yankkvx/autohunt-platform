import { Box, Typography } from "@mui/material";
import AsyncSelect from "react-select/async";
import { useRef, useState } from "react";
import { MAIN_URL } from "../api-config";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface LocationOptions {
    label: string;
    value: {
        display_name: string;
        latitude: string;
        longitude: string;
        address: {
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            country?: string;
            country_code?: string;
            postcode?: string;
        };
    };
}

interface LocationInputProps {
    formik: any;
    selectStyles: any;
}

const LocationInput = ({ formik, selectStyles }: LocationInputProps) => {
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchLoadingInputs = async (
        inputValue: string
    ): Promise<LocationOptions[]> => {
        if (!inputValue || inputValue.length < 3) return [];

        setIsLoading(true);
        try {
            const result = await fetch(
                `${MAIN_URL}/locations/search/?q=${encodeURIComponent(
                    inputValue
                )}`
            );
            if (!result.ok) return [];

            const data = await result.json();

            return data.results.map((item: any) => ({
                label: item.display_name,
                value: item,
            }));
        } catch (error) {
            console.error("Location fetch error: ", error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };
    const loadOptions = (
        inputValue: string,
        callback: (options: LocationOptions[]) => void
    ) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            const options = await fetchLoadingInputs(inputValue);
            callback(options);
        }, 500);
    };

    const handleChange = (selected: any) => {
        if (!selected) {
            formik.setFieldValue("location", "");
            formik.setFieldValue("city", "");
            formik.setFieldValue("state", "");
            formik.setFieldValue("country", "");
            formik.setFieldValue("country_code", "");
            formik.setFieldValue("postcode", "");
            formik.setFieldValue("latitude", "");
            formik.setFieldValue("longitude", "");
            return;
        }

        const loc = selected.value;
        formik.setFieldValue("location", loc.display_name);
        formik.setFieldValue(
            "city",
            loc.address.city || loc.address.town || loc.address.village || ""
        );
        formik.setFieldValue("state", loc.address.state || "");
        formik.setFieldValue("country", loc.address.country || "");
        formik.setFieldValue("country_code", loc.address.country_code || "");
        formik.setFieldValue("postcode", loc.address.postcode || "");
        formik.setFieldValue("latitude", loc.latitude || "");
        formik.setFieldValue("longitude", loc.longitude || "");
    };

    const formatOptionLabel = (option: LocationOptions) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOnIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography component="span" variant="body2">
                {option.label}
            </Typography>
        </Box>
    );

    const enhancedStyles = {
        ...selectStyles,
        control: (base: any) => ({
            ...base,
            minHeight: 56,
        }),
        option: (base: any) => ({
            ...base,
            fontWeight: "normal",
        }),
        singleValue: (base: any) => ({
            ...base,
            fontWeight: "normal",
        }),
    };
    const menuPortalTarget =
        typeof document !== "undefined" ? document.body : null;

    return (
        <>
            <Typography variant="body2" sx={{ mb: 1 }}>
                Location
            </Typography>
            <AsyncSelect<LocationOptions>
                cacheOptions
                defaultOptions
                value={
                    formik.values.location
                        ? { label: formik.values.location, value: null as any }
                        : null
                }
                loadOptions={loadOptions}
                onChange={handleChange}
                formatOptionLabel={formatOptionLabel}
                placeholder="Start typing to search location..."
                noOptionsMessage={({ inputValue }) =>
                    inputValue.length < 3
                        ? "Type at least 3 characters"
                        : "No locations found"
                }
                loadingMessage={() => "Searching locations..."}
                isClearable
                styles={enhancedStyles}
                menuPortalTarget={menuPortalTarget}
            />
            {formik.touched.location && formik.errors.location && (
                <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1.5 }}
                >
                    {formik.error.location}
                </Typography>
            )}
        </>
    );
};

export default LocationInput;
