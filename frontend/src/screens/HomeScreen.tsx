import { Box } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import HeroSection from "../components/HomeScreen/HeroSection";
import FilterSection from "../components/HomeScreen/FilterSection";
import BodyTypeSection from "../components/HomeScreen/BodyTypeSection";
import LatestAdsSection from "../components/HomeScreen/LatestAdsSection";

const HomeScreen = () => {
    return (
        <MainLayout>
            <HeroSection />
            <FilterSection />
            <BodyTypeSection />
            <LatestAdsSection />
        </MainLayout>
    );
};

export default HomeScreen;
