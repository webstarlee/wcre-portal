import React from "react";
import { API_URL } from "@/utils/urls";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Skeleton,
} from "@mui/material";
import { SaleProps, UserProps } from "@/utils/interfaces";
import {
  DetailContainer,
  DetailHalfBox,
  ListingDetailImg,
  UploadFormLabel,
  UploadFormReadInput,
} from "./StyledComponents";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ListingImgUrl from "@/assets/images/temp/listing.png";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { formatShortDocumentName } from "@/utils/format";

interface ListingDetailProps {
  sale: SaleProps;
  open: boolean;
  onCloseDetail: () => void;
}
const SaleDetail: React.FC<ListingDetailProps> = ({
  sale,
  open,
  onCloseDetail,
}) => {
  const [listingCover, setListingCover] = React.useState<string | undefined>(
    undefined
  );

  const getBucketImage = async (key: string) => {
    try {
      const s3ObjectUrl = parseUrl(
        `https://wcre-documents.s3.us-east-2.amazonaws.com/${key}`
      );
      const presigner = new S3RequestPresigner({
        region: "us-east-2",
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        },
        sha256: Sha256,
      });
      // Create a GET request from S3 url.
      const url = await presigner.presign(new HttpRequest(s3ObjectUrl));
      if (url) {
        setListingCover(formatUrl(url));
      } else {
        setListingCover(ListingImgUrl);
      }
    } catch (error) {
      setListingCover(ListingImgUrl);
    }
  };

  const getStateFullname = (_state: string): string => {
    const stateMapping = {
      NJ: "New Jersey",
      PA: "Pennsylvania",
    };
    // @ts-ignore
    return stateMapping[_state] || _state;
  };

  React.useEffect(() => {
    if (sale.sale_cover !== "") {
      getBucketImage(sale.sale_cover);
    } else {
      setListingCover(ListingImgUrl);
    }
  }, [sale]);

  const removeSymbol = (price: string) => {
    const newPrice = price.replace("$", "");
    return newPrice;
  };

  const getBrokerFullnames = (brokers: UserProps[]) => {
    let fullnames = "";
    brokers.map((broker) => {
      if (fullnames !== "") {
        fullnames = fullnames + ", " + broker.fullname;
      } else {
        fullnames = broker.fullname;
      }
    });

    return fullnames;
  };

  const handleDownloadButton = async (
    e: React.MouseEvent,
    fileName: string
  ) => {
    e.stopPropagation();
    try {
      window.location.href = `${API_URL}/download/${fileName}`;
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadLCS = async (sale_id: string) => {
    console.log(sale_id)
    try {
      window.location.href = `${API_URL}/download/sale/lcs/${sale_id}`;
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth="md"
      open={open}
      onClose={onCloseDetail}
      sx={{ "& .MuiDialog-paper": { borderRadius: "15px" } }}
    >
      <DialogTitle
        sx={{
          paddingBottom: "10px",
          fontSize: "20px",
          backgroundColor: "#FFFFFF",
          fontFamily: "SatoshiBold",
          textAlign: "left",
        }}
      >
        Sales Overview - {sale.sale_street}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onCloseDetail}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          padding: "20px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <DetailContainer>
          <DetailHalfBox sx={{ paddingLeft: { md: "0px" } }}>
            <Box sx={{ width: "100%", height: "220px", position: "relative" }}>
              <Skeleton
                animation="wave"
                sx={{ bgcolor: "white.500" }}
                variant="rectangular"
                width={"100%"}
                height={"100%"}
              />
              <ListingDetailImg src={listingCover} />
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", sm: "row", xl: "row" },
                gap: "10px",
                marginTop: "5px",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Property Type</UploadFormLabel>
                <UploadFormReadInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={sale.sale_property_type}
                  placeholder="Listing Property Type"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Total Commission</UploadFormLabel>
                <UploadFormReadInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={`$ ${removeSymbol(sale.sale_commission)}`}
                  placeholder="Listing Street"
                />
              </Box>
            </Box>
            <Box
              sx={{
                width: "100%",
                marginTop: "5px",
              }}
            >
              <UploadFormLabel>Sales Street</UploadFormLabel>
              <UploadFormReadInput
                InputProps={{
                  readOnly: true,
                }}
                value={sale.sale_street}
                placeholder="Listing Street"
              />
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", sm: "row", xl: "row" },
                gap: "10px",
                marginTop: "5px",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Sales City</UploadFormLabel>
                <UploadFormReadInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={sale.sale_city}
                  placeholder="Listing City"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Sales State</UploadFormLabel>
                <UploadFormReadInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={getStateFullname(sale.sale_state)}
                  placeholder="Listing Street"
                />
              </Box>
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", sm: "row", xl: "row" },
                gap: "10px",
                marginTop: "5px",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Square FT</UploadFormLabel>
                <UploadFormReadInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={sale.sale_sqft}
                  placeholder="Square FT"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Price</UploadFormLabel>
                <UploadFormReadInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={`$ ${removeSymbol(sale.sale_price)}`}
                  placeholder="Listing Street"
                />
              </Box>
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", sm: "row", xl: "row" },
                gap: "10px",
                marginTop: "5px",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Listing Agreement</UploadFormLabel>
                <Box
                  sx={{
                    width: "100%",
                    backgroundColor: "#EBEEF7",
                    height: "41px",
                    border: "solid 1px #b5b7be",
                    borderRadius: "5px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: "15px",
                  }}
                >
                  <Typography sx={{ flex: 1, color: "#95979d" }}>
                    {sale.sale_agreement_file_id
                      ? formatShortDocumentName(sale.sale_agreement_file_id)
                      : "File Not Uploaded"}
                  </Typography>
                  {sale.sale_agreement_file_id && (
                    <IconButton
                      onClick={(e: React.MouseEvent) =>
                        handleDownloadButton(e, sale.sale_agreement_file_id)
                      }
                    >
                      <DownloadIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Closing Date</UploadFormLabel>
                <Box
                  sx={{
                    width: "100%",
                    backgroundColor: "#EBEEF7",
                    height: "41px",
                    border: "solid 1px #b5b7be",
                    borderRadius: "5px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: "15px",
                  }}
                >
                  <Typography sx={{ flex: 1, color: "#000" }}>
                    {sale.sale_end_date}
                  </Typography>
                  <IconButton onClick={() => handleDownloadLCS(sale.id)}>
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </DetailHalfBox>
          <DetailHalfBox
            sx={{
              paddingRight: { md: "0px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                flex: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", xl: "row" },
                  gap: "10px",
                  marginTop: "5px",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Buyer Entity (DBA)</UploadFormLabel>
                  <UploadFormReadInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={sale.sale_buyer_entity}
                    placeholder="Listing Street"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Buyer Name</UploadFormLabel>
                  <UploadFormReadInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={sale.sale_buyer_name}
                    placeholder="Listing City"
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", xl: "row" },
                  gap: "10px",
                  marginTop: "5px",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Buyer Email</UploadFormLabel>
                  <UploadFormReadInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={sale.sale_buyer_email}
                    placeholder="Listing Street"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Buyer Phone Number</UploadFormLabel>
                  <UploadFormReadInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={sale.sale_buyer_phone}
                    placeholder="Listing City"
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", xl: "row" },
                  gap: "10px",
                  marginTop: "5px",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Seller Entity (DBA)</UploadFormLabel>
                  <UploadFormReadInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={sale.sale_seller_entity}
                    placeholder="Listing Street"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Seller Name</UploadFormLabel>
                  <UploadFormReadInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={sale.sale_seller_name}
                    placeholder="Listing City"
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", xl: "row" },
                  gap: "10px",
                  marginTop: "5px",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Seller Email</UploadFormLabel>
                  <UploadFormReadInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={sale.sale_seller_email}
                    placeholder="Listing Street"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Seller Phone Number</UploadFormLabel>
                  <UploadFormReadInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={sale.sale_seller_phone}
                    placeholder="Listing City"
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "5px",
                }}
              >
                <UploadFormLabel>Brokers</UploadFormLabel>
                <UploadFormReadInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={getBrokerFullnames(sale.broker_users)}
                  placeholder="Listing Street"
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Notes</UploadFormLabel>
                <UploadFormReadInput
                  value={sale.sale_notes}
                  multiline
                  rows={3}
                  InputProps={{
                    readOnly: true,
                  }}
                  placeholder="Enter Notes:"
                />
              </Box>
            </Box>
            <Box
              sx={{
                width: "100%",
                marginTop: "10px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <Button
                sx={{
                  borderRadius: "25px",
                  fontFamily: "SatoshiBold",
                  width: { md: "50%", sm: "100%", xs: "100%" },
                }}
                variant="contained"
                size="large"
                color="secondary"
                onClick={onCloseDetail}
              >
                Close
              </Button>
            </Box>
          </DetailHalfBox>
        </DetailContainer>
      </DialogContent>
    </Dialog>
  );
};

export default SaleDetail;
