import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import type { AdStats } from "../../store/slices/subscriptionSlice";

interface StatsCardProps {
    stats: AdStats;
}

const StatsCard = ({ stats }: StatsCardProps) => {
    return (
        <Card
            sx={{
                mb: 4,
                background:
                    "linear-gradient(135deg, #0E1A25 0%, #213B7A 50%, #3C63C7 100%)",
                color: "white",
            }}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Your Ad Limit
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                    {stats.usage} / {stats.limit}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {stats.remaining} ads remaining
                </Typography>

                {stats.active_subscriptions &&
                    stats.active_subscriptions.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Active Subscription:
                            </Typography>
                            {stats.active_subscriptions.map((sub) => (
                                <Chip
                                    key={sub.id}
                                    label={`${sub.plan_name} (+${sub.additional_ads} ads) - ${sub.days_remaining} days left`}
                                    sx={{
                                        mb: 1,
                                        color: "white",
                                        bgcolor: "rgba(255, 255, 255, 0.3)",
                                        fontWeight: 500,
                                    }}
                                />
                            ))}
                        </Box>
                    )}
            </CardContent>
        </Card>
    );
};

export default StatsCard;
