import {
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";

interface UploadListingProps {
  open: boolean;
  onClose: () => void;
}

const UploadListing: React.FC<UploadListingProps> = ({ open, onClose }) => {
  return (
    <>
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
            fontSize: "24px",
            backgroundColor: "#1A1D1F",
            fontFamily: "BalooSemiBold",
            textAlign: "center",
          }}
        >
          Create Proposal
        </DialogTitle>
        <DialogContent
          sx={{
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "20px",
            backgroundColor: "#1A1D1F",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        ></DialogContent>
      </Dialog>
    </>
  );
};

export default UploadListing;
