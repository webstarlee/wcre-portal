import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Typography
} from "@mui/material";
import {
  AuthContainer,
  FormContainer,
  FormLeftBox,
  FormRightBox,
  AuthLogoImg,
} from "./components/StyledComponents";
import LoadingView from "@/components/LoadingView";
import { useAuth } from "@/hooks/AuthContext";
import LogoImg from "@/assets/images/logo.png";

const AuthLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
    } else {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      {isLoading ? (
        <LoadingView />
      ) : (
        <AuthContainer sx={{ flexGrow: 1 }}>
          <FormContainer>
            <FormLeftBox>
              <AuthLogoImg src={LogoImg} alt="logo" />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "30px 0px",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "SatoshiBold",
                    color: "#000",
                    fontSize: "24px",
                    textAlign: "center",
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "SatoshiRegular",
                    color: "#aab0b6",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  Please Enter Your Credentials to Log in the WCRE Portak
                </Typography>
              </Box>
            </FormLeftBox>
            <FormRightBox>
              <Typography
                sx={{
                  fontFamily: "SatoshiBlack",
                  color: "#000",
                  fontSize: "28px",
                  textAlign: "center",
                }}
              >
                WCRE Management Portal
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Outlet />
              </Box>
            </FormRightBox>
          </FormContainer>
        </AuthContainer>
      )}
    </>
  );
};

export default AuthLayout;
