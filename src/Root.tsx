import "./index.css";
import { Composition } from "remotion";
import { ChatDemo } from "./ChatDemo";
import { TitleCard } from "./TitleCard";
import { CustomComp } from "./CustomComp";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ChatDemo"
        component={ChatDemo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          messages: [
            { text: "Hello!", isUser: true },
            { text: "Hi there! How can I help?", isUser: false }
          ],
          botName: "Assistant",
          botEmoji: "🤖"
        }}
        calculateMetadata={({ props }) => {
          const msgCount = props.messages?.length || 2;
          return {
            durationInFrames: 30 * (msgCount * 2 + 4)
          };
        }}
      />
      <Composition
        id="TitleCard"
        component={TitleCard}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Your Title Here",
          subtitle: "Subtitle text",
          backgroundColor: "#1a1a2e"
        }}
      />
      <Composition
        id="CustomComp"
        component={CustomComp}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          text: "Hello World",
          backgroundColor: "#0f0f23",
          textColor: "#ffffff"
        }}
      />
    </>
  );
};
