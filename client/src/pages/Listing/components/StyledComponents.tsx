import {
  styled,
  Box,
  IconButton,
  Typography,
  TextField,
} from "@mui/material";

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

export const UploadFormReadInput = styled(TextField)(() => ({
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
    "&.Mui-focused fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)",
      borderWidth: "1px"
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)",
      borderWidth: "1px"
    }
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
  height: "220px",
  objectFit: "cover",
  borderRadius: "5px",
  position: "absolute",
  top: "0px",
  left: "0px",
  zIndex: 1
}));


export const ImageUploadCoverImg = styled("img")(() => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "5px"
}));