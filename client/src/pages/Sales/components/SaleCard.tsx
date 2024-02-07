import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ListingContainer, ListingImg } from "./StyledComponents";
import ListingImgUrl from "@/assets/images/temp/listing.png";
import RetailSvg from "@/assets/images/retail.svg";
import ComissionSvg from "@/assets/images/comission.svg";
import CalendarSvg from "@/assets/images/calendar.svg";
import { SaleProps } from "@/utils/interfaces";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { useAuth } from "@/hooks/AuthContext";

interface CardProps {
  sale: SaleProps;
  openDetail: (_sale: SaleProps) => void;
  openEdit: (_sale: SaleProps) => void;
  openDelete: (_sale: SaleProps) => void;
}

const SaleCard: React.FC<CardProps> = ({
  sale,
  openDetail,
  openEdit,
  openDelete,
}): JSX.Element => {
  const { user } = useAuth();
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

  React.useEffect(() => {
    if (sale.sale_cover !== "") {
      getBucketImage(sale.sale_cover);
    } else {
      setListingCover(ListingImgUrl);
    }
  }, [sale]);

  const handleClickMain = () => {
    openDetail(sale);
  };

  const handleEditButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEdit(sale);
  };

  const handleDeleteButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDelete(sale);
  };

  return (
    <ListingContainer onClick={handleClickMain}>
      <ListingImg src={listingCover} />
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
        {sale.broker_users.map((broker, index) => (
          <span key={index}>
            {broker.fullname}
            {index < sale.brokers.length - 1 && ", "}
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
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {sale.sale_street}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
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
            {sale.sale_property_type}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginLeft: "10px",
          }}
        >
          <img
            src={ComissionSvg}
            style={{ width: "12px", marginRight: "3px" }}
          />
          <Typography
            sx={{
              fontFamily: "SatoshiBold",
              fontSize: "11px",
              color: "#000",
              opacity: "0.8",
            }}
          >
            {sale.sale_commission}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginLeft: "10px",
          }}
        >
          <img
            src={CalendarSvg}
            style={{ width: "10px", marginRight: "3px" }}
          />
          <Typography
            sx={{
              fontFamily: "SatoshiBold",
              fontSize: "11px",
              color: "#000",
              opacity: "0.8",
            }}
          >
            {sale.sale_end_date}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {sale.sale_agreement_file_id ? (
          <Typography
            sx={{
              fontFamily: "SatoshiMedium",
              fontSize: "14px",
              color: "#01d6fb",
            }}
          >
            Fully Executed
          </Typography>
        ) : (
          <Typography
            sx={{
              fontFamily: "SatoshiMedium",
              fontSize: "14px",
              color: "#FB7901",
            }}
          >
            Sale Pending
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <IconButton
            onClick={handleEditButton}
            sx={{ width: "25px", height: "25px" }}
          >
            <EditIcon sx={{ width: "15px", color: "#000" }} />
          </IconButton>
          {user?.role === "Admin" && (
            <IconButton
              onClick={handleDeleteButton}
              sx={{ width: "25px", height: "25px" }}
            >
              <DeleteIcon sx={{ width: "15px", color: "#000" }} />
            </IconButton>
          )}
        </Box>
      </Box>
    </ListingContainer>
  );
};

export default SaleCard;