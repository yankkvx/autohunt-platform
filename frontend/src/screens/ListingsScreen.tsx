import {
    Box,
    Drawer,
    Grid,
    IconButton,
    Container,
    Button,
    Fade,
    Pagination,
} from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ListingFilters from "../components/ListingsScreen/ListingFilters";
import AdCard from "../components/ListingsScreen/AdCard";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAds } from "../store/slices/adsSlice";
import CloseIcon from "@mui/icons-material/Close";

const ListingsScreen = () => {
    const dispatch = useAppDispatch();
    const { cars, loading, error, count, currentPage } = useAppSelector(
        (state) => state.ads
    );
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({});

    const pageSize = 16;
    const totalPages = Math.ceil(count / pageSize);

    useEffect(() => {
        dispatch(fetchAds({ page: page || 1, filters }));
    }, [dispatch, page, filters]);

    const handleFiltersChange = (newFilters: any) => {
        setFilters(newFilters);
        setPage(1);
    };

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ pt: 2, pb: 4 }}>
                <Grid container spacing={3}>
                    <Grid
                        size={{ xs: 0, md: 3 }}
                        sx={{
                            display: { xs: "none", md: "block", lg: "block" },
                        }}
                    >
                        <ListingFilters
                            filters={filters}
                            onChange={handleFiltersChange}
                        />
                    </Grid>
                    <Grid
                        size={{ xs: 12, md: 9 }}
                        sx={{ pt: { xs: "none", md: 4, lg: 4 } }}
                    >
                        <Box
                            sx={{
                                mb: 1,
                                display: {
                                    xs: "flex",
                                    md: "none",
                                    lg: "none",
                                    justifyContent: "flex-end",
                                },
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => setDrawerOpen(true)}
                            >
                                Filters
                            </Button>
                        </Box>

                        <Grid container spacing={3}>
                            {cars.map((ad) => (
                                <Grid
                                    key={ad.id}
                                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                    component={LinkRouter}
                                    to={`${ad.id}`}
                                    sx={{ textDecoration: "none" }}
                                >
                                    <AdCard ad={ad} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
                <Drawer
                    anchor="top"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    transitionDuration={300}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: "100vw",
                            height: "100vh",
                            display: "flex",
                            flexDirection: "column",
                            px: { xs: 2, sm: 3, md: 4 },
                            pt: { xs: 12, md: 16 },
                            overflowY: "auto",
                        },
                    }}
                >
                    <IconButton
                        onClick={() => setDrawerOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 80,
                            right: 15,
                            zIndex: 1201,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Fade in={drawerOpen} timeout={300}>
                        <Box
                            sx={{
                                display: "flex",
                                mx: "auto",
                                width: { xs: "20rem", sm: "25rem" },
                            }}
                        >
                            <ListingFilters
                                filters={filters}
                                onChange={handleFiltersChange}
                            />
                        </Box>
                    </Fade>
                </Drawer>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            </Container>
        </MainLayout>
    );
};

export default ListingsScreen;
