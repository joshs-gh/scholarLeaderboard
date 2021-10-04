import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { MoralisProvider } from "react-moralis";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

ReactDOM.render(
  <MoralisProvider
    appId="SEeyHCzG36isFXmvnR5rZwZ3234qhHmNJoAWRvF8"
    serverUrl="https://qstqhij1mkyn.moralishost.com:2053/server"
  >
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </MoralisProvider>,
  document.getElementById("root")
);
