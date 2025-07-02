import React, { useState } from "react";

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    const systemPrompt = `You are a helpful assistant for the website. Answer questions based on the website's services and content.`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`, // Replace this
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: input },
          ],
        }),
      });

      const data = await response.json();
      const botReply = data.choices[0]?.message?.content;

      setMessages((prev) => [...prev, { sender: "bot", text: botReply || "Sorry, I couldn’t respond." }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error occurred. Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "400px", padding: "16px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>🤖 AI Chat Help</h3>
      <div style={{ height: "300px", overflowY: "auto", marginBottom: "12px", background: "#f9f9f9", padding: "8px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "4px 0" }}>
            <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong> {msg.text}
          </div>
        ))}
        {loading && <div>Typing...</div>}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        style={{ width: "75%", padding: "8px" }}
      />
      <button onClick={handleSend} style={{ width: "20%", marginLeft: "5%", padding: "8px" }}>
        Send
      </button>
    </div>
  );
};

export default ChatBot;
