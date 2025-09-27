import { Container, Box, Grid } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useEffect } from "react";
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

    useEffect(() => {
        if (!isNaN(adId)) {
            dispatch(fetchAdById(adId));
        }
    }, [adId, dispatch]);

    return (
        <MainLayout>
            <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
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
