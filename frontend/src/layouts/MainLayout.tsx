import { Box } from "@mui/material";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <Header />
            <Box sx={{ flex: 1, pt: 10 }}>{children}</Box>
            <Footer />
        </Box>
    );
};

export default MainLayout;
