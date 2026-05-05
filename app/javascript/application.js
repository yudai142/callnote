// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import React from "react"
import { createRoot } from "react-dom/client"
import CallApp from "./components/CallApp"

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("react-app")
  if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<CallApp />)
  }
})
