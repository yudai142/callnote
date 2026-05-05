import * as React from "react"
import * as ReactDOM from "react-dom/client"

// Example React component
const App = () => {
  const [count, setCount] = React.useState(0)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to CallNote</h1>
      <p className="mb-4">React + Rails with importmap and Tailwind CSS</p>
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Count: {count}
      </button>
    </div>
  )
}

// Mount React app if target element exists
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("react-app")
  if (root) {
    const reactRoot = ReactDOM.createRoot(root)
    reactRoot.render(<App />)
  }
})
