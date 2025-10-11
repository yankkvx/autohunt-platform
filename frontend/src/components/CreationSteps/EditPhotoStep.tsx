import {
    Box,
    Grid,
    Typography,
    Button,
    Paper,
    Card,
    CardMedia,
    Chip,
    CardActions,
    Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";

const EditPhotoStep = ({
    existingImages,
    newImagePreviews,
    onNewImageChange,
    onRemoveNewImage,
    onRemoveExistingImage,
}: any) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                <ImageIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Vehicle
                Photos
            </Typography>

            {existingImages.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Current Photos
                    </Typography>
                    <Grid container spacing={2}>
                        {existingImages.map((image: any, idx: number) => (
                            <Grid
                                size={{ xs: 12, sm: 6, md: 4 }}
                                key={image.id}
                            >
                                <Card elevation={2}>
                                    {idx === 0 && (
                                        <Chip
                                            label="Main Photo"
                                            color="primary"
                                            size="small"
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                left: 8,
                                                zIndex: 1,
                                            }}
                                        />
                                    )}
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={image.image}
                                        alt={`Image ${idx + 1}`}
                                        sx={{ objectFit: "cover" }}
                                    />
                                    <CardActions>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() =>
                                                onRemoveExistingImage(image.id)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
            <Divider sx={{ my: 3 }} />

            <Box>
                <Typography variant="subtitle1" gutterBottom>
                    Add New Photos
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    Upload additional photos
                </Typography>
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    size="large"
                    sx={{ mb: 3 }}
                >
                    Upload Photos
                    <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={onNewImageChange}
                    />
                </Button>
            </Box>

            {newImagePreviews.length > 0 ? (
                <Grid container spacing={2}>
                    {newImagePreviews.map((preview: any, id: number) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={id}>
                            <Card elevation={2}>
                                <Chip
                                    label="Main Photo"
                                    color="primary"
                                    size="small"
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        left: 8,
                                        zIndex: 1,
                                    }}
                                />
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={preview}
                                    alt={`Image ${id + 1}`}
                                    sx={{ objectFit: "cover" }}
                                />
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => onRemoveNewImage(id)}
                                    >
                                        Remove
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper
                    variant="outlined"
                    sx={{ p: 4, textAlign: "center", borderStyle: "dashed" }}
                >
                    <ImageIcon sx={{ fontSize: 60, color: "text.disabled" }} />
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                        No photos added yet.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default EditPhotoStep;
