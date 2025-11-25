import { Box, Container, Grid, Link, Typography, Paper } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const brands = [
    {
        name: "Mazda",
        img: "images/brands/mazda.svg",
        link: "/ads?brand=Mazda",
    },
    {
        name: "BMW",
        img: "images/brands/bmw.svg",
        link: "/ads?brand=BMW",
    },
    {
        name: "Citroen",
        img: "images/brands/citroen.svg",
        link: "/ads?brand=Citroën",
    },
    {
        name: "Infiniti",
        img: "images/brands/infiniti.svg",
        link: "/ads?brand=Infiniti",
    },
    {
        name: "Lamborghini",
        img: "images/brands/lamborghini.svg",
        link: "/ads?brand=Lamborghini",
    },
    {
        name: "Ford",
        img: "images/brands/ford.svg",
        link: "/ads?brand=Ford",
    },
    {
        name: "Mercedes-Benz",
        img: "images/brands/mercedes.svg",
        link: "/ads?brand=Mercedes-Benz",
    },
    {
        name: "Opel",
        img: "images/brands/opel.svg",
        link: "/ads?brand=Opel",
    },
    {
        name: "Porsche",
        img: "images/brands/porsche.svg",
        link: "/ads?brand=Porsche",
    },
    {
        name: "Tesla",
        img: "images/brands/tesla.svg",
        link: "/ads?brand=Tesla",
    },
    {
        name: "Toyota",
        img: "images/brands/toyota.svg",
        link: "/ads?brand=Toyota",
    },

    {
        name: "Volkswagen",
        img: "images/brands/volkswagen.svg",
        link: "/ads?brand=Volkswagen",
    },
];

const BrandSection = () => {
    const theme = useTheme();
    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Popular Brands
            </Typography>
            <Box
                sx={{
                    display: "grid",
                    gap: 4,
                    gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(3, 1fr)",
                        md: "repeat(6, 1fr)",
                    },
                }}
            >
                {brands.map((brand) => (
                    <Link
                        component={LinkRouter}
                        to={brand.link}
                        underline="none"
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 140,
                                width: "100%",
                                bgcolor:
                                    theme.palette.mode === "dark"
                                        ? theme.palette.grey[900]
                                        : theme.palette.background.paper,
                                boxShadow: 1,
                                transition: "transform 0.2s, box-shadow 0.2s",
                                "&:hover": {
                                    transform: "translateY(-5px)",
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src={brand.img}
                                alt={brand.name}
                                sx={{
                                    maxHeight: 60,
                                    maxWidth: "100%",
                                    mb: 1,
                                    objectFit: "contain",
                                    filter:
                                        theme.palette.mode === "dark"
                                            ? "invert(1) sepia(1) saturate(5) hue-rotate(180deg)"
                                            : "none",
                                }}
                            />
                            <Typography variant="body2" fontWeight={400}>
                                {brand.name}
                            </Typography>
                        </Paper>
                    </Link>
                ))}
            </Box>
        </Container>
    );
};

export default BrandSection;
