import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./hooks/AuthContext.tsx";
import { RootProvider } from "./hooks/RootContext.tsx";
import { MainProvider } from "./hooks/MainContext.tsx";
import App from "./App.tsx";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootProvider>
      <AuthProvider>
        <MainProvider>
          <App />
        </MainProvider>
      </AuthProvider>
    </RootProvider>
  </React.StrictMode>
);
