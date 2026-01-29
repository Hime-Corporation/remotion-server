import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

interface TitleCardProps {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  subtitleColor?: string;
}

export const TitleCard: React.FC<TitleCardProps> = ({ 
  title, 
  subtitle,
  backgroundColor = "#1a1a2e",
  textColor = "#ffffff",
  subtitleColor = "#888888"
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 80 }, from: 0.8, to: 1 });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      opacity,
      transform: `scale(${scale})`,
    }}>
      <div style={{ 
        fontSize: 96, 
        fontWeight: 800, 
        color: textColor, 
        textAlign: "center", 
        marginBottom: 20,
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: 36, 
          color: subtitleColor, 
          textAlign: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
        }}>
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
