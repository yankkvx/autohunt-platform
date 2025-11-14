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
    fieldName?: string;
    label?: string;
}

const LocationInput = ({
    formik,
    selectStyles,
    fieldName = "location",
    label,
}: LocationInputProps) => {
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
            formik.setFieldValue(fieldName, "");
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
        formik.setFieldValue(fieldName, loc.display_name);
        formik.setFieldValue(
            "city",
            loc.address.city || loc.address.town || loc.address.village || ""
        );
        formik.setFieldValue("state", loc.address.state || "");
        formik.setFieldValue("country", loc.address.country || "");
        formik.setFieldValue("country_code", loc.address.country_code || "");
        formik.setFieldValue("postcode", loc.address.postcode || "");
        formik.setFieldValue("latitude", Number(loc.latitude).toFixed(6));
        formik.setFieldValue("longitude", Number(loc.longitude).toFixed(6));
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

    const currentValue = formik.values[fieldName];

    const displayName =
        label ||
        (fieldName === "company_office" ? "Company Office" : "Location");

    return (
        <>
            {fieldName != "company_office" && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                    {displayName}
                </Typography>
            )}
            <AsyncSelect<LocationOptions>
                cacheOptions
                defaultOptions
                value={
                    currentValue
                        ? {
                              label: currentValue,
                              value: null as any,
                          }
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
            {formik.touched[fieldName] && formik.errors[fieldName] && (
                <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1.5 }}
                >
                    {formik.errors[fieldName]}
                </Typography>
            )}
        </>
    );
};

export default LocationInput;
