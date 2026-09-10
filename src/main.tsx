import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import FloatingLyrics from "./components/FloatingLyrics";
import "./App.css";

const isOverlay = new URLSearchParams(window.location.search).get("window") === "overlay";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {isOverlay ? <FloatingLyrics /> : <App />}
  </React.StrictMode>,
);
