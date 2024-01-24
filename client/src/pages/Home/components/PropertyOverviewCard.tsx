import React from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ReactApexCharts from 'react-apexcharts'
import { Card } from "@/components/StyledComponents";
import ApexCharts from "apexcharts";

const options: ApexCharts.ApexOptions = {
  chart: {
    height: 300,
    type: 'area',
    toolbar: {
      show: false
    },
    selection: {
      enabled: false,
    },
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    colors: ['#0156FB'],
    width: 1
  },
  fill: {
    colors: ['#679bff'],
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    type: 'category',
    categories: [
      '',
      'Jan',
      'Feb',
      'Mar',
      'April',
      'May',
      'June',
      'July',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec',
      ''
    ]
  },
  yaxis: {
    show: true,
    min: 2,
    max: 20,
    stepSize: 2,
    forceNiceScale: true
  },
  responsive: [
    {
      breakpoint: 2000,
      options: {
        legend: {
          position: "bottom"
        }
      }
    },
    {
      breakpoint: 1200,
      options: {
        plotOptions: {
          bar: {
            horizontal: true
          }
        },
        legend: {
          position: "right"
        }
      }
    }
  ]
};

const series = [{
  name: 'series1',
  data: [13, 16, 11, 10, 6, 7, 15, 12, 8, 12, 6, 7, 8, 9]
}];

const PropertyOverviewCard: React.FC = (): JSX.Element => {
  const theme = useTheme();
  let chatHeight = 400;
  const screenWidth = window.innerWidth;
  if (screenWidth > 2000) {
    chatHeight = 400;
  } else if (screenWidth > 1536 && screenWidth < 2000) {
    chatHeight = 300;
  } else if (theme.breakpoints.down("xl")) {
    chatHeight = 220;
  }

  return (
    <Card>
      <Typography
        sx={{ fontFamily: "SatoshiBold", fontSize: "18px", color: "#000" }}
      >
        Property Overview
      </Typography>
      <ReactApexCharts options={options} series={series} type="area" height={chatHeight} />
    </Card>
  );
};

export default PropertyOverviewCard;