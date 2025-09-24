import { Card, CardContent, CardMedia, Typography } from "@mui/material";

const AdCard = ({ ad }) => {
    const sellerName =
        ad.user.account_type === "company"
            ? ad.user.company_name
            : ad.user.first_name;
    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: 2,
                display: "flex",
                flexDirection: "column",
                height: 300,
            }}
        >
            <CardMedia
                component="img"
                height="180"
                image={ad.images[0]?.image}
                alt={ad.title}
                style={{ objectFit: "cover" }}
            />
            <CardContent>
                <Typography variant="h6" fontWeight={600}>
                    ${ad.price}
                </Typography>
                <Typography
                    variant="subtitle1"
                    color="text.secondaty"
                    noWrap
                    title={ad.title}
                >
                    {ad.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {sellerName}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default AdCard;
