import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

interface CustomCompProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
}

export const CustomComp: React.FC<CustomCompProps> = ({ 
  text,
  backgroundColor = "#0f0f23",
  textColor = "#ffffff",
  fontSize = 72
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = spring({ frame, fps, config: { damping: 15 }, from: 0.9, to: 1 });

  return (
    <AbsoluteFill style={{
      backgroundColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ 
        fontSize,
        color: textColor,
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        fontWeight: 600,
        opacity,
        transform: `scale(${scale})`,
        textAlign: "center",
        padding: 40
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};
