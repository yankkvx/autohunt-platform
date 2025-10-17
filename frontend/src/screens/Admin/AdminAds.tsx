import {
    Box,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Chip,
    TextField,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    CircularProgress,
    Tooltip,
    Alert,
    DialogContent,
    Pagination,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useEffect, useState } from "react";
import { fetchAds } from "../../store/slices/adsSlice";
import { deleteAdByAdmin, clearErrors } from "../../store/slices/adminSlice";
import HideImageIcon from "@mui/icons-material/HideImage";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const AdminAds = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { cars, count, loading, currentPage } = useAppSelector(
        (state) => state.ads
    );
    const { actionLoading, actionError } = useAppSelector(
        (state) => state.admin
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        adId: number | null;
        adTitle: string;
    }>({ open: false, adId: null, adTitle: "" });

    useEffect(() => {
        dispatch(fetchAds({ page: 1, filters: {} }));
    }, [dispatch]);

    const handleSearch = () => {
        dispatch(fetchAds({ page: 1, filters: { search: searchTerm } }));
    };

    const handlePageChange = (_: any, page: number) => {
        dispatch(fetchAds({ page, filters: {} }));
    };

    const handleDeleteButton = (adId: number, adTitle: string) => {
        setDeleteDialog({ open: true, adId, adTitle });
    };

    const handleDeleteConfirm = async () => {
        if (deleteDialog.adId) {
            await dispatch(deleteAdByAdmin(deleteDialog.adId));
            await dispatch(fetchAds({ page: currentPage, filters: {} }));
            setDeleteDialog({ open: false, adId: null, adTitle: "" });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, adId: null, adTitle: "" });
    };

    const handleViewAd = (adId: number) => {
        navigate(`/ads/${adId}`);
    };

    const handleEdit = (adId: number) => {
        navigate(`/ads/${adId}/edit`);
    };

    const totalPages = Math.ceil(count / 16);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "80vh",
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight={900}>
                Ads Management
            </Typography>
            {actionError && (
                <Alert
                    severity="error"
                    onClose={() => dispatch(clearErrors())}
                    sx={{ mb: 2 }}
                >
                    {actionError}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <TextField
                        label="Search"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search ads.."
                        sx={{ minWidth: 200 }}
                    />
                    <Button variant="contained" onClick={handleSearch}>
                        Search
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Brand / Model</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Condition</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cars.map((ad) => (
                            <TableRow key={ad.id} hover>
                                <TableCell>{ad.id}</TableCell>
                                <TableCell>
                                    {ad.images.length > 0 ? (
                                        <Box
                                            component="img"
                                            sx={{
                                                height: 60,
                                                width: 60,
                                                objectFit: "cover",
                                                borderRadius: 2,
                                            }}
                                            src={ad.images[0]?.image}
                                        />
                                    ) : (
                                        <HideImageIcon
                                            sx={{ height: 60, width: 60 }}
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {ad.title}
                                    </Typography>
                                </TableCell>
                                <TableCell>{ad.model}</TableCell>
                                <TableCell>{ad.year}</TableCell>
                                <TableCell>
                                    $ {ad.price.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {ad.user.account_type === "company"
                                        ? ad.user.company_name
                                        : ad.user.first_name}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={
                                            ad.condition
                                                ? ad.condition
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  ad.condition.slice(1)
                                                : ""
                                        }
                                        size="small"
                                        color={
                                            ad.condition === "new"
                                                ? "success"
                                                : ad.condition === "used"
                                                ? "default"
                                                : ad.condition === "drowned"
                                                ? "info"
                                                : ad.condition === "restored"
                                                ? "warning"
                                                : "error"
                                        }
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View Ad">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewAd(ad.id)}
                                            color="primary"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Ad">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(ad.id)}
                                            color="info"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Ad">
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleDeleteButton(
                                                    ad.id,
                                                    ad.title
                                                )
                                            }
                                            disabled={actionLoading}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {cars.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        No ads found
                    </Typography>
                </Box>
            )}

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                    />
                </Box>
            )}

            <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete ad №{deleteDialog.adId}{" "}
                        - '{deleteDialog.adTitle}'?
                    </Typography>
                    <Typography variant="subtitle1">
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={actionLoading}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminAds;
