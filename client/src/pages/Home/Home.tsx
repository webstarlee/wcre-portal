import { Typography, Grid, Box } from "@mui/material";
import { PageHeader } from "@/components/StyledComponents";
import { useMain } from "@/hooks/MainContext";
import {
  MainContainer,
  MainBox,
  NotificationBox,
} from "./components/StyledComponents";
import PieChartCard from "./components/PieChartCard";
import StatisticsCard from "./components/StatisticsCard";
import RecentUnitsCard from "./components/RecentUnitsCard";
import NotificationCard from "./components/NotificationCard";
import PropertyOverviewCard from "./components/PropertyOverviewCard";
import { LoadingContainer } from "@/components/StyledComponents";

import LoadingImg from "@/assets/images/loading.svg";
import ListingImg from "@/assets/images/listing.svg";
import SalesImg from "@/assets/images/sale.svg";
import DocumentImg from "@/assets/images/document.svg";
import LeasesImg from "@/assets/images/lease.svg";

const Home: React.FC = () => {
  const { dashboard, mainLoading } = useMain();

  return (
    <>
      {!dashboard && mainLoading ? (
        <LoadingContainer sx={{ height: "100%" }}>
          <img style={{ width: "40px" }} src={LoadingImg} />
        </LoadingContainer>
      ) : (
        <>
          <PageHeader>
            <Typography sx={{ fontFamily: "SatoshiBold", fontSize: "28px" }}>
              {dashboard ? dashboard.greetingMsg : ""}
            </Typography>
          </PageHeader>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={3}>
              <StatisticsCard
                value={dashboard ? dashboard.totalListings : "0"}
                title="Active Listings"
                bgColor="#0156FB"
                bgImg={ListingImg}
              />
            </Grid>
            <Grid item xs={12} lg={3}>
              <StatisticsCard
                value={dashboard ? dashboard.totalSales : "0"}
                title="Total Sales"
                bgColor="#FB0179"
                bgImg={SalesImg}
              />
            </Grid>
            <Grid item xs={12} lg={3}>
              <StatisticsCard
                value={dashboard ? dashboard.totalLeases : "0"}
                title="Active Leases"
                bgColor="#FB7901"
                bgImg={LeasesImg}
              />
            </Grid>
            <Grid item xs={12} lg={3}>
              <StatisticsCard
                value={dashboard ? dashboard.totalDocuments : "0"}
                title="Total Documents"
                bgColor="#01cdfb"
                bgImg={DocumentImg}
              />
            </Grid>
          </Grid>
          <MainContainer sx={{ marginTop: "15px" }}>
            <MainBox>
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} lg={7}>
                    <PropertyOverviewCard />
                  </Grid>
                  <Grid item xs={12} lg={5}>
                    <PieChartCard />
                  </Grid>
                </Grid>
              </Box>
              <RecentUnitsCard />
            </MainBox>
            <NotificationBox>
              <NotificationCard />
            </NotificationBox>
          </MainContainer>
        </>
      )}
    </>
  );
};

export default Home;
