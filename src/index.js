import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { MoralisProvider } from "react-moralis";

ReactDOM.render(
  <MoralisProvider
    appId="SEeyHCzG36isFXmvnR5rZwZ3234qhHmNJoAWRvF8"
    serverUrl="https://qstqhij1mkyn.moralishost.com:2053/server"
  >
    <App />
  </MoralisProvider>,
  document.getElementById("root")
);
