import { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
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

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const data = await fetchWrapper("/diagnosis-chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });

      // Handle errors
      if (data?.error) {
        if (data.error.toLowerCase().includes("quota") || data.error.toLowerCase().includes("too many requests")) {
          toast.warn("OpenAI quota exceeded. Please wait a few seconds before sending more messages.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      const botReply = { sender: "bot", text: data.response };
      setMessages((prev) => [...prev, botReply]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error(error.message || "Something went wrong!");
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

        {/* Chat Container */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          height="calc(100vh - 64px)" // Adjust for Topbar height
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
            />
            <IconButton
              onClick={sendMessage}
              sx={{ color: colors.blueAccent[500] }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DiagnosisChat;
