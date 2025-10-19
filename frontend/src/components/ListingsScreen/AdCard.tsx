import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
    CircularProgress,
    Tooltip,
    Box,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {
    addFavourite,
    removeFavourite,
} from "../../store/slices/favouriteSlice";
import ImageIcon from "@mui/icons-material/Image";

const AdCard = ({ ad }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { favourites, adding, removing } = useAppSelector(
        (state) => state.favourites
    );
    const { user } = useAppSelector((state) => state.auth);

    const isFavourite = user
        ? favourites.some((fav) => fav.ad.id === ad.id)
        : false;
    const isOwner = user?.id === ad.user?.id;
    const isLoading = adding || removing;

    const handleFavouriteButton = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate("/login");
            return;
        }

        try {
            if (isFavourite) {
                await dispatch(removeFavourite(ad.id)).unwrap();
            } else {
                await dispatch(addFavourite(ad.id)).unwrap();
            }
        } catch (error) {
            console.error("Failed to update favourite: ", error);
        }
    };

    const sellerName =
        ad.user.account_type === "company"
            ? ad.user.company_name
            : ad.user.first_name;

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: 2,
                display: "flex",
                flexDirection: "column",
                height: 300,
                position: "relative",
            }}
        >
            {!isOwner && (
                <Tooltip
                    title={
                        isFavourite
                            ? "Remove from favourites"
                            : "Add to favourites"
                    }
                >
                    <IconButton
                        onClick={handleFavouriteButton}
                        disabled={isLoading}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(4px)",
                            boxShadow: 2,
                            zIndex: 1,
                            opacity: isFavourite ? 1 : 0.5,
                            transition: "all 0.5s",
                            "&: hover": {
                                bgcolor: "rgba(255, 255, 255, 1)",
                                transform: "scale(1.1)",
                            },
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={15} />
                        ) : isFavourite ? (
                            <FavoriteIcon sx={{ color: "error.main" }} />
                        ) : (
                            <FavoriteBorderIcon
                                sx={{ color: "text.secondary" }}
                            />
                        )}
                    </IconButton>
                </Tooltip>
            )}
            {ad.images?.[0]?.image ? (
                <CardMedia
                    component="img"
                    height="180"
                    image={ad.images[0]?.image}
                    alt={ad.title}
                    style={{ objectFit: "cover" }}
                />
            ) : (
                <Box
                    sx={{
                        height: 180,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "background.paper",
                    }}
                >
                    <ImageIcon sx={{ fontSize: 60, color: "text.disabled" }} />
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                        No image available
                    </Typography>
                </Box>
            )}

            <CardContent>
                <Typography variant="h6" fontWeight={600}>
                    ${ad.price}
                </Typography>
                <Typography
                    variant="subtitle1"
                    color="text.secondaty"
                    noWrap
                    title={ad.title}
                >
                    {ad.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {sellerName}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default AdCard;
