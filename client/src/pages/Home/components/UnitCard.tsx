import React from "react";
import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { UnitCardImg } from "./StyledComponents";

interface UnitCardProps {
  title: string;
  square: number;
  dateTime: string;
  price: number;
  bgImg: string;
}

const UnitCard: React.FC<UnitCardProps> = ({
  title,
  square,
  dateTime,
  price,
  bgImg,
}): JSX.Element => {

  const theme = useTheme();
  let imageWidth = 120;
  let imageHeight = 100;
  const screenWidth = window.innerWidth;
  if (screenWidth > 2000) {
    imageWidth = 160;
    imageHeight = 160;
  } else if (screenWidth > 1536 && screenWidth < 2000) {
    imageWidth = 120;
    imageHeight = 110;
  } else if (theme.breakpoints.down("xl")) {
    imageWidth = 120;
    imageHeight = 100;
  }

  return (
    <Box
      sx={{
        padding: "10px",
        backgroundColor: "#EBEEF7",
        borderRadius: "15px",
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "#0156FB",
            "& p": {
                color: "#fff"
            }
        },
      }}
    >
      <UnitCardImg sx={{width: `${imageWidth}px`, height: `${imageHeight}px`}} src={bgImg} />
      <Typography
        sx={{ fontFamily: "SatoshiBold", fontSize: "12px", color: "#4A4D50" }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: "SatoshiRegular",
          fontSize: "10px",
          color: "#4A4D50",
        }}
      >
        {square} sqft
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontFamily: "SatoshiRegular",
            fontSize: "10px",
            color: "#4A4D50",
          }}
        >
          {dateTime}
        </Typography>
        <Typography
          sx={{ fontFamily: "SatoshiBold", fontSize: "10px", color: "#4A4D50" }}
        >
          ${price}
        </Typography>
      </Box>
    </Box>
  );
};

export default UnitCard;
