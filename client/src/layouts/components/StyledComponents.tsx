import { styled, Box, Drawer, ListItemButton, ListItemText } from "@mui/material";
import BgImage from "@/assets/images/auth-bg-dark.jpg";

export const AuthContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `url(${BgImage})`,
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  [theme.breakpoints.down("sm")]: {
    padding: "20px",
  },
}));

export const FormContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: "700px",
  display: "flex",
  flexDirection: "row",
  backgroundColor: "#fff",
  borderRadius: "10px",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

export const FormLeftBox = styled(Box)(({ theme }) => ({
  width: "250px",
  backgroundColor: "#ecf0f3",
  padding: "20px 25px",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

export const AuthLogoImg = styled("img")(() => ({
  width: "100%",
}));

export const FormRightBox = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: "20px 25px",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

// Dashboard components

export const Main = styled("main")(() => ({
    position: "relative",
    flexGrow: 1,
    height: '100vh',
    padding: 0,
    overflow: 'hidden',
    backgroundColor: "#EBEEF7",
    color: "#000",
    display: "flex",
    flexDirection: "column",
}));

export const DesktopDrawer = styled(Drawer)(({ theme }) => ({
    width: 250,
    flexShrink: 0,
    display: "block",
    [theme.breakpoints.down("md")]: {
        display: "none",
    },
    "& .MuiDrawer-paper": {
        width: 250,
        boxSizing: "border-box",
        backgroundColor: "#F7F8FA",
        borderRight: "0px",
        height: "100vh",
        padding: "24px",
        boxShadow: "5px 0 20px 0px rgba(0, 0, 0, 0.1)",
    },
}));

export const MobileDrawer = styled(Drawer)(({ theme }) => ({
    width: "100%",
    display: "none",
    zIndex: 1099,
    [theme.breakpoints.down("md")]: {
        display: "block",
    },
    "& .MuiDrawer-paper": {
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#F7F8FA",
        borderRight: "0px",
        height: "100vh",
        padding: "20px",
        paddingTop: "80px",
        backgroundImage: "unset"
    },
}));

export const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "10px",
    [theme.breakpoints.down("md")]: {
        justifyContent: "space-between",
    },
}));

export const Logo = styled("img")(() => ({
    width: "150px",
}));

export const ListItemButtonCustom = styled(ListItemButton)(() => ({
    borderRadius: "12px",
    padding: "10px 12px",
    color: "#272B30",
    fontFamily: "SatoshiRegular",
    marginTop: "5px",
    "&.Mui-selected": {
        backgroundColor: "#0156FB",
        "& svg path": {
            fill: "#fff",
            opacity: 1
        },
        "& span": {
            color: "#fff",
        },
        "& svg circle": {
            fill: "#fff",
        },
        "&:hover": {
            backgroundColor: "#0156FB",
        }
    },
    "&:hover": {
        backgroundColor: "#0156FB",
        "& svg path": {
            fill: "#fff",
            opacity: 1
        },
        "& span": {
            color: "#fff",
        },
        "& svg circle": {
            fill: "#fff",
        },
    },
}));

export const ListItemTextCustom = styled(ListItemText)(() => ({
    "& span": {
        fontFamily: "SatoshiMedium",
        fontSize: "18px",
        color: "#6f767e"
    },
}));