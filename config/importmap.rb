# Pin npm packages by running ./bin/importmap

pin "application"

# React and ReactDOM from CDN
pin "react", to: "https://cdn.jsdelivr.net/npm/react@18.3.1/+esm"
pin "react-dom", to: "https://cdn.jsdelivr.net/npm/react-dom@18.3.1/+esm"
pin "react-dom/client", to: "https://cdn.jsdelivr.net/npm/react-dom@18.3.1/client.+esm"
