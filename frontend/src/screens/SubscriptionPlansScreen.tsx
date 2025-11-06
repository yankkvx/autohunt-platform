import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    Snackbar,
    Container,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
    fetchSubscriptionPlans,
    fetchAdStats,
    activateSubscription,
    clearErrors,
} from "../store/slices/subscriptionSlice";
import type { SubscriptionPlan } from "../store/slices/subscriptionSlice";
import StatsCard from "../components/Subscriptions/StatsCard";
import SubscriptionCard from "../components/Subscriptions/SubscriptionCard";
import MainLayout from "../layouts/MainLayout";
import { MAIN_URL } from "../api-config";
import axios from "axios";

const PAYPAL_CLIENT_ID: string = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

const SubscruptionPlansScreen = () => {
    const dispatch = useAppDispatch();
    const plans = useAppSelector((state) => state.subscription.plans);
    const plansLoading = useAppSelector(
        (state) => state.subscription.plansLoading
    );
    const stats = useAppSelector((state) => state.subscription.adStats);
    const statsLoading = useAppSelector(
        (state) => state.subscription.statsLoading
    );
    const activating = useAppSelector((state) => state.subscription.activating);
    const activateError = useAppSelector(
        (state) => state.subscription.activatingError
    );
    const user = useAppSelector((state) => state.auth.user);

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
        null
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        dispatch(fetchSubscriptionPlans());
        if (user) {
            dispatch(fetchAdStats());
        }
    }, [dispatch, user]);

    const handlePlanSelect = (plan: SubscriptionPlan) => {
        if (!user) {
            setWarningMessage("Login to purchase a subscription plan");
            return;
        }

        if (user.account_type !== "company") {
            setWarningMessage(
                "Only company accounts can purchase subscription plans"
            );
            return;
        }
        setSelectedPlan(plan);
        setDialogOpen(true);
    };

    const validateBeforePurchase = async () => {
        const token = user?.access;
        try {
            await axios.post(
                `${MAIN_URL}/subscriptions/validate-purchase/`,
                { plan_id: selectedPlan!.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return true;
        } catch (error: any) {
            const msg =
                error.response?.data?.detail || "Purchase validation error";
            setWarningMessage(msg);
            return false;
        }
    };

    const handleApprove = async (data: any, actions: any) => {
        if (!selectedPlan) return;
        setProcessingPayment(true);

        try {
            const details = await actions.order.capture();

            await dispatch(
                activateSubscription({
                    plan_id: selectedPlan.id,
                    paypal_order_id: data.orderID,
                    paypal_payer_id: data.payerID,
                })
            ).unwrap();

            setDialogOpen(false);
            setSelectedPlan(null);
            setSuccessMessage("Subscription activated successfully!");

            dispatch(fetchAdStats());
        } catch (error: any) {
            setWarningMessage(
                error.response?.data?.detail ||
                    'Failed to activate subscription"'
            );
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleCloseError = () => {
        dispatch(clearErrors());
    };
    const handleCloseSuccess = () => {
        setSuccessMessage("");
    };
    const handleCloseWarning = () => {
        setWarningMessage("");
    };
    const handleDialogClose = () => {
        if (!processingPayment) {
            setDialogOpen(false);
            setSelectedPlan(null);
        }
    };

    const getButtonText = (plan: SubscriptionPlan) => {
        if (!user) return "Login Required";
        if (user.account_type !== "company") return "Company Only";
        if (!plan.is_active) return "Not Available";
        return "Purchase Plan";
    };

    const isCardDisabled = (plan: SubscriptionPlan) => {
        return !user || user.account_type !== "company" || !plan.is_active;
    };

    if (plansLoading && plans.length === 0) {
        return (
            <MainLayout>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "60vh",
                    }}
                >
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }
    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight={900}>
                    Subscriptions Plans
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Expand your advertising capacity with our flexible
                    subscription plans
                </Typography>
                <Snackbar
                    open={!!activateError}
                    autoHideDuration={5000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert severity="error" onClose={handleCloseError}>
                        {activateError}
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={5000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert severity="success" onClose={handleCloseSuccess}>
                        {successMessage}
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={!!warningMessage}
                    autoHideDuration={5000}
                    onClose={handleCloseWarning}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert severity="warning" onClose={handleCloseWarning}>
                        {warningMessage}
                    </Alert>
                </Snackbar>
                {stats && user && !statsLoading && <StatsCard stats={stats} />}

                {user && user.account_type !== "company" && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Subscription plans are only available for company
                        account.
                    </Alert>
                )}

                <Grid container spacing={3} justifyContent="center">
                    {plans.map((plan) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={plan.id}>
                            <SubscriptionCard
                                plan={plan}
                                onPlanSelect={handlePlanSelect}
                                disabled={isCardDisabled(plan)}
                                disabledReason={getButtonText(plan)}
                            />
                        </Grid>
                    ))}
                </Grid>

                {plans.length === 0 && !plansLoading && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No subscription plans available at the moment.
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Please check back later or contact support.
                        </Typography>
                    </Box>
                )}

                <Dialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography fontWeight={900}>
                            Complete Purchase
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        {selectedPlan && (
                            <>
                                <Card sx={{ mb: 3, bgcolor: "grey.50" }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {selectedPlan.name}
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            color="primary"
                                            gutterBottom
                                            fontWeight={900}
                                        >
                                            ${selectedPlan.price}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {selectedPlan.description}
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Alert severity="info" sx={{ mb: 3 }}>
                                    You will receive +
                                    {selectedPlan.additional_ads} additional ads
                                    slots valid for {selectedPlan.duration_days}{" "}
                                    days
                                </Alert>

                                <Box sx={{ mt: 3 }}>
                                    {PAYPAL_CLIENT_ID ? (
                                        <PayPalScriptProvider
                                            options={{
                                                clientId: PAYPAL_CLIENT_ID,
                                                currency: "USD",
                                            }}
                                        >
                                            <PayPalButtons
                                                style={{
                                                    layout: "vertical",
                                                    color: "gold",
                                                    shape: "rect",
                                                    label: "paypal",
                                                }}
                                                createOrder={async (
                                                    data,
                                                    actions
                                                ) => {
                                                    const ok =
                                                        await validateBeforePurchase();
                                                    if (!ok) {
                                                        throw new Error(
                                                            "Validation failed"
                                                        );
                                                    }
                                                    return actions.order.create(
                                                        {
                                                            intent: "CAPTURE",
                                                            purchase_units: [
                                                                {
                                                                    amount: {
                                                                        value: selectedPlan.price,
                                                                        currency_code:
                                                                            "USD",
                                                                    },
                                                                    description: `${selectedPlan.name} - ${selectedPlan.additional_ads} additional ads for ${selectedPlan.duration_days} days.`,
                                                                },
                                                            ],
                                                        }
                                                    );
                                                }}
                                                onApprove={handleApprove}
                                                onError={(error) => {
                                                    console.error(
                                                        "Paypal error: ",
                                                        error
                                                    );
                                                    setProcessingPayment(false);
                                                    if (
                                                        error.message !==
                                                        "Validation failed"
                                                    ) {
                                                        setWarningMessage(
                                                            "Payment processing error occurred"
                                                        );
                                                    }
                                                }}
                                                disabled={processingPayment}
                                            />
                                        </PayPalScriptProvider>
                                    ) : (
                                        <Alert severity="warning">
                                            <Typography
                                                variant="body2"
                                                fontWeight={900}
                                                gutterBottom
                                            >
                                                Paypal Client IT is not
                                                configured.
                                            </Typography>
                                        </Alert>
                                    )}
                                </Box>
                                {processingPayment && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            mt: 2,
                                        }}
                                    >
                                        <CircularProgress size={24} />
                                        <Typography
                                            variant="body2"
                                            sx={{ ml: 2 }}
                                        >
                                            Processing payment...
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </MainLayout>
    );
};

export default SubscruptionPlansScreen;
