import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface LocationMapProps {
    latitude?: number;
    longitude?: number;
    locationName?: string;
    height?: number;
}

const LocationMap = ({
    latitude,
    longitude,
    locationName,
    height = 300,
}: LocationMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!latitude || !longitude || !mapRef.current) return;

        // Initialize leaflet map
        const InitializeMap = async () => {
            const L = (await import("leaflet")).default;
            await import("leaflet/dist/leaflet.css");

            // Fix for default marker icon (markers dont show in Vite)
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });

            // remove old map instance first to prevent duplacate map creation
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }

            // create map and set center view
            const map = L.map(mapRef.current!).setView(
                [latitude, longitude],
                14
            );

            // add tile layer openStreetMap source
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            // create a marker on provided location
            const marker = L.marker([latitude, longitude]).addTo(map);

            // if location name (city and country) provided show popup over marker
            if (locationName) {
                marker.bindPopup(locationName).openPopup();
            }
            mapInstanceRef.current = map;

            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        };
        InitializeMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude, locationName]);

    if (!latitude || !longitude) {
        return (
            <Paper
                elevation={0}
                sx={{
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.paper",
                    borderRadius: 2,
                }}
            >
                <Box textAlign="center">
                    <LocationOnIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        Location not provided
                    </Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                height,
                overflow: "hidden",
                borderRadius: 2,
                "& .leaflet-container": {
                    height: "100%",
                    width: "100%",
                    borderRadius: 2,
                },
            }}
            elevation={0}
        >
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </Paper>
    );
};

export default LocationMap;
