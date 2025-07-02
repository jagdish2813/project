import { FaCommentDots } from "react-icons/fa";

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`, // Replace securely
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant for TheHomeDesigners website. Help users with information about interior designers, home projects, and material selection." },
            ...newMessages.map(msg => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
          ],
        }),
      });

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";

      setMessages([...newMessages, { sender: "bot", text: botText }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages([...newMessages, { sender: "bot", text: "There was an error. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: "#dd6b4d",
            border: "none",
            borderRadius: "50%",
            width: "56px",
            height: "56px",
            color: "#fff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
        >
          <FaCommentDots size={24} />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: "350px",
            height: "480px",
            backgroundColor: "#fff8f3",
            borderRadius: "16px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#dd6b4d",
              color: "#fff",
              padding: "12px 16px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            Ask TheHomeDesigners
            <button
              onClick={() => setIsOpen(false)}
              style={{
                color: "#fff",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  margin: "6px 0",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    backgroundColor: msg.sender === "user" ? "#ffe4d6" : "#f3f3f3",
                    color: "#333",
                    maxWidth: "80%",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div style={{ fontSize: "14px", color: "#999" }}>Typing...</div>}
          </div>

          {/* Input */}
          <div style={{ display: "flex", borderTop: "1px solid #eee", padding: "10px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question..."
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                backgroundColor: "#dd6b4d",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                marginLeft: "8px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;