import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Chip,
} from "@mui/material";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { tokens } from "../../../themes";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fetchWrapper from "../../Context/fetchwrapper";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WarningIcon from "@mui/icons-material/Warning";

const ImageAnalyzer = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedImages, setSelectedImages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentAnalyzing, setCurrentAnalyzing] = useState(null);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/dicom'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast.warning("Some files were skipped. Please upload only JPEG, PNG, or DICOM images.");
    }

    setSelectedImages(validFiles);
    setResults([]);
  };

  const analyzeImages = async () => {
    if (!selectedImages.length) {
      toast.warning("Please select medical images first.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      for (const image of selectedImages) {
        setCurrentAnalyzing(image.name);

        const formData = new FormData();
        formData.append("file", image);

        const result = await fetchWrapper("/image-analyzer", {
          method: "POST",
          body: formData,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        setResults(prev => [...prev, {
          image,
          analysis: result.analysis,
          raw: result
        }]);

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      toast.success("Medical Image Analysis Complete!");
    } catch (error) {
      console.error("Error analyzing medical images:", error);
      toast.error(error.message || "Medical analysis failed");
    } finally {
      setLoading(false);
      setCurrentAnalyzing(null);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 80) return colors.redAccent[500];
    if (confidence > 60) return colors.orangeAccent[500];
    if (confidence > 40) return colors.yellowAccent[500];
    return colors.greenAccent[500];
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setResults(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box display="flex" height="100vh" bgcolor={colors.primary[900]}>
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Topbar />

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          height="calc(100vh - 64px)"
          width="100%"
          p={2}
          component={Paper}
          elevation={3}
          sx={{ backgroundColor: colors.primary[800] }}
        >
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
            <MedicalServicesIcon sx={{ fontSize: 40, color: colors.blueAccent[500], mr: 2 }} />
            <Typography
              variant="h4"
              sx={{
                color: colors.grey[100],
                fontWeight: "bold"
              }}
            >
              Medical Image Analysis
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Upload X-rays, CT scans, or other medical images for AI-powered analysis.
            Supported formats: JPEG, PNG, DICOM
          </Alert>

          {/* File Upload Section */}
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <input
              type="file"
              accept=".jpeg,.jpg,.png,.dicom,.dcm"
              multiple
              onChange={handleImageUpload}
              style={{
                marginBottom: "20px",
                color: colors.grey[100],
                padding: "10px"
              }}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={analyzeImages}
              disabled={loading || selectedImages.length === 0}
              startIcon={<MedicalServicesIcon />}
              sx={{
                bgcolor: colors.blueAccent[500],
                color: "white",
                '&:hover': {
                  bgcolor: colors.blueAccent[600]
                },
                '&:disabled': {
                  bgcolor: colors.grey[600]
                }
              }}
            >
              {loading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} />
                  <Typography>
                    {currentAnalyzing ? `Analyzing ${currentAnalyzing}...` : "Analyzing..."}
                  </Typography>
                </Box>
              ) : (
                `Analyze ${selectedImages.length} Medical Image${selectedImages.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </Box>

          {/* Display Medical Images and Results */}
          <Box display="flex" flexWrap="wrap" gap={3} p={2} justifyContent="center">
            {selectedImages.map((image, index) => {
              const resultItem = results[index];
              const isAnalyzing = currentAnalyzing === image.name;

              return (
                <Card
                  key={index}
                  sx={{
                    maxWidth: 350,
                    bgcolor: colors.primary[700],
                    border: resultItem ? `2px solid ${colors.blueAccent[500]}` : 'none'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: colors.grey[100], mb: 1 }}>
                      {image.name}
                    </Typography>

                    <CardMedia
                      component="img"
                      image={URL.createObjectURL(image)}
                      alt={`Medical Image ${index}`}
                      sx={{
                        borderRadius: "8px",
                        maxHeight: 200,
                        objectFit: "contain",
                        bgcolor: 'black' // Better contrast for medical images
                      }}
                    />

                    {isAnalyzing && (
                      <Box display="flex" justifyContent="center" mt={1}>
                        <CircularProgress size={24} sx={{ color: colors.blueAccent[500] }} />
                        <Typography sx={{ color: colors.grey[100], ml: 1 }}>
                          AI Analysis in progress...
                        </Typography>
                      </Box>
                    )}

                    {resultItem && resultItem.analysis && (
                      <Box mt={2}>
                        <Typography variant="h6" sx={{ color: colors.grey[100], mb: 1 }}>
                          Analysis Results:
                        </Typography>
                        {resultItem.analysis.map((item, idx) => (
                          <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: colors.primary[600], borderRadius: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" sx={{ color: colors.grey[100], fontWeight: 'bold' }}>
                                {item.condition}
                              </Typography>
                              <Chip
                                label={`${item.confidence}%`}
                                sx={{
                                  bgcolor: getConfidenceColor(item.confidence),
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" sx={{ color: colors.grey[300], fontStyle: 'italic' }}>
                              {item.interpretation}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Button
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        color: colors.redAccent[500],
                        mt: 1
                      }}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageAnalyzer;