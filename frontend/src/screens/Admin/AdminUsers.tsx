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
    Link,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    fetchAllUsers,
    toggleUserActive,
    toggleUserStaff,
    deleteUserByAdmin,
    clearErrors,
} from "../../store/slices/adminSlice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";

const AdminUsers = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { users, usersLoading, actionLoading, actionError } = useAppSelector(
        (state) => state.admin
    );
    const currentUser = useAppSelector((state) => state.auth.user);

    const [searchTerm, setSearchTerm] = useState("");
    const [accountTypeFilter, setAccountTypeFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("");
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        userId: number | null;
    }>({ open: false, userId: null });

    useEffect(() => {
        dispatch(fetchAllUsers({}));
    }, [dispatch]);

    const handleSearch = () => {
        dispatch(
            fetchAllUsers({
                search: searchTerm,
                account_type: accountTypeFilter,
                is_active: activeFilter ? activeFilter : undefined,
            })
        );
    };

    const handleToggleActive = (userId: number) => {
        dispatch(toggleUserActive(userId));
    };

    const handleToggleStaff = (userId: number) => {
        dispatch(toggleUserStaff(userId));
    };

    const handleDeleteButton = (userId: number) => {
        setDeleteDialog({ open: true, userId });
    };

    const handleDeleteConfirm = () => {
        if (deleteDialog.userId) {
            dispatch(deleteUserByAdmin(deleteDialog.userId)).then(() => {
                setDeleteDialog({ open: false, userId: null });
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, userId: null });
    };

    const handleShowProfile = (userId: number) => {
        navigate(`/users/${userId}`);
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setAccountTypeFilter("");
        setActiveFilter("");
        dispatch(fetchAllUsers({}));
    };

    if (usersLoading) {
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
                User Management
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
                        placeholder="Email, name..."
                        sx={{ minWidth: 200 }}
                    />
                    <TextField
                        select
                        label="Account Type"
                        variant="outlined"
                        size="small"
                        value={accountTypeFilter}
                        onChange={(e) => setAccountTypeFilter(e.target.value)}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                        <MenuItem value="company">Comapny</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Status"
                        variant="outlined"
                        size="small"
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Banned</MenuItem>
                    </TextField>
                    <Button variant="contained" onClick={handleSearch}>
                        Search
                    </Button>
                    <Button variant="outlined" onClick={handleResetFilters}>
                        Reset
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Account Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>
                                    <Link
                                        href={`mailto:${user.email}`}
                                        sx={{
                                            textDecoration: "none",
                                            color: "inherit",
                                        }}
                                    >
                                        {user.email}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell>{user.phone_number}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={
                                            user.account_type
                                                ? user.account_type
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  user.account_type.slice(1)
                                                : ""
                                        }
                                        size="small"
                                        color={
                                            user.account_type === "company"
                                                ? "primary"
                                                : "default"
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={
                                            user.is_active ? "Active" : "Banned"
                                        }
                                        size="small"
                                        color={
                                            user.is_active ? "default" : "error"
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.is_staff ? "Admin" : "User"}
                                        size="small"
                                        color={
                                            user.is_staff
                                                ? "secondary"
                                                : "default"
                                        }
                                        icon={
                                            user.is_staff ? (
                                                <AdminPanelSettingsIcon />
                                            ) : (
                                                <PersonIcon />
                                            )
                                        }
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View Ad">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleShowProfile(user.id)}
                                            color="primary"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            user.is_active
                                                ? "Ban user"
                                                : "Unban user"
                                        }
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleToggleActive(user.id)
                                            }
                                            disabled={
                                                actionLoading ||
                                                user.id === currentUser?.id
                                            }
                                            color={
                                                user.is_active
                                                    ? "error"
                                                    : "success"
                                            }
                                        >
                                            {user.is_active ? (
                                                <BlockIcon />
                                            ) : (
                                                <CheckCircleIcon />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip
                                        title={
                                            user.is_staff
                                                ? "Revoke admin"
                                                : "Promote user"
                                        }
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleToggleStaff(user.id)
                                            }
                                            disabled={
                                                actionLoading ||
                                                user.id === currentUser?.id
                                            }
                                            color={
                                                user.is_staff
                                                    ? "error"
                                                    : "success"
                                            }
                                        >
                                            <AdminPanelSettingsIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Delete user">
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleDeleteButton(user.id)
                                            }
                                            disabled={
                                                actionLoading ||
                                                user.id === currentUser?.id
                                            }
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

            {users.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        No users found
                    </Typography>
                </Box>
            )}

            <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete this user?
                    </Typography>
                    <Typography variant="subtitle1">
                        This action cannnot be undone.
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

export default AdminUsers;
