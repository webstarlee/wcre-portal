import React from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
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
import dayjs, { Dayjs } from "dayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import {
  ImageUploadButton,
  ImageUploadButtonImg,
} from "@/components/StyledComponents";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import UploadIcon from "@mui/icons-material/Upload";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  UploadFormLabel,
  UploadFormInput,
  CoverImg,
  ImageUploadCoverImg,
} from "./StyledComponents";
import UploadImg from "@/assets/images/upload.svg";
import { UserProps, ListingProps } from "@/utils/interfaces";
import { convertApiUrl } from "@/utils/urls";
import { useAuth } from "@/hooks/AuthContext";
import { getLatLng } from "@/utils/urls";
import LoadingImg from "@/assets/images/loading.svg";
import ListingImgUrl from "@/assets/images/temp/listing.png";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { formatShortDocumentName } from "@/utils/format";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

interface EditListingProps {
  listing: ListingProps;
  open: boolean;
  onClose: () => void;
  reload: () => void;
  allBrokers: UserProps[] | [];
}

const EditListing: React.FC<EditListingProps> = ({
  listing,
  open,
  onClose,
  reload,
  allBrokers,
}) => {
  const { authToken } = useAuth();
  const [errMessage, setErrMessage] = React.useState("");
  const [errorOpen, setErrorOpen] = React.useState(false);

  const [step, setStep] = React.useState<number>(1);
  const coverRef = React.useRef<HTMLInputElement | null>(null);
  const [cover, setCover] = React.useState<File | null>(null);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(null);
  const [listingStreet, setListingStreet] = React.useState<string>("");
  const [listingCity, setListingCity] = React.useState<string>("");
  const [listingPrice, setListingPrice] = React.useState<string>("");
  const [ownerEntity, setOwnerEntity] = React.useState<string>("");
  const [listingStart, setListingStart] = React.useState<Dayjs | null>(
    dayjs("2024-01-01")
  );
  const [listingEnd, setListingEnd] = React.useState<Dayjs | null>(
    dayjs("2024-12-31")
  );
  const [primaryContact, setPrimaryContact] = React.useState<string>("");
  const [ownerEmail, setOwnerEmail] = React.useState<string>("");
  const [ownerPhone, setOwnerPhone] = React.useState<string>("");
  const [brokerIds, setBrokerIds] = React.useState<string[]>([]);
  const [brokers, setBrokers] = React.useState<UserProps[]>([]);
  const [propertyType, setPropertyType] = React.useState<string>("Office");
  const [listingState, setListingState] = React.useState<string>("NJ");

  const agreementRef = React.useRef<HTMLInputElement | null>(null);
  const [agreement, setAgreement] = React.useState<File | null>(null);

  const amendmentRef = React.useRef<HTMLInputElement | null>(null);
  const [amendment, setAmendment] = React.useState<File | null>(null);
  const [note, setNote] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const [listingCover, setListingCover] = React.useState<string | undefined>(
    undefined
  );

  const removeSymbol = (price: string) => {
    const newPrice = price.replace("$", "");
    return newPrice;
  };

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

  const getCorrectStateName = (_state: string) => {
    if (_state === "NJ" || _state === "PA") {
      return _state;
    } else if (_state.trim() === "New Jersey") {
      return "NJ";
    } else if (_state.trim() === "Pennsylvania") {
      return "PA";
    }

    return _state;
  };

  const resetForm = () => {
    setStep(1);
    setCover(null);
    setCoverUrl("");
    setListingStreet(listing.listing_street);
    setListingCity(listing.listing_city);
    setListingPrice(removeSymbol(listing.listing_price));
    setOwnerEntity(listing.listing_owner_entity);
    setListingStart(dayjs(listing.listing_start_date));
    setListingEnd(dayjs(listing.listing_end_date));
    setPrimaryContact(listing.listing_owner_name);
    setOwnerEmail(listing.listing_owner_email);
    setOwnerPhone(listing.listing_owner_phone);
    setBrokerIds(listing.brokers);
    setBrokers(listing.broker_users);
    setPropertyType(listing.listing_property_type);
    setListingState(getCorrectStateName(listing.listing_state));
    setAgreement(null);
    setAmendment(null);
    setNote(listing.listing_notes);
  };

  React.useEffect(() => {
    if (listing) {
      resetForm();
      if (listing.listing_cover !== "") {
        getBucketImage(listing.listing_cover);
      } else {
        setListingCover(ListingImgUrl);
      }
    }
  }, [listing]);

  const handleNextStep = () => {
    if (!listingStreet) {
      setErrMessage(`Listing Street is required`);
      setErrorOpen(true);
      return false;
    }

    if (!listingCity) {
      setErrMessage(`Listing City is required`);
      setErrorOpen(true);
      return false;
    }
    if (!listingPrice) {
      setErrMessage(`Listing Price is required`);
      setErrorOpen(true);
      return false;
    }
    if (!ownerEntity) {
      setErrMessage(`Owner Entity is required`);
      setErrorOpen(true);
      return false;
    }

    setStep(2);
  };

  const handleChange = (event: SelectChangeEvent<typeof brokerIds>) => {
    const {
      target: { value },
    } = event;
    setBrokerIds(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );

    const _broker = allBrokers.filter(
      (_single_broker) => _single_broker.id === value[0]
    )[0];

    const exist_broker = brokers.filter(
      (_single_broker) => _single_broker && _single_broker.id === value[0]
    );

    if (exist_broker.length > 0) {
      const _brokers = brokers.filter(
        (_single_broker) => _single_broker && _single_broker.id !== value[0]
      );
      setBrokers(_brokers);
    } else {
      setBrokers([...brokers, _broker]);
    }
  };

  const handlePropertyChange = (event: SelectChangeEvent) => {
    setPropertyType(event.target.value);
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
        setCover(files[0]);
        setCoverUrl(URL.createObjectURL(files[0]));
      }
    }
  };

  const handleResetCover = () => {
    setCover(null);
    setCoverUrl(null);
  };

  const handleStateChange = (event: SelectChangeEvent) => {
    setListingState(event.target.value);
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
        setAgreement(files[0]);
      }
    }
  };

  const triggerAmendmentInput = () => {
    if (amendmentRef.current) {
      amendmentRef.current.click();
    }
  };

  const handleAmendmentUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files && files.length > 0) {
        setAmendment(files[0]);
      }
    }
  };

  const handleUpdateListing = async () => {
    if (!primaryContact) {
      setErrMessage(`Primary Contact is required`);
      setErrorOpen(true);
      return false;
    }

    if (!ownerEmail) {
      setErrMessage(`Owner Email is required`);
      setErrorOpen(true);
      return false;
    }

    if (!ownerPhone) {
      setErrMessage(`Owner Phone is required`);
      setErrorOpen(true);
      return false;
    }

    if (brokerIds.length === 0) {
      setErrMessage(`Please select brokers`);
      setErrorOpen(true);
      return false;
    }
    const formData = new FormData();
    if (cover) {
      formData.append("cover", cover);
    }
    if (agreement) {
      formData.append("agreement", agreement);
    }
    if (amendment) {
      formData.append("amendment", amendment);
    }

    setLoading(true);
    const address = `${listingStreet}, ${listingCity}, ${listingState}`;
    const location = await getLatLng(address);
    if (location) {
      if (cover || agreement || amendment) {
        axios
          .post(convertApiUrl("upload"), formData, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          })
          .then(async (response) => {
            const listingData = {
              listing_id: listing.id,
              listing_street: listingStreet,
              listing_city: listingCity,
              listing_price: listingPrice,
              owner_entity: ownerEntity,
              listing_start: listingStart?.format("MM/DD/YYYY"),
              listing_end: listingEnd?.format("MM/DD/YYYY"),
              primary_contact: primaryContact,
              owner_email: ownerEmail,
              owner_phone: ownerPhone,
              broker_ids: brokerIds,
              property_type: propertyType,
              listing_state: listingState,
              cover: response.data.cover,
              agreement: response.data.agreement,
              amendment: response.data.amendment,
              note: note,
              listing_lat: location.lat,
              listing_lng: location.lng,
            };

            console.log(listingData);
            const result = await axios.post(
              convertApiUrl("listing/update"),
              listingData,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            setLoading(false);

            if (result.status === 200) {
              resetForm();
              onClose();
              reload();
            }
          })
          .catch((errors) => {
            setLoading(false);
            console.log(errors);
          });
      } else {
        const listingData = {
          listing_id: listing.id,
          listing_street: listingStreet,
          listing_city: listingCity,
          listing_price: listingPrice,
          owner_entity: ownerEntity,
          listing_start: listingStart?.format("MM/DD/YYYY"),
          listing_end: listingEnd?.format("MM/DD/YYYY"),
          primary_contact: primaryContact,
          owner_email: ownerEmail,
          owner_phone: ownerPhone,
          broker_ids: brokerIds,
          property_type: propertyType,
          listing_state: listingState,
          cover: "",
          agreement: "",
          amendment: "",
          note: note,
          listing_lat: location.lat,
          listing_lng: location.lng,
        };

        axios
          .post(convertApiUrl("listing/update"), listingData, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
          .then((result) => {
            setLoading(false);

            if (result.status === 200) {
              resetForm();
              onClose();
              reload();
            }
          })
          .catch((errors) => {
            setLoading(false);
            console.log(errors);
          });
      }
    } else {
      setLoading(false);
      setErrMessage(`Please input correct address`);
      setErrorOpen(true);
      return false;
    }
  };

  const handleErrorClose = () => {
    setErrorOpen(false);
    setErrMessage("");
  };

  const handlePriceInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let inputText = e.target.value.trim();
    if (isNaN(Number(inputText.replace(/[,.$]/g, "")))) {
      setListingPrice(inputText);
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
    setListingPrice(formattedPrice);
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
        <DialogTitle
          sx={{
            paddingBottom: "10px",
            fontSize: "20px",
            backgroundColor: "#FFFFFF",
            fontFamily: "SatoshiBold",
            textAlign: "center",
          }}
        >
          Update Listing
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
          {step === 1 && (
            <Box>
              {!cover && !coverUrl && (
                <ImageUploadButton
                  sx={{
                    padding: listing.listing_cover !== "" ? "0px" : "6px 8px",
                    border:
                      listing.listing_cover !== ""
                        ? "0px"
                        : "dashed 2px #B9BABB",
                  }}
                  onClick={triggerCoverInput}
                >
                  {listing.listing_cover !== "" ? (
                    <ImageUploadCoverImg src={listingCover} alt="upload" />
                  ) : (
                    <>
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
                    </>
                  )}
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpdate}
                    style={{ display: "none" }}
                  />
                </ImageUploadButton>
              )}
              {cover && coverUrl && (
                <Box sx={{ width: "100%", position: "relative" }}>
                  <CoverImg src={coverUrl} />
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
                <UploadFormLabel>Listing Street*</UploadFormLabel>
                <UploadFormInput
                  value={listingStreet}
                  onChange={(e) => setListingStreet(e.target.value)}
                  placeholder="Listing Street"
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
                  <UploadFormLabel>Listing City*</UploadFormLabel>
                  <UploadFormInput
                    value={listingCity}
                    onChange={(e) => setListingCity(e.target.value)}
                    placeholder="Listing City"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Listing State*</UploadFormLabel>
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      value={listingState}
                      onChange={handleStateChange}
                      inputProps={{
                        sx: {
                          backgroundColor: "#EBEEF7",
                          padding: "12.5px 14px",
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
                      value={propertyType}
                      onChange={handlePropertyChange}
                      inputProps={{
                        sx: {
                          backgroundColor: "#EBEEF7",
                          padding: "12.5px 14px",
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
                  <UploadFormLabel>Price*</UploadFormLabel>
                  <UploadFormInput
                    value={listingPrice}
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
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Owner Entity (DBA)*</UploadFormLabel>
                <UploadFormInput
                  value={ownerEntity}
                  onChange={(e) => setOwnerEntity(e.target.value)}
                  placeholder="Owner Entity (DBA)"
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
                  <UploadFormLabel>Listing Start*</UploadFormLabel>
                  <MobileDatePicker
                    sx={{
                      backgroundColor: "#EBEEF7",
                      "& input": { padding: "12.5px 14px" },
                    }}
                    value={listingStart}
                    onChange={(newValue) => setListingStart(newValue)}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <UploadFormLabel>Listing End*</UploadFormLabel>
                  <MobileDatePicker
                    sx={{
                      backgroundColor: "#EBEEF7",
                      "& input": { padding: "12.5px 14px" },
                    }}
                    value={listingEnd}
                    onChange={(newValue) => setListingEnd(newValue)}
                  />
                </Box>
              </Box>
            </Box>
          )}
          {step === 2 && (
            <Box>
              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Primary Contact Name*</UploadFormLabel>
                <UploadFormInput
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  placeholder="KG Patel"
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
                <Box>
                  <UploadFormLabel>Owner Email*</UploadFormLabel>
                  <UploadFormInput
                    value={ownerEmail}
                    type="email"
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="who@mail.com"
                  />
                </Box>
                <Box>
                  <UploadFormLabel>Owner Phone Number*</UploadFormLabel>
                  <UploadFormInput
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="4794488795"
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <UploadFormLabel>Brokers*</UploadFormLabel>
                <FormControl sx={{ width: "100%" }}>
                  <Select
                    multiple
                    value={brokerIds}
                    onChange={handleChange}
                    displayEmpty
                    input={<OutlinedInput />}
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return (
                          <Typography sx={{ color: "#95979d" }}>
                            Jhon Mozzillo
                          </Typography>
                        );
                      }
                      return (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((id, index) => {
                            const _single_broker = allBrokers.filter(
                              (allbroker) =>
                                allbroker.id.toLowerCase() === id.toLowerCase()
                            )[0];
                            if (_single_broker) {
                              return (
                                <Chip
                                  key={index}
                                  label={_single_broker.fullname}
                                />
                              );
                            }
                          })}
                        </Box>
                      );
                    }}
                    inputProps={{
                      "aria-label": "Without label",
                      sx: {
                        backgroundColor: "#EBEEF7",
                        padding: "11.5px 14px",
                      },
                    }}
                    MenuProps={MenuProps}
                  >
                    {allBrokers.map((broker, index) => (
                      <MenuItem key={index} value={broker.id}>
                        <Checkbox
                          size="small"
                          checked={brokerIds.indexOf(broker.id) > -1}
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
                    {agreement ? (
                      agreement.name
                    ) : (
                      <>
                        {listing.listing_agreement_file_id
                          ? formatShortDocumentName(
                            listing.listing_agreement_file_id
                          )
                          : "No File Selected"}
                      </>
                    )}
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
                <UploadFormLabel>Listing Amendment</UploadFormLabel>
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
                    ref={amendmentRef}
                    type="file"
                    accept=".txt,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleAmendmentUpdate}
                    style={{ display: "none" }}
                  />
                  <Typography sx={{ flex: 1, color: "#95979d" }}>
                    {amendment ? (
                      amendment.name
                    ) : (
                      <>
                        {listing.listing_amendment_file_id
                          ? formatShortDocumentName(
                            listing.listing_amendment_file_id
                          )
                          : "No File Selected"}
                      </>
                    )}
                  </Typography>
                  <IconButton onClick={triggerAmendmentInput}>
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
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Pending"
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
                onClick={() => setStep(1)}
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
                onClick={handleUpdateListing}
              >
                {loading ? <img src={LoadingImg} /> : "Update"}
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

export default EditListing;
