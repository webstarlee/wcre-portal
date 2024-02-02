import React from "react";
import axios from "axios";
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import { ListingProps } from "@/utils/interfaces";
import { convertApiUrl } from "@/utils/urls";
import { useAuth } from "@/hooks/AuthContext";
import LoadingImg from "@/assets/images/loading.svg";

interface DeleteListingProps {
  listing: ListingProps;
  open: boolean;
  onClose: () => void;
  reload: () => void;
}

const DeleteListing: React.FC<DeleteListingProps> = ({
  listing,
  open,
  onClose,
  reload
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const { authToken } = useAuth();

  const handleDelete = async () => {
    setLoading(true);
    const result = await axios.post(
      convertApiUrl("listing/delete"),
      { listing_id: listing.id },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    setLoading(false);

    if (result.status === 200) {
      onClose();
      reload();
    }
  };
  return (
    <Dialog
      fullWidth={true}
      maxWidth="xs"
      open={open}
      disableEscapeKeyDown={true}
      sx={{ "& .MuiDialog-paper": { borderRadius: "15px" } }}
    >
      <DialogTitle
        sx={{
          paddingBottom: "10px",
          fontSize: "20px",
          backgroundColor: "#FFFFFF",
          fontFamily: "SatoshiBold",
          textAlign: "center",
        }}
      >
        Delete Listing ?
      </DialogTitle>
      <DialogActions sx={{ padding: "20px", paddingTop: "0px" }}>
        <Button
          sx={{
            flex: 1,
            borderRadius: "25px",
            fontFamily: "SatoshiBold",
          }}
          variant="contained"
          size="large"
          color="secondary"
          disabled={loading}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          sx={{
            flex: 1,
            borderRadius: "25px",
            fontFamily: "SatoshiBold",
          }}
          disabled={loading}
          variant="contained"
          size="large"
          color="success"
          onClick={handleDelete}
        >
          {loading ? <img src={LoadingImg} /> : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteListing;
