import {
    Container,
    Box,
    Grid,
    Typography,
    Paper,
    Alert,
    Snackbar,
    Tabs,
    Tab,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import React, { useEffect, useState, useRef } from "react";
import {
    fetchCurrentUser,
    updateUser,
    clearError,
} from "../store/slices/authSlice";
import ChatIcon from "@mui/icons-material/Chat";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useFormik } from "formik";
import ChatList from "../components/Chat/ChatList";
import { fetchChats } from "../store/slices/chatSlice";
import { useNavigate } from "react-router-dom";
import {
    deleteAdByOwner,
    fetchAds,
    resetDeleteState,
} from "../store/slices/adsSlice";
import ProfileForm from "../components/Profile/ProfileForm";
import ProfileAdsList from "../components/Profile/ProfileAdsList";

const ProfileScreen = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, loading, error } = useAppSelector((state) => state.auth);
    const { chats } = useAppSelector((state) => state.chat);
    const { cars, deleteAd, deleteError, deleteSuccess } = useAppSelector(
        (state) => state.ads
    );
    const [isEdit, setIsEdit] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tabValue, setTabValue] = useState(0);
    const [formHeight, setFormHeight] = useState<number>(0);
    const formRef = useRef<HTMLDivElement>(null);

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
        dispatch(fetchChats());
        if (user) {
            dispatch(
                fetchAds({ page: 1, filters: { user: { value: user.id } } })
            );
        }
    }, [dispatch, user?.id]);

    useEffect(() => {
        if (user) {
            setImagePreview(user.profile_image || null);
            setProfileImage(null);
        }
    }, [user]);

    useEffect(() => {
        const updateHeight = () => {
            if (formRef.current) {
                setFormHeight(formRef.current.offsetHeight);
            }
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        const timer = setTimeout(updateHeight, 100);

        return () => {
            window.removeEventListener("resize", updateHeight);
            clearTimeout(timer);
        };
    }, [user, isEdit]);

    useEffect(() => {
        if (deleteSuccess) {
            setShowDeleteSuccess(true);
            dispatch(resetDeleteState());
        }
    }, [deleteSuccess, dispatch]);

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

    const handleViewAd = (adId: number) => {
        navigate(`/ads/${adId}`);
    };

    const handleEditAd = (adId: number) => {
        navigate(`/ads/${adId}/edit`);
    };

    const handleDeleteAd = async (adId: number) => {
        await dispatch(deleteAdByOwner({ adId }));
    };

    const userAds = cars.filter((car) => car.user.id === user?.id);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
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

                <Grid
                    container
                    spacing={3}
                    sx={{ mt: 1, alignItems: "flex-start" }}
                >
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box ref={formRef}>
                            <ProfileForm
                                user={user}
                                formik={formik}
                                isEdit={isEdit}
                                imagePreview={imagePreview}
                                onEdit={handleEdit}
                                onCancel={handleCancel}
                                onImageChange={handleImageChange}
                            />
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
                        <Paper
                            elevation={2}
                            sx={{
                                borderRadius: 2,
                                height: {
                                    md:
                                        formHeight > 0
                                            ? `${formHeight}px`
                                            : "auto",
                                },
                                width: "100%",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Box
                                sx={{
                                    borderBottom: 1,
                                    borderColor: "divider",
                                }}
                            >
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    variant="fullWidth"
                                >
                                    <Tab
                                        icon={<ChatIcon />}
                                        iconPosition="start"
                                        label={`Chats (${chats.length})`}
                                    />
                                    <Tab
                                        icon={<DirectionsCarIcon />}
                                        iconPosition="start"
                                        label={`Ads (${userAds.length})`}
                                    />
                                </Tabs>
                            </Box>

                            <Box
                                sx={{ flex: 1, overflow: "auto", minHeight: 0 }}
                            >
                                {tabValue === 0 && <ChatList chats={chats} />}
                                {tabValue === 1 && (
                                    <ProfileAdsList
                                        ads={userAds}
                                        onView={handleViewAd}
                                        onEdit={handleEditAd}
                                        onDelete={handleDeleteAd}
                                        deleteAd={deleteAd}
                                    />
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
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

                <Snackbar
                    open={showDeleteSuccess}
                    autoHideDuration={3000}
                    onClose={() => setShowDeleteSuccess(false)}
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
                        Ad deleted successfully.
                    </Alert>
                </Snackbar>
            </Container>
        </MainLayout>
    );
};

export default ProfileScreen;
