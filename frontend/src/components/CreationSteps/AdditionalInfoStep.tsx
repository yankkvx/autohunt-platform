import {
    Box,
    Typography,
    TextField,
    Grid,
    Stack,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import Select from "react-select";

const AdditionalInfoStep = ({
    formik,
    exteriorColorsOptions,
    interiorColorsOptions,
    interiorMaterialsOptions,
    selectStyles,
}: any) => {
    const menuPortalTarget = typeof document !== "undefined" ? document.body : null;
    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Additional Inforamation
            </Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Exterior Color
                    </Typography>
                    <Select
                        options={exteriorColorsOptions}
                        value={formik.values.exteriorColor}
                        onChange={(selected) =>
                            formik.setFieldValue("exteriorColor", selected)
                        }
                        placeholder="Select Color"
                        isClearable
                        styles={selectStyles}
                        menuPortalTarget={menuPortalTarget}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Interior Color
                    </Typography>
                    <Select
                        options={interiorColorsOptions}
                        value={formik.values.interiorColor}
                        onChange={(selected) =>
                            formik.setFieldValue("interiorColor", selected)
                        }
                        placeholder="Select Color"
                        isClearable
                        styles={selectStyles}
                        menuPortalTarget={menuPortalTarget}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Interior Material
                    </Typography>
                    <Select
                        options={interiorMaterialsOptions}
                        value={formik.values.interiorMaterial}
                        onChange={(selected) =>
                            formik.setFieldValue("interiorMaterial", selected)
                        }
                        placeholder="Select Material"
                        isClearable
                        styles={selectStyles}
                        menuPortalTarget={menuPortalTarget}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        VIN Code
                    </Typography>
                    <TextField
                        fullWidth
                        label="VIN Code"
                        name="vin"
                        value={formik.values.vin}
                        onChange={formik.handleChange}
                        placeholder="ABCD1234XXXX..."
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Location
                    </Typography>
                    <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        value={formik.values.location}
                        onChange={formik.handleChange}
                        placeholder="Chicago, Il"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Number of owners
                    </Typography>
                    <TextField
                        fullWidth
                        label="Number of owners"
                        name="owner_count"
                        value={formik.values.owner_count}
                        onChange={formik.handleChange}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Features
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={2}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="warranty"
                                    onChange={formik.handleChange}
                                    checked={formik.values.warranty}
                                />
                            }
                            label="Warranty"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="airbag"
                                    onChange={formik.handleChange}
                                    checked={formik.values.airbag}
                                />
                            }
                            label="Airbag"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="air_conditioning"
                                    onChange={formik.handleChange}
                                    checked={formik.values.air_conditioning}
                                />
                            }
                            label="Air Conditioning"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="is_first_owner"
                                    onChange={formik.handleChange}
                                    checked={formik.values.is_first_owner}
                                />
                            }
                            label="First Owner"
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdditionalInfoStep;
