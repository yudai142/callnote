import React from "react"
import { createRoot } from "react-dom/client"
import CallApp from "./components/CallApp"
import LandingPage from "./components/LandingPage"

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("react-app")
  if (rootElement) {
    const userSignedIn = rootElement.dataset.userSignedIn === "true"
    const root = createRoot(rootElement)
    root.render(userSignedIn ? <CallApp /> : <LandingPage />)
  }
})
