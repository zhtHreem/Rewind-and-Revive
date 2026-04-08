import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Alert,
  Snackbar,
  IconButton,
  Divider,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Layout from "../Layout/layout";

// shared design tokens (same as BidProductHome / BiddingProduct)
const COLORS = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  border: "#ECEAE4",
  accent: "#85586F",
  accentDark: "#6B4459",
  accentSoft: "#F5EEF1",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  danger: "#E53935",
};

const SERIF = '"Playfair Display", "Fraunces", Georgia, serif';

// reusable section heading
const SectionLabel = ({ children, hint }) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      sx={{
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        fontWeight: 700,
        color: COLORS.accent,
      }}
    >
      {children}
    </Typography>
    {hint && (
      <Typography sx={{ fontSize: 13, color: COLORS.textSecondary, mt: 0.5 }}>
        {hint}
      </Typography>
    )}
  </Box>
);

// shared input styling
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: COLORS.surface,
    "& fieldset": { borderColor: COLORS.border },
    "&:hover fieldset": { borderColor: COLORS.accent },
    "&.Mui-focused fieldset": { borderColor: COLORS.accent },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: COLORS.accent },
};

const CreateProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    startingPrice: "",
    description: "",
    bidStartTime: "",
    bidEndTime: "",
    biddingModel: "Top 3 Bidders",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "error",
  });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const showSnack = (msg, severity = "error") =>
    setSnack({ open: true, msg, severity });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showSnack("Please choose an image file");
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      showSnack("Please upload a product image");
      return;
    }
    if (
      formData.bidEndTime &&
      formData.bidStartTime &&
      new Date(formData.bidEndTime) <= new Date(formData.bidStartTime)
    ) {
      showSnack("End time must be after start time");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("startingPrice", formData.startingPrice);
    data.append("description", formData.description);
    data.append("bidStartTime", formData.bidStartTime);
    data.append("bidEndTime", formData.bidEndTime);
    data.append("biddingModel", formData.biddingModel);
    data.append("image", image);

    try {
      setSubmitting(true);
      await axios.post(
        `${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/create`,
        data,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      showSnack("Auction created successfully", "success");
      setTimeout(() => navigate("/bidProduct"), 800);
    } catch (error) {
      console.error("Error creating product:", error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create auction";
      showSnack(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: COLORS.bg,
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: 760, mx: "auto" }}>
          {/* HERO */}
          <Box sx={{ mb: 5 }}>
            <Typography
              sx={{
                fontSize: 12,
                color: COLORS.textSecondary,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
              }}
            >
              New listing
            </Typography>
            <Typography
              sx={{
                fontFamily: SERIF,
                fontSize: { xs: 32, md: 44 },
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1.1,
                mb: 1.5,
              }}
            >
              Create an auction
            </Typography>
            <Typography
              sx={{ fontSize: 16, color: COLORS.textSecondary, maxWidth: 560 }}
            >
              List a pre-loved piece for bidding. Add clear photos and an honest
              description to attract serious bidders.
            </Typography>
          </Box>

          {/* FORM CARD */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              bgcolor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
              p: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            {/* SECTION 1 — basics */}
            <Box>
              <SectionLabel hint="What are you selling?">Basics</SectionLabel>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Product name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  placeholder="e.g. Vintage leather handbag"
                  sx={inputSx}
                />
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Tell bidders about the condition, brand, era, materials..."
                  sx={inputSx}
                />
              </Box>
            </Box>

            <Divider sx={{ borderColor: COLORS.border }} />

            {/* SECTION 2 — media */}
            <Box>
              <SectionLabel hint="A clear, well-lit photo gets 3× more bids.">
                Media
              </SectionLabel>

              {!imagePreview ? (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  sx={{
                    border: `2px dashed ${
                      dragActive ? COLORS.accent : COLORS.border
                    }`,
                    borderRadius: 3,
                    bgcolor: dragActive ? COLORS.accentSoft : "#FAFAF7",
                    py: 6,
                    px: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: COLORS.accent,
                      bgcolor: COLORS.accentSoft,
                    },
                  }}
                >
                  <CloudUploadOutlinedIcon
                    sx={{ fontSize: 40, color: COLORS.accent, mb: 1 }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    Click or drag an image here
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, color: COLORS.textSecondary }}
                  >
                    PNG or JPG · max 5 MB
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.border}`,
                    aspectRatio: "4 / 3",
                    width: "100%",
                  }}
                >
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    onClick={removeImage}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      bgcolor: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
                    }}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      px: 2,
                      py: 1,
                      fontSize: 12,
                    }}
                  >
                    {image?.name}
                  </Box>
                </Box>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </Box>

            <Divider sx={{ borderColor: COLORS.border }} />

            {/* SECTION 3 — pricing & format */}
            <Box>
              <SectionLabel hint="Set the floor — bidders take it from there.">
                Pricing & format
              </SectionLabel>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2.5,
                }}
              >
                <TextField
                  label="Starting price"
                  name="startingPrice"
                  type="number"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          sx={{ color: COLORS.textSecondary, fontSize: 14 }}
                        >
                          Rs.
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                <FormControl fullWidth required sx={inputSx}>
                  <InputLabel id="bidding-model-label">
                    Bidding format
                  </InputLabel>
                  <Select
                    labelId="bidding-model-label"
                    label="Bidding format"
                    name="biddingModel"
                    value={formData.biddingModel}
                    onChange={handleChange}
                  >
                    <MenuItem value="Top 3 Bidders">Top 3 Bidders</MenuItem>
                    <MenuItem value="Highest Bidder">Highest Bidder</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider sx={{ borderColor: COLORS.border }} />

            {/* SECTION 4 — schedule */}
            <Box>
              <SectionLabel hint="When should bidding open and close?">
                Schedule
              </SectionLabel>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2.5,
                }}
              >
                <TextField
                  label="Bid start time"
                  name="bidStartTime"
                  type="datetime-local"
                  value={formData.bidStartTime}
                  onChange={handleChange}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
                <TextField
                  label="Bid end time"
                  name="bidEndTime"
                  type="datetime-local"
                  value={formData.bidEndTime}
                  onChange={handleChange}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
              </Box>
            </Box>

            {/* ACTIONS */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: "flex-end",
                pt: 1,
              }}
            >
              <Button
                onClick={() => navigate("/bidProduct")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: COLORS.textSecondary,
                  px: 3,
                  py: 1.25,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "transparent", color: COLORS.textPrimary },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: COLORS.accent,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  px: 4,
                  py: 1.25,
                  borderRadius: 2,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: COLORS.accentDark,
                    boxShadow: "none",
                  },
                  "&:disabled": {
                    bgcolor: "#e0e0e0",
                    color: "#9e9e9e",
                  },
                }}
              >
                {submitting ? "Publishing…" : "Publish auction"}
              </Button>
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snack.severity}
            variant="filled"
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{ borderRadius: 2 }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default CreateProductForm;
