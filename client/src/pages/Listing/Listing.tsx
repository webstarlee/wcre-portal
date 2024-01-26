import React from "react";
import axios from "axios";
import { Typography, InputBase, Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  PageHeader,
  PageFooter,
  PageBody,
} from "@/components/StyledComponents";
import {
  SearchBox,
  SearchBoxContainer,
  HeaderCustomButton,
  ListingFooter,
  NavigationBtn,
} from "./components/StyledComponents";
import ListingCard from "./components/ListingCard";
import UploadIcon from "@mui/icons-material/Upload";
import PinDropIcon from "@mui/icons-material/PinDrop";
import SortIcon from "@mui/icons-material/Sort";
import { LoadingContainer } from "@/components/StyledComponents";
import { ListingProps } from "@/utils/interfaces";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { convertApiUrl } from "@/utils/urls";
import { makePageNavigation } from "@/utils/format";
import { useAuth } from "@/hooks/AuthContext";

import UploadListing from "./components/UploadListing";

import LoadingImg from "@/assets/images/loading.svg";

const Listing: React.FC = (): JSX.Element => {
  const { authToken } = useAuth();
  const [listings, setListings] = React.useState<ListingProps[] | []>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pageLoading, setPageLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [count, setCount] = React.useState<number>(0);

  const [uploadListingOpen, setUploadListingOpen] = React.useState<boolean>(false)

  const fetchListings = async (page: number) => {
    try {
      const response = await axios.get(convertApiUrl(`listings/${page}`), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setLoading(false);
      setPageLoading(false);
      const result: { listings: ListingProps[]; total: number } = response.data;
      setListings(result.listings);
      setCount(result.total);
    } catch (error) {
      setLoading(false);
      setPageLoading(false);
      console.log(error);
    }
  };

  const handlePageNavigation = (_page: number) => {
    if (page !== _page) {
      setPage(_page);
      setPageLoading(true);
      fetchListings(_page);
    }
  };

  useEffectOnce(() => {
    setLoading(true);
    fetchListings(1);
  });

  const handlePrevPage = () => {
    if (page > 1) {
      handlePageNavigation(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < Math.floor(count / 15) + 1) {
      handlePageNavigation(page + 1);
    }
  };

  const uploadListingModalClose = () => {
    setUploadListingOpen(false)
  }

  return (
    <>
      {loading ? (
        <LoadingContainer sx={{ height: "100%" }}>
          <img style={{ width: "40px" }} src={LoadingImg} />
        </LoadingContainer>
      ) : (
        <>
          <PageHeader>
            <Typography
              sx={{
                fontFamily: "SatoshiBold",
                fontSize: "28px",
                display: { sm: "none", xs: "none", md: "block" },
              }}
            >
              Total Listings ({count})
            </Typography>
            <Typography
              sx={{
                fontFamily: "SatoshiBold",
                fontSize: "28px",
                display: { sm: "block", md: "none" },
              }}
            >
              ({count})
            </Typography>
            <SearchBoxContainer>
              <SearchBox>
                <SearchIcon sx={{ color: "#808080" }} />
                <InputBase
                  sx={{
                    ml: 1,
                    flex: 1,
                    "& .MuiInputBase-input": {
                      "&::placeholder": {
                        opacity: 1,
                        color: "#808080",
                      },
                    },
                  }}
                  placeholder="Search Listings"
                />
              </SearchBox>
              <HeaderCustomButton
                sx={{ backgroundColor: "#0156FB" }}
                variant="contained"
                color="primary"
                onClick={() => setUploadListingOpen(true)}
              >
                <UploadIcon />
                <Typography>Upload Listing</Typography>
              </HeaderCustomButton>
              <HeaderCustomButton
                sx={{ backgroundColor: "#FB0179" }}
                variant="contained"
                color="error"
              >
                <PinDropIcon />
                <Typography>Listings Map</Typography>
              </HeaderCustomButton>
            </SearchBoxContainer>
            <HeaderCustomButton
              sx={{ backgroundColor: "#FB7901" }}
              variant="contained"
              color="warning"
            >
              <SortIcon />
              <Typography>Sort</Typography>
            </HeaderCustomButton>
          </PageHeader>
          <PageBody>
            {pageLoading ? (
              <LoadingContainer sx={{ height: "100%" }}>
                <img style={{ width: "40px" }} src={LoadingImg} />
              </LoadingContainer>
            ) : (
              <>
                {listings.length === 0 ? (
                  <Typography>No Listing</Typography>
                ) : (
                  <Grid
                    container
                    spacing={2}
                    justifyContent="center"
                    sx={{
                      height: "100%",
                      paddingBottom: "5px",
                      paddingTop: "5px",
                    }}
                  >
                    {listings.map((listing, index) => (
                      <Grid key={index} item xs={12} sm={6} md={4} lg={2.4}>
                        <ListingCard listing={listing} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </PageBody>
          {count > 0 && (
            <PageFooter>
              <ListingFooter>
                <NavigationBtn onClick={handlePrevPage} disabled={page === 1}>
                  <ArrowBackIosIcon
                    fontSize="small"
                    sx={{ color: "#fff", marginLeft: "5px" }}
                  />
                </NavigationBtn>
                {makePageNavigation(page, count).map((pageNum, index) => {
                  if (pageNum === 0) {
                    return (
                      <Typography sx={{ color: "#fff", fontSize: "20px" }}>
                        ...
                      </Typography>
                    );
                  } else {
                    return (
                      <NavigationBtn
                        onClick={() => handlePageNavigation(pageNum)}
                        key={index}
                        sx={{
                          backgroundColor: page === pageNum ? "#fff" : "",
                          "& p": { color: page === pageNum ? "#000" : "" },
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "SatoshiMedium",
                            fontSize: "16px",
                            color: "#fff",
                          }}
                        >
                          {pageNum}
                        </Typography>
                      </NavigationBtn>
                    );
                  }
                })}
                <NavigationBtn
                  onClick={handleNextPage}
                  disabled={page === Math.floor(count / 15) + 1}
                >
                  <ArrowForwardIosIcon
                    fontSize="small"
                    sx={{ color: "#fff", marginRight: "-1px" }}
                  />
                </NavigationBtn>
              </ListingFooter>
            </PageFooter>
          )}

          <UploadListing open={uploadListingOpen} onClose={uploadListingModalClose} />
        </>
      )}
    </>
  );
};

export default Listing;
