import {
    Container,
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
    createAd,
    resetCreateState,
    uploadAdImages,
    type CreateAdData,
} from "../store/slices/adsSlice";
import {
    fetchCatalog,
    fetchExtendedFilters,
    CONDITION_OPTIONS,
} from "../store/slices/catalogSlice";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import MainLayout from "../layouts/MainLayout";
import BasicInfoStep from "../components/CreationSteps/BasicInfoStep";
import SpecificationsStep from "../components/CreationSteps/SpecificationsStep";
import AdditionalInfoStep from "../components/CreationSteps/AdditionalInfoStep";
import PhotoStep from "../components/CreationSteps/PhotoStep";

const steps = ["Basic Info", "Specifications", "Additional", "Photos"];

const validationSchema = Yup.object({
    title: Yup.string()
        .required("Title is required.")
        .min(10, "Minimum 10 characters.")
        .max(200, "Maximum 200 characters."),
    description: Yup.string()
        .required("Description is required.")
        .min(10, "Minimum 10 characters.")
        .max(500, "Maximum 500 characters."),
    brand: Yup.object().required("Brand is required").nullable(),
    model: Yup.object().required("Model is required").nullable(),
    year: Yup.number()
        .required("Year is required.")
        .min(1900, "Invalid year.")
        .max(new Date().getFullYear() + 1, "Invalid year."),
    price: Yup.number()
        .required("Price is required.")
        .min(1000, "Minumum $1000."),
    mileage: Yup.number().required("Mileage is required.").min(0, "Minimum 0."),
    condition: Yup.object().required("Condtion is required.").nullable(),
});

const CreateAdScreen = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [isProcessingImages, setIsProcessingImages] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        brands,
        models,
        bodyTypes,
        fuelTypes,
        driveTypes,
        transmissions,
        colors,
        interiorMaterials,
        loading: catalogLoading,
    } = useAppSelector((state) => state.catalog);

    const {
        creating,
        createSuccess,
        createError,
        createdAd,
        uploadingImages,
        uploadError,
    } = useAppSelector((state) => state.ads);

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        dispatch(fetchCatalog());
        dispatch(fetchExtendedFilters());
    }, [dispatch]);

    useEffect(() => {
        if (
            createSuccess &&
            createdAd &&
            !uploadingImages &&
            !isProcessingImages
        ) {
            setIsProcessingImages(true);
            navigate(`/ads/${createdAd.id}`);
        }
    }, [
        createSuccess,
        createdAd,
        uploadingImages,
        isProcessingImages,
        navigate,
        dispatch,
    ]);

    useEffect(() => {
        return () => {
            dispatch(resetCreateState());
            imagePreviews.forEach((i) => URL.revokeObjectURL(i));
        };
    }, [dispatch, imagePreviews]);

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            brand: null as any,
            model: null as any,
            bodyType: null as any,
            fuelType: null as any,
            driveType: null as any,
            transmission: null as any,
            exteriorColor: null as any,
            interiorColor: null as any,
            interiorMaterial: null as any,
            year: new Date().getFullYear(),
            mileage: 0,
            power: "",
            capacity: "",
            battery_power: "",
            battery_capacity: "",
            price: "",
            vin: "",
            location: "",
            city: "",
            state: "",
            country: "",
            country_code: "",
            postcode: "",
            latitude: "",
            longitude: "",
            warranty: false,
            airbag: false,
            air_conditioning: false,
            number_of_seats: "",
            number_of_doors: "",
            condition: CONDITION_OPTIONS[1] as any,
            owner_count: "",
            is_first_owner: false,
        },
        validationSchema,
        onSubmit: async (values) => {
            const adData: CreateAdData = {
                title: values.title,
                description: values.description,
                brand_id: values.brand.value,
                model_id: values.model.value,
                body_type_id: values.bodyType?.value || null,
                fuel_type_id: values.fuelType?.value || null,
                drive_type_id: values.driveType?.value || null,
                transmission_id: values.transmission?.value || null,
                exterior_color_id: values.exteriorColor?.value || null,
                interior_color_id: values.interiorColor?.value || null,
                interior_material_id: values.interiorMaterial?.value || null,
                year: values.year,
                mileage: values.mileage,
                power: values.power ? Number(values.power) : null,
                capacity: values.capacity ? Number(values.capacity) : null,
                battery_power: values.battery_power
                    ? Number(values.battery_power)
                    : null,
                battery_capacity: values.battery_capacity
                    ? Number(values.battery_capacity)
                    : null,
                price: Number(values.price),
                vin: values.vin || null,
                location: values.location || null,
                warranty: values.warranty,
                airbag: values.airbag,
                air_conditioning: values.air_conditioning,
                number_of_seats: values.number_of_seats
                    ? Number(values.number_of_seats)
                    : null,
                number_of_doors: values.number_of_doors
                    ? Number(values.number_of_doors)
                    : null,
                condition: values.condition.value,
                owner_count: values.owner_count
                    ? Number(values.owner_count)
                    : null,
                is_first_owner: values.is_first_owner,
            };
            const result = await dispatch(createAd(adData));

            if (createAd.fulfilled.match(result) && images.length > 0) {
                await dispatch(
                    uploadAdImages({ adId: result.payload.id, images })
                );
            }
        },
    });

    const brandOptions = brands.map((b: any) => ({
        value: b.id,
        label: b.name,
    }));
    const modelOptions = formik.values.brand
        ? models
              .filter((m: any) => m.brand.id === formik.values.brand.value)
              .map((m: any) => ({ value: m.id, label: m.name }))
        : [];
    const bodyTypeOptions = bodyTypes.map((bt: any) => ({
        value: bt.id,
        label: bt.name,
    }));
    const fuelTypeOptions = fuelTypes.map((ft: any) => ({
        value: ft.id,
        label: ft.name,
    }));
    const transmissionOptions = transmissions.map((t: any) => ({
        value: t.id,
        label: t.name,
    }));
    const driveTypeOptions = driveTypes.map((dt: any) => ({
        value: dt.id,
        label: dt.name,
    }));
    const exteriorColorsOptions = colors.map((ec: any) => ({
        value: ec.id,
        label: ec.name,
    }));
    const interiorColorsOptions = colors.map((ic: any) => ({
        value: ic.id,
        label: ic.name,
    }));
    const interiorMaterialsOptions = interiorMaterials.map((im: any) => ({
        value: im.id,
        label: im.name,
    }));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImages((prev) => [...prev, ...files]);
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const handleRemoveImage = (id: number) => {
        URL.revokeObjectURL(imagePreviews[id]);
        setImages((prev) => prev.filter((_, i) => i !== id));
        setImagePreviews((prev) => prev.filter((_, i) => i !== id));
    };

    const canProceed = (step: number) => {
        if (step === 0) {
            return (
                formik.values.title &&
                formik.values.brand &&
                formik.values.model &&
                formik.values.condition
            );
        }
        if (step === 1) {
            return (
                formik.values.year &&
                formik.values.price &&
                formik.values.mileage !== undefined
            );
        }
        return true;
    };

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };
    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (
            isSubmitting ||
            creating ||
            uploadingImages ||
            isProcessingImages ||
            createSuccess
        ) {
            return;
        }
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            formik.setTouched({
                title: true,
                description: true,
                brand: true,
                model: true,
                year: true,
                price: true,
                mileage: true,
                condition: true,
            });
            return;
        }
        setIsSubmitting(true);
        formik.handleSubmit();
    };

    const selectStyles = {
        control: (base: any) => ({
            ...base,
            minHeight: 56,
            borderColor: "#c4c4c4",
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 1400 }),
    };
    if (catalogLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <CircularProgress />
            </Box>
        );
    }
    return (
        <MainLayout>
            <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
                <Paper
                    elevation={2}
                    sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}
                >
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="h4"
                            fontWeight="bolder"
                            gutterBottom
                        >
                            Create New Ad
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fill in the form to post your vehicle
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            overflowX: "auto",
                            maxWidth: "100%",
                            "::-webkit-scrollbar": { display: "none" },
                            scrollbarWidth: "none",
                        }}
                    >
                        <Stepper
                            activeStep={activeStep}
                            sx={{
                                mb: 4,
                                width: "max-content",
                                minWidth: "100%",
                            }}
                        >
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                    {(createError || uploadError) && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {createError || uploadError}
                        </Alert>
                    )}

                    <Box>
                        {activeStep === 0 && (
                            <BasicInfoStep
                                formik={formik}
                                brandOptions={brandOptions}
                                modelOptions={modelOptions}
                                bodyTypeOptions={bodyTypeOptions}
                                selectStyles={selectStyles}
                            />
                        )}
                        {activeStep === 1 && (
                            <SpecificationsStep
                                formik={formik}
                                fuelTypeOptions={fuelTypeOptions}
                                driveTypeOptions={driveTypeOptions}
                                transmissionOptions={transmissionOptions}
                                selectStyles={selectStyles}
                            />
                        )}

                        {activeStep === 2 && (
                            <AdditionalInfoStep
                                formik={formik}
                                exteriorColorsOptions={exteriorColorsOptions}
                                interiorColorsOptions={interiorColorsOptions}
                                interiorMaterialsOptions={
                                    interiorMaterialsOptions
                                }
                                selectStyles={selectStyles}
                            />
                        )}

                        {activeStep === 3 && (
                            <PhotoStep
                                imagePreviews={imagePreviews}
                                onImageChange={handleImageChange}
                                onRemoveImage={handleRemoveImage}
                            />
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 4,
                                pt: 3,
                                borderTop: 1,
                                borderColor: "divider",
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={
                                    activeStep === 0
                                        ? () => navigate(-1)
                                        : handleBack
                                }
                                disabled={
                                    creating ||
                                    uploadingImages ||
                                    isProcessingImages
                                }
                            >
                                {activeStep === 0 ? "Cancel" : "Back"}
                            </Button>

                            {activeStep < steps.length - 1 ? (
                                <Button
                                    type="button"
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={!canProceed(activeStep)}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={
                                        creating ||
                                        uploadingImages ||
                                        isProcessingImages ||
                                        createSuccess
                                    }
                                    startIcon={
                                        (creating ||
                                            uploadingImages ||
                                            isProcessingImages) && (
                                            <CircularProgress size={20} />
                                        )
                                    }
                                >
                                    {creating
                                        ? "Creating.."
                                        : uploadingImages
                                        ? "Uploading Photos..."
                                        : isProcessingImages
                                        ? "Processing Images..."
                                        : "Publish Ad"}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </MainLayout>
    );
};

export default CreateAdScreen;
