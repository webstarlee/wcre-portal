import {
  styled,
  Box,
} from "@mui/material";

export const LoadingContainer = styled(Box)(() => ({
  width: "100%",
  height: '100vh',
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}));

export const PageHeader = styled(Box)(() => ({
  width: "100%",
  height: "50px",
  display: "flex",
  marginBottom: "10px",
  flexDirection: "column",
  justifyContent: "center"
}));

export const Card = styled(Box)(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#F7F8FA",
  padding: "15px",
  borderRadius: "20px",
  position: "relative",
  boxShadow: "1px 1px 5px 0px rgba(0,0,0,0.2)"
}));
