import React from "react";
import { Typography, Box, List, ListItem, ListItemButton } from "@mui/material";
import { Card } from "@/components/StyledComponents";
import {
  NotificationListIconBox,
  NotificationListText,
  NotificationListBox
} from "./StyledComponents";

import LeasesIcon from "@/assets/images/lease.svg";
import DocumentIcon from "@/assets/images/document.svg";
import SaleIcon from "@/assets/images/sale.svg";
import ListingIcon from "@/assets/images/listing.svg";
import { useMain } from "@/hooks/MainContext";

const NotificationCard: React.FC = (): JSX.Element => {
  const {dashboard} = useMain();

  return (
    <Card sx={{ padding: 0, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          padding: "15px 15px 0px 15px",
        }}
      >
        <Typography
          sx={{ fontFamily: "SatoshiBold", fontSize: "18px", color: "#000" }}
        >
          Notifications
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", padding: "7px 15px" }}>
        <Typography
          sx={{
            fontFamily: "SatoshiRegular",
            fontSize: "14px",
            color: "#5C5D69",
            width: "50px",
          }}
        >
          Type
        </Typography>
        <Typography
          sx={{
            flex: 1,
            fontFamily: "SatoshiRegular",
            fontSize: "14px",
            color: "#5C5D69",
          }}
        >
          Details
        </Typography>
      </Box>
      <NotificationListBox>
        <List>
          {dashboard && dashboard.notifications &&
            dashboard.notifications.map((notification, index) => {
              let typeIcon = LeasesIcon;
              if (notification.type === "document") {
                typeIcon = DocumentIcon;
              } else if (notification.type === "sale") {
                typeIcon = SaleIcon;
              } else if (notification.type === "listing") {
                typeIcon = ListingIcon;
              }

              return (
                <ListItem
                  key={index}
                  disablePadding
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#EEF1FA" : "#F7F8FA",
                  }}
                >
                  <ListItemButton>
                    <NotificationListIconBox
                      sx={{
                        backgroundColor: `${notification.color}`,
                      }}
                    >
                      <img src={typeIcon} style={{ width: "16px" }} />
                    </NotificationListIconBox>
                    <NotificationListText primary={notification.text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </NotificationListBox>
    </Card>
  );
};

export default NotificationCard;
