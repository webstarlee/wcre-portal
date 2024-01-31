import React from "react";
import ReactDOM from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./hooks/AuthContext.tsx";
import { RootProvider } from "./hooks/RootContext.tsx";
import { MainProvider } from "./hooks/MainContext.tsx";
import { theme } from "@/styles/theme.ts";
import App from "./App.tsx";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <RootProvider>
        <AuthProvider>
          <MainProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <App />
            </LocalizationProvider>
          </MainProvider>
        </AuthProvider>
      </RootProvider>
    </ThemeProvider>
  </React.StrictMode>
);
