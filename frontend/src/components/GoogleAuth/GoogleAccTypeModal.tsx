import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        account_type: "private" | "company";
        company_name?: string;
    }) => void;
    loading?: boolean;
}

const validationSchema = Yup.object({
    account_type: Yup.string()
        .oneOf(["private", "company"])
        .required("Account type is required"),
    company_name: Yup.string().when("account_type", {
        is: "company",
        then: (schema) =>
            schema.required("Company name is required for company accounts"),
        otherwise: (schema) => schema.notRequired(),
    }),
});

const GoogleAccTypeModal = ({
    open,
    onClose,
    onSubmit,
    loading = false,
}: ModalProps) => {
    const formik = useFormik({
        initialValues: {
            account_type: "private" as "private" | "company",
            company_name: "",
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Complete Registration
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={formik.handleSubmit}>
                    <Alert severity="info" sx={{ mb: 3, mt: 2 }}>
                        Please select your account type to complete registration
                    </Alert>

                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Account type"
                        name="account_type"
                        value={formik.values.account_type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                            formik.touched.account_type &&
                            Boolean(formik.errors.account_type)
                        }
                        helperText={
                            formik.touched.account_type &&
                            formik.errors.account_type
                        }
                    >
                        <MenuItem value="private">Private</MenuItem>
                        <MenuItem value="company">Company</MenuItem>
                    </TextField>

                    {formik.values.account_type === "company" && (
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Company Name"
                            name="company_name"
                            value={formik.values.company_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.company_name &&
                                Boolean(formik.errors.company_name)
                            }
                            helperText={
                                formik.touched.company_name &&
                                formik.errors.company_name
                            }
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} disabled={loading} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={() => formik.handleSubmit()}
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Complete Registration"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GoogleAccTypeModal;
