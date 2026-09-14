import { useState, useRef, useEffect } from "react";
import "../styles/chatbot.css";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello 👋 I’m FraudBot AI. Ask me anything about recruitment fraud, fake jobs, or company verification."
    }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ================= SMART REPLY ENGINE =================
  function getReply(message) {
    const text = message.toLowerCase();

    if (text.includes("hello") || text.includes("hi")) {
      return "Hello 👋 How can I assist you today?";
    }

    if (text.includes("fraud") || text.includes("scam")) {
      return "Recruitment fraud is when scammers post fake job offers to steal money or personal information from job seekers.";
    }

    if (text.includes("fake job")) {
      return "⚠️ Warning signs of fake jobs:\n• Unrealistic salary\n• Asking for registration fees\n• Gmail email IDs\n• No official website\n• Interview only via chat apps";
    }

    if (text.includes("salary")) {
      return "If the salary seems too high for the experience required, it may be a scam. Always verify through official company websites.";
    }

    if (text.includes("email")) {
      return "Legitimate companies use official domains like @company.com. Avoid offers from free email services.";
    }

    if (text.includes("money") || text.includes("fee") || text.includes("payment")) {
      return "🚫 Genuine companies never ask for money for interviews, registration, or job placement.";
    }

    if (text.includes("verify company")) {
      return "You can use the Company Verification tool in the dashboard to check website, location, and legitimacy.";
    }

    if (text.includes("safe") || text.includes("protect")) {
      return "🔐 Stay safe by verifying official websites, checking LinkedIn profiles, avoiding fees, and never sharing OTPs.";
    }

    return "I can help you detect fake job offers, salary scams, suspicious emails, and company fraud. Please provide more details.";
  }

  // ================= SEND MESSAGE =================
  function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const botMessage = { from: "bot", text: getReply(input) };
      setMessages(prev => [...prev, botMessage]);
      setTyping(false);
    }, 700);
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="chatbot-toggle" onClick={() => setOpen(!open)}>
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-box">

          <div className="chatbot-header">
            FraudBot AI
            <span onClick={() => setOpen(false)}>✕</span>
          </div>

          <div className="chatbot-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat ${m.from}`}>
                {m.text}
              </div>
            ))}

            {typing && (
              <div className="chat bot typing">
                Typing...
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={sendMessage}>Send</button>
          </div>

        </div>
      )}
    </>
  );
}
