// List View：Search bar + Sort + pokemon card + page number + gallery icon and list icon

// Gallery View：all images + Type Filter + gallery icon and list icon

// Detail View:all details information + Previous / Next Arrows + back arrow
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);