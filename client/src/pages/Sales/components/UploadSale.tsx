import React from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  OutlinedInput,
  MenuItem,
  FormControl,
  Chip,
  Checkbox,
  ListItemText,
  IconButton,
  InputAdornment,
} from "@mui/material";
import dayjs from "dayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { UserProps, SaleProps } from "@/utils/interfaces";
import { UploadFormLabel, UploadFormInput, CoverImg } from "./StyledComponents";
import {
  ImageUploadButton,
  ImageUploadButtonImg,
} from "@/components/StyledComponents";
import { convertApiUrl } from "@/utils/urls";
import { useAuth } from "@/hooks/AuthContext";

import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadImg from "@/assets/images/upload.svg";
import LoadingImg from "@/assets/images/loading.svg";
import UploadIcon from "@mui/icons-material/Upload";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface UploadSaleProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  allBrokers: UserProps[] | [];
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 3.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const UploadSale: React.FC<UploadSaleProps> = ({
  open,
  onClose,
  reload,
  allBrokers,
}) => {
  const { authToken } = useAuth();
  const [step, setStep] = React.useState<number>(1);
  const [loading, setLoading] = React.useState<boolean>(false);
  const coverRef = React.useRef<HTMLInputElement | null>(null);
  const agreementRef = React.useRef<HTMLInputElement | null>(null);
  const [newSale, setNewSale] = React.useState<SaleProps>({
    id: "",
    sale_street: "",
    sale_city: "",
    sale_state: "NJ",
    sale_cover: "",
    sale_sqft: "",
    sale_seller_entity: "",
    sale_seller_name: "",
    sale_seller_email: "",
    sale_seller_phone: "",
    sale_buyer_entity: "",
    sale_buyer_name: "",
    sale_buyer_email: "",
    sale_buyer_phone: "",
    sale_end_date_days: dayjs("2024-12-31"),
    sale_property_type: "Office",
    sale_type: "User",
    sale_price: "",
    sale_commission: "",
    brokers: [],
    sale_agreement_file_id: "",
    sale_agreement: null,
    sale_notes: "",
    broker_users: [],
    sale_end_date: "12/31/2024",
    cover: null,
    sale_entered_date: "",
  });

  const [errMessage, setErrMessage] = React.useState("");
  const [errorOpen, setErrorOpen] = React.useState(false);

  const handleNextStep = () => {
    if (step === 1) {
      if (!newSale.cover) {
        setErrMessage(`Sale image is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_street) {
        setErrMessage(`Street is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_city) {
        setErrMessage(`City is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_sqft) {
        setErrMessage(`Square Footage is Required`);
        setErrorOpen(true);
        return false;
      }
    } else if (step === 3) {
      if (!newSale.sale_seller_entity) {
        setErrMessage(`Seller Entity is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_seller_name) {
        setErrMessage(`Seller Name is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_seller_email) {
        setErrMessage(`Seller Email is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_seller_phone) {
        setErrMessage(`Seller Phone is Required`);
        setErrorOpen(true);
        return false;
      }
    } else if (step === 2) {
      if (!newSale.sale_buyer_entity) {
        setErrMessage(`Buyer Entity is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_buyer_name) {
        setErrMessage(`Buyer Name is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_buyer_email) {
        setErrMessage(`Buyer Email is Required`);
        setErrorOpen(true);
        return false;
      }

      if (!newSale.sale_buyer_phone) {
        setErrMessage(`Buyer Phone is Required`);
        setErrorOpen(true);
        return false;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const triggerCoverInput = () => {
    if (coverRef.current) {
      coverRef.current.click();
    }
  };

  const handleCoverUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files && files.length > 0) {
        setNewSale({ ...newSale, cover: files[0] });
      }
    }
  };

  const handleResetCover = () => {
    setNewSale({ ...newSale, cover: null });
  };

  const createImageUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    return url;
  };

  const handleNormalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSale({ ...newSale, [e.target.name]: e.target.value });
  };

  const handleStateChange = (event: SelectChangeEvent) => {
    setNewSale({ ...newSale, sale_state: event.target.value });
  };

  const handlePropertyChange = (event: SelectChangeEvent) => {
    setNewSale({ ...newSale, sale_property_type: event.target.value });
  };

  const handleSaleTypeChange = (event: SelectChangeEvent) => {
    setNewSale({ ...newSale, sale_type: event.target.value });
  };

  const handleSqFtInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let inputText = e.target.value.trim();
    if (isNaN(Number(inputText.replace(/[,.$]/g, "")))) {
      return;
    }
    let numericValue = inputText.replace(/[^0-9.,]/g, "");
    numericValue = numericValue.replace(/\.+/g, ".").replace(/,+/g, ",");
    const parts = numericValue.split(".");
    if (parts.length > 1) {
      parts[1] = parts[1].substring(0, 2);
      numericValue = parts.join(".");
    }

    let cents = "";
    if (numericValue.includes(".")) {
      [numericValue, cents] = numericValue.split(".");
      cents = "." + cents;
    }
    numericValue = numericValue.replace(/,/g, "");
    const numberValue = isNaN(parseFloat(numericValue))
      ? 0
      : parseFloat(numericValue);
    const formattedNumber = new Intl.NumberFormat("en-US").format(numberValue);
    const formattedPrice = numberValue ? `${formattedNumber}${cents}` : "";
    setNewSale({ ...newSale, sale_sqft: formattedPrice });
  };

  const handlePriceInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let inputText = e.target.value.trim();
    if (isNaN(Number(inputText.replace(/[,.$]/g, "")))) {
      setNewSale({ ...newSale, sale_price: inputText });
      return;
    }
    let numericValue = inputText.replace(/[^0-9.,]/g, "");
    numericValue = numericValue.replace(/\.+/g, ".").replace(/,+/g, ",");
    const parts = numericValue.split(".");
    if (parts.length > 1) {
      parts[1] = parts[1].substring(0, 2);
      numericValue = parts.join(".");
    }

    let cents = "";
    if (numericValue.includes(".")) {
      [numericValue, cents] = numericValue.split(".");
      cents = "." + cents;
    }
    numericValue = numericValue.replace(/,/g, "");
    const numberValue = isNaN(parseFloat(numericValue))
      ? 0
      : parseFloat(numericValue);
    const formattedNumber = new Intl.NumberFormat("en-US").format(numberValue);
    const formattedPrice = numberValue ? `${formattedNumber}${cents}` : "";
    setNewSale({ ...newSale, sale_price: formattedPrice });
  };

  const handleBrokerChange = (
    event: SelectChangeEvent<typeof newSale.brokers>
  ) => {
    const {
      target: { value },
    } = event;
    setNewSale({
      ...newSale,
      brokers: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleCommissionInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let inputText = e.target.value.trim();
    if (isNaN(Number(inputText.replace(/[,.$]/g, "")))) {
      setNewSale({ ...newSale, sale_commission: inputText });
      return;
    }
    let numericValue = inputText.replace(/[^0-9.,]/g, "");
    numericValue = numericValue.replace(/\.+/g, ".").replace(/,+/g, ",");
    const parts = numericValue.split(".");
    if (parts.length > 1) {
      parts[1] = parts[1].substring(0, 2);
      numericValue = parts.join(".");
    }

    let cents = "";
    if (numericValue.includes(".")) {
      [numericValue, cents] = numericValue.split(".");
      cents = "." + cents;
    }
    numericValue = numericValue.replace(/,/g, "");
    const numberValue = isNaN(parseFloat(numericValue))
      ? 0
      : parseFloat(numericValue);
    const formattedNumber = new Intl.NumberFormat("en-US").format(numberValue);
    const formattedPrice = numberValue ? `${formattedNumber}${cents}` : "";
    setNewSale({ ...newSale, sale_commission: formattedPrice });
  };

  const triggerAgreementInput = () => {
    if (agreementRef.current) {
      agreementRef.current.click();
    }
  };

  const handleAgreementUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files && files.length > 0) {
        setNewSale({ ...newSale, sale_agreement: files[0] });
      }
    }
  };

  const handleErrorClose = () => {
    setErrorOpen(false);
    setErrMessage("");
  };

  const handleUploadSale = async () => {
    if (newSale.brokers.length === 0) {
      setErrMessage(`Please select brokers`);
      setErrorOpen(true);
      return false;
    }

    if (!newSale.sale_commission) {
      setErrMessage(`Total Commission is required`);
      setErrorOpen(true);
      return false;
    }

    if (!newSale.sale_price) {
      setErrMessage(`Price is Required`);
      setErrorOpen(true);
      return false;
    }

    setNewSale({
      ...newSale,
      sale_end_date: newSale.sale_end_date_days
        ? newSale.sale_end_date_days.format("MM/DD/YYYY")
        : "",
    });

    const formData = new FormData();
    if (newSale.cover) {
      formData.append("cover", newSale.cover);
    }
    if (newSale.sale_agreement) {
      formData.append("agreement", newSale.sale_agreement);
    }
    setLoading(true);

    axios
      .post(convertApiUrl("upload"), formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(async (response) => {
        newSale.sale_cover = response.data.cover;
        newSale.sale_agreement_file_id = response.data.agreement;

        const result = await axios.post(convertApiUrl("sale/upload"), newSale, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log(newSale);
        setLoading(false);

        if (result.status === 200) {
          onClose();
          reload();
        }
      })
      .catch((errors) => {
        setLoading(false);
        console.log(errors);
      });
  };

  const phoneNumberInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let phoneNumber = e.target.value.replace(/\D/g, "");
    if (phoneNumber.length > 10) {
      phoneNumber = phoneNumber.slice(0, 10);
    }
    const formattedNumber = phoneNumber.replace(
      /(\d{3})(\d{3})(\d{4})/,
      "$1-$2-$3"
    );
    return formattedNumber;
  };

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={open}
        disableEscapeKeyDown={true}
        sx={{ "& .MuiDialog-paper": { borderRadius: "15px" } }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
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
          {step === 1 && (
            <Box sx={{ width: "100%" }}>
              <Box sx={{ width: "100%", marginBottom: "20px" }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "SatoshiBold",
                    textAlign: "center",
                  }}
                >
                  New Sale - Property Information
                </Typography>
              </Box>
              {!newSale.cover && (
                <ImageUploadButton onClick={triggerCoverInput}>
                  <ImageUploadButtonImg src={UploadImg} alt="upload" />
                  <Typography
                    sx={{
                      color: "#B9BABB",
                      fontFamily: "SatoshiBold",
                      fontSize: "20px",
                      marginTop: "10px",
                    }}
                  >
                    Upload Property Image
                  </Typography>
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpdate}
                    style={{ display: "none" }}
                  />
                </ImageUploadButton>
              )}
              {newSale.cover && (
                <Box sx={{ width: "100%", position: "relative" }}>
                  <CoverImg src={createImageUrl(newSale.cover)} />
                  <IconButton
                    onClick={handleResetCover}
                    sx={{ position: "absolute", top: "0px", right: "0px" }}
                  >
                    <RefreshIcon color="secondary" />
                  </IconButton>
                </Box>
              )}

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Sale Street*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_street}
                  name="sale_street"
                  onChange={handleNormalChange}
                  placeholder="Enter Street Address:"
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", xl: "row" },
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Sale City*</UploadFormLabel>
                  <UploadFormInput
                    value={newSale.sale_city}
                    name="sale_city"
                    onChange={handleNormalChange}
                    placeholder="Enter Town/City:"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Listing State*</UploadFormLabel>
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      value={newSale.sale_state}
                      onChange={handleStateChange}
                      inputProps={{
                        sx: {
                          backgroundColor: "#EBEEF7",
                          padding: "9px 14px",
                        },
                      }}
                    >
                      <MenuItem value="NJ">New Jersey</MenuItem>
                      <MenuItem value="PA">Pennsylvania</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", xl: "row" },
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Property Type*</UploadFormLabel>
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      value={newSale.sale_property_type}
                      onChange={handlePropertyChange}
                      inputProps={{
                        sx: {
                          backgroundColor: "#EBEEF7",
                          padding: "9px 14px",
                        },
                      }}
                    >
                      <MenuItem value="Office">Office</MenuItem>
                      <MenuItem value="Industrial">Industrial</MenuItem>
                      <MenuItem value="Flex">Flex</MenuItem>
                      <MenuItem value="Retail">Retail</MenuItem>
                      <MenuItem value="Medical">Medical</MenuItem>
                      <MenuItem value="Land">Land</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Sale Square Footage*</UploadFormLabel>
                  <UploadFormInput
                    value={newSale.sale_sqft}
                    onChange={(e) => handleSqFtInput(e)}
                    placeholder="4,000"
                    InputProps={{
                      sx: {
                        "& input": { paddingRight: "0px!important" },
                      },
                      endAdornment: (
                        <InputAdornment
                          sx={{ marginRight: "2px" }}
                          position="end"
                        >
                          SF
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
          {step === 2 && (
            <Box sx={{ width: "100%" }}>
              <Box sx={{ width: "100%", marginBottom: "20px" }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "SatoshiBold",
                    textAlign: "center",
                  }}
                >
                  New Sale - Buyer Information
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                }}
              >
                <UploadFormLabel>Buyer Entity (DBA)*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_buyer_entity}
                  name="sale_buyer_entity"
                  onChange={handleNormalChange}
                  placeholder="110 Richardson LLC ..."
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>buyer Name*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_buyer_name}
                  name="sale_buyer_name"
                  onChange={handleNormalChange}
                  placeholder="Michael Colleluori ..."
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Buyer Email*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_buyer_email}
                  name="sale_buyer_email"
                  onChange={handleNormalChange}
                  placeholder="buyer.name@email.com"
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Buyer Phone Number*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_buyer_phone}
                  onChange={(e) =>
                    setNewSale({
                      ...newSale,
                      sale_buyer_phone: phoneNumberInput(e),
                    })
                  }
                  placeholder="215-555-1212"
                />
              </Box>
            </Box>
          )}

          {step === 3 && (
            <Box sx={{ width: "100%" }}>
              <Box sx={{ width: "100%", marginBottom: "20px" }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "SatoshiBold",
                    textAlign: "center",
                  }}
                >
                  New Sale - Buyer Information
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                }}
              >
                <UploadFormLabel>Seller Entity (DBA)*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_seller_entity}
                  name="sale_seller_entity"
                  onChange={handleNormalChange}
                  placeholder="Bancroft ..."
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Seller Name*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_seller_name}
                  name="sale_seller_name"
                  onChange={handleNormalChange}
                  placeholder="Jennifer Cripps ..."
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Seller Email*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_seller_email}
                  name="sale_seller_email"
                  onChange={handleNormalChange}
                  placeholder="seller.name@email.com"
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Seller Phone Number*</UploadFormLabel>
                <UploadFormInput
                  value={newSale.sale_seller_phone}
                  name="sale_seller_phone"
                  onChange={(e) =>
                    setNewSale({
                      ...newSale,
                      sale_seller_phone: phoneNumberInput(e),
                    })
                  }
                  placeholder="856-348-1196"
                />
              </Box>
            </Box>
          )}

          {step === 4 && (
            <Box sx={{ width: "100%" }}>
              <Box sx={{ width: "100%", marginBottom: "20px" }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "SatoshiBold",
                    textAlign: "center",
                  }}
                >
                  New Sale - General Information
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", xl: "row" },
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Sale Type*</UploadFormLabel>
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      value={newSale.sale_type}
                      onChange={handleSaleTypeChange}
                      inputProps={{
                        sx: {
                          backgroundColor: "#EBEEF7",
                          padding: "9px 14px",
                        },
                      }}
                    >
                      <MenuItem value="User">User</MenuItem>
                      <MenuItem value="investor">investor</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Price*</UploadFormLabel>
                  <UploadFormInput
                    value={newSale.sale_price}
                    onChange={(e) => handlePriceInput(e)}
                    placeholder="4,000"
                    InputProps={{
                      sx: {
                        "& input": { paddingLeft: "0px!important" },
                      },
                      startAdornment: (
                        <InputAdornment
                          sx={{ marginRight: "2px" }}
                          position="start"
                        >
                          $
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  width: "100%",
                }}
              >
                <UploadFormLabel>Brokers*</UploadFormLabel>
                <FormControl sx={{ width: "100%" }}>
                  <Select
                    multiple
                    value={newSale.brokers}
                    onChange={handleBrokerChange}
                    displayEmpty
                    input={<OutlinedInput />}
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return (
                          <Typography sx={{ color: "#95979d" }}>
                            Select Brokers
                          </Typography>
                        );
                      }
                      return (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((id, index) => {
                            const _single_broker = allBrokers.filter(
                              (allbroker) => allbroker.id === id
                            )[0];
                            return (
                              <Chip
                                key={index}
                                label={_single_broker.fullname}
                              />
                            );
                          })}
                        </Box>
                      );
                    }}
                    inputProps={{
                      "aria-label": "Without label",
                      sx: {
                        backgroundColor: "#EBEEF7",
                        padding: "9px 14px",
                      },
                    }}
                    MenuProps={MenuProps}
                  >
                    {allBrokers.map((broker, index) => (
                      <MenuItem key={index} value={broker.id}>
                        <Checkbox
                          size="small"
                          checked={newSale.brokers.indexOf(broker.id) > -1}
                        />
                        <ListItemText primary={broker.fullname} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row", xl: "row" },
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Total Sale Commission*</UploadFormLabel>
                  <UploadFormInput
                    value={newSale.sale_commission}
                    onChange={(e) => handleCommissionInput(e)}
                    placeholder="4,000"
                    InputProps={{
                      sx: {
                        "& input": { paddingLeft: "0px!important" },
                      },
                      startAdornment: (
                        <InputAdornment
                          sx={{ marginRight: "2px" }}
                          position="start"
                        >
                          $
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Sale Closing Date*</UploadFormLabel>
                  <MobileDatePicker
                    sx={{
                      backgroundColor: "#EBEEF7",
                      "& input": { padding: "9px 14px" },
                    }}
                    value={newSale.sale_end_date_days}
                    onChange={(newValue) =>
                      setNewSale({ ...newSale, sale_end_date_days: newValue })
                    }
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
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
                  <input
                    ref={agreementRef}
                    type="file"
                    accept=".txt,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleAgreementUpdate}
                    style={{ display: "none" }}
                  />
                  <Typography sx={{ flex: 1, color: "#95979d" }}>
                    {newSale.sale_agreement
                      ? newSale.sale_agreement.name
                      : "No File Selected"}
                  </Typography>
                  <IconButton onClick={triggerAgreementInput}>
                    <UploadIcon />
                  </IconButton>
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
                  value={newSale.sale_notes}
                  name="sale_notes"
                  onChange={handleNormalChange}
                  multiline
                  rows={4}
                  placeholder="Enter Notes:"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "20px", paddingTop: "0px" }}>
          {step === 1 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                gap: "20px",
              }}
            >
              <Button
                sx={{
                  flex: 1,
                  borderRadius: "25px",
                  fontFamily: "SatoshiBold",
                }}
                variant="contained"
                size="large"
                color="secondary"
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
                variant="contained"
                size="large"
                onClick={handleNextStep}
              >
                Continue
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                gap: "20px",
              }}
            >
              <Button
                sx={{
                  flex: 1,
                  borderRadius: "25px",
                  fontFamily: "SatoshiBold",
                }}
                disabled={loading}
                variant="outlined"
                size="large"
                color="secondary"
                onClick={handlePrevStep}
              >
                Previous
              </Button>
              <Button
                sx={{
                  flex: 1,
                  borderRadius: "25px",
                  fontFamily: "SatoshiBold",
                }}
                variant="contained"
                size="large"
                onClick={handleNextStep}
              >
                Continue
              </Button>
            </Box>
          )}

          {step === 3 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                gap: "20px",
              }}
            >
              <Button
                sx={{
                  flex: 1,
                  borderRadius: "25px",
                  fontFamily: "SatoshiBold",
                }}
                disabled={loading}
                variant="outlined"
                size="large"
                color="secondary"
                onClick={handlePrevStep}
              >
                Previous
              </Button>
              <Button
                sx={{
                  flex: 1,
                  borderRadius: "25px",
                  fontFamily: "SatoshiBold",
                }}
                variant="contained"
                size="large"
                onClick={handleNextStep}
              >
                Continue
              </Button>
            </Box>
          )}

          {step === 4 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                gap: "20px",
              }}
            >
              <Button
                sx={{
                  flex: 1,
                  borderRadius: "25px",
                  fontFamily: "SatoshiBold",
                }}
                disabled={loading}
                variant="outlined"
                size="large"
                color="secondary"
                onClick={handlePrevStep}
              >
                Previous
              </Button>
              <Button
                disabled={loading}
                sx={{
                  flex: 1,
                  borderRadius: "25px",
                  fontFamily: "SatoshiBold",
                }}
                variant="contained"
                size="large"
                color="success"
                onClick={handleUploadSale}
              >
                {loading ? <img src={LoadingImg} /> : "Upload"}
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={errorOpen}
        onClose={handleErrorClose}
        message={errMessage}
        autoHideDuration={2000}
      >
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UploadSale;
