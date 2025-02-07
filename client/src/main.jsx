import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { AvatarProvider } from "./context/AvatarContext";

ReactDOM.render(
    <AvatarProvider>
      <App />
    </AvatarProvider>,
  document.getElementById("root")
);
