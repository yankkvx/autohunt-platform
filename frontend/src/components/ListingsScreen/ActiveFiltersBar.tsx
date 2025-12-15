import { Box, Chip, Paper, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ActiveFilterProps {
    filters: any;
    catalogState: any;
    onRemoveFilter: (filterKey: string) => void;
    onClearAll: () => void;
}

const ActiveFiltersBar = ({
    filters,
    catalogState,
    onRemoveFilter,
    onClearAll,
}: ActiveFilterProps) => {
    const {
        brands,
        models,
        bodyTypes,
        fuelTypes,
        driveTypes,
        transmissions,
        colors,
        interiorMaterials,
    } = catalogState;

    const findNameById = (catalog: any[], id: number): string => {
        const item = catalog.find((item: any) => item.id === id);
        return item ? item.name : id.toString();
    };

    const getFilterLabel = (key: string, value: any): string => {
        if (!value) return "";

        switch (key) {
            case "brand":
            case "model":
            case "fuelType":
            case "condition":
                return value.label || "";

            case "yearFrom":
                return `Year from ${value.value}`;
            case "yearTo":
                return `Year to ${value.value}`;

            case "mileageFrom":
                return `Mileage from ${value.value}`;
            case "mileageTo":
                return `Mileage to ${value.value}`;

            case "priceFrom":
                return `Price from ${value.value}`;
            case "priceTo":
                return `Price to ${value.value}`;

            case "powerFrom":
                return `Power from ${value.value} HP`;
            case "powerTo":
                return `Power to ${value.value} HP`;

            case "capacityFrom":
                return `Capacity from ${value.value} L`;
            case "capacityTo":
                return `Capacity to ${value.value} L`;

            case "batteryPowerFrom":
                return `Battery power from ${value.value} kW`;
            case "batteryPowerto":
                return `Battery power to ${value.value} kW`;

            case "batteryCapacityFrom":
                return `Battery capacity from ${value.value} kWh`;
            case "batteryCapacityTo":
                return `Battery capacity to ${value.value} kWh`;

            case "numberOfSeats":
                return `${value.value} seats`;
            case "numberOfDoors":
                return `${value.value} doors`;

            case "transmission":
                if (Array.isArray(value)) {
                    return value
                        .map((id) => findNameById(transmissions, id))
                        .join(", ");
                }
                return "";

            case "bodyType":
                if (Array.isArray(value)) {
                    return value
                        .map((id) => findNameById(bodyTypes, id))
                        .join(", ");
                }
                return "";

            case "driveType":
                if (Array.isArray(value)) {
                    return value
                        .map((id) => findNameById(driveTypes, id))
                        .join(", ");
                }
                return "";

            case "exteriorColor":
            case "interiorColor":
                if (Array.isArray(value)) {
                    return value
                        .map((id) => findNameById(colors, id))
                        .join(", ");
                }
                return "";

            case "interiorMaterial":
                if (Array.isArray(value)) {
                    return value
                        .map((id) => findNameById(interiorMaterials, id))
                        .join(", ");
                }
                return "";

            case "conditions":
                if (Array.isArray(value)) {
                    return value
                        .map(
                            (v: string) =>
                                v.charAt(0).toUpperCase() + v.slice(1)
                        )
                        .join(", ");
                }
                return "";

            case "warranty":
                return "Warranty";
            case "airbag":
                return "Airbag";
            case "air_conditioning":
                return "Air conditioning";
            case "is_first_owner":
                return "First owner";

            default:
                return "";
        }
    };

    const activeFilters: Array<{ key: string; label: string }> = [];

    Object.entries(filters).forEach(([key, value]) => {
        if (
            value === null ||
            value === undefined ||
            value === false ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
        ) {
            return;
        }
        const label = getFilterLabel(key, value);
        if (label) {
            activeFilters.push({ key, label });
        }
    });

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <Paper
            elevation={3}
            sx={{
                position: "fixed",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                borderRadius: 8,
                px: 3,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
                maxWidth: "90vw",
                overflow: "hidden",
            }}
        >
            <Typography
                variant="body2"
                fontWeight={600}
                sx={{ whiteSpace: "nowrap" }}
            >
                Filters:
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    maxWidth: "100%",
                }}
            >
                {activeFilters.map((filter) => (
                    <Chip
                        key={filter.key}
                        label={filter.label}
                        onDelete={() => onRemoveFilter(filter.key)}
                        deleteIcon={<CloseIcon />}
                        size="small"
                        sx={{ fontWeight: 400, whiteSpace: "nowrap" }}
                    />
                ))}
            </Box>
            <Button
                size="small"
                onClick={onClearAll}
                sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    minWidth: "auto",
                }}
            >
                Clear All
            </Button>
        </Paper>
    );
};

export default ActiveFiltersBar;
