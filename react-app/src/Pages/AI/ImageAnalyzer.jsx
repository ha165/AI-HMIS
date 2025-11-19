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
  Grid,
  Container,
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
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast.warning("Some files were skipped. Please upload only JPEG or PNG images.");
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
    <Box display="flex" minHeight="100vh" bgcolor={colors.primary[900]}>
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column" minHeight="100vh">
        <Topbar />

        {/* Main Content Area */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          p={3}
          sx={{
            overflow: 'auto',
            maxHeight: 'calc(100vh - 64px)'
          }}
        >
          {/* Header Section */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={3}
            sx={{ textAlign: 'center' }}
          >
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

          {/* Info Alert */}
          <Alert
            severity="info"
            sx={{ mb: 3, maxWidth: '800px', mx: 'auto', width: '100%' }}
            icon={<WarningIcon />}
          >
            Upload X-rays, CT scans, or other medical images for AI-powered analysis.
            Supported formats: JPEG, PNG
          </Alert>

          {/* Warning Alert */}
          <Alert
            severity="warning"
            sx={{ mb: 3, maxWidth: '800px', mx: 'auto', width: '100%' }}
          >
            <WarningIcon sx={{ mr: 1 }} />
            This AI analysis is for assistance only. Always consult with qualified healthcare professionals for medical diagnosis.
          </Alert>

          {/* Upload and Analyze Section */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              maxWidth: '800px',
              mx: 'auto',
              width: '100%',
              backgroundColor: colors.primary[700]
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <input
                type="file"
                accept=".jpeg,.jpg,.png"
                multiple
                onChange={handleImageUpload}
                style={{
                  marginBottom: "20px",
                  color: colors.grey[100],
                  padding: "10px",
                  width: '100%',
                  maxWidth: '400px'
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
                  px: 4,
                  py: 1,
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

              {/* Selected Files Count */}
              {selectedImages.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.grey[300],
                    mt: 2,
                    textAlign: 'center'
                  }}
                >
                  {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected for analysis
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Results Section */}
          {selectedImages.length > 0 && (
            <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
              <Typography
                variant="h5"
                sx={{
                  color: colors.grey[100],
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                Analysis Results
              </Typography>

              <Grid container spacing={3} justifyContent="center">
                {selectedImages.map((image, index) => {
                  const resultItem = results[index];
                  const isAnalyzing = currentAnalyzing === image.name;

                  return (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          bgcolor: colors.primary[700],
                          border: resultItem ? `2px solid ${colors.blueAccent[500]}` : '1px solid ' + colors.primary[600],
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Image Name */}
                          <Typography
                            variant="h6"
                            sx={{
                              color: colors.grey[100],
                              mb: 2,
                              textAlign: 'center',
                              wordBreak: 'break-word'
                            }}
                          >
                            {image.name.length > 30 ? image.name.substring(0, 30) + '...' : image.name}
                          </Typography>

                          {/* Image Preview */}
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <CardMedia
                              component="img"
                              image={URL.createObjectURL(image)}
                              alt={`Medical Image ${index + 1}`}
                              sx={{
                                borderRadius: "8px",
                                maxHeight: 200,
                                maxWidth: '100%',
                                objectFit: "contain",
                                bgcolor: 'black'
                              }}
                            />
                          </Box>

                          {/* Loading State */}
                          {isAnalyzing && (
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              sx={{ flexGrow: 1, minHeight: '100px' }}
                            >
                              <CircularProgress size={30} sx={{ color: colors.blueAccent[500] }} />
                              <Typography sx={{ color: colors.grey[100], ml: 2 }}>
                                AI Analysis in progress...
                              </Typography>
                            </Box>
                          )}

                          {/* Analysis Results */}
                          {resultItem && resultItem.analysis && (
                            <Box sx={{ mt: 'auto' }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: colors.grey[100],
                                  mb: 2,
                                  textAlign: 'center',
                                  borderBottom: `1px solid ${colors.primary[500]}`,
                                  pb: 1
                                }}
                              >
                                Analysis Results:
                              </Typography>

                              <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                                {resultItem.analysis.map((item, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      mb: 1.5,
                                      p: 1.5,
                                      bgcolor: colors.primary[600],
                                      borderRadius: 2,
                                      border: `1px solid ${colors.primary[500]}`
                                    }}
                                  >
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          color: colors.grey[100],
                                          fontWeight: 'bold',
                                          flex: 1,
                                          mr: 1
                                        }}
                                      >
                                        {item.condition}
                                      </Typography>
                                      <Chip
                                        label={`${item.confidence}%`}
                                        sx={{
                                          bgcolor: getConfidenceColor(item.confidence),
                                          color: 'white',
                                          fontWeight: 'bold',
                                          minWidth: '60px'
                                        }}
                                        size="small"
                                      />
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: colors.grey[300],
                                        fontStyle: 'italic',
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      {item.interpretation}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}

                          {/* No Results State */}
                          {resultItem && (!resultItem.analysis || resultItem.analysis.length === 0) && (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                              <Typography sx={{ color: colors.grey[400], fontStyle: 'italic' }}>
                                No analysis results available
                              </Typography>
                            </Box>
                          )}

                          {/* Remove Button */}
                          <Button
                            size="small"
                            onClick={() => removeImage(index)}
                            sx={{
                              color: colors.redAccent[500],
                              mt: 2,
                              alignSelf: 'center'
                            }}
                          >
                            Remove Image
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Empty State */}
          {selectedImages.length === 0 && !loading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                height: '200px',
                maxWidth: '800px',
                mx: 'auto',
                width: '100%'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: colors.grey[500],
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}
              >
                Upload medical images to begin analysis
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageAnalyzer;