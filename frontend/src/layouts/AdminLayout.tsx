import {
    AppBar,
    Box,
    Container,
    Toolbar,
    Button,
    Tabs,
    Tab,
    Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import ColorModeToggle from "../components/ColorMode/ColorModeToggle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const tabs = [
        { label: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
        { label: "Users", path: "/admin/users", icon: <GroupIcon /> },
        { label: "Ads", path: "/admin/ads", icon: <DirectionsCarIcon /> },
        { label: "Catalog", path: "/admin/catalog", icon: <CategoryIcon /> },
    ];

    const currentTab = tabs.findIndex((tab) => tab.path === location.pathname);

    const handleTabChange = (_: any, newValue: number) => {
        navigate(tabs[newValue].path);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const handleBackToSite = () => {
        navigate("/");
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        Admin Panel - AutoHunt
                    </Typography>
                    <ColorModeToggle />
                    <Button
                        color="inherit"
                        onClick={handleBackToSite}
                        sx={{ mr: 2 }}
                    >
                        Back to Site
                    </Button>
                    <Button
                        color="inherit"
                        onClick={handleLogout}
                        sx={{ mr: 2 }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Container maxWidth="xl">
                    <Tabs
                        value={currentTab !== -1 ? currentTab : 0}
                        onChange={handleTabChange}
                        aria-label="admin-navigation"
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={tab.path}
                                icon={tab.icon}
                                iconPosition="start"
                                label={tab.label}
                            />
                        ))}
                    </Tabs>
                </Container>
            </Box>

            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;
