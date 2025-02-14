import { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  useTheme,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { tokens } from "../../../themes";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ImageAnalyzer = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.warning("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    setLoading(true);

    try {
      const response = await fetch("/api/image-analyzer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }
      let formattedResult = "";
      if (typeof data.analysis === "string") {
        formattedResult = data.analysis;
      } else if (typeof data.analysis === "object") {
        formattedResult = Object.entries(data.analysis)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");
      } else {
        formattedResult = "Analysis complete, but no details available.";
      }

      setResult(formattedResult);
      toast.success("AI Analysis Complete!");
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" height="100vh" bgcolor={colors.primary[900]}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box flex={1} display="flex" flexDirection="column">
        {/* Topbar */}
        <Topbar />

        {/* Analyzer Container */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
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
              onChange={handleImageUpload}
              style={{ marginBottom: "10px" }}
            />
            <Button
              variant="contained"
              onClick={analyzeImage}
              disabled={loading}
              sx={{ bgcolor: colors.blueAccent[500], color: "white" }}
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </Button>
          </Box>

          {/* Display Selected Image */}
          {selectedImage && (
            <Box display="flex" justifyContent="center" p={2}>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "10px",
                }}
              />
            </Box>
          )}

          {/* Display AI Analysis Result */}
          <Box p={2}>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: colors.greenAccent[700],
                color: "white",
                borderRadius: "10px",
                p: 2,
                whiteSpace: "pre-wrap", // Keep formatted JSON
              }}
            >
              {result || "AI analysis result will appear here..."}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageAnalyzer;
