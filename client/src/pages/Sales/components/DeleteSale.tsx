import React from "react";
import axios from "axios";
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import { SaleProps } from "@/utils/interfaces";
import { convertApiUrl } from "@/utils/urls";
import { useAuth } from "@/hooks/AuthContext";
import LoadingImg from "@/assets/images/loading.svg";

interface DeleteSaleProps {
  sale: SaleProps;
  open: boolean;
  onClose: () => void;
  reload: () => void;
}

const DeleteSale: React.FC<DeleteSaleProps> = ({
  sale,
  open,
  onClose,
  reload
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const { authToken } = useAuth();

  const handleDelete = async () => {
    setLoading(true);
    const result = await axios.post(
      convertApiUrl("sale/delete"),
      { sale_id: sale.id },
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
      onClose={onClose}
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
        Delete Sale? ({sale.sale_street})
      </DialogTitle>
      <DialogActions sx={{ padding: "20px", paddingTop: "20px" }}>
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

export default DeleteSale;