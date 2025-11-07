import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    CircularProgress,
} from "@mui/material";
import { useAppSelector } from "../../store/hooks";
import axios from "axios";
import { MAIN_URL } from "../../api-config";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalAds: number;
    totalBrands: number;
    totalModels: number;
    totalPlans: number;
}

const AdminDashboard = () => {
    const { user } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeUsers: 0,
        totalAds: 0,
        totalBrands: 0,
        totalModels: 0,
        totalPlans: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, adsRes, brandsRes, modelsRes, plansRes] =
                    await Promise.all([
                        axios.get(`${MAIN_URL}/admin/users`, {
                            headers: {
                                Authorization: `Bearer ${user?.access}`,
                            },
                        }),
                        axios.get(`${MAIN_URL}/ads/`),
                        axios.get(`${MAIN_URL}/catalog/brands/`),
                        axios.get(`${MAIN_URL}/catalog/models/`),
                        axios.get(`${MAIN_URL}/subscriptions/plans/`),
                    ]);

                const users = usersRes.data;
                setStats({
                    totalUsers: users.length,
                    activeUsers: users.filter((u: any) => u.is_active).length,
                    totalAds:
                        adsRes.data.count || adsRes.data.results?.lenght || 0,
                    totalBrands:
                        brandsRes.data.results?.length ||
                        brandsRes.data.length ||
                        0,
                    totalModels:
                        modelsRes.data.results?.length ||
                        modelsRes.data.length ||
                        0,
                    totalPlans: plansRes.data.length || 0,
                });
            } catch (error) {
                return "Failed to fetch stats.";
            } finally {
                setLoading(false);
            }
        };
        if (user?.access) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "80vh",
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Admin Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            height: 140,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <GroupIcon sx={{ fontSize: 40, mr: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {stats.totalUsers}
                            </Typography>
                        </Box>
                        <Typography variant="h6">Total Users</Typography>
                        <Typography variant="body2">
                            {stats.activeUsers} active
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            height: 140,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <DirectionsCarIcon sx={{ fontSize: 40, mr: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {stats.totalAds}
                            </Typography>
                        </Box>
                        <Typography variant="h6">Total Ads</Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            height: 140,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <CategoryIcon sx={{ fontSize: 40, mr: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {stats.totalBrands}
                            </Typography>
                        </Box>
                        <Typography variant="h6">Total Brands</Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            height: 140,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <InventoryIcon sx={{ fontSize: 40, mr: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {stats.totalModels}
                            </Typography>
                        </Box>
                        <Typography variant="h6">Total Models</Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            height: 140,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <ReceiptIcon sx={{ fontSize: 40, mr: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {stats.totalPlans}
                            </Typography>
                        </Box>
                        <Typography variant="h6">Total Plans</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom fontWeight={900}>
                Quick Actions
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardActionArea
                            onClick={() => navigate("/admin/users")}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <GroupIcon sx={{ fontSize: 40, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h5">
                                            Manage Users
                                        </Typography>
                                        <Typography variant="body2">
                                            View, edit, ban users
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardActionArea onClick={() => navigate("/admin/ads")}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <DirectionsCarIcon
                                        sx={{ fontSize: 40, mr: 2 }}
                                    />
                                    <Box>
                                        <Typography variant="h5">
                                            Manage Ads
                                        </Typography>
                                        <Typography variant="body2">
                                            View and moderate ads
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardActionArea
                            onClick={() => navigate("/admin/catalog")}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <CategoryIcon
                                        sx={{ fontSize: 40, mr: 2 }}
                                    />
                                    <Box>
                                        <Typography variant="h5">
                                            Manage Catalog
                                        </Typography>
                                        <Typography variant="body2">
                                            Brands, models, fuel, etc.
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardActionArea
                            onClick={() => navigate("/admin/plans")}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <ReceiptIcon sx={{ fontSize: 40, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h5">
                                            Manage Plans
                                        </Typography>
                                        <Typography variant="body2">
                                            Subscription plans
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;
