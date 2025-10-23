import { Box, Typography, Avatar, Button, Link } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import type { CarDetailes, UserDetail } from "../../store/slices/adsSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    addFavourite,
    removeFavourite,
    fetchFavourites,
} from "../../store/slices/favouriteSlice";
import { useEffect } from "react";
import { getOrCreateChat } from "../../store/slices/chatSlice";

interface SellerInfoProps {
    ad: CarDetailes;
    user: UserDetail;
}

const SellerInfo = ({ ad, user }: SellerInfoProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user: authUser } = useAppSelector((state) => state.auth);
    const { favourites, adding, removing } = useAppSelector(
        (state) => state.favourites
    );

    const isOwner =
        authUser?.id &&
        ad?.user?.id &&
        Number(authUser.id) === Number(ad.user.id);

    const isFavourite = favourites.some((fav) => fav.ad.id === ad.id);

    useEffect(() => {
        dispatch(fetchFavourites());
    }, [dispatch]);

    const handleFavouriteClick = () => {
        if (isFavourite) {
            dispatch(removeFavourite(ad.id));
        } else {
            dispatch(addFavourite(ad.id));
        }
    };

    const handleWriteMessage = async () => {
        const result = await dispatch(getOrCreateChat(ad.id));
        if (getOrCreateChat.fulfilled.match(result)) {
            navigate(`/chat/${result.payload.id}`);
        }
    };

    return (
        <Box
            sx={{
                mt: 3,
                bgcolor: "background.paper",
                boxShadow: 2,
                borderRadius: 3,
                p: 3,
                width: { lg: 300 },
                maxWidth: 350,
            }}
        >
            <Typography variant="h5" color="text.secondary" noWrap>
                {ad.title}
            </Typography>
            <Typography variant="h5" fontWeight={600} color="primary">
                ${ad.price}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <Avatar
                    alt="avarar"
                    src={user.profile_image}
                    sx={{ width: 56, height: 56 }}
                />
                <Box
                    sx={{
                        display: "flex",
                        ml: 1,
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    <Typography
                        component={LinkRouter}
                        to={`/users/${user.id}`}
                        sx={{
                            textDecoration: "none",
                            color: "text.primary",
                            "&:hover": { textDecoration: "underline" },
                        }}
                    >
                        {user.account_type === "company"
                            ? user.company_name
                            : `${user.first_name} ${user.last_name}`}
                    </Typography>
                    <Typography
                        sx={{
                            textTransform: "capitalize",
                            color: "text.secondary",
                            fontSize: "0.9rem",
                        }}
                    >
                        {user.account_type}
                    </Typography>
                </Box>
            </Box>

            <Box pt={2}>
                <Typography variant="subtitle1">Contacts</Typography>
                <Typography display="flex" alignItems="center" gap={1} noWrap>
                    <EmailIcon fontSize="small" />
                    <Link href={`mailto:${user.email}`}>{user.email}</Link>
                </Typography>
                <Typography display="flex" alignItems="center" gap={1} noWrap>
                    <PhoneIcon fontSize="small" />
                    <Link href={`tel:${user.phone_number}`}>
                        {user.phone_number}
                    </Link>
                </Typography>
            </Box>
            {isOwner ? (
                <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/ads/${ad.id}/edit`)}
                    >
                        Edit
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                    <Button variant="contained" onClick={handleWriteMessage}>Send message</Button>
                    <Button
                        variant="contained"
                        color="info"
                        sx={{ mt: 1 }}
                        onClick={handleFavouriteClick}
                        disabled={adding || removing}
                    >
                        {isFavourite
                            ? "Remove from favourites"
                            : "Add to favourites"}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default SellerInfo;
