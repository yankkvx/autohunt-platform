import {
    Box,
    Container,
    Link,
    Typography,
    Grid,
    AppBar,
    Divider,
} from "@mui/material";
import { Link as LinkRouter } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                py: { xs: 4, sm: 6 },
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h5" gutterBottom fontWeight={600}>
                            AutoHunt
                        </Typography>
                        <Typography
                            variant="body2"
                            color={theme.palette.text.secondary}
                        >
                            Find your next ride or sell your car easily - all in
                            one marketplace.
                        </Typography>
                    </Grid>

                    {/* Main navigational */}
                    <Grid item xs={12} sm={2}>
                        <Typography variant="subtitle1">Explore</Typography>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            component={LinkRouter}
                            to="/ads"
                        >
                            All listings
                        </Link>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            component={LinkRouter}
                            to="/post-ad"
                        >
                            Create a listing
                        </Link>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            component={LinkRouter}
                            to="/favorites"
                        >
                            Favorites
                        </Link>
                    </Grid>

                    {/* Legal and service */}

                    <Grid item xs={12} sm={2}>
                        <Typography variant="subtitle1">
                            Legal & Service
                        </Typography>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            component={LinkRouter}
                            to="/terms-of-service"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            component={LinkRouter}
                            to="/privacy-policy"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            component={LinkRouter}
                            to="/privacy-policy"
                        >
                            Safety
                        </Link>
                    </Grid>

                    {/* Social links */}
                    <Grid item xs={12} sm={2}>
                        <Typography variant="subtitle1">Social</Typography>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            target="_blank"
                            href="https://www.facebook.com/autohunt"
                        >
                            Facebook
                        </Link>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            target="_blank"
                            href="https://www.instagram.com/autohunt"
                        >
                            Instagram
                        </Link>
                        <Link
                            color="inherit"
                            underline="hover"
                            display="block"
                            target="_blank"
                            href="https://www.tiktok.com/autohunt"
                        >
                            TikTok
                        </Link>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                >
                    &copy; {new Date().getFullYear()} AutoHunt. All rights
                    reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
