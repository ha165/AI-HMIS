import { useState } from "react";
import { Box, TextField, IconButton, Typography, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const DiagnosisChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);
    setInput("");

    try {
      const response = await fetch("/api/diagnosis-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();

      const botReply = { sender: "bot", text: data.response };
      setMessages([...messages, newMessage, botReply]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      height="80vh"
      width="100%"
      p={2}
      component={Paper}
      elevation={3}
    >
      {/* Chat Messages */}
      <Box flex={1} overflow="auto" p={2}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
            mb={1}
          >
            <Typography
              sx={{
                backgroundColor: msg.sender === "user" ? "#1976d2" : "#e0e0e0",
                color: msg.sender === "user" ? "white" : "black",
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
      <Box display="flex" alignItems="center" p={1}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
        />
        <IconButton onClick={sendMessage} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default DiagnosisChat;
