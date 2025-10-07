import {
    Container,
    Box,
    Grid,
    Typography,
    Avatar,
    Paper,
    Alert,
    IconButton,
    Snackbar,
    TextField,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import React, { useEffect, useState, useRef } from "react";
import {
    fetchCurrentUser,
    updateUser,
    clearError,
} from "../store/slices/authSlice";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useFormik } from "formik";

const ProfileScreen = () => {
    const dispatch = useAppDispatch();
    const { user, loading, error } = useAppSelector((state) => state.auth);
    const [isEdit, setIsEdit] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formik = useFormik({
        initialValues: {
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            email: user?.email || "",
            phone_number: user?.phone_number || "",
            about: user?.about || "",
            company_name: user?.company_name || "",
            company_website: user?.company_website || "",
            company_office: user?.company_office || "",
            telegram: user?.telegram || "",
            instagram: user?.instagram || "",
            twitter: user?.twitter || "",
        },

        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (!values.first_name) {
                errors.first_name = "Required";
            }
            if (!values.last_name) {
                errors.last_name = "Required";
            }
            if (!values.email) {
                errors.email = "Required";
            } else if (
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
                errors.email = "Invalid email address";
            }
            const urlPattern = /^https?:\/\/.+/;
            if (values.telegram && !urlPattern.test(values.telegram)) {
                errors.telegram =
                    "Enter a valid URL (starting with http:// or https://";
            }
            if (values.twitter && !urlPattern.test(values.twitter)) {
                errors.twitter =
                    "Enter a valid URL (starting with http:// or https://";
            }
            if (values.instagram && !urlPattern.test(values.instagram)) {
                errors.instagram =
                    "Enter a valid URL (starting with http:// or https://";
            }
            if (
                values.company_website &&
                !urlPattern.test(values.company_website)
            ) {
                errors.company_website =
                    "Enter a valid URL (starting with http:// or https://";
            }
            return errors;
        },

        enableReinitialize: true,
        onSubmit: async (values) => {
            const updateData: any = {};

            if (user) {
                Object.entries(values).forEach(([key, value]) => {
                    const userValue = (user as any)[key] || "";
                    const newValue = value || "";
                    if (newValue !== userValue) {
                        updateData[key] = newValue;
                    }
                });
            }

            if (profileImage) {
                updateData.profile_image = profileImage;
            }

            if (Object.keys(updateData).length === 0) {
                setIsEdit(false);
                return;
            }

            try {
                const result = await dispatch(updateUser(updateData));
                if (updateUser.fulfilled.match(result)) {
                    setIsEdit(false);
                    setShowSuccess(true);
                    setProfileImage(null);
                    await dispatch(fetchCurrentUser());
                }
            } catch (err) {
                console.error("Failed to update profile:", err);
            }
        },
    });

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            setImagePreview(user.profile_image || null);
            setProfileImage(null);
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = () => {
        setIsEdit(true);
        dispatch(clearError());
    };

    const handleCancel = () => {
        setIsEdit(false);
        setProfileImage(null);

        if (user) {
            formik.resetForm({
                values: {
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    email: user.email || "",
                    phone_number: user.phone_number || "",
                    about: user.about || "",
                    company_name: user.company_name || "",
                    company_website: user.company_website || "",
                    company_office: user.company_office || "",
                    telegram: user.telegram || "",
                    instagram: user.instagram || "",
                    twitter: user.twitter || "",
                },
            });

            setImagePreview(user.profile_image || null);
        }

        dispatch(clearError());
    };

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ pt: 2, pb: 4 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h4" fontWeight={900}>
                        My Profile
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
                        {typeof error === "string"
                            ? error
                            : "Failed to update profile."}
                    </Alert>
                )}
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    position: "relative",
                                }}
                            >
                                {!isEdit ? (
                                    <IconButton
                                        onClick={handleEdit}
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            boxShadow: 1,
                                        }}
                                    >
                                        <EditIcon
                                            sx={{ color: "text.primary" }}
                                        />
                                    </IconButton>
                                ) : (
                                    <Box display="flex" gap={1}>
                                        <IconButton
                                            onClick={handleCancel}
                                            disabled={formik.isSubmitting}
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                right: 55,
                                                boxShadow: 1,
                                            }}
                                        >
                                            <CancelIcon
                                                sx={{ color: "error.main" }}
                                            />
                                        </IconButton>
                                        <IconButton
                                            type="submit"
                                            disabled={formik.isSubmitting}
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                boxShadow: 1,
                                            }}
                                        >
                                            <SaveIcon
                                                sx={{ color: "primary.main" }}
                                            />
                                        </IconButton>
                                    </Box>
                                )}
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    gap={2}
                                >
                                    <Box position="relative">
                                        <Avatar
                                            src={imagePreview || undefined}
                                            sx={{ width: 150, height: 150 }}
                                            alt={user?.email}
                                        />
                                        {isEdit && (
                                            <>
                                                <IconButton
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: 0,
                                                        right: 0,
                                                        bgcolor: "primary.main",
                                                        color: "white",
                                                        "&:hover": {
                                                            bgcolor:
                                                                "primary.dark",
                                                        },
                                                    }}
                                                    size="small"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                >
                                                    <PhotoCameraIcon fontSize="small" />
                                                </IconButton>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={handleImageChange}
                                                />
                                            </>
                                        )}
                                    </Box>
                                    <Box textAlign="center" width="100%">
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            gutterBottom
                                        >
                                            {user?.first_name} {user?.last_name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                px: 2,
                                                py: 0.5,
                                                bgcolor: "primary.main",
                                                color: "white",
                                                borderRadius: 1,
                                                display: "inline-block",
                                            }}
                                        >
                                            {user?.account_type
                                                ? user.account_type[0].toUpperCase() +
                                                  user.account_type.slice(1)
                                                : ""}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{ mt: 2 }}
                                    >
                                        Personal Information
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                name="first_name"
                                                value={formik.values.first_name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEdit}
                                                variant={
                                                    isEdit
                                                        ? "outlined"
                                                        : "filled"
                                                }
                                                error={
                                                    formik.touched.first_name &&
                                                    Boolean(
                                                        formik.errors.first_name
                                                    )
                                                }
                                                helperText={
                                                    formik.touched.first_name &&
                                                    formik.errors.first_name
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                name="last_name"
                                                value={formik.values.last_name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEdit}
                                                variant={
                                                    isEdit
                                                        ? "outlined"
                                                        : "filled"
                                                }
                                                error={
                                                    formik.touched.last_name &&
                                                    Boolean(
                                                        formik.errors.last_name
                                                    )
                                                }
                                                helperText={
                                                    formik.touched.last_name &&
                                                    formik.errors.last_name
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEdit}
                                                variant={
                                                    isEdit
                                                        ? "outlined"
                                                        : "filled"
                                                }
                                                error={
                                                    formik.touched.email &&
                                                    Boolean(formik.errors.email)
                                                }
                                                helperText={
                                                    formik.touched.email &&
                                                    formik.errors.email
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Phone Number"
                                                name="phone_number"
                                                value={
                                                    formik.values.phone_number
                                                }
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEdit}
                                                variant={
                                                    isEdit
                                                        ? "outlined"
                                                        : "filled"
                                                }
                                                error={
                                                    formik.touched
                                                        .phone_number &&
                                                    Boolean(
                                                        formik.errors
                                                            .phone_number
                                                    )
                                                }
                                                helperText={
                                                    formik.touched
                                                        .phone_number &&
                                                    formik.errors.phone_number
                                                }
                                            />
                                        </Grid>
                                        {user?.account_type === "company" && (
                                            <>
                                                <Grid size={{ xs: 12 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Company Name"
                                                        name="company_name"
                                                        value={
                                                            formik.values
                                                                .company_name
                                                        }
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        disabled={!isEdit}
                                                        variant={
                                                            isEdit
                                                                ? "outlined"
                                                                : "filled"
                                                        }
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Company Office"
                                                        name="company_office"
                                                        value={
                                                            formik.values
                                                                .company_office
                                                        }
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        disabled={!isEdit}
                                                        variant={
                                                            isEdit
                                                                ? "outlined"
                                                                : "filled"
                                                        }
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Company Website"
                                                        name="company_website"
                                                        value={
                                                            formik.values
                                                                .company_website
                                                        }
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        disabled={!isEdit}
                                                        variant={
                                                            isEdit
                                                                ? "outlined"
                                                                : "filled"
                                                        }
                                                        error={
                                                            formik.touched
                                                                .company_website &&
                                                            Boolean(
                                                                formik.errors
                                                                    .company_website
                                                            )
                                                        }
                                                        helperText={
                                                            formik.touched
                                                                .company_website &&
                                                            formik.errors
                                                                .company_website
                                                        }
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="About"
                                                name="about"
                                                value={formik.values.about}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEdit}
                                                variant={
                                                    isEdit
                                                        ? "outlined"
                                                        : "filled"
                                                }
                                                multiline
                                                rows={3}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Typography
                                                variant="subtitle1"
                                                color="text.secondary"
                                            >
                                                Social Media
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Telegram"
                                                name="telegram"
                                                value={formik.values.telegram}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEdit}
                                                variant={
                                                    isEdit
                                                        ? "outlined"
                                                        : "filled"
                                                }
                                                error={
                                                    formik.touched.telegram &&
                                                    Boolean(
                                                        formik.errors.telegram
                                                    )
                                                }
                                                helperText={
                                                    formik.touched.telegram &&
                                                    formik.errors.telegram
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Twitter"
                                                name="twitter"
                                                value={formik.values.twitter}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEdit}
                                                variant={
                                                    isEdit
                                                        ? "outlined"
                                                        : "filled"
                                                }
                                                error={
                                                    formik.touched.twitter &&
                                                    Boolean(
                                                        formik.errors.twitter
                                                    )
                                                }
                                                helperText={
                                                    formik.touched.twitter &&
                                                    formik.errors.twitter
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Instagram"
                                                name="instagram"
                                                value={formik.values.instagram}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={!isEdit}
                                                variant={
                                                    isEdit
                                                        ? "outlined"
                                                        : "filled"
                                                }
                                                error={
                                                    formik.touched.instagram &&
                                                    Boolean(
                                                        formik.errors.instagram
                                                    )
                                                }
                                                helperText={
                                                    formik.touched.instagram &&
                                                    formik.errors.instagram
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
                <Snackbar
                    open={showSuccess}
                    autoHideDuration={3000}
                    onClose={() => setShowSuccess(false)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                    <Alert
                        severity="success"
                        variant="filled"
                        sx={{
                            width: "100%",
                            boxShadow: 3,
                            borderRadius: 2,
                            alignItems: "center",
                        }}
                    >
                        Profile updated successfully
                    </Alert>
                </Snackbar>
            </Container>
        </MainLayout>
    );
};

export default ProfileScreen;
