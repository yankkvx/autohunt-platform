import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Pagination,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchFavourites } from "../store/slices/favouriteSlice";
import AdCard from "../components/ListingsScreen/AdCard";
import MainLayout from "../layouts/MainLayout";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const FavouritesScreen = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { favourites, loading, error, count } = useAppSelector(
        (state) => state.favourites
    );

    const [page, setPage] = useState(1);
    const pageSize = 16;
    const totalPages = Math.ceil(count / pageSize);

    useEffect(() => {
        dispatch(fetchFavourites(page));
    }, [dispatch, page]);

    if (loading) {
        return (
            <MainLayout>
                <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            minHeight: "60vh",
                        }}
                    >
                        <CircularProgress size={80} />
                    </Box>
                </Container>
            </MainLayout>
        );
    }
    if (error) {
        return (
            <MainLayout>
                <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </MainLayout>
        );
    }

    if (!favourites || favourites.length === 0) {
        return (
            <MainLayout>
                <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            minHeight: "60vh",
                        }}
                    >
                        <FavoriteBorderIcon
                            sx={{
                                fontSize: 100,
                                color: "text.secondary",
                                mb: 2,
                            }}
                        />
                        <Typography variant="h4" gutterBottom fontWeight={600}>
                            No favourites yet
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 3, maxWidth: 350, textAlign: "justify" }}
                        >
                            Start adding cars to your favourites to see them
                            here. Browse our catalog and click the heart icon on
                            any car you like!
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/ads")}
                            sx={{ borderRadius: 2, mt: 1 }}
                        >
                            Brows Cars
                        </Button>
                    </Box>
                </Container>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight={900}>
                    Favourites
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    {favourites.length}{" "}
                    {favourites.length === 1 ? "vehicle" : "vehicles"} saved
                </Typography>
                <Grid container spacing={3}>
                    {favourites.map((fav) => (
                        <Grid
                            key={fav.id}
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                            component={LinkRouter}
                            to={`/ads/${fav.ad.id}/`}
                            sx={{ textDecoration: "none" }}
                        >
                            <AdCard ad={fav.ad} />
                        </Grid>
                    ))}
                </Grid>
                {totalPages > 1 && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 3,
                        }}
                    >
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </Container>
        </MainLayout>
    );
};
export default FavouritesScreen;
