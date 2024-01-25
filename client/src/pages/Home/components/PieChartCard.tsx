import React from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ReactApexCharts from "react-apexcharts";
import { Card } from "@/components/StyledComponents";
import ApexCharts from "apexcharts";

const options: ApexCharts.ApexOptions = {
  chart: {
    type: "donut",
    toolbar: {
        show: false
    }
  },
  dataLabels: {
    enabled: false,
  },
  colors: ["#0156FB", "#FB0179", "#FB7901"],
  labels: ["A", "B", "C"],
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '16px',
            fontFamily: 'SatoshiMedium',
            color: "#000",
            offsetY: -25,
            formatter: function (val) {
              return val
            }
          },
          value: {
            show: true,
            fontSize: '42px',
            fontFamily: 'SatoshiBold',
            color: "#000",
            offsetY: 15,
            formatter: function (val) {
              return val
            }
          },
          total: {
            show: true,
            label: "Total",
            fontSize: '16px',
            fontFamily: 'SatoshiMedium',
            color: "#000",
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a: number, b: number) => {
                return a + b;
              }, 0);
            },
          },
        },
      },
    },
  },
  legend: {
    show: false
  }
};

const series = [11, 11, 6];

const PieChartCard: React.FC = (): JSX.Element => {
  const theme = useTheme();
  let chatHeight = 400;
  const screenWidth = window.innerWidth;
  if (screenWidth > 2000) {
    chatHeight = 400;
  } else if (screenWidth > 1536 && screenWidth < 2000) {
    chatHeight = 300;
  } else if (theme.breakpoints.down("xl")) {
    chatHeight = 250;
  }

  return (
    <Card>
      <Typography
        sx={{ fontFamily: "SatoshiBold", fontSize: "21px", color: "#000" }}
      >
        Statistics
      </Typography>
      <ReactApexCharts
        options={options}
        series={series}
        type="donut"
        height={chatHeight}
      />
    </Card>
  );
};

export default PieChartCard;
