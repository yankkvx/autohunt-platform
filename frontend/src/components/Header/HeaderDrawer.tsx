import {
    Drawer,
    Box,
    IconButton,
    Typography,
    Fade,
    List,
    ListItem,
    ListItemText,
    Button,
    Link,
    Avatar,
    Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { Link as LinkRouter } from "react-router-dom";
import { useAuthServiceContext } from "../../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import SearchInput from "./SearchInput";

type HeaderDrawerProps = {
    open: boolean;
    onClose: () => void;
};

const HeaderDrawer = ({ open, onClose }: HeaderDrawerProps) => {
    const theme = useTheme();
    const { isAuthenticated } = useAuthServiceContext();
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
        onClose();
    };

    return (
        <Drawer
            anchor="top"
            open={open}
            onClose={onClose}
            transitionDuration={0}
            sx={{
                "& .MuiDrawer-paper": {
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: theme.palette.background.default,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    top: 0,
                    left: 0,
                    zIndex: theme.zIndex.appBar + 1,
                },
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: 10,
                    right: 1,
                    color: theme.palette.text.primary,
                    zIndex: theme.zIndex.appBar + 2,
                    "&hover": {
                        backgroundColor: theme.palette.action.hover,
                    },
                }}
            >
                <CloseIcon />
            </IconButton>

            <Fade in={open} timeout={300}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100vh",
                        px: { xs: 2, sm: 3, md: 4 },
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            width: "100%",
                            pt: { xs: 15, md: 16 },
                        }}
                    >
                        {isAuthenticated ? (
                            <Box
                                sx={{
                                    mb: { xs: 4, sm: 5, md: 6 },
                                    width: "100%",
                                    px: { xs: 2, sm: 3 },
                                    py: 3,
                                    borderRadius: 3,
                                    background: "background.paper",
                                    border: `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                    }}
                                >
                                    <Avatar
                                        src={user?.profile_image}
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            border: `2px solid ${theme.palette.text.primary}`,
                                        }}
                                    />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {user?.account_type === "company"
                                                ? user?.company_name
                                                : `${user?.first_name} ${user?.last_name}`}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    mb: { xs: 4, sm: 5, md: 6 },
                                    width: "100%",
                                    px: { xs: 2, sm: 3 },
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    color="text.secondary"
                                    fontWeight={800}
                                    sx={{
                                        fontSize: {
                                            xs: "1.75rem",
                                            sm: "2.25rem",
                                            md: "2.75rem",
                                            lg: "3rem",
                                        },
                                    }}
                                >
                                    Hello,
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: {
                                            xs: "1.1rem",
                                            sm: "1.5rem",
                                            md: "1.75rem",
                                            lg: "2rem",
                                        },
                                    }}
                                >
                                    Would like to{" "}
                                    <Link
                                        component={LinkRouter}
                                        to="/register"
                                        sx={{
                                            color: theme.palette.text.primary,
                                            textDecoration: "none",
                                        }}
                                    >
                                        Register
                                    </Link>{" "}
                                    or{" "}
                                    <Link
                                        component={LinkRouter}
                                        to="/login"
                                        sx={{
                                            color: theme.palette.text.primary,
                                            textDecoration: "none",
                                        }}
                                    >
                                        Sign In
                                    </Link>
                                    ?
                                </Typography>
                            </Box>
                        )}

                        <List sx={{ width: "100%" }}>
                            <ListItem sx={{ px: 2, py: 1 }}>
                                <SearchInput onMobileClose={onClose} />
                            </ListItem>
                            <Divider sx={{ my: 1.5 }} />
                            <ListItem
                                component={LinkRouter}
                                to="/ads"
                                onClick={onClose}
                                sx={{
                                    color: theme.palette.text.primary,
                                    borderRadius: 2,
                                    mb: 1,
                                }}
                            >
                                <ListItemText
                                    primary="All Listings"
                                    sx={{
                                        "& .MuiListItemText-primary": {
                                            fontSize: {
                                                xs: "1.25rem",
                                                sm: "1.5rem",
                                                md: "1.75rem",
                                                lg: "2rem",
                                            },
                                            fontWeight: 600,
                                            color: theme.palette.text.primary,
                                        },
                                    }}
                                />
                            </ListItem>
                            {isAuthenticated && (
                                <>
                                    <Divider sx={{ my: 1.5 }} />
                                    {user?.is_staff && (
                                        <ListItem
                                            component={LinkRouter}
                                            to="/admin"
                                            onClick={onClose}
                                            sx={{
                                                color: theme.palette.text
                                                    .primary,
                                                borderRadius: 2,
                                                mb: 1,
                                            }}
                                        >
                                            <ListItemText
                                                primary="Admin"
                                                sx={{
                                                    "& .MuiListItemText-primary":
                                                        {
                                                            fontSize: {
                                                                xs: "1.25rem",
                                                                sm: "1.5rem",
                                                                md: "1.75rem",
                                                                lg: "2rem",
                                                            },
                                                            fontWeight: 600,
                                                            color: theme.palette
                                                                .text.primary,
                                                        },
                                                }}
                                            />
                                        </ListItem>
                                    )}
                                    <ListItem
                                        component={LinkRouter}
                                        to="/profile"
                                        onClick={onClose}
                                        sx={{
                                            color: theme.palette.text.primary,
                                            borderRadius: 2,
                                            mb: 1,
                                        }}
                                    >
                                        <ListItemText
                                            primary="Profile"
                                            sx={{
                                                "& .MuiListItemText-primary": {
                                                    fontSize: {
                                                        xs: "1.25rem",
                                                        sm: "1.5rem",
                                                        md: "1.75rem",
                                                        lg: "2rem",
                                                    },
                                                    fontWeight: 600,
                                                    color: theme.palette.text
                                                        .primary,
                                                },
                                            }}
                                        />
                                    </ListItem>
                                    <ListItem
                                        component={LinkRouter}
                                        to="/favourites"
                                        onClick={onClose}
                                        sx={{
                                            color: theme.palette.text.primary,
                                            borderRadius: 2,
                                        }}
                                    >
                                        <ListItemText
                                            primary="Favourites"
                                            sx={{
                                                "& .MuiListItemText-primary": {
                                                    fontSize: {
                                                        xs: "1.25rem",
                                                        sm: "1.5rem",
                                                        md: "1.75rem",
                                                        lg: "2rem",
                                                    },
                                                    fontWeight: 600,
                                                    color: theme.palette.text
                                                        .primary,
                                                },
                                            }}
                                        />
                                    </ListItem>
                                    {user?.account_type == "company" && (
                                        <ListItem
                                            component={LinkRouter}
                                            to="/subscriptions"
                                            onClick={onClose}
                                            sx={{
                                                color: theme.palette.text
                                                    .primary,
                                                borderRadius: 2,
                                            }}
                                        >
                                            <ListItemText
                                                primary="Subscriptions"
                                                sx={{
                                                    "& .MuiListItemText-primary":
                                                        {
                                                            fontSize: {
                                                                xs: "1.25rem",
                                                                sm: "1.5rem",
                                                                md: "1.75rem",
                                                                lg: "2rem",
                                                            },
                                                            fontWeight: 600,
                                                            color: theme.palette
                                                                .text.primary,
                                                        },
                                                }}
                                            />
                                        </ListItem>
                                    )}
                                    <Divider sx={{ my: 1.5 }} />
                                    <ListItem
                                        component={Button}
                                        onClick={handleLogout}
                                        sx={{
                                            color: theme.palette.error.main,
                                            mb: 1,
                                        }}
                                    >
                                        <ListItemText
                                            primary="Logout"
                                            sx={{
                                                "& .MuiListItemText-primary": {
                                                    fontSize: {
                                                        xs: "1.25rem",
                                                        sm: "1.5rem",
                                                        md: "1.75rem",
                                                        lg: "2rem",
                                                    },
                                                    fontWeight: 600,
                                                    textTransform: "none",
                                                },
                                            }}
                                        />
                                    </ListItem>
                                </>
                            )}
                        </List>

                        <Box
                            sx={{
                                mt: "auto",
                                mb: 4,
                                boxShadow: "0 -3px 6px rgba(0,0,0, 0.1)",
                                borderRadius: 2,
                                mx: 2,
                                width: "calc(100% - 32px)",
                                display: "flex",
                            }}
                        >
                            <Button
                                component={LinkRouter}
                                to="/post-ad"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{
                                    py: 2,
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1.25rem",
                                        md: "1.3rem",
                                        lg: "1.375rem",
                                    },
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                                }}
                            >
                                Create Listing
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Drawer>
    );
};

export default HeaderDrawer;
