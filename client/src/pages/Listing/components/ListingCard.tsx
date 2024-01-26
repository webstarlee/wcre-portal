import React from "react";
import { Box, Typography, IconButton, Link } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ListingContainer, ListingImg } from "./StyledComponents";
import ListingImgUrl from "@/assets/images/temp/listing.png";
import RetailSvg from "@/assets/images/retail.svg";
import { ListingProps } from "@/utils/interfaces";
import { stateName } from "@/utils/format";

interface CardProps {
  listing: ListingProps;
}

const ListingCard: React.FC<CardProps> = ({ listing }): JSX.Element => {
  const handleClickMain = () => {
    console.log("Main button clicked");
  };

  const handleClickInside = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Inside button clicked");
  };

  console.log(listing);
  return (
    <ListingContainer onClick={handleClickMain}>
      <ListingImg src={ListingImgUrl} />
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
        {listing.brokers.map((broker, index) => (
          <span key={index}>
            {broker}
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
            lineHeight: "16px",
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
