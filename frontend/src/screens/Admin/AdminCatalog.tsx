import {
    Box,
    Container,
    Paper,
    Tabs,
    Tab,
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
    createCatalogItem,
    editCatalogItem,
    deleteCatalogItem,
    clearErrors,
} from "../../store/slices/adminSlice";
import {
    fetchCatalog,
    fetchExtendedFilters,
} from "../../store/slices/catalogSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
    return (
        <Box hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </Box>
    );
};

const catalogTypes = [
    { type: "brands", label: "Brands", hasParent: false },
    { type: "models", label: "Models", hasParent: true },
    { type: "body-types", label: "Body Types", hasParent: false },
    { type: "fuel-types", label: "Fuel Types", hasParent: false },
    { type: "drive-types", label: "Drive Types", hasParent: false },
    { type: "transmissions", label: "Transmissions", hasParent: false },
    { type: "colors", label: "Colors", hasParent: false },
    {
        type: "interior-materials",
        label: "Interior Materials",
        hasParent: false,
    },
];

const AdminCatalog = () => {
    const dispatch = useAppDispatch();
    const {
        brands,
        models,
        bodyTypes,
        fuelTypes,
        driveTypes,
        transmissions,
        colors,
        interiorMaterials,
    } = useAppSelector((state) => state.catalog);
    const { catalogLoading, catalogError } = useAppSelector(
        (state) => state.admin
    );

    const [tabValue, setTabValue] = useState(0);
    const [dialog, setDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        type: string;
        item?: any;
    }>({ open: false, mode: "create", type: "" });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: string;
        id: number | null;
    }>({ open: false, type: "", id: null });

    const currentType = catalogTypes[tabValue].type;
    const hasParent = catalogTypes[tabValue].hasParent;

    const getDataForTab = (type: string) => {
        switch (type) {
            case "brands":
                return brands;
            case "models":
                return models;
            case "body-types":
                return bodyTypes;
            case "fuel-types":
                return fuelTypes;
            case "drive-types":
                return driveTypes;
            case "transmissions":
                return transmissions;
            case "colors":
                return colors;
            case "interior-materials":
                return interiorMaterials;
            default:
                return [];
        }
    };

    useEffect(() => {
        dispatch(fetchCatalog());
        dispatch(fetchExtendedFilters());
    }, [dispatch]);

    const validationSchema = Yup.object({
        name: Yup.string().required("Name is required."),
        brand_id: hasParent
            ? Yup.number().required("Brand is required.")
            : Yup.number(),
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            brand_id: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            dispatch(clearErrors());
            const data = hasParent
                ? { name: values.name, brand_id: Number(values.brand_id) }
                : { name: values.name };
            let result;
            if (dialog.mode === "create") {
                result = await dispatch(
                    createCatalogItem({ type: dialog.type, data })
                );
            } else if (dialog.item) {
                result = await dispatch(
                    editCatalogItem({
                        type: dialog.type,
                        id: dialog.item.id,
                        data,
                    })
                );
            }
            if (result?.type.endsWith("/fulfilled")) {
                dispatch(clearErrors());
                handleCloseDialog();
                await dispatch(fetchCatalog());
                await dispatch(fetchExtendedFilters());
            }
        },
    });

    const handleOpenDialog = (
        mode: "create" | "edit",
        type: string,
        item?: any
    ) => {
        dispatch(clearErrors());
        setDialog({ open: true, mode, type, item });
        if (mode === "edit" && item) {
            formik.setValues({
                name: item.name,
                brand_id: item.brand?.id || "",
            });
        } else {
            formik.resetForm();
        }
    };

    const handleCloseDialog = () => {
        setDialog({ open: false, mode: "create", type: "" });
        formik.resetForm();
        dispatch(clearErrors());
    };

    const handleDeleteButton = (type: string, id: number) => {
        dispatch(clearErrors());
        setDeleteDialog({ open: true, type, id });
    };

    const handleDeleteConfirm = async () => {
        if (deleteDialog.id) {
            const result = await dispatch(
                deleteCatalogItem({
                    type: deleteDialog.type,
                    id: deleteDialog.id,
                })
            );
            if (result.type.endsWith("/fulfilled")) {
                setDeleteDialog({ open: false, type: "", id: null });
                await dispatch(fetchCatalog());
                await dispatch(fetchExtendedFilters());
            }
        }
    };

    if (catalogLoading) {
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
                Catalog Management
            </Typography>

            <Paper>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {catalogTypes.map((cat, index) => (
                        <Tab key={cat.type} label={cat.label} />
                    ))}
                </Tabs>

                {catalogTypes.map((cat, index) => (
                    <TabPanel key={cat.type} value={tabValue} index={index}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mb: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() =>
                                    handleOpenDialog("create", cat.type)
                                }
                            >
                                Add {cat.label}
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        {cat.hasParent && (
                                            <TableCell>Brand</TableCell>
                                        )}
                                        <TableCell align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getDataForTab(cat.type).map(
                                        (item: any) => (
                                            <TableRow key={item.id} hover>
                                                <TableCell>{item.id}</TableCell>
                                                <TableCell>
                                                    {item.name}
                                                </TableCell>
                                                {cat.hasParent && (
                                                    <TableCell>
                                                        {item.brand?.name}
                                                    </TableCell>
                                                )}
                                                <TableCell align="right">
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleOpenDialog(
                                                                    "edit",
                                                                    cat.type,
                                                                    item
                                                                )
                                                            }
                                                            disabled={
                                                                catalogLoading
                                                            }
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleDeleteButton(
                                                                    cat.type,
                                                                    item.id
                                                                )
                                                            }
                                                            color="error"
                                                            disabled={
                                                                catalogLoading
                                                            }
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {getDataForTab(cat.type).length === 0 && (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    No items found
                                </Typography>
                            </Box>
                        )}
                    </TabPanel>
                ))}
            </Paper>

            <Dialog
                open={dialog.open}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle>
                        {dialog.mode === "create" ? "Create" : "Edit"}{" "}
                        {
                            catalogTypes.find((c) => c.type === dialog.type)
                                ?.label
                        }
                    </DialogTitle>
                    <DialogContent>
                        {catalogError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {catalogError}
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
                            {hasParent && (
                                <TextField
                                    fullWidth
                                    select
                                    label="Brand"
                                    name="brand_id"
                                    value={formik.values.brand_id}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.brand_id &&
                                        Boolean(formik.errors.brand_id)
                                    }
                                    helperText={
                                        formik.touched.brand_id &&
                                        formik.errors.brand_id
                                    }
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </TextField>
                            )}
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
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} type="button">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={catalogLoading}
                        >
                            {catalogLoading ? (
                                <CircularProgress size={22} />
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
                    setDeleteDialog({ open: false, type: "", id: null })
                }
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    {catalogError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {catalogError}
                        </Alert>
                    )}
                    <Typography variant="body1">
                        Are you sure you want to delete this item?
                    </Typography>
                    <Typography variant="subtitle1">
                        This action cannnot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setDeleteDialog({ open: false, type: "", id: null })
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={catalogLoading}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminCatalog;
