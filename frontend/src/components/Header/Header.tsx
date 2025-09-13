import {
    AppBar,
    Box,
    Toolbar,
    Link,
    Typography,
    IconButton,
    Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { DirectionsCar } from "@mui/icons-material";
import { Link as LinkRouter } from "react-router-dom";
import { useState } from "react";
import ColorModeToggle from "../ColorMode/ColorModeToggle";
import HeaderDrawer from "./HeaderDrawer";

const Header = () => {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <AppBar
                sx={{
                    zIndex: theme.zIndex.drawer + 2,
                    backgroundColor: theme.palette.background.default,
                    display: drawerOpen ? "none" : "block",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
            >
                <Toolbar
                    variant="regular"
                    sx={{
                        height: theme.header?.height,
                        minHeight: theme.header?.height,
                        display: "flex",
                        justifyContent: "space-between",
                        px: { xs: 1, sm: 2, md: 3 },
                    }}
                >
                    <Box sx={{ px: { xs: 1, sm: 2 } }}>
                        <Link
                            href="/"
                            underline="none"
                            color="inherit"
                            sx={{ color: theme.palette.text.primary }}
                        >
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontWeight: 600,
                                    fontSize: {
                                        xs: "1.1rem",
                                        sm: "1.25rem",
                                        md: "1.5rem",
                                    },
                                }}
                            >
                                <DirectionsCar sx={{ mr: 0.2 }} /> AutoHunt
                            </Typography>
                        </Link>
                    </Box>
                    <Box
                        sx={{
                            display: { xs: "none", sm: "flex" },
                            alignItems: "center",
                            gap: 2,
                            px: 2,
                        }}
                    >
                        <ColorModeToggle />
                        <Link
                            href="/ads"
                            underline="none"
                            color="inherit"
                            sx={{ color: theme.palette.text.primary }}
                        >
                            <Typography
                                variant="button"
                                textTransform="none"
                                sx={{
                                    fontSize: {
                                        sm: "0.85rem",
                                        md: "1rem",
                                        lg: "1.15rem",
                                    },
                                }}
                            >
                                All Listings
                            </Typography>
                        </Link>
                        <Button
                            component={LinkRouter}
                            to="/post-ad"
                            variant="contained"
                            color="info"
                            sx={{
                                fontSize: {
                                    sm: "0.85rem",
                                    md: "1rem",
                                    lg: "1.15rem",
                                },
                                borderRadius: 2,
                                textTransform: "none",
                                boxShadow: "none",
                            }}
                        >
                            Create Listing
                        </Button>
                        <Button
                            component={LinkRouter}
                            to="/login"
                            variant="contained"
                            color="secondary"
                            sx={{
                                fontSize: {
                                    sm: "0.85rem",
                                    md: "1rem",
                                    lg: "1.15rem",
                                },
                                borderRadius: 2,
                                textTransform: "none",
                                boxShadow: "none",
                            }}
                        >
                            Sign In
                        </Button>
                    </Box>
                    <Box
                        sx={{
                            display: { xs: "flex", sm: "none" },
                            alignItems: "center",
                        }}
                    >
                        <ColorModeToggle />
                        <IconButton
                            edge="end"
                            sx={{
                                display: { xs: "flex", sm: "none" },
                                color: theme.palette.text.primary,
                            }}
                            onClick={() => setDrawerOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <HeaderDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
};

export default Header;
