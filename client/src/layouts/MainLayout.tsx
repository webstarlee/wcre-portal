import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Main } from "./components/StyledComponents";
import LoadingView from "@/components/LoadingView";
import Sidebar from "./components/Sidebar";
import { useAuth } from "@/hooks/AuthContext";

const MainLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
    } else {
      navigate("/login");
    }
  }, [isAuthenticated]);

  return (
    <>
      {isLoading ? (
        <LoadingView />
      ) : (
        <Box sx={{ display: "flex" }}>
          <Sidebar />
          <Main>
            <Outlet />
          </Main>
        </Box>
      )}
    </>
  );
};

export default MainLayout;
