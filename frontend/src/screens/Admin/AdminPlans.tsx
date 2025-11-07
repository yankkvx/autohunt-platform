import {
    Box,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableContainer,
    TableRow,
    Typography,
    IconButton,
    Chip,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    CircularProgress,
    Alert,
    Tooltip,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    createPlanByAdmin,
    editPlanByAdmin,
    deletePlanByAdmin,
    clearErrors,
} from "../../store/slices/adminSlice";
import { fetchSubscriptionPlans } from "../../store/slices/subscriptionSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

const AdminPlans = () => {
    const dispatch = useAppDispatch();
    const { plans, subscriptionsLoading } = useAppSelector(
        (state) => state.subscription
    );
    const { plansLoading, plansError } = useAppSelector((state) => state.admin);

    const [dialog, setDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        plan?: any;
    }>({ open: false, mode: "create" });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
        name: string;
    }>({ open: false, id: null, name: "" });

    useEffect(() => {
        dispatch(fetchSubscriptionPlans());
    }, [dispatch]);

    const validationSchema = Yup.object({
        name: Yup.string().required("Name is required."),
        description: Yup.string(),
        price: Yup.number()
            .required("Price is required.")
            .min(0, "Price must be positive."),
        additional_ads: Yup.number()
            .required("Additional ads is required.")
            .min(0, "Additional ads must be positive."),
        duration_days: Yup.number()
            .required("Duration is required.")
            .min(1, "Duration must be at least 1 day."),
        is_active: Yup.boolean().required(),
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            price: "",
            additional_ads: "",
            duration_days: "",
            is_active: true,
        },
        validationSchema,
        onSubmit: async (values) => {
            dispatch(clearErrors());
            const data = {
                name: values.name,
                description: values.description,
                price: Number(values.price),
                additional_ads: Number(values.additional_ads),
                duration_days: Number(values.duration_days),
                is_active: values.is_active,
            };
            let result;
            if (dialog.mode === "create") {
                result = await dispatch(createPlanByAdmin(data));
            } else if (dialog.plan) {
                result = await dispatch(
                    editPlanByAdmin({ id: dialog.plan.id, data })
                );
            }
            if (result?.type.endsWith("/fulfilled")) {
                dispatch(clearErrors());
                handleCloseDialog();
                await dispatch(fetchSubscriptionPlans());
            }
        },
    });

    const handleOpenDialog = (mode: "create" | "edit", plan?: any) => {
        dispatch(clearErrors());
        setDialog({ open: true, mode, plan });

        if (mode === "edit" && plan) {
            formik.setValues({
                name: plan.name,
                description: plan.description || "",
                price: String(plan.price),
                additional_ads: String(plan.additional_ads),
                duration_days: String(plan.duration_days),
                is_active: plan.is_active,
            });
        } else {
            formik.resetForm();
        }
    };

    const handleCloseDialog = () => {
        setDialog({ open: false, mode: "create" });
        formik.resetForm();
        dispatch(clearErrors());
    };

    const handleDeleteButton = (id: number, name: string) => {
        dispatch(clearErrors());
        setDeleteDialog({ open: true, id, name });
    };

    const handleDeleteConfirm = async () => {
        if (deleteDialog.id) {
            const result = await dispatch(deletePlanByAdmin(deleteDialog.id));
            if (result.type.endsWith("/fulfilled")) {
                setDeleteDialog({ open: false, id: null, name: "" });
                await dispatch(fetchSubscriptionPlans());
            }
        }
    };

    if (subscriptionsLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    textAlign: "center",
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
                Plans Management
            </Typography>
            <Paper>
                <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog("create")}
                    >
                        Add Plan
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Additional Ads</TableCell>
                                <TableCell>Duration (days)</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {plans.map((plan) => (
                                <TableRow key={plan.id} hover>
                                    <TableCell>{plan.id}</TableCell>
                                    <TableCell>{plan.name}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                maxWidth: 300,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {plan.description || "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>$ {plan.price}</TableCell>
                                    <TableCell>{plan.additional_ads}</TableCell>
                                    <TableCell>{plan.duration_days}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                plan.is_active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            size="small"
                                            color={
                                                plan.is_active
                                                    ? "success"
                                                    : "default"
                                            }
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleOpenDialog(
                                                        "edit",
                                                        plan
                                                    )
                                                }
                                                color="info"
                                                disabled={plansLoading}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleDeleteButton(
                                                        plan.id,
                                                        plan.name
                                                    )
                                                }
                                                color="error"
                                                disabled={plansLoading}
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

                {plans.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                            No plans found.
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Dialog
                open={dialog.open}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle>
                        {dialog.mode === "create" ? "Create" : "Edit"} Plan
                    </DialogTitle>
                    <DialogContent>
                        {plansError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {plansError}
                            </Alert>
                        )}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                pt: 1,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.name &&
                                    Boolean(formik.errors.name)
                                }
                                helperText={
                                    formik.touched.name && formik.errors.name
                                }
                            />
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                multiline
                                rows={3}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.description &&
                                    Boolean(formik.errors.description)
                                }
                                helperText={
                                    formik.touched.description &&
                                    formik.errors.description
                                }
                            />
                            <TextField
                                fullWidth
                                label="Price"
                                name="price"
                                value={formik.values.price}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.price &&
                                    Boolean(formik.errors.price)
                                }
                                helperText={
                                    formik.touched.price && formik.errors.price
                                }
                            />
                            <TextField
                                fullWidth
                                label="Additional Ads"
                                name="additional_ads"
                                value={formik.values.additional_ads}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.additional_ads &&
                                    Boolean(formik.errors.additional_ads)
                                }
                                helperText={
                                    formik.touched.additional_ads &&
                                    formik.errors.additional_ads
                                }
                            />
                            <TextField
                                fullWidth
                                label="Duration (days)"
                                name="duration_days"
                                value={formik.values.duration_days}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.duration_days &&
                                    Boolean(formik.errors.duration_days)
                                }
                                helperText={
                                    formik.touched.duration_days &&
                                    formik.errors.duration_days
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="is_active"
                                        checked={formik.values.is_active}
                                        onChange={formik.handleChange}
                                    />
                                }
                                label="Active"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} type="button">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={plansLoading}
                        >
                            {plansLoading ? (
                                <CircularProgress size={18} />
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={deleteDialog.open}
                onClose={() =>
                    setDeleteDialog({ open: false, id: null, name: "" })
                }
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    {plansError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {plansError}
                        </Alert>
                    )}
                    <Typography variant="body1">
                        Are you sure you want to delete plan {deleteDialog.name}
                    </Typography>
                    <Typography variant="subtitle1">
                        This action can not be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setDeleteDialog({
                                open: false,
                                id: null,
                                name: "",
                            })
                        }
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={plansLoading}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminPlans;
