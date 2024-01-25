import { styled, Box, Typography, ListItemText } from "@mui/material";

export const MainContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "row",
  justifyContent: "center",
  gap: "15px",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

export const MainBox = styled(Box)(() => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "start",
  gap: "15px",
}));

export const NotificationBox = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: "400px",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  [theme.breakpoints.down("xl")]: {
    maxWidth: "300px",
  },
  [theme.breakpoints.down("sm")]: {
    maxWidth: "unset",
  },
}));

export const NotificationListIconBox = styled(Box)(({ theme }) => ({
  width: "50px",
  height: "50px",
  borderRadius: "7px",
  marginRight: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.down("xl")]: {
    width: "34px",
    height: "34px",
  },
}));

export const NotificationListBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  paddingBottom: "10px",
  maxHeight: "530px",
  overflow: "hidden",
  [theme.breakpoints.down("xl")]: {
    maxHeight: "420px",
  },
  [theme.breakpoints.down("sm")]: {
    maxHeight: "unset",
  },
}));

export const NotificationListText = styled(ListItemText)(({ theme }) => ({
  "& span": {
    fontFamily: "SatoshiMedium",
    fontSize: "15px",
    color: "#000",
  },
  [theme.breakpoints.down("xl")]: {
    "& span": {
      fontSize: "12px",
    },
  },
}));

export const StatisticsValueTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "SatoshiBold",
  fontSize: "80px",
  color: "#fff",
  lineHeight: "100px",
  [theme.breakpoints.down("xl")]: {
    fontSize: "70px",
    lineHeight: "80px",
  },
}));

export const StatisticsBackImg = styled("img")(({ theme }) => ({
  position: "absolute",
  width: "130px",
  height: "140px",
  bottom: "-10px",
  right: "-10px",
  [theme.breakpoints.down("xl")]: {
    width: "100px",
  },
}));

export const UnitCardImg = styled("img")(() => ({
  objectFit: "cover",
  borderRadius: "10px",
}));
