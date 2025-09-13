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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { Link as LinkRouter } from "react-router-dom";

type HeaderDrawerProps = {
    open: boolean;
    onClose: () => void;
};

const HeaderDrawer = ({ open, onClose }: HeaderDrawerProps) => {
    const theme = useTheme();

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
                                Hello!
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
                                    to="/sign-in"
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
                        <List>
                            <ListItem
                                component={LinkRouter}
                                to="/ads"
                                onClick={onClose}
                                sx={{
                                    color: theme.palette.text.primary,
                                }}
                            >
                                <ListItemText
                                    primary="All Ads"
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
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1.25rem",
                                        md: "1.3rem",
                                        lg: "1.375rem",
                                    },
                                    borderRadius: 2,
                                    textTransform: "none",
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
