import { useState } from "react";
import LearnScreen from "./screens/LearnScreen";
import SuccessScreen from "./screens/SuccessScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import type { WordEntry } from "./services/storage";

type Screen = "welcome" | "learn" | "success";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [done, setDone] = useState<WordEntry | null>(null);
  const [learnKey, setLearnKey] = useState(0);

  return (
    <div className="mx-auto h-full w-full max-w-md overflow-hidden bg-sky-100">
      {screen === "welcome" && <WelcomeScreen onStart={() => setScreen("learn")} />}
      {screen === "learn" && (
        <LearnScreen
          key={learnKey}
          onSuccess={(e) => {
            setDone(e);
            setScreen("success");
          }}
        />
      )}
      {screen === "success" && done && (
        <SuccessScreen
          en={done.en}
          image={done.image}
          onBack={() => {
            setLearnKey((k) => k + 1);
            setScreen("learn");
          }}
        />
      )}
    </div>
  );
}
