import {
    Container,
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Alert,
} from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchLatestCars } from "../../store/slices/latestCarSlice";

const LatestAdsSection = () => {
    const dispatch = useAppDispatch();
    const { cars, loading, error } = useAppSelector(
        (state) => state.latestCars
    );

    useEffect(() => {
        dispatch(fetchLatestCars());
    }, [dispatch]);

    const carouselSettings = {
        dots: true,
        infinite: false,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    if (loading)
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh",
                }}
            >
                <CircularProgress />
            </Box>
        );

    if (error)
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Alert severity="error">{error}</Alert>
            </Box>
        );

    return (
        <Container maxWidth="lg" sx={{ p: 3 }}>
            <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold">
                    Latest Cars
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Explore the newest arrivals and choose the car that
                    perfectly matches your lifestyle and budget.
                </Typography>
            </Box>
            <Slider {...carouselSettings}>
                {cars.map((car) => (
                    <Box key={car.id} px={1} sx={{ pt: 2 }}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                boxShadow: 3,
                            }}
                        >
                            <Box sx={{ p: 2 }}>
                                <CardMedia
                                    component="img"
                                    image={car.images[0]?.image}
                                    alt={car.title}
                                    sx={{
                                        height: {
                                            xs: 200,
                                            sm: 240,
                                            md: 260,
                                            lg: 280,
                                        },
                                        width: "100%",
                                        objectFit: "cover",
                                        borderRadius: 2,
                                    }}
                                />
                            </Box>
                            <CardContent>
                                <Typography
                                    sx={{
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "1.2rem",
                                            md: "1.4rem",
                                        },
                                        fontWeight: "bold",
                                    }}
                                >
                                    {car.brand.name} - {car.model.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: 400,
                                        fontSize: {
                                            xs: "1rem",
                                            sm: "1.2rem",
                                            md: "1.4rem",
                                        },
                                    }}
                                >
                                    $
                                    {new Intl.NumberFormat("de-DE").format(
                                        Number(car.price)
                                    )}
                                </Typography>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: 1,
                                        mt: 1,
                                    }}
                                >
                                    {car.year && (
                                        <Chip
                                            label={car.year}
                                            sx={{
                                                fontSize: "0.9rem",
                                                borderRadius: 3,
                                            }}
                                        />
                                    )}
                                    {car.condition && (
                                        <Chip
                                            label={car.condition}
                                            sx={{
                                                fontSize: "0.9rem",
                                                borderRadius: 3,
                                            }}
                                        />
                                    )}
                                    {car.transmission?.name && (
                                        <Chip
                                            label={car.transmission.name}
                                            sx={{
                                                fontSize: "0.9rem",
                                                borderRadius: 3,
                                            }}
                                        />
                                    )}
                                    {car.body_type?.name && (
                                        <Chip
                                            label={car.body_type.name}
                                            sx={{
                                                fontSize: "0.9rem",
                                                borderRadius: 3,
                                            }}
                                        />
                                    )}
                                    {car.drive_type?.name && (
                                        <Chip
                                            label={car.drive_type.name}
                                            sx={{
                                                fontSize: "0.9rem",
                                                borderRadius: 3,
                                            }}
                                        />
                                    )}
                                    {car.fuel_type?.name && (
                                        <Chip
                                            label={car.fuel_type.name}
                                            sx={{
                                                fontSize: "0.9rem",
                                                borderRadius: 3,
                                            }}
                                        />
                                    )}
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    sx={{ pt: 2 }}
                                >
                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                        color="text.secondary"
                                    >
                                        Mileage:
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        fontWeight={500}
                                        color="text.secondary"
                                    >
                                        {car.mileage} mi
                                    </Typography>
                                </Box>
                                <Box pt={2}>
                                    <Button
                                        component={LinkRouter}
                                        to={`/ads/${car.id}`}
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: "none",
                                            p: 1,
                                            fontSize: {
                                                sm: "0.85rem",
                                                md: "1rem",
                                            },
                                        }}
                                    >
                                        Show Ad
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Slider>
        </Container>
    );
};

export default LatestAdsSection;
