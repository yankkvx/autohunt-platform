import {
    Box,
    Typography,
    Avatar,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    DialogTitle,
    Divider,
    CircularProgress,
} from "@mui/material";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HideImageIcon from "@mui/icons-material/HideImage";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

interface AdImage {
    id: number;
    image: string;
}

interface Ad {
    id: number;
    title: string;
    price: number | string;
    year: number;
    images: AdImage[];
}

interface ProfileAdsListProps {
    ads: Ad[];
    onView: (adId: number) => void;
    onEdit: (adId: number) => void;
    onDelete: (adId: number) => void;
    deleteAd?: boolean;
}

const ProfileAdsList = ({
    ads,
    onView,
    onEdit,
    onDelete,
    deleteAd = false,
}: ProfileAdsListProps) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adDelete, setAdDelete] = useState<number | null>(null);

    const handleDeleteClick = (adId: number) => {
        setAdDelete(adId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (adDelete) {
            onDelete(adDelete);
        }
        setDeleteDialogOpen(false);
        setAdDelete(null);
    };
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setAdDelete(null);
    };

    if (ads.length === 0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 6,
                }}
            >
                <DirectionsCarIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No ads yet
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <List sx={{ p: 0 }}>
                {ads.map((ad, index) => (
                    <Box key={ad.id}>
                        <ListItem
                            secondaryAction={
                                <Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => onView(ad.id)}
                                        title="View"
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(ad.id)}
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteClick(ad.id)}
                                        title="Delete"
                                        sx={{ color: "error.main" }}
                                    >
                                        {deleteAd ? (
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                        ) : (
                                            <DeleteIcon />
                                        )}
                                    </IconButton>
                                </Box>
                            }
                        >
                            <ListItemAvatar>
                                {ad.images.length > 0 ? (
                                    <Avatar
                                        variant="rounded"
                                        src={ad.images?.[0].image}
                                        sx={{
                                            height: 48,
                                            width: 48,
                                        }}
                                    />
                                ) : (
                                    <HideImageIcon
                                        sx={{
                                            height: 48,
                                            width: 48,
                                            color: "text.secondary",
                                        }}
                                    />
                                )}
                            </ListItemAvatar>
                            <ListItemText
                                disableTypography
                                primary={
                                    <Typography
                                        variant="subtitle2"
                                        color="primary"
                                        sx={{ fontSize: "16px" }}
                                    >
                                        {ad.title}
                                    </Typography>
                                }
                                secondary={
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: "14px" }}
                                    >{`$${ad.price} - ${ad.year}`}</Typography>
                                }
                            />
                        </ListItem>
                        {index < ads.length - 1 && <Divider component="li" />}
                    </Box>
                ))}
            </List>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Advertisement</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this ad? This action
                        cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        autoFocus
                        startIcon={
                            deleteAd ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : null
                        }
                    >
                        {deleteAd ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProfileAdsList;
