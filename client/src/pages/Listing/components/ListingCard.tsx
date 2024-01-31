import React from "react";
import { Box, Typography, IconButton, Link } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ListingContainer, ListingImg } from "./StyledComponents";
import ListingImgUrl from "@/assets/images/temp/listing.png";
import RetailSvg from "@/assets/images/retail.svg";
import { ListingProps } from "@/utils/interfaces";
import { stateName } from "@/utils/format";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import {Sha256} from "@aws-crypto/sha256-browser";
import { formatUrl } from "@aws-sdk/util-format-url";

interface CardProps {
  listing: ListingProps;
}

const ListingCard: React.FC<CardProps> = ({ listing }): JSX.Element => {

  const [listingCover, setListingCover] = React.useState<string | undefined>(undefined);

  const handleClickMain = () => {
    console.log("Main button clicked");
  };

  const handleClickInside = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Inside button clicked");
  };

  const getBucketImage = async (key: string) => {
    try {
      const s3ObjectUrl = parseUrl(`https://wcre-documents.s3.us-east-2.amazonaws.com/${key}`);
      const presigner = new S3RequestPresigner({
          "region": "us-east-2",
          credentials: {
              accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
              secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
          },
          sha256: Sha256
      });
      // Create a GET request from S3 url.
      const url = await presigner.presign(new HttpRequest(s3ObjectUrl));
      if (url) {
        setListingCover(formatUrl(url))
      } else {
        setListingCover(ListingImgUrl)
      }
    } catch (error) {
      setListingCover(ListingImgUrl)
    }
  }

  React.useEffect(() => {
    if (listing.listing_cover !== "") {
      getBucketImage(listing.listing_cover);
    } else {
      setListingCover(ListingImgUrl)
    }
  }, [listing])

  return (
    <ListingContainer onClick={handleClickMain}>
      <ListingImg
        src={listingCover}
      />
      <Typography
        sx={{
          marginTop: "5px",
          fontFamily: "SatoshiMedium",
          fontSize: "12px",
          color: "#000",
          opacity: "0.8",
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {listing.broker_users.map((broker, index) => (
          <span key={index}>
            {broker.fullname}
            {index < listing.brokers.length - 1 && ", "}
          </span>
        ))}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontFamily: "SatoshiBold",
            fontSize: "16px",
            color: "#000",
            lineHeight: "20px",
            width: "calc(100% - 90px)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {listing.listing_owner_entity}
        </Typography>
        <Typography
          sx={{
            fontFamily: "SatoshiBold",
            fontSize: "16px",
            color: "#0156FB",
            lineHeight: "16px",
          }}
        >
          {listing.listing_price}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <img src={RetailSvg} style={{ width: "10px", marginRight: "3px" }} />
          <Typography
            sx={{
              fontFamily: "SatoshiBold",
              fontSize: "11px",
              color: "#000",
              opacity: "0.8",
            }}
          >
            {listing.listing_property_type}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: "SatoshiMedium",
            fontSize: "12px",
            color: "#808080",
          }}
        >
          {listing.listing_city}, {stateName(listing.listing_state)}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {listing.listing_agreement_file_id ? (
          <Link
            sx={{
              fontFamily: "SatoshiMedium",
              fontSize: "14px",
              color: "#01d6fb",
            }}
            href={`./download/${listing.listing_agreement_file_id}`}
          >
            Fully Executed
          </Link>
        ) : (
          <Typography
            sx={{
              fontFamily: "SatoshiMedium",
              fontSize: "14px",
              color: "#FB7901",
            }}
          >
            Pending
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <IconButton
            onClick={handleClickInside}
            sx={{ width: "25px", height: "25px" }}
          >
            <EditIcon sx={{ width: "15px" }} />
          </IconButton>
          <IconButton
            onClick={handleClickInside}
            sx={{ width: "25px", height: "25px" }}
          >
            <DeleteIcon sx={{ width: "15px" }} />
          </IconButton>
        </Box>
      </Box>
    </ListingContainer>
  );
};

export default ListingCard;