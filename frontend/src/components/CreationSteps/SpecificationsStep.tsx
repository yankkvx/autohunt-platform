import { Box, Typography, TextField, Grid } from "@mui/material";
import Select from "react-select";
import SettingsIcon from "@mui/icons-material/Settings";

const SpecificationsStep = ({
    formik,
    fuelTypeOptions,
    driveTypeOptions,
    transmissionOptions,
    selectStyles,
}: any) => {

    const menuPortalTarget = typeof document !== "undefined" ? document.body : null;

    const currentFuel = formik.values.fuelType?.label?.toLowerCase();

    const isElectricOrHybrid =
        currentFuel === "Electric" ||
        currentFuel === "Hybrid" ||
        currentFuel?.includes("electric") ||
        currentFuel?.includes("hybrid");

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                <SettingsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Technical Specifications
            </Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Year"
                        name="year"
                        value={formik.values.year}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.year && Boolean(formik.errors.year)
                        }
                        helperText={formik.touched.year && formik.errors.year}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Mileage (mi)"
                        name="mileage"
                        value={formik.values.mileage}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.mileage &&
                            Boolean(formik.errors.mileage)
                        }
                        helperText={
                            formik.touched.mileage && formik.errors.mileage
                        }
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Price ($)"
                        name="price"
                        value={formik.values.price}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.price && Boolean(formik.errors.price)
                        }
                        helperText={formik.touched.price && formik.errors.price}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Drive Type
                    </Typography>
                    <Select
                        options={driveTypeOptions}
                        value={formik.values.driveType}
                        onChange={(selected) =>
                            formik.setFieldValue("driveType", selected)
                        }
                        placeholder="Select Drive Type"
                        isClearable
                        styles={selectStyles}
                        menuPortalTarget={menuPortalTarget}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Transmission
                    </Typography>
                    <Select
                        options={transmissionOptions}
                        value={formik.values.transmission}
                        onChange={(selected) =>
                            formik.setFieldValue("transmission", selected)
                        }
                        placeholder="Select Transmission"
                        isClearable
                        styles={selectStyles}
                        menuPortalTarget={menuPortalTarget}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Fuel Type
                    </Typography>
                    <Select
                        options={fuelTypeOptions}
                        value={formik.values.fuelType}
                        onChange={(selected) =>
                            formik.setFieldValue("fuelType", selected)
                        }
                        placeholder="Select Fuel Type"
                        isClearable
                        styles={selectStyles}
                        menuPortalTarget={menuPortalTarget}
                    />
                </Grid>
                {isElectricOrHybrid ? (
                    <>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Battery Power
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                label="Battery Power (kWh)"
                                name="battery_power"
                                value={formik.values.battery_power}
                                onChange={formik.handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Battery Capacity
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                label="Battery Capacity (kW)"
                                name="battery_capacity"
                                value={formik.values.battery_capacity}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Power
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                label="Power (hp)"
                                name="power"
                                value={formik.values.power}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Capacity
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                label="Capacity (L.)"
                                name="capacity"
                                value={formik.values.capacity}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                    </>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Seats"
                        name="number_of_seats"
                        value={formik.values.number_of_seats}
                        onChange={formik.handleChange}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Doors"
                        name="number_of_doors"
                        value={formik.values.number_of_doors}
                        onChange={formik.handleChange}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default SpecificationsStep;
