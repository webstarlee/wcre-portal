import React from "react";
import { Typography } from "@mui/material";
import { Card } from "@/components/StyledComponents";
import { StatisticsBackImg, StatisticsValueTitle } from "./StyledComponents";

interface StatisticsCardProps {
  value: string;
  title: string;
  bgColor: string;
  bgImg: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({value, title, bgColor, bgImg}): JSX.Element => {
  return (
    <Card sx={{ backgroundColor: `${bgColor}`, overflow: "hidden", padding: "20px", justifyContent: "space-between" }}>
      <StatisticsValueTitle>{value}</StatisticsValueTitle>
      <Typography sx={{fontFamily: "SatoshiLight", fontSize: "22px", color: "#fff"}}>{title}</Typography>
      <StatisticsBackImg src={bgImg} alt="asdf" />
    </Card>
  );
};

export default StatisticsCard;
