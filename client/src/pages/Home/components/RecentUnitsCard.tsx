import React from "react";
import { Typography, Box } from "@mui/material";
import { Card } from "@/components/StyledComponents";
import UnitCard from "./UnitCard";

import UnitImg1 from "@/assets/images/units/unit_1.jpg";
import UnitImg2 from "@/assets/images/units/unit_2.jpg";
import UnitImg3 from "@/assets/images/units/unit_3.jpg";

const units = [
  {
    title: "190 haddon Ave",
    square: 2243,
    dateTime: "22 Jan 2023",
    price: 160000,
    bgImg: UnitImg1,
  },
  {
    title: "325 Haddon Ave",
    square: 1246,
    dateTime: "24 Jan 2023",
    price: 230000,
    bgImg: UnitImg2,
  },
  {
    title: "670 Haddon Ave",
    square: 1024,
    dateTime: "22 Jan 2023",
    price: 160000,
    bgImg: UnitImg3,
  }
]

const RecentUnitsCard: React.FC = (): JSX.Element => {
  return (
    <Card>
      <Typography
        sx={{ fontFamily: "SatoshiBold", fontSize: "18px", color: "#000" }}
      >
        Recent Units
      </Typography>
      <Box sx={{display: 'flex', flexDirection: 'row', gap: "15px", width: "100%", overflowX: "auto"}}>
        {units.map(unit => <UnitCard key={unit.title} {...unit} />)}
      </Box>
    </Card>
  );
};

export default RecentUnitsCard;
