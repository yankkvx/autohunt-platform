import {
    Box,
    Grid,
    Typography,
    Avatar,
    Paper,
    IconButton,
    TextField,
} from "@mui/material";
import { useRef } from "react";
import { type User } from "../../store/slices/authSlice";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import type { FormikProps } from "formik";
import LocationInput from "../LocationInput";

interface FormValues {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    company_name: string;
    company_website: string;
    company_office: string;
    about: string;
    telegram: string;
    twitter: string;
    instagram: string;
    city: string;
    state: string;
    country: string;
    country_code: string;
    latitude: number;
    longitude: number;
    full_address: string;
}

interface ProfileFormProps {
    user: User | null;
    formik: FormikProps<FormValues>;
    isEdit: boolean;
    imagePreview: string | null;
    onEdit: () => void;
    onCancel: () => void;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileForm = ({
    user,
    formik,
    isEdit,
    imagePreview,
    onEdit,
    onCancel,
    onImageChange,
}: ProfileFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectStyles = {
        control: (base: any) => ({
            ...base,
            minHeight: 56,
            borderColor: "#c4c4c4",
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 100 }),
    };
    return (
        <form onSubmit={formik.handleSubmit}>
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    position: "relative",
                    width: "100%",
                }}
            >
                {!isEdit ? (
                    <IconButton
                        onClick={onEdit}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            boxShadow: 1,
                        }}
                    >
                        <EditIcon sx={{ color: "text.primary" }} />
                    </IconButton>
                ) : (
                    <Box display="flex" gap={1}>
                        <IconButton
                            onClick={onCancel}
                            disabled={formik.isSubmitting}
                            sx={{
                                position: "absolute",
                                top: 8,
                                right: 55,
                                boxShadow: 1,
                            }}
                        >
                            <CancelIcon sx={{ color: "error.main" }} />
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
                            <SaveIcon sx={{ color: "primary.main" }} />
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
                                            bgcolor: "primary.dark",
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
                                    onChange={onImageChange}
                                />
                            </>
                        )}
                    </Box>
                    <Box textAlign="center" width="100%">
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
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
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
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
                                variant={isEdit ? "outlined" : "filled"}
                                error={
                                    formik.touched.first_name &&
                                    Boolean(formik.errors.first_name)
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
                                variant={isEdit ? "outlined" : "filled"}
                                error={
                                    formik.touched.last_name &&
                                    Boolean(formik.errors.last_name)
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
                                variant={isEdit ? "outlined" : "filled"}
                                error={
                                    formik.touched.email &&
                                    Boolean(formik.errors.email)
                                }
                                helperText={
                                    formik.touched.email && formik.errors.email
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone_number"
                                value={formik.values.phone_number}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={!isEdit}
                                variant={isEdit ? "outlined" : "filled"}
                                error={
                                    formik.touched.phone_number &&
                                    Boolean(formik.errors.phone_number)
                                }
                                helperText={
                                    formik.touched.phone_number &&
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
                                        value={formik.values.company_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={!isEdit}
                                        variant={isEdit ? "outlined" : "filled"}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    {isEdit ? (
                                        <LocationInput
                                            formik={formik}
                                            selectStyles={selectStyles}
                                            fieldName="company_office"
                                            label="Company Office"
                                        />
                                    ) : (
                                        <TextField
                                            fullWidth
                                            label="Company Office"
                                            value={formik.values.company_office}
                                            disabled
                                            variant="filled"
                                        />
                                    )}
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Company Website"
                                        name="company_website"
                                        value={formik.values.company_website}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={!isEdit}
                                        variant={isEdit ? "outlined" : "filled"}
                                        error={
                                            formik.touched.company_website &&
                                            Boolean(
                                                formik.errors.company_website
                                            )
                                        }
                                        helperText={
                                            formik.touched.company_website &&
                                            formik.errors.company_website
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
                                variant={isEdit ? "outlined" : "filled"}
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
                                variant={isEdit ? "outlined" : "filled"}
                                error={
                                    formik.touched.telegram &&
                                    Boolean(formik.errors.telegram)
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
                                variant={isEdit ? "outlined" : "filled"}
                                error={
                                    formik.touched.twitter &&
                                    Boolean(formik.errors.twitter)
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
                                variant={isEdit ? "outlined" : "filled"}
                                error={
                                    formik.touched.instagram &&
                                    Boolean(formik.errors.instagram)
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
        </form>
    );
};

export default ProfileForm;
