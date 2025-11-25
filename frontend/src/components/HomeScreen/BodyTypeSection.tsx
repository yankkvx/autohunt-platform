import { Box, Container, Grid, Link, Typography } from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";

const cars = [
    {
        title: "Sedan",
        img: "images/Sedan.png",
        link: "/ads?body_type=Sedan",
    },
    {
        title: "SUV",
        img: "images/SUV.png",
        link: "/ads?body_type=SUV",
    },
    {
        title: "Hatchback",
        img: "images/Hatchback.png",
        link: "ads?body_type=Hatchback",
    },
    {
        title: "Coupe",
        img: "images/Coupe.png",
        link: "/ads?body_type=Coupe",
    },
    {
        title: "Cabrio",
        img: "images/Cabrio.png",
        link: "/ads?body_type=Cabriolet",
    },
    {
        title: "Wagon",
        img: "images/Wagon.png",
        link: "/ads?body_type=Wagon",
    },
    {
        title: "Van",
        img: "images/Van.png",
        link: "/ads?body_type=Van",
    },
    {
        title: "Pick Up",
        img: "images/PickUp.png",
        link: "/ads?body_type=Pickup",
    },
];

const BodyTypeSection = () => {
    return (
        <Container maxWidth="lg">
            <Grid
                container
                columnSpacing={6.3}
                justifyContent="center"
                textAlign="center"
            >
                {cars.map((car) => (
                    <Grid key={car.title} component="div">
                        <Link
                            component={LinkRouter}
                            to={car.link}
                            underline="none"
                        >
                            <Box
                                sx={{
                                    pt: 3,
                                    position: "relative",
                                    display: "inline-block",
                                    transition:
                                        "transform 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                        transform: "translateY(-5px)",
                                    },
                                }}
                            >
                                <Box
                                    component="img"
                                    src={car.img}
                                    alt={car.title}
                                    sx={{
                                        width: "100%",
                                        objectFit: "contain",
                                        borderRadius: 3,
                                        mb: 2,
                                        display: "block",
                                        height: {
                                            xs: 350,
                                            sm: 290,
                                            md: 270,
                                            lg: 250,
                                        },
                                    }}
                                />
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        position: "absolute",
                                        bottom: 25,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    {car.title}
                                </Typography>
                            </Box>
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default BodyTypeSection;
