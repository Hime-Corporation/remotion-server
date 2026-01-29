import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

interface Message {
  text: string;
  isUser: boolean;
  emoji?: string;
}

interface ChatDemoProps {
  messages: Message[];
  botName?: string;
  botEmoji?: string;
}

const MessageBubble = ({ text, isUser, delay = 0, emoji, botEmoji }: Message & { delay: number; botEmoji?: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animFrame = frame - delay;

  const opacity = interpolate(animFrame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = spring({ frame: animFrame, fps, config: { damping: 15 }, from: 30, to: 0 });

  if (animFrame < 0) return null;

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 12,
      opacity,
      transform: `translateY(${translateY}px)`,
      padding: "0 16px",
    }}>
      {!isUser && (
        <div style={{
          width: 40, height: 40, borderRadius: 20, backgroundColor: "#E53935",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 8, fontSize: 24,
        }}>{botEmoji || "🤖"}</div>
      )}
      <div style={{
        maxWidth: "75%",
        padding: "12px 16px",
        borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
        backgroundColor: isUser ? "#0088cc" : "#E8E8E8",
        color: isUser ? "white" : "black",
        fontSize: 28,
        lineHeight: 1.4,
        whiteSpace: "pre-wrap",
      }}>
        {emoji && <span style={{ marginRight: 8 }}>{emoji}</span>}
        {text}
      </div>
    </div>
  );
};

export const ChatDemo: React.FC<ChatDemoProps> = ({ messages, botName = "Assistant", botEmoji = "🤖" }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "white", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Status bar */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "50px 24px 12px", fontSize: 18, fontWeight: 600 }}>
        <span>9:41</span>
        <div style={{ display: "flex", gap: 8 }}>📶 📡 🔋</div>
      </div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E0E0E0", backgroundColor: "#F8F8F8" }}>
        <div style={{ color: "#0088cc", fontSize: 28, marginRight: 12 }}>‹</div>
        <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#E53935", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginRight: 12 }}>{botEmoji}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 22 }}>{botName}</div>
          <div style={{ fontSize: 16, color: "#888" }}>online</div>
        </div>
      </div>
      {/* Messages */}
      <div style={{ flex: 1, padding: "20px 0", overflow: "hidden" }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} delay={i * 40 + 30} botEmoji={botEmoji} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
