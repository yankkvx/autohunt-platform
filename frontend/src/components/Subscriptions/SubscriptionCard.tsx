import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
} from "@mui/material";
import type { SubscriptionPlan } from "../../store/slices/subscriptionSlice";

interface SubscriptionCardProps {
    plan: SubscriptionPlan;
    onPlanSelect: (plan: SubscriptionPlan) => void;
    disabled?: boolean;
    disabledReason?: string;
}

const SubscriptionCard = ({
    plan,
    onPlanSelect,
    disabled = false,
    disabledReason = "Choose Plan",
}: SubscriptionCardProps) => {
    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                border: "3px solid transparent",
                "&:hover": {
                    transform: disabled ? "none" : "translateY(-8px)",
                    boxShadow: disabled ? 1 : 6,
                    borderColor: disabled ? "transparent" : "primary.main",
                },
            }}
        >
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    fontWeight={900}
                >
                    {plan.name}
                </Typography>
                <Box sx={{ my: 2 }}>
                    <Typography variant="h3" color="primary" fontWeight={900}>
                        ${plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        per month
                    </Typography>
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minHeight: 60, textAlign: 'justify'}}
                >
                    {plan.description}
                </Typography>

                <Box sx={{ mt: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Additional ads:
                        </Typography>
                        <Chip
                            label={`+${plan.additional_ads}`}
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                        />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            Valid for
                        </Typography>
                        <Chip
                            label={`${plan.duration_days} days`}
                            color="secondary"
                            size="small"
                            sx={{ ml: 1 }}
                        />
                    </Box>
                </Box>
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => onPlanSelect(plan)}
                    disabled={disabled}
                    size="large"
                    sx={{ py: 1.5, fontWeight: 600 }}
                >
                    {disabledReason}
                </Button>
            </Box>
        </Card>
    );
};

export default SubscriptionCard;
