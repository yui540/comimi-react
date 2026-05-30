import { useState } from "react";
import { ComponentExample } from "./ComponentExample";
import { HookExample } from "./HookExample";
import { ReactContentExample } from "./ReactContentExample";

type Mode = "component" | "hook" | "react-content";

export function App() {
  const [mode, setMode] = useState<Mode>("component");

  const tabStyle = (active: boolean) => ({
    padding: "8px 16px",
    border: "1px solid #ccc",
    borderBottom: active ? "1px solid #ccc" : "1px solid #ccc",
    background: active ? "#ccc" : "#eee",
    cursor: "pointer",
    borderRadius: "6px 6px 0 0",
    marginRight: 4,
    fontWeight: active ? 700 : 400,
  });

  return (
    <div>
      <h1>comimi-react preview</h1>
      <div
        style={{
          display: "flex",
          marginTop: 16,
          borderBottom: "1px solid #ccc",
        }}
      >
        <button
          style={tabStyle(mode === "component")}
          onClick={() => setMode("component")}
        >
          {"<MangaViewer />"}
        </button>
        <button
          style={tabStyle(mode === "hook")}
          onClick={() => setMode("hook")}
        >
          useMangaViewer()
        </button>
        <button
          style={tabStyle(mode === "react-content")}
          onClick={() => setMode("react-content")}
        >
          React コンテンツ
        </button>
      </div>
      <div
        style={{
          background: "#ccc",
          padding: 24,
          border: "1px solid #ccc",
          borderTop: "none",
          borderRadius: "0 0 6px 6px",
        }}
      >
        {mode === "component" && <ComponentExample />}
        {mode === "hook" && <HookExample />}
        {mode === "react-content" && <ReactContentExample />}
      </div>
    </div>
  );
}
