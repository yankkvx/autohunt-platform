import { Box, Typography, TextField, Grid, Stack } from "@mui/material";
import Select from "react-select";
import { CONDITION_OPTIONS } from "../../store/slices/catalogSlice";

const BasicInfoStep = ({
    formik,
    brandOptions,
    modelOptions,
    bodyTypeOptions,
    selectStyles,
}: any) => {
    return (
        <Box>
            <Stack spacing={3}>
                <TextField
                    fullWidth
                    label="Ad Title"
                    name="title"
                    placeholder="e.g. Tesla Model S, full option"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                />

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    placeholder="Describe your vehicle in detail..."
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={
                        formik.touched.description &&
                        Boolean(formik.errors.description)
                    }
                    helperText={
                        formik.touched.description && formik.errors.description
                    }
                />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Brand *
                        </Typography>
                        <Select
                            options={brandOptions}
                            value={formik.values.brand}
                            onChange={(selected) => {
                                formik.setFieldValue('brand', selected)
                                formik.setFieldValue('model', null)
                            }}
                            placeholder='Select Brand'
                            styles={selectStyles}
                        />
                        {formik.touched.brand && formik.errors.brand && (
                            <Typography color="error" variant="caption">{formik.errors.brand as string}</Typography>
                        )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Model *
                        </Typography>
                        <Select
                            options={modelOptions}
                            value={formik.values.model}
                            onChange={(selected) => {
                                formik.setFieldValue('model', selected)
                            }}
                            isDisabled={!formik.values.brand}
                            placeholder='Select Model'
                            styles={selectStyles}
                        />
                        {formik.touched.model && formik.errors.model && (
                            <Typography color="error" variant="caption">{formik.errors.model as string}</Typography>
                        )}
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Condition *
                        </Typography>
                        <Select
                            options={CONDITION_OPTIONS}
                            value={formik.values.condition}
                            onChange={(selected) => {
                                formik.setFieldValue('condition', selected)
                            }}
                            placeholder='Select Condtion'
                            styles={selectStyles}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Body Type *
                        </Typography>
                        <Select
                            options={bodyTypeOptions}
                            value={formik.values.bodyType}
                            onChange={(selected) => {
                                formik.setFieldValue('bodyType', selected)
                            }}
                            placeholder='Select Body Type'
                            isClearable
                            styles={selectStyles}
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
};

export default BasicInfoStep;
