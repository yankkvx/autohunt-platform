import { Box } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import HeroSection from "../components/HomeScreen/HeroSection";
import FilterSection from "../components/HomeScreen/FilterSection";
import BodyTypeSection from "../components/HomeScreen/BodyTypeSection";

const HomeScreen = () => {
    return (
        <MainLayout>
            <HeroSection />
            <FilterSection />
            <BodyTypeSection />
        </MainLayout>
    );
};

export default HomeScreen;
