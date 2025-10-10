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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";

const PhotoStep = ({ imagePreviews, onImageChange, onRemoveImage }: any) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                <ImageIcon sx={{ mr: 1, verticalAlign: "middke" }} /> Vehicle
                Photos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload up to 10 photos. First will be the main one.
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
                    onChange={onImageChange}
                />
            </Button>

            {imagePreviews.length > 0 ? (
                <Grid container spacing={2}>
                    {imagePreviews.map((preview: any, id: number) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={id}>
                            <Card elevation={2}>
                                {id === 0 && (
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
                                    image={preview}
                                    alt={`Image ${id + 1}`}
                                    sx={{ objectFit: "cover" }}
                                />
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => onRemoveImage(id)}
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

export default PhotoStep;
