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
import { ListingProps, UserProps } from "@/utils/interfaces";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { convertApiUrl } from "@/utils/urls";
import { makePageNavigation } from "@/utils/format";
import { useAuth } from "@/hooks/AuthContext";
import UploadListing from "./components/UploadListing";
import ListingDetail from "./components/ListingDetail";
import EditListing from "./components/EditListing";
import DeleteListing from "./components/DeleteListing";
import LoadingImg from "@/assets/images/loading.svg";

const Listing: React.FC = (): JSX.Element => {
  const { authToken } = useAuth();
  const [listings, setListings] = React.useState<ListingProps[] | []>([]);
  const [brokers, setBrokers] = React.useState<UserProps[] | []>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pageLoading, setPageLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [count, setCount] = React.useState<number>(0);
  const [uploadListingOpen, setUploadListingOpen] = React.useState<boolean>(false)
  const [listingDetailOpen, setListingDetailOpen] = React.useState<boolean>(false);
  const [listingData, setListingData] = React.useState<ListingProps | null>(null);
  const [listingEditOpen, setListingEditOpen] = React.useState<boolean>(false);
  const [listingEditData, setListingEditData] = React.useState<ListingProps | null>(null);

  const [listingDeleteOpen, setListingDeleteOpen] = React.useState<boolean>(false);
  const [listingDeleteData, setListingDeleteData] = React.useState<ListingProps | null>(null);

  const fetchListings = async (page: number) => {
    try {
      const response = await axios.get(convertApiUrl(`listings/${page}`), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setLoading(false);
      setPageLoading(false);

      const result: { listings: ListingProps[]; total: number, brokers: UserProps[] } = response.data;
      setListings(result.listings);
      setBrokers(result.brokers);
      setCount(result.total);
    } catch (error) {
      setLoading(false);
      setPageLoading(false);
      console.log(error);
    }
  };

  const reloadListing = () => {
    setPageLoading(true);
    fetchListings(1);
  }

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

  const editListingModalClose = () => {
    setListingEditOpen(false);
    setListingEditData(null);
  }

  const handleListingDetail = (_listing: ListingProps) => {
    setListingData(_listing);
    setListingDetailOpen(true);
  }

  const handleDetailClose = () => {
    setListingData(null);
    setListingDetailOpen(false);
  }

  const handleSetEditListing = (_listing: ListingProps) => {
    setListingEditData(_listing);
    setListingEditOpen(true)
  }

  const handleDeleteClose = () => {
    setListingDeleteData(null);
    setListingDeleteOpen(false);
  }

  const handleSetDeleteListing = (_listing: ListingProps) => {
    setListingDeleteData(_listing);
    setListingDeleteOpen(true)
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
                variant="contained"
                color="primary"
                onClick={() => setUploadListingOpen(true)}
              >
                <UploadIcon />
                <Typography>Upload Listing</Typography>
              </HeaderCustomButton>
              <HeaderCustomButton
                variant="contained"
                color="secondary"
              >
                <PinDropIcon />
                <Typography>Listings Map</Typography>
              </HeaderCustomButton>
            </SearchBoxContainer>
            <HeaderCustomButton
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
                        <ListingCard listing={listing} openDetail={handleListingDetail} openEdit={handleSetEditListing} openDelete={handleSetDeleteListing} />
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

          {uploadListingOpen && <UploadListing open={uploadListingOpen} onClose={uploadListingModalClose} allBrokers={brokers} reload={reloadListing} />}
          {listingDeleteOpen && listingDeleteData && <DeleteListing listing={listingDeleteData} open={listingDeleteOpen} onClose={handleDeleteClose} reload={reloadListing} />}
          {listingDetailOpen && listingData && <ListingDetail listing={listingData} open={listingDetailOpen} onCloseDetail={handleDetailClose} />}
          {listingEditOpen && listingEditData && <EditListing listing={listingEditData} open={listingEditOpen} onClose={editListingModalClose} allBrokers={brokers} reload={reloadListing} />}
        </>
      )}
    </>
  );
};

export default Listing;
