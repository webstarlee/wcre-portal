import React from "react";
import axios from "axios";
import { Typography, InputBase, Grid } from "@mui/material";
import {
  PageHeader,
  PageFooter,
  PageBody,
  SearchBox,
  SearchBoxContainer,
  HeaderCustomButton,
  LoadingContainer,
} from "@/components/StyledComponents";
import { SaleProps, UserProps } from "@/utils/interfaces";
import { ListingFooter, NavigationBtn } from "./components/StyledComponents";
import { makePageNavigation } from "@/utils/format";
import { convertApiUrl } from "@/utils/urls";
import { useAuth } from "@/hooks/AuthContext";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import SaleCard from "./components/SaleCard";
import SaleDetail from "./components/SaleDetail";
import UploadSale from "./components/UploadSale";
import EditSale from "./components/EditSale";
import DeleteSale from "./components/DeleteSale";

import SearchIcon from "@mui/icons-material/Search";
import UploadIcon from "@mui/icons-material/Upload";
import PinDropIcon from "@mui/icons-material/PinDrop";
import SortIcon from "@mui/icons-material/Sort";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import LoadingImg from "@/assets/images/loading.svg";

const Sales: React.FC = (): JSX.Element => {
  const { authToken } = useAuth();
  const [page, setPage] = React.useState<number>(1);
  const [count, setCount] = React.useState<number>(0);
  const [sales, setSales] = React.useState<SaleProps[] | []>([]);
  const [brokers, setBrokers] = React.useState<UserProps[] | []>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pageLoading, setPageLoading] = React.useState<boolean>(false);
  const [detailOpen, setDetailOpen] = React.useState<boolean>(false);
  const [saleData, setSaleData] = React.useState<SaleProps | null>(null);

  const [uploadOpen, setUploadOpen] = React.useState<boolean>(false);

  const [editOpen, setEditOpen] = React.useState<boolean>(false);
  const [editData, setEditData] = React.useState<SaleProps | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState<boolean>(false);
  const [deleteData, setDeleteData] = React.useState<SaleProps | null>(null);

  useEffectOnce(() => {
    setLoading(true);
    fetchSales(1);
  });

  const fetchSales = async (page: number) => {
    try {
      const response = await axios.get(convertApiUrl(`sales/${page}`), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setLoading(false);
      setPageLoading(false);

      const result: {
        sales: SaleProps[];
        total: number;
        brokers: UserProps[];
      } = response.data;
      setSales(result.sales);
      setBrokers(result.brokers);
      setCount(result.total);
    } catch (error) {
      setLoading(false);
      setPageLoading(false);
      console.log(error);
    }
  };

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

  const handlePageNavigation = (_page: number) => {
    if (page !== _page) {
      setPage(_page);
      setPageLoading(true);
      fetchSales(_page);
    }
  };

  const handleSaleDetail = (_sale: SaleProps) => {
    setSaleData(_sale);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setSaleData(null);
    setDetailOpen(false);
  };

  const uploadModalClose = () => {
    setUploadOpen(false);
  };

  const reloadSales = () => {
    setPageLoading(true);
    fetchSales(1);
  };

  const handleSetEditSale = (_sale: SaleProps) => {
    setEditData(_sale);
    setEditOpen(true);
  };

  const editModalClose = () => {
    setEditOpen(false);
    setEditData(null);
  };

  const updateSalesData = (_sale: SaleProps) => {
    setSales((prevSales) => {
      return prevSales.map((sale) => (sale.id === _sale.id ? _sale : sale));
    });
  };

  const handleSetDelete = (_sale: SaleProps) => {
    setDeleteData(_sale);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteData(null);
    setDeleteOpen(false);
  };

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
              Total Sales ({count})
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
                  placeholder="Search Sales"
                />
              </SearchBox>
              <HeaderCustomButton
                onClick={() => setUploadOpen(true)}
                variant="contained"
                color="primary"
              >
                <UploadIcon />
                <Typography>Upload Sales</Typography>
              </HeaderCustomButton>
              <HeaderCustomButton variant="contained" color="secondary">
                <PinDropIcon />
                <Typography>Sales Map</Typography>
              </HeaderCustomButton>
            </SearchBoxContainer>
            <HeaderCustomButton variant="contained" color="warning">
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
                {sales.length === 0 ? (
                  <Typography>No Sales</Typography>
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
                    {sales.map((sale, index) => (
                      <Grid key={index} item xs={12} sm={6} md={4} lg={2.4}>
                        <SaleCard
                          sale={sale}
                          openDetail={handleSaleDetail}
                          openEdit={handleSetEditSale}
                          openDelete={handleSetDelete}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </PageBody>
          {count > 15 && (
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

          {detailOpen && saleData && (
            <SaleDetail
              sale={saleData}
              open={detailOpen}
              onCloseDetail={handleDetailClose}
            />
          )}

          {editOpen && editData && (
            <EditSale
              sale={editData}
              open={editOpen}
              onClose={editModalClose}
              update={updateSalesData}
              allBrokers={brokers}
            />
          )}

          {uploadOpen && (
            <UploadSale
              open={uploadOpen}
              onClose={uploadModalClose}
              allBrokers={brokers}
              reload={reloadSales}
            />
          )}

          {deleteOpen && deleteData && (
            <DeleteSale
              sale={deleteData}
              open={deleteOpen}
              onClose={handleDeleteClose}
              reload={reloadSales}
            />
          )}
        </>
      )}
    </>
  );
};

export default Sales;
