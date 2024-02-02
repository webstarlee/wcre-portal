import React from "react";
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
import { ListingProps, UserProps } from "@/utils/interfaces";
import {
  DetailContainer,
  DetailHalfBox,
  ListingDetailImg,
  UploadFormLabel,
  UploadFormInput,
} from "./StyledComponents";
import DownloadIcon from "@mui/icons-material/Download";
import ListingImgUrl from "@/assets/images/temp/listing.png";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { formatShortDocumentName } from "@/utils/format";

interface ListingDetailProps {
  listing: ListingProps;
  open: boolean;
  onCloseDetail: () => void;
}
const ListingDetail: React.FC<ListingDetailProps> = ({
  listing,
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
    if (listing.listing_cover !== "") {
      getBucketImage(listing.listing_cover);
    } else {
      setListingCover(ListingImgUrl);
    }
  }, [listing]);

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
        {listing.listing_street}
      </DialogTitle>
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
                <UploadFormLabel>Property Type*</UploadFormLabel>
                <UploadFormInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={listing.listing_property_type}
                  placeholder="Listing Property Type"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Price*</UploadFormLabel>
                <UploadFormInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={`$ ${removeSymbol(listing.listing_price)}`}
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
              <UploadFormLabel>Listing Street</UploadFormLabel>
              <UploadFormInput
                InputProps={{
                  readOnly: true,
                }}
                value={listing.listing_street}
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
                <UploadFormLabel>Listing City</UploadFormLabel>
                <UploadFormInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={listing.listing_city}
                  placeholder="Listing City"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Listing State</UploadFormLabel>
                <UploadFormInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={getStateFullname(listing.listing_state)}
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
                <UploadFormLabel>Listing start</UploadFormLabel>
                <UploadFormInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={listing.listing_start_date}
                  placeholder="Listing City"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <UploadFormLabel>Listing End</UploadFormLabel>
                <UploadFormInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={listing.listing_end_date}
                  placeholder="Listing Street"
                />
              </Box>
            </Box>
          </DetailHalfBox>
          <DetailHalfBox sx={{ paddingRight: { md: "0px" }, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Box
              sx={{
                flex: 1,
                width: "100%",
                display: "flex",
                flexDirection: 'column',
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
                  <UploadFormLabel>Owner Entity (DBA)</UploadFormLabel>
                  <UploadFormInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={listing.listing_owner_entity}
                    placeholder="Listing Street"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Primary Contact Name</UploadFormLabel>
                  <UploadFormInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={listing.listing_owner_name}
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
                  <UploadFormLabel>Owner Email</UploadFormLabel>
                  <UploadFormInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={listing.listing_owner_email}
                    placeholder="Listing Street"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Owner Phone Number</UploadFormLabel>
                  <UploadFormInput
                    InputProps={{
                      readOnly: true,
                    }}
                    value={listing.listing_owner_phone}
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
                <UploadFormInput
                  InputProps={{
                    readOnly: true,
                  }}
                  value={getBrokerFullnames(listing.broker_users)}
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
                  <UploadFormLabel>Owner Email</UploadFormLabel>
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
                      {listing.listing_agreement_file_id
                        ? formatShortDocumentName(
                          listing.listing_agreement_file_id
                        )
                        : "File not uploaded"}
                    </Typography>
                    {listing.listing_agreement_file_id && (
                      <IconButton>
                        <DownloadIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Owner Phone Number</UploadFormLabel>
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
                      {listing.listing_amendment_file_id
                        ? formatShortDocumentName(
                          listing.listing_amendment_file_id
                        )
                        : "File not uploaded"}
                    </Typography>
                    {listing.listing_amendment_file_id && (
                      <IconButton>
                        <DownloadIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Notes</UploadFormLabel>
                <UploadFormInput
                  value={listing.listing_notes}
                  multiline
                  rows={3}
                  InputProps={{
                    readOnly: true,
                  }}
                  placeholder="Pending"
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

export default ListingDetail;
