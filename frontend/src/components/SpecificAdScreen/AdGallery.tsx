import { useState } from "react";
import { Box, Dialog, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";

import type { CarImage } from "../../store/slices/adsSlice";

interface AdGalleryProps {
    images: CarImage[];
}

const AdGallery = ({ images }: AdGalleryProps) => {
    const [selectedId, setSelectedId] = useState(0);
    const [openWindow, setOpenWindow] = useState(false);

    const handleOpen = (id: number) => {
        setSelectedId(id);
        setOpenWindow(true);
    };

    const handleClose = () => setOpenWindow(false);

    const prevImage = () =>
        setSelectedId((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    const nextImage = () =>
        setSelectedId((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    return (
        <Box>
            <Box
                sx={{
                    mb: 0.5,
                    height: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    borderRadius: 3,
                    overflow: "hidden",
                }}
                onClick={() => handleOpen(selectedId)}
            >
                <img
                    src={images[selectedId].image}
                    alt={`Car ${selectedId + 1}`}
                    style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "cover",
                    }}
                />
            </Box>
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
                {images.map((img, id) => (
                    <Box
                        key={img.id}
                        onClick={() => setSelectedId(id)}
                        sx={{
                            height: 80,
                            width: 100,
                            borderRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            border:
                                id === selectedId
                                    ? "1px solid #3881ff"
                                    : "1px solid #ccc",
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src={img.image}
                            alt={`Thumb ${id + 1}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </Box>
                ))}
            </Box>
            <Dialog fullScreen open={openWindow} onClose={handleClose}>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        fontSize: 20,
                        zIndex: 10,
                    }}
                >
                    <CloseIcon sx={{ color: "#fff" }} />
                </IconButton>

                <IconButton
                    onClick={prevImage}
                    sx={{
                        position: "absolute",
                        left: 20,
                        top: "50%",
                        zIndex: 10,
                    }}
                >
                    <ArrowBackIosIcon sx={{ fontSize: 20, color: "#fff" }} />
                </IconButton>

                <IconButton
                    onClick={nextImage}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: "50%",
                        zIndex: 10,
                    }}
                >
                    <ArrowForwardIosIcon sx={{ fontSize: 20, color: "#fff" }} />
                </IconButton>

                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: "#000",
                    }}
                >
                    <img
                        src={images[selectedId].image}
                        alt={`Fullscreen ${selectedId + 1}`}
                        style={{
                            maxWidth: "95%",
                            maxHeight: "95%",
                            objectFit: "contain",
                        }}
                    />
                </Box>
            </Dialog>
        </Box>
    );
};

export default AdGallery;
