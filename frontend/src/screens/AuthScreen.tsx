import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Alert,
    Divider,
} from "@mui/material";
import { useFormik } from "formik";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
    loginUser,
    registerUser,
    type RegisterUser,
    type LoginUser,
    clearError,
    type GoogleAuthData,
    googleAuth,
} from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import * as Yup from "yup";
import GoogleOAuthButton from "../components/GoogleAuth/oAuthButton";
import GoogleAccTypeModal from "../components/GoogleAuth/GoogleAccTypeModal";

const loginValidationSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email address.")
        .required("Email is required."),
    password: Yup.string().required("Password is required."),
});

const registerValidationSchema = Yup.object({
    account_type: Yup.string()
        .oneOf(["private", "company"])
        .required("Account Type is required."),
    email: Yup.string()
        .email("Invalid email address.")
        .required("Email is required."),
    first_name: Yup.string().required("First name is required."),
    last_name: Yup.string().required("Last name is required."),
    phone_number: Yup.string().required("Phone number is required."),
    company_name: Yup.string().when("account_type", {
        is: "company",
        then: (schema) => schema.required("Comapny name is required."),
        otherwise: (schema) => schema.notRequired(),
    }),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters.")
        .required("Password is required."),
    password_confirm: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match.")
        .required("Please confirm your password."),
});

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [googleModalOpen, setGoogleModalOpen] = useState(false);
    const [pendingGoogleCredential, setPendingGoogleCredential] = useState<
        string | null
    >();
    const [pendingUserInfo, setPendingUserInfo] = useState<any>(null);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearError());
    }, [isLogin, dispatch]);

    const renderError = () => {
        if (!error) return null;

        if (typeof error === "string") {
            return (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            );
        }

        if (typeof error === "object") {
            return (
                <Box sx={{ mt: 2 }}>
                    {Object.entries(error).map(([field, messages]) => (
                        <Alert key={field} severity="error" sx={{ mb: 1 }}>
                            <strong>{field}</strong>{" "}
                            {Array.isArray(messages)
                                ? messages.join(" ")
                                : messages}
                        </Alert>
                    ))}
                </Box>
            );
        }
        return null;
    };

    const loginFormik = useFormik<LoginUser>({
        initialValues: { email: "", password: "" },
        validationSchema: loginValidationSchema,
        onSubmit: async (values) => {
            const result = await dispatch(loginUser(values));
            if (loginUser.fulfilled.match(result)) {
                navigate("/");
            }
        },
    });

    const registerFormik = useFormik<RegisterUser>({
        initialValues: {
            account_type: "private",
            email: "",
            first_name: "",
            last_name: "",
            phone_number: "",
            company_name: "",
            password: "",
            password_confirm: "",
        },
        validationSchema: registerValidationSchema,
        onSubmit: async (values) => {
            const result = await dispatch(registerUser(values));
            if (registerUser.fulfilled.match(result)) {
                navigate("/profile");
            }
        },
    });

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const credential = credentialResponse.credential;

        const authData: GoogleAuthData = {
            credential: credential,
        };

        if (!isLogin && registerFormik.values.account_type) {
            authData.account_type = registerFormik.values.account_type;
            if (
                registerFormik.values.account_type === "company" &&
                registerFormik.values.company_name
            ) {
                authData.company_name = registerFormik.values.company_name;
            }
        }
        const result = await dispatch(googleAuth(authData));

        if (googleAuth.fulfilled.match(result)) {
            navigate("/");
        } else if (googleAuth.rejected.match(result)) {
            const errorPayload = result.payload as any;

            if (errorPayload?.type === "REGISTRATION_REQUIRED") {
                setPendingGoogleCredential(credential);
                setPendingUserInfo(errorPayload.data.user_info);
                setGoogleModalOpen(true);
            }
        }
    };

    const handleGoogleError = () => {
        console.error("Google OAuth error");
    };

    const handleGoogleModalSubmit = async (data: {
        account_type: "private" | "company";
        company_name?: string;
    }) => {
        if (!pendingGoogleCredential) return;

        const result = await dispatch(
            googleAuth({
                credential: pendingGoogleCredential,
                account_type: data.account_type,
                company_name: data.company_name,
            })
        );
        if (googleAuth.fulfilled.match(result)) {
            setGoogleModalOpen(false);
            setPendingGoogleCredential(null);
            setPendingUserInfo(null);
            navigate("/profile");
        }
    };

    const handleGoogleModalClose = () => {
        setGoogleModalOpen(false);
        setPendingUserInfo(null);
        setPendingGoogleCredential(null);
        setPendingUserInfo(null);
    };

    return (
        <MainLayout>
            <Box
                sx={{
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    borderRadius: 3,
                    p: 4,
                    mt: 6,
                    width: "100%",
                    maxWidth: { xs: 320, sm: 350, md: 400 },
                    mx: "auto",
                }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    {isLogin
                        ? "Sign In to AutoHunt"
                        : "Create AutoHunt Account"}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    mb={2}
                >
                    {isLogin
                        ? "Enter your credentials"
                        : "Fill in your details below"}
                </Typography>

                {isLogin && (
                    <Box component="form" onSubmit={loginFormik.handleSubmit}>
                        <TextField
                            fullWidth
                            autoFocus
                            label="Email"
                            name="email"
                            type="email"
                            margin="normal"
                            value={loginFormik.values.email}
                            onChange={loginFormik.handleChange}
                            onBlur={loginFormik.handleBlur}
                            error={
                                !!loginFormik.touched.email &&
                                !!loginFormik.errors.email
                            }
                            helperText={
                                loginFormik.touched.email &&
                                loginFormik.errors.email
                            }
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            margin="normal"
                            value={loginFormik.values.password}
                            onChange={loginFormik.handleChange}
                            onBlur={loginFormik.handleBlur}
                            error={
                                !!loginFormik.touched.password &&
                                !!loginFormik.errors.password
                            }
                            helperText={
                                loginFormik.touched.password &&
                                loginFormik.errors.password
                            }
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            Login
                        </Button>
                        {renderError()}
                    </Box>
                )}

                {!isLogin && (
                    <Box
                        component="form"
                        onSubmit={registerFormik.handleSubmit}
                    >
                        <TextField
                            select
                            fullWidth
                            autoFocus
                            margin="normal"
                            label="Account Type"
                            name="account_type"
                            type="text"
                            value={registerFormik.values.account_type}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            error={
                                !!registerFormik.touched.account_type &&
                                !!registerFormik.errors.account_type
                            }
                            helperText={
                                registerFormik.touched.account_type &&
                                registerFormik.errors.account_type
                            }
                        >
                            <MenuItem value="private">Private</MenuItem>
                            <MenuItem value="company">Company</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            margin="normal"
                            value={registerFormik.values.email}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            error={
                                !!registerFormik.touched.email &&
                                !!registerFormik.errors.email
                            }
                            helperText={
                                registerFormik.touched.email &&
                                registerFormik.errors.email
                            }
                        />

                        <TextField
                            fullWidth
                            label="First name"
                            name="first_name"
                            type="text"
                            margin="normal"
                            value={registerFormik.values.first_name}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            error={
                                !!registerFormik.touched.first_name &&
                                !!registerFormik.errors.first_name
                            }
                            helperText={
                                registerFormik.touched.first_name &&
                                registerFormik.errors.first_name
                            }
                        />
                        <TextField
                            fullWidth
                            label="Last name"
                            name="last_name"
                            type="text"
                            margin="normal"
                            value={registerFormik.values.last_name}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            error={
                                !!registerFormik.touched.last_name &&
                                !!registerFormik.errors.last_name
                            }
                            helperText={
                                registerFormik.touched.last_name &&
                                registerFormik.errors.last_name
                            }
                        />

                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone_number"
                            type="text"
                            margin="normal"
                            value={registerFormik.values.phone_number}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            error={
                                !!registerFormik.touched.phone_number &&
                                !!registerFormik.errors.phone_number
                            }
                            helperText={
                                registerFormik.touched.phone_number &&
                                registerFormik.errors.phone_number
                            }
                        />

                        {registerFormik.values.account_type === "company" && (
                            <TextField
                                fullWidth
                                label="Company Name"
                                name="company_name"
                                margin="normal"
                                value={registerFormik.values.company_name}
                                onChange={registerFormik.handleChange}
                                onBlur={registerFormik.handleBlur}
                                error={
                                    !!registerFormik.touched.company_name &&
                                    !!registerFormik.errors.company_name
                                }
                                helperText={
                                    registerFormik.touched.company_name &&
                                    registerFormik.errors.company_name
                                }
                            />
                        )}

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            margin="normal"
                            value={registerFormik.values.password}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            error={
                                !!registerFormik.touched.password &&
                                !!registerFormik.errors.password
                            }
                            helperText={
                                registerFormik.touched.password &&
                                registerFormik.errors.password
                            }
                        />

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="password_confirm"
                            type="password"
                            margin="normal"
                            value={registerFormik.values.password_confirm}
                            onChange={registerFormik.handleChange}
                            onBlur={registerFormik.handleBlur}
                            error={
                                !!registerFormik.touched.password_confirm &&
                                !!registerFormik.errors.password_confirm
                            }
                            helperText={
                                registerFormik.touched.password_confirm &&
                                registerFormik.errors.password_confirm
                            }
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            Register
                        </Button>
                        {renderError()}
                    </Box>
                )}

                <Box>
                    <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            OR
                        </Typography>
                    </Divider>
                    <GoogleOAuthButton
                        mode="login"
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </Box>
            </Box>

            <Typography align="center" mt={2}>
                {isLogin ? "New to AutoHunt?" : "Already have an account?"}
                <Button onClick={() => setIsLogin((prev) => !prev)}>
                    {isLogin ? "Sign Up" : "Sign In"}
                </Button>
            </Typography>

            <GoogleAccTypeModal
                open={googleModalOpen}
                onClose={handleGoogleModalClose}
                onSubmit={handleGoogleModalSubmit}
                loading={loading}
            />
        </MainLayout>
    );
};

export default AuthScreen;
