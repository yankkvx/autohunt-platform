import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Avatar,
    Link,
    Divider,
    IconButton,
    CircularProgress,
    Pagination,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Button,
} from "@mui/material";
import { Link as LinkRouter, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MAIN_URL } from "../api-config";
import MainLayout from "../layouts/MainLayout";
import { useAppSelector } from "../store/hooks";
import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import TelegramIcon from "@mui/icons-material/Telegram";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import BusinessIcon from "@mui/icons-material/Business";
import AdCard from "../components/ListingsScreen/AdCard";
import LocationMap from "../components/LocationMap";

interface PublicProfile {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    account_type: string;
    profile_image: string;
    about: string;
    company_name?: string;
    company_website?: string;
    company_office?: string;
    telegram?: string;
    instagram?: string;
    twitter: string;
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
}

interface AdImage {
    id: number;
    image: string;
}

interface Ad {
    id: number;
    title: string;
    price: string;
    year: number;
    brand: string;
    model: string;
    images: AdImage[];
}

const PublicProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: authUser } = useAppSelector((state) => state.auth);
    const [user, setUser] = useState<PublicProfile | null>(null);
    const [ads, setAds] = useState<Ad[]>([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [next, setNext] = useState<string | null>(null);
    const [previous, setPrevious] = useState<string | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingAds, setLoadingAds] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string>("-created_at");

    const isOwnerProfile =
        authUser?.id && id && Number(authUser.id) === Number(id);

    const sortOptions = [
        { label: "Newest first", value: "-created_at" },
        { label: "Oldest first", value: "created_at" },
        { label: "Price: Low to High", value: "price" },
        { label: "Price: High to Low", value: "-price" },
    ];

    const fetchProfile = useCallback(async () => {
        if (!id) return;

        try {
            setLoadingProfile(true);
            setError(null);
            const response = await axios.get(`${MAIN_URL}/profile/${id}/`);
            setUser(response.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError("Profile not found or available");
            } else {
                setError("Failed to load profile.");
            }
        } finally {
            setLoadingProfile(false);
        }
    }, [id]);

    const fetchAds = useCallback(async () => {
        if (!id) return;
        try {
            setLoadingAds(true);
            const response = await axios.get(
                `${MAIN_URL}/ads/?user=${id}&page=${page}&ordering=${sortOption}`
            );
            const data = response.data;
            setAds(data.results || data);
            setCount(Math.ceil(data.count / 16));
        } catch (err: any) {
            setError("Failed to load ads.");
        } finally {
            setLoadingAds(false);
        }
    }, [id, page, sortOption]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSortChange = (value: string) => {
        setSortOption(value);
        setPage(1);
    };

    if (error) {
        return (
            <MainLayout>
                <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ pt: 2, pb: 4 }}>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid
                        size={{ xs: 12, md: 4 }}
                        sx={{
                            position: { md: "sticky" },
                            top: { md: 90 },
                            alignSelf: { md: "flex-start" },
                        }}
                    >
                        {loadingProfile ? (
                            <Box>
                                <CircularProgress size={80} />
                            </Box>
                        ) : (
                            <>
                                <Paper
                                    elevation={2}
                                    sx={{ p: 3, borderRadius: 2 }}
                                >
                                    <Box
                                        display="flex"
                                        flexDirection={{
                                            xs: "column",
                                            lg: "row",
                                        }}
                                        alignItems="center"
                                        gap={3}
                                        mb={3}
                                    >
                                        <Avatar
                                            src={user?.profile_image}
                                            sx={{
                                                width: 160,
                                                height: 160,
                                                border: "4px solid #e0e0e0",
                                            }}
                                            alt={user?.email}
                                        />
                                        <Box
                                            flex={1}
                                            sx={{
                                                minWidth: 0,
                                                wordBreak: "break-word",
                                                overflowWrap: "anywhere",
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {user?.first_name}{" "}
                                                {user?.last_name}
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                color="text.secondary"
                                            >
                                                {user?.account_type
                                                    ? user.account_type[0].toUpperCase() +
                                                      user.account_type.slice(1)
                                                    : ""}
                                            </Typography>
                                            {user?.company_name && (
                                                <Typography fontWeight={500}>
                                                    {user.company_name}
                                                </Typography>
                                            )}
                                            {user?.company_website && (
                                                <Typography
                                                    component={Link}
                                                    color="primary"
                                                    sx={{
                                                        textDecoration: "none",
                                                    }}
                                                    href={user.company_website}
                                                >
                                                    {user.company_website
                                                        .replace(
                                                            /^https?:\/\//,
                                                            ""
                                                        )
                                                        .replace(/\$/, "")}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />

                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        gap={2}
                                    >
                                        <Typography
                                            component={Link}
                                            href={`mailto:${user?.email}`}
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                alignItems: "center",
                                                textDecoration: "none",
                                                color: "text.primary",
                                                "&:hover": {
                                                    color: "primary.main",
                                                },
                                            }}
                                        >
                                            <EmailIcon fontSize="small" />
                                            {user?.email}
                                        </Typography>

                                        <Typography
                                            component={Link}
                                            href={`tel:${user?.phone_number}`}
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                alignItems: "center",
                                                textDecoration: "none",
                                                color: "text.primary",
                                                "&:hover": {
                                                    color: "primary.main",
                                                },
                                            }}
                                        >
                                            <LocalPhoneIcon fontSize="small" />
                                            {user?.phone_number}
                                        </Typography>
                                        {(user?.telegram ||
                                            user?.twitter ||
                                            user?.instagram) && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                {user?.telegram && (
                                                    <IconButton
                                                        component={Link}
                                                        href={user.telegram}
                                                        target="_blank"
                                                        sx={{
                                                            p: 0,
                                                            color: "text.primary",
                                                            "&:hover": {
                                                                color: "primary.main",
                                                            },
                                                        }}
                                                    >
                                                        <TelegramIcon />
                                                    </IconButton>
                                                )}
                                                {user?.twitter && (
                                                    <IconButton
                                                        component={Link}
                                                        href={user.twitter}
                                                        target="_blank"
                                                        sx={{
                                                            p: 0,
                                                            color: "text.primary",
                                                            "&:hover": {
                                                                color: "primary.main",
                                                            },
                                                        }}
                                                    >
                                                        <TwitterIcon />
                                                    </IconButton>
                                                )}
                                                {user?.instagram && (
                                                    <IconButton
                                                        component={Link}
                                                        href={user.instagram}
                                                        target="_blank"
                                                        sx={{
                                                            p: 0,
                                                            color: "text.primary",
                                                            "&:hover": {
                                                                color: "primary.main",
                                                            },
                                                        }}
                                                    >
                                                        <InstagramIcon />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                    {user?.about && (
                                        <Box mt={2}>
                                            <Typography variant="h6" mb={1}>
                                                About
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                textAlign="justify"
                                            >
                                                {user.about}
                                            </Typography>
                                        </Box>
                                    )}
                                    {isOwnerProfile && (
                                        <Box mt={2}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                onClick={() =>
                                                    navigate("/profile")
                                                }
                                            >
                                                Edit Profile
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>
                                {user?.account_type === "company" && (
                                    <Paper
                                        elevation={2}
                                        sx={{ p: 3, borderRadius: 2, mt: 2 }}
                                    >
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <BusinessIcon fontSize="small" />
                                                Office Location
                                            </Typography>
                                        </Box>
                                        <LocationMap
                                            height={240}
                                            latitude={user?.latitude}
                                            longitude={user?.longitude}
                                            locationName={user?.company_office}
                                        />
                                    </Paper>
                                )}
                            </>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            {loadingAds ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <CircularProgress size={60} />
                                </Box>
                            ) : ads.length > 0 ? (
                                <>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            mb: 2,
                                            gap: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            Published Ads
                                        </Typography>
                                        <FormControl
                                            size="small"
                                            sx={{ minWidth: 180 }}
                                        >
                                            <InputLabel>Sort By</InputLabel>
                                            <Select
                                                value={sortOption}
                                                label="Sort By"
                                                onChange={(e) =>
                                                    handleSortChange(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {sortOptions.map((option) => (
                                                    <MenuItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Grid container spacing={2}>
                                        {ads.map((ad) => (
                                            <Grid
                                                size={{ xs: 12, sm: 6, md: 4 }}
                                                key={ad.id}
                                            >
                                                <LinkRouter
                                                    to={`/ads/${ad.id}`}
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "inherit",
                                                        display: "block",
                                                    }}
                                                >
                                                    <AdCard ad={ad} />
                                                </LinkRouter>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {count > 1 && (
                                        <Stack alignItems="center" mt={4}>
                                            <Pagination
                                                count={count}
                                                page={page}
                                                onChange={handlePageChange}
                                                color="primary"
                                                shape="rounded"
                                            />
                                        </Stack>
                                    )}
                                </>
                            ) : (
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    mb={2}
                                >
                                    No ads yet
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </MainLayout>
    );
};
export default PublicProfile;
