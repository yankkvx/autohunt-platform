import { Box, Typography, Button } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";

const HeroSection = () => {
    return (
        <Box
            component="section"
            sx={{
                position: "relative",
                width: "100",
                height: { xs: 300, sm: 400, md: 500 },
                overflow: "hidden",
            }}
        >
            <Box
                component="video"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            >
                <source src="videos/herosection.mp4" type="video/mp4" />
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(0, 0, 0, 0.35)",
                    zIndex: 1,
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        color: "#ffffff",
                        px: 2,
                    }}
                >
                    <Typography variant="h3" fontWeight={600} gutterBottom>
                        Find Your Dream Car
                    </Typography>
                    <Typography variant="h6">
                        Buy and sell cars with ease on AutoHunt
                    </Typography>
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
                            mt: 2,
                            borderRadius: 2,
                            textTransform: "none",
                        }}
                    >
                        Get Started
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default HeroSection;
