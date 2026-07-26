import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/**
 * iOS Safari can ignore viewport zoom restrictions. Keep one-finger vertical
 * scrolling available while preventing pinch and legacy Safari gesture zooms.
 */
const preventMultiTouchZoom = (event: TouchEvent) => {
  if (event.touches.length > 1) event.preventDefault();
};

const preventGestureZoom = (event: Event) => event.preventDefault();

document.addEventListener("touchmove", preventMultiTouchZoom, {
  passive: false,
});
document.addEventListener("gesturestart", preventGestureZoom, {
  passive: false,
});
document.addEventListener("gesturechange", preventGestureZoom, {
  passive: false,
});
document.addEventListener("gestureend", preventGestureZoom, { passive: false });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
