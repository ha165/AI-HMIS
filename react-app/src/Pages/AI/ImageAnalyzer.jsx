import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Button,
  CircularProgress,
} from "@mui/material";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { tokens } from "../../../themes";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fetchWrapper from "../../Context/fetchwrapper";

const ImageAnalyzer = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedImages, setSelectedImages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);
  };

  const analyzeImages = async () => {
    if (!selectedImages.length) {
      toast.warning("Please select images first.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // Create a promise for each image
      const promises = selectedImages.map(async (image) => {
        const formData = new FormData();
        formData.append("image", image);

        // fetchWrapper automatically attaches auth headers and returns parsed JSON
        const result = await fetchWrapper("/image-analyzer", {
          method: "POST",
          body: formData,
        });

        let formattedResult = "";
        if (Array.isArray(result.analysis)) {
          formattedResult = result.analysis
            .map((item) => `${item.label}: ${item.score.toFixed(3)}`)
            .join("\n");
        } else if (typeof result.analysis === "object") {
          formattedResult = JSON.stringify(result.analysis, null, 2);
        } else {
          formattedResult = result.analysis || "No analysis available";
        }

        return { image, result: formattedResult };
      });

      // Wait for all images to finish
      const analysisResults = await Promise.all(promises);

      setResults(analysisResults);
      toast.success("AI Analysis Complete!");
    } catch (error) {
      console.error("Error analyzing images:", error);
      toast.error(error.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
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
          {/* File Upload Section */}
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ marginBottom: "10px" }}
            />
            <Button
              variant="contained"
              onClick={analyzeImages}
              disabled={loading}
              sx={{ bgcolor: colors.blueAccent[500], color: "white" }}
            >
              {loading ? <CircularProgress size={24} /> : "Analyze Images"}
            </Button>
          </Box>

          {/* Display Selected Images */}
          <Box display="flex" flexWrap="wrap" gap={2} p={2}>
            {selectedImages.map((image, index) => {
              const resultItem = results.find((r) => r.image === image);
              return (
                <Box
                  key={index}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Selected ${index}`}
                    style={{ maxWidth: "200px", borderRadius: "10px" }}
                  />
                  {resultItem && (
                    <Typography
                      sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: colors.greenAccent[700],
                        color: "white",
                        borderRadius: "8px",
                        whiteSpace: "pre-wrap",
                        textAlign: "center",
                      }}
                    >
                      {resultItem.result}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageAnalyzer;
