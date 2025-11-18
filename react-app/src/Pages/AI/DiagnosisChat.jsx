import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Sidebar from "../../Scenes/global/SideBar";
import Topbar from "../../Scenes/global/TopBar";
import { tokens } from "../../../themes";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fetchWrapper from "../../Context/fetchwrapper";

const DiagnosisChat = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchWrapper("/chat-history");
        setMessages(
          data.map((msg) => ({
            sender: msg.role === "user" ? "user" : "bot",
            text: msg.content,
          }))
        );
      } catch (err) {
        toast.error("Failed to load chat history");
      }
    };
    loadHistory();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await fetchWrapper("/diagnosis-chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });

      if (!result) throw new Error("No response from server");

      // Handle rate-limit
      if (result.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment.");
        return;
      }

      if (result.error) throw new Error(result.error);

      const botReply = { sender: "bot", text: result.response };
      setMessages((prev) => [...prev, newMessage, botReply]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error(error.message || "Something went wrong!");
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
          justifyContent="space-between"
          height="calc(100vh - 64px)"
          width="100%"
          p={2}
          component={Paper}
          elevation={3}
          sx={{ backgroundColor: colors.primary[800] }}
        >
          {/* Chat Messages */}
          <Box flex={1} overflow="auto" p={2}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  msg.sender === "user" ? "flex-end" : "flex-start"
                }
                mb={1}
              >
                <Typography
                  sx={{
                    backgroundColor:
                      msg.sender === "user"
                        ? colors.blueAccent[600]
                        : colors.greenAccent[700],
                    color: "white",
                    borderRadius: "10px",
                    p: 1,
                    maxWidth: "60%",
                  }}
                >
                  {msg.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Input Field */}
          <Box
            display="flex"
            alignItems="center"
            p={1}
            bgcolor={colors.primary[700]}
          >
            <TextField
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              sx={{
                input: { color: colors.grey[100] },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: colors.grey[500] },
                  "&:hover fieldset": { borderColor: colors.blueAccent[400] },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.blueAccent[500],
                  },
                },
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <IconButton
              onClick={sendMessage}
              sx={{ color: colors.blueAccent[500] }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DiagnosisChat;
