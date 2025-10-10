import { Container, Box, Grid, CircularProgress, Alert } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useEffect, useState } from "react";
import { fetchAdById } from "../store/slices/adsSlice";
import { useParams } from "react-router-dom";
import AdDetails from "../components/SpecificAdScreen/AdDetails";
import AdGallery from "../components/SpecificAdScreen/AdGallery";
import SellerInfo from "../components/SpecificAdScreen/SellerInfo";

const SpecificAdScreen = () => {
    const { id } = useParams<{ id: string }>();
    const adId = Number(id);
    const dispatch = useAppDispatch();
    const { currentAd, loading, error } = useAppSelector((state) => state.ads);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (!isNaN(adId)) {
            dispatch(fetchAdById(adId));
        }
    }, [adId, dispatch]);

    useEffect(() => {
        if (
            currentAd &&
            (!currentAd.images || currentAd.images.length === 0) &&
            retryCount < 3
        ) {
            const timer = setTimeout(() => {
                dispatch(fetchAdById(adId));
                setRetryCount((prev) => prev + 1);
            }, 2000);
            return () => clearInterval(timer);
        }
    }, [currentAd, adId, dispatch, retryCount]);

    if (loading) {
        return (
            <MainLayout>
                <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
                    <Box
                        sx={{
                            height: "60vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CircularProgress size={60} />
                    </Box>
                </Container>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
                    <Alert severity="error" sx={{ mt: 3 }}>
                        {error}
                    </Alert>
                </Container>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
                {(!currentAd?.images || currentAd?.images.length === 0) &&
                    retryCount < 3 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Images are being processed... This may take a few
                            moments.
                        </Alert>
                    )}
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }} sx={{ mt: 3 }}>
                        {currentAd ? (
                            <>
                                {/* Photos */}
                                <AdGallery images={currentAd.images || []} />
                                {/* Details */}
                                <AdDetails ad={currentAd} />
                            </>
                        ) : (
                            <Box
                                sx={{
                                    height: 400,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "background.paper",
                                    boxShadow: 2,
                                    borderRadius: 3,
                                }}
                            >
                                Loading...
                            </Box>
                        )}
                    </Grid>

                    {/* Seller info */}
                    <Grid
                        size={{ xs: 12, md: 4 }}
                        sx={{
                            position: "sticky",
                            top: 70,
                            alignSelf: "flex-start",
                        }}
                    >
                        {currentAd ? (
                            <SellerInfo ad={currentAd} user={currentAd.user} />
                        ) : (
                            <Box
                                mt={3}
                                p={3}
                                bgcolor="background.paper"
                                borderRadius={3}
                                boxShadow={2}
                                sx={{ position: "sticky", top: 20 }}
                            >
                                Loading...
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </MainLayout>
    );
};

export default SpecificAdScreen;
