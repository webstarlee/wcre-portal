import {
  styled,
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
} from "@mui/material";

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

export const ListingContainer = styled(Box)(() => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  padding: "10px",
  borderRadius: "10px",
  backgroundColor: "#fff",
  cursor: "pointer",
  textTransform: "none",
  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.2)",
  alignItems: "flex-start",
  "&:hover": {
    boxShadow: "0px 1px 8px 0px rgba(0, 0, 0, 0.2)",
  },
}));

export const ListingFooter = styled(Box)(() => ({
  width: "250px",
  padding: "8px 10px",
  backgroundColor: "#0156FB",
  boxShadow: "0 1px 15px 0 rgba(0,0,0,0.2)",
  borderRadius: "50px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const ListingImg = styled("img")(({ theme }) => ({
  width: "100%",
  height: "140px",
  objectFit: "cover",
  borderRadius: "5px",
  [theme.breakpoints.down("xl")]: {
    height: "102px",
  },
  [theme.breakpoints.down("sm")]: {
    height: "140px",
  },
}));

export const NavigationBtn = styled(IconButton)(() => ({
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  margin: "0 2px",
  "&:hover": {
    backgroundColor: "#fff",
    "& svg, & p": {
      color: "#000",
    },
  },
}));

export const UploadFormLabel = styled(Typography)(() => ({
  marginBottom: "3px",
  fontFamily: "SatoshiMedium",
  color: "#B9BABB",
  fontSize: "14px",
}));

export const UploadFormInput = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    borderRadius: "4px",
    backgroundColor: "#EBEEF7",
    fontfamily: "SatoshiMedium",
    fontSize: "16px",
    "& input": {
      padding: "9px 14px",
    },
    "&.MuiInputBase-multiline": {
      padding: "9px 14px",
    },
  },
  width: "100%",
}));

export const CoverImg = styled("img")(({ theme }) => ({
  width: "100%",
  borderRadius: "5px",
  objectFit: "cover",
  maxHeight: "200px",
  [theme.breakpoints.down("xl")]: {
    maxHeight: "170px",
  },
}));

export const DetailContainer = styled(Box)(({theme}) => ({
  width: "100%",
  display: 'flex',
  flexDirection: "row",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

export const DetailHalfBox = styled(Box)(({theme}) => ({
  flex: 1,
  paddingLeft: "15px",
  paddingRight: "15px",
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

export const ListingDetailImg = styled("img")(() => ({
  width: "100%",
  maxHeight: "220px",
  objectFit: "cover",
  borderRadius: "5px",
  position: "absolute",
  top: "0px",
  left: "0px",
  zIndex: 1
}));
