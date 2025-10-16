import { Navigate, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { Box, Typography, Container } from "@mui/material";
import AdminLayout from "../../layouts/AdminLayout";
import { useEffect } from "react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.is_staff) {
        useEffect(() => {
            const timer = setTimeout(() => {
                navigate("/", { replace: true });
            }, 5000);
            return () => clearTimeout(timer);
        });
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Box textAlign="center">
                    <Typography variant="h4" color="error" gutterBottom>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You don't have permission to access this page.
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You will be redirected to the homepage.
                    </Typography>
                </Box>
            </Container>
        );
    }
    return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRoute;
