import {
  styled,
  Box,
  Button
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
  height: "70px",
  display: "flex",
  paddingLeft: "24px",
  paddingRight: "24px",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}));

export const PageFooter = styled(Box)(() => ({
  width: "100%",
  height: "66px",
  display: "flex",
  paddingLeft: "24px",
  paddingRight: "24px",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}));

export const PageBody = styled(Box)(() => ({
  flex: 1,
  width: "100%",
  height: "calc(100vh - 136px)",
  overflowY: "auto",
  display: "flex",
  paddingLeft: "24px",
  paddingRight: "24px",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
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

export const ImageUploadButton = styled(Button)(({theme}) => ({
  width: "100%",
  height: "200px",
  border: "dashed 2px #B9BABB",
  borderRadius: "10px",
  display: 'flex',
  flexDirection: "column",
  textTransform: "unset",
  backgroundColor: "#EDEEEE",
  [theme.breakpoints.down("xl")]: {
    height: "170px",
  },
}));

export const ImageUploadButtonImg = styled("img")(({theme}) => ({
  width: "100px",
  [theme.breakpoints.down("xl")]: {
    width: "80px",
  },
}));

export const SearchBoxContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "20px",
  [theme.breakpoints.down("lg")]: {
    gap: "10px",
  },
}));

export const SearchBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  width: "500px",
  height: "45px",
  backgroundColor: "#fff",
  alignItems: "center",
  borderRadius: "10px",
  padding: "7px 10px",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.2)",
  "&:hover": {
    boxShadow: "0px 1px 8px 0px rgba(0, 0, 0, 0.2)",
  },
  [theme.breakpoints.down("xl")]: {
    width: "300px",
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

export const HeaderCustomButton = styled(Button)(({ theme }) => ({
  borderRadius: "25px",
  fontFamily: "SatoshiBold",
  fontSize: "16px",
  textTransform: "none",
  height: "45px",
  "& p, & span": {
    fontFamily: "SatoshiBold",
    marginLeft: "5px",
  },
  [theme.breakpoints.down("lg")]: {
    "& p, & span": {
      display: "none",
    },
    minWidth: "unset",
    width: "45px",
    height: "45px",
  },
}));
