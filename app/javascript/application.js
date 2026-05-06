import React from "react"
import { createRoot } from "react-dom/client"
import CallApp from "./components/CallApp"
import LandingPage from "./components/LandingPage"

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("react-app")
  if (rootElement) {
    const root = createRoot(rootElement)
    root.render(window.userSignedIn ? <CallApp /> : <LandingPage />)
  }
})
