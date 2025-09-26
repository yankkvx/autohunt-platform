import { Box, Grid, Typography } from "@mui/material";
import AddRoadIcon from "@mui/icons-material/AddRoad";
import SpeedIcon from "@mui/icons-material/Speed";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonIcon from "@mui/icons-material/Person";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import CheckIcon from "@mui/icons-material/Check";
import type { CarDetailes } from "../../store/slices/adsSlice";

interface AdDetailsProps {
    ad: CarDetailes;
}

const AdDetails = ({ ad }: AdDetailsProps) => {
    const carDetails = [
        { label: "Brand", value: ad.brand?.name },
        { label: "Model", value: ad.model?.name },
        { label: "Body", value: ad.body_type?.name },
        { label: "Transmission", value: ad.transmission?.name },
        { label: "Drive Type", value: ad.drive_type?.name },
        { label: "Year", value: ad.year },
        { label: "Mileage", value: `${ad.mileage} mi` },
        { label: "Power", value: ad.power ? `${ad.power} HP` : null },
        { label: "Capacity", value: ad.capacity ? `${ad.capacity} L` : null },
        {
            label: "Battery Power",
            value: ad.battery_power ? `${ad.battery_power} kW` : null,
        },
        {
            label: "Battery Capacity",
            value: ad.battery_capacity ? `${ad.battery_capacity} kwH` : null,
        },
        { label: "Exterior color", value: ad.exterior_color?.name },
        { label: "Interior color", value: ad.interior_color?.name },
        {
            label: "Interior material",
            value: ad.interior_material?.name,
        },
        { label: "Number of seats", value: ad.number_of_seats },
        { label: "Number of doors", value: ad.number_of_doors },
        { label: "Warranty", value: ad.warranty },
        { label: "Airbag", value: ad.airbag },
        { label: "Air conditioning", value: ad.air_conditioning },
        { label: "Owners", value: ad.owner_count },
        { label: "VIN", value: ad.vin },
    ].filter((item) => {
        if (item.value === null || item.value === undefined) return false;
        if (typeof item.value === "boolean") return item.value;
        if (typeof item.value === "string") return item.value.trim() !== "";
        return true;
    });
    return (
        <>
            {/* Description */}
            <Box
                sx={{
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    borderRadius: 3,
                    p: 3,
                }}
            >
                <Typography variant="subtitle1" gutterBottom>
                    Description
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="justify"
                >
                    {ad.description}
                </Typography>
            </Box>
            {/* Short info */}
            <Box
                sx={{
                    mt: 3,
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    borderRadius: 3,
                    p: 3,
                }}
            >
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Box display="flex" alignItems="center">
                            <CalendarTodayOutlinedIcon />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                ml={0.5}
                            >
                                Year
                            </Typography>
                        </Box>
                        <Typography ml={3.5}>{ad.year}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Box display="flex" alignItems="center">
                            <AddRoadIcon />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                ml={0.5}
                            >
                                Mileage
                            </Typography>
                        </Box>
                        <Typography ml={3.5}>{ad.mileage} km</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Box display="flex" alignItems="center">
                            <SettingsInputComponentIcon />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                ml={0.5}
                            >
                                Transmission
                            </Typography>
                        </Box>
                        <Typography ml={3.5}>
                            {ad.transmission?.name}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Box display="flex" alignItems="center">
                            <SpeedIcon />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                ml={0.5}
                            >
                                Power
                            </Typography>
                        </Box>
                        <Typography ml={3.5}>{ad.power} HP</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Box display="flex" alignItems="center">
                            <LocalGasStationIcon />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                ml={0.5}
                            >
                                Fuel
                            </Typography>
                        </Box>
                        <Typography ml={3.5}>{ad.fuel_type?.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Box display="flex" alignItems="center">
                            <PersonIcon />
                            <Typography variant="body2" ml={0.5}>
                                Seller
                            </Typography>
                        </Box>
                        <Typography ml={3.5}>
                            {ad.user.account_type === "company"
                                ? "Company"
                                : "Private"}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Other details */}
            <Box
                sx={{
                    mt: 3,
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    borderRadius: 3,
                    p: 3,
                }}
            >
                {carDetails.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            p: 2,
                            borderBottom:
                                index !== carDetails.length - 1
                                    ? "1px solid #e0e0e0"
                                    : "none",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {item.label}
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                            }}
                        >
                            {item.value === true ? (
                                <CheckIcon />
                            ) : (
                                <Typography variant="body2" fontWeight={500}>
                                    {item.value}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>
        </>
    );
};

export default AdDetails;
