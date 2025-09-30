import { Box, Button, TextField, Typography, MenuItem } from "@mui/material";
import { useFormik } from "formik";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
    loginUser,
    registerUser,
    type RegisterUser,
    type LoginUser,
} from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);

    const loginFormik = useFormik<LoginUser>({
        initialValues: { email: "", password: "" },
        validate: (values) => {
            const errors: Partial<typeof values> = {};
            if (!values.email) {
                errors.email = "This field is required";
            }
            if (!values.password) {
                errors.password = "This field is required";
            }
            return errors;
        },
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
        },
        validate: (values) => {
            const errors: any = {};
            if (!values.email) {
                errors.email = "Email is required.";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                errors.email = "Invalid email address.";
            }
            if (!values.password) {
                errors.password = "Password is required.";
            } else if (values.password.length < 8) {
                errors.password = "Minimum 8 characters.";
            }
            if (!values.first_name) errors.first_name = "Required.";
            if (!values.last_name) errors.last_name = "Required.";
            if (!values.phone_number) errors.phone_number = "Required.";
            if (values.account_type === "company" && !values.company_name) {
                errors.company_name = "Company name is required.";
            }
            return errors;
        },
        onSubmit: async (values) => {
            const result = await dispatch(registerUser(values));
            if (registerUser.fulfilled.match(result)) {
                navigate("/profile");
            }
        },
    });

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
                        {error && (
                            <Typography
                                color="error"
                                variant="body2"
                                align="center"
                                mt={1}
                            >
                                {error}
                            </Typography>
                        )}
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

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            Register
                        </Button>
                        {error && (
                            <Typography
                                color="error"
                                variant="body2"
                                align="center"
                                mt={1}
                            >
                                {error}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>

            <Typography align="center" mt={2}>
                {isLogin ? "New to AutoHunt?" : "Already have an account?"}
                <Button onClick={() => setIsLogin((prev) => !prev)}>
                    {isLogin ? "Sign Up" : "Sign In"}
                </Button>
            </Typography>
        </MainLayout>
    );
};

export default AuthScreen;
