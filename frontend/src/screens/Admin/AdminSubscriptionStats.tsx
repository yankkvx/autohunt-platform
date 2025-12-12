import {
    Container,
    Paper,
    Box,
    Grid,
    Typography,
    FormControl,
    Select,
    MenuItem,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchSubscriptionStats } from "../../store/slices/adminSlice";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49f", "#FFBB28", "#FF8042", "#8884d8"];

const AdminSubscriptionStats = () => {
    const dispatch = useAppDispatch();
    const [period, setPeriod] = useState("day30");
    const { subscriptionStats: stats, subscriptionStatsLoading: loading } =
        useAppSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchSubscriptionStats(period));
    }, [period, dispatch]);

    const revenueChartData = stats?.revenue_by_period.map((item: any) => {
        let label;

        if (period === "day1" || period === "day7" || period === "day30") {
            label = new Date(item.period).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
            });
        } else if (period === "week") {
            label =
                "Week of " +
                new Date(item.period).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                });
        } else if (period === "year") {
            label = new Date(item.period).getFullYear().toString();
        } else {
            label = new Date(item.period).getFullYear().toString();
        }

        return {
            period: label,
            revenue: parseFloat(item.revenue || 0),
            count: item.count,
        };
    });

    const planChartData = stats?.revenue_by_plan.map((item: any) => ({
        name: item.plan_name,
        revenue: parseFloat(item.revenue || 0),
        count: item.count,
    }));

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
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4" gutterBottom fontWeight={900}>
                    Subscription Analytics
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <MenuItem value="day1">Last 24 hours</MenuItem>
                        <MenuItem value="day7">Last 7 days</MenuItem>
                        <MenuItem value="day30">Last 30 days</MenuItem>
                        <MenuItem value="month6">Last 6 months</MenuItem>
                        <MenuItem value="year">Last year</MenuItem>
                        <MenuItem value="all">All time</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                color="text.secondary"
                                gutterBottom
                                variant="h6"
                            >
                                Total Revenue
                            </Typography>
                            <Typography variant="h4" fontWeight={900}>
                                ${stats?.summary.total_revenue}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                color="text.secondary"
                                variant="h6"
                                gutterBottom
                            >
                                Total Subscriptions
                            </Typography>
                            <Typography variant="h4" fontWeight={900}>
                                {stats?.summary.total_subscriptions}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography
                                color="text.secondary"
                                variant="h6"
                                gutterBottom
                            >
                                Active Subscriptions
                            </Typography>
                            <Typography variant="h4" fontWeight={900}>
                                {stats?.summary.active_subscriptions}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={900}>
                    Revenue Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8884d8"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={900}>
                            Revenue by Plan
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={planChartData}
                                    dataKey="revenue"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {planChartData?.map(
                                        (entry: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        )
                                    )}
                                    <Tooltip />
                                    <Legend />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={900}>
                            Subscriptions by Plan
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={planChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={900}>
                    Recent Subscriptions
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Plan</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats?.recent_subscriptions.map((sub: any) => (
                                <TableRow key={sub.id}>
                                    <TableCell>{sub.user_email}</TableCell>
                                    <TableCell>{sub.plan_name}</TableCell>
                                    <TableCell>${sub.amount_paid}</TableCell>
                                    <TableCell>
                                        {new Date(
                                            sub.created_at
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: sub.is_active
                                                ? "success.main"
                                                : "error.main",
                                        }}
                                    >
                                        {sub.is_active ? "Active" : "Expired"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default AdminSubscriptionStats;
