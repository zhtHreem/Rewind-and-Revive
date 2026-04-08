import React, { useState, useRef } from "react";
import {
  MenuItem,
  Select,
  Box,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography,
  Checkbox,
  FormControl,
  FormControlLabel,
  Button,
  InputLabel,
  Divider,
  Chip,
  InputAdornment,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import axios from "axios";
import Layout from "../Layout/layout";
import LoadingOverlay from "../Utils/loading";
import { useNavigate } from "react-router-dom";

// shared design tokens
const COLORS = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  border: "#ECEAE4",
  accent: "#85586F",
  accentDark: "#6B4459",
  accentSoft: "#F5EEF1",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
};

const SERIF = '"Playfair Display", "Fraunces", Georgia, serif';

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

const SectionLabel = ({ children, hint }) => (
  <Box sx={{ mb: 2.5 }}>
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

const category = {
  top: {
    categories: ["Shirt", "Blouse", "Sweater", "Jacket", "Cardigan", "Tank Top"],
    materials: ["Cotton", "Wool", "Silk", "Polyester", "Linen", "Rayon"],
  },
  bottom: {
    categories: ["Pants", "Jeans", "Skirt", "Shorts", "Leggings", "Trousers"],
    materials: ["Denim", "Chino", "Corduroy", "Wool", "Cotton", "Linen"],
  },
  "top/bottom": {
    categories: [
      "Shirt", "Blouse", "Sweater", "Jacket", "Cardigan", "Tank Top",
      "Pants", "Jeans", "Skirt", "Shorts", "Leggings", "Trousers",
    ],
    materials: [
      "Cotton", "Wool", "Silk", "Polyester", "Linen", "Rayon",
      "Denim", "Chino", "Corduroy",
    ],
  },
  accessories: {
    categories: ["Bag", "Belt", "Scarf", "Hat", "Watch", "Gloves"],
  },
};

const TYPE_OPTIONS = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "top/bottom", label: "Top + Bottom" },
  { value: "accessories", label: "Accessories" },
];

function NewProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customAddType, setCustomAddType] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedOption, setSelectedOption] = useState("top");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [topSizes, setTopSizes] = useState({
    waist: "",
    armLength: "",
    hips: "",
    shoulderWidth: "",
    bustChest: "",
    neckCircumference: "",
  });

  const [bottomSizes, setBottomSizes] = useState({
    waist: "",
    hips: "",
    inseam: "",
    thighLegOpening: "",
    rise: "",
  });

  const handleTopSizeChange = (e) =>
    setTopSizes({ ...topSizes, [e.target.name]: e.target.value });

  const handleBottomSizeChange = (e) =>
    setBottomSizes({ ...bottomSizes, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!name || !price || !color || !selectedOption || !selectedCategory) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Incomplete Information",
        text: "Please fill in all required fields.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("color", color);
    formData.append("description", description);
    formData.append("type", selectedOption);
    formData.append("category", selectedCategory);
    imageFiles.forEach((file) => formData.append("images", file));
    formData.append("categories", JSON.stringify(selectedCategories));
    formData.append("materials", JSON.stringify(selectedMaterials));
    if (selectedOption === "top" || selectedOption === "top/bottom") {
      formData.append("topSizes", JSON.stringify(topSizes));
    }
    if (selectedOption === "bottom" || selectedOption === "top/bottom") {
      formData.append("bottomSizes", JSON.stringify(bottomSizes));
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_LOCAL_URL}/api/product/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: "Product added",
        timer: 1800,
        text: "Your product has been listed.",
      });
      setTimeout(() => {
        navigate(`/product/${response.data.product._id}`);
      }, 1800);
      resetForm();
    } catch (error) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text:
          error.response?.data?.message ||
          "Failed to add product. Please try again.",
      });
      console.error("Product submission error:", error);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setColor("");
    setDescription("");
    setImages([]);
    setImageFiles([]);
    setTopSizes({
      waist: "",
      armLength: "",
      hips: "",
      shoulderWidth: "",
      bustChest: "",
      neckCircumference: "",
    });
    setBottomSizes({
      waist: "",
      hips: "",
      inseam: "",
      thighLegOpening: "",
      rise: "",
    });
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "Image limit",
        text: "You can only upload up to 5 images.",
      });
      return;
    }
    const newImages = newFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...newFiles]);
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleImageChange = (event) => handleFiles(event.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustom = () => {
    if (!customValue.trim()) return;
    const updatedCategory = JSON.parse(JSON.stringify(category));
    if (customAddType === "category") {
      updatedCategory[selectedOption].categories.push(customValue);
    } else if (customAddType === "material" && selectedOption !== "accessories") {
      updatedCategory[selectedOption].materials.push(customValue);
    }
    Object.assign(category, updatedCategory);
    setIsAddDialogOpen(false);
    setCustomValue("");
  };

  const toggleCategory = (value) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const toggleMaterial = (value) => {
    setSelectedMaterials((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  };

  const sizeFields = (sizes, handler, fields) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
        gap: 2,
      }}
    >
      {fields.map((f) => (
        <TextField
          key={f.name}
          label={f.label}
          name={f.name}
          type="number"
          value={sizes[f.name]}
          onChange={handler}
          sx={inputSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography
                  sx={{ fontSize: 12, color: COLORS.textSecondary }}
                >
                  in
                </Typography>
              </InputAdornment>
            ),
          }}
        />
      ))}
    </Box>
  );

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
        <LoadingOverlay show={isLoading} />

        <Box sx={{ maxWidth: 880, mx: "auto" }}>
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
              List a product
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                color: COLORS.textSecondary,
                maxWidth: 560,
              }}
            >
              Share a pre-loved piece with the community. Clear photos and
              accurate sizes get the most interest.
            </Typography>
          </Box>

          {/* FORM */}
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
              <SectionLabel hint="Tell us what you're listing.">
                Basics
              </SectionLabel>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2.5,
                }}
              >
                <TextField
                  label="Product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  placeholder="e.g. Vintage denim jacket"
                  sx={{ ...inputSx, gridColumn: { sm: "1 / -1" } }}
                />
                <TextField
                  label="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
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
                <TextField
                  label="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                  fullWidth
                  placeholder="e.g. Indigo"
                  sx={inputSx}
                />
                <FormControl fullWidth required sx={{ ...inputSx, gridColumn: { sm: "1 / -1" } }}>
                  <InputLabel>Audience</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Audience"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="men">Men</MenuItem>
                    <MenuItem value="women">Women</MenuItem>
                    <MenuItem value="kids">Kids</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider sx={{ borderColor: COLORS.border }} />

            {/* SECTION 2 — type & tags */}
            <Box>
              <SectionLabel hint="What type of item is this?">
                Type & tags
              </SectionLabel>

              {/* Type pills */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  mb: 3,
                }}
              >
                {TYPE_OPTIONS.map((opt) => {
                  const active = selectedOption === opt.value;
                  return (
                    <Box
                      key={opt.value}
                      onClick={() => setSelectedOption(opt.value)}
                      sx={{
                        px: 2.5,
                        py: 1.25,
                        borderRadius: 2,
                        border: `1.5px solid ${
                          active ? COLORS.accent : COLORS.border
                        }`,
                        bgcolor: active ? COLORS.accentSoft : COLORS.surface,
                        color: active ? COLORS.accent : COLORS.textPrimary,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": { borderColor: COLORS.accent },
                      }}
                    >
                      {opt.label}
                    </Box>
                  );
                })}
              </Box>

              {/* Categories */}
              {selectedOption && category[selectedOption] && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                      mt: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: COLORS.textPrimary,
                      }}
                    >
                      Categories
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsAddDialogOpen(true);
                        setCustomAddType("category");
                      }}
                      sx={{
                        color: COLORS.accent,
                        p: 0.5,
                        "&:hover": { bgcolor: COLORS.accentSoft },
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {category[selectedOption].categories.map((tag) => {
                      const active = selectedCategories.includes(tag);
                      return (
                        <Chip
                          key={tag}
                          label={tag}
                          onClick={() => toggleCategory(tag)}
                          sx={{
                            borderRadius: 2,
                            px: 0.5,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            bgcolor: active ? COLORS.accent : COLORS.surface,
                            color: active ? "#fff" : COLORS.textPrimary,
                            border: `1px solid ${
                              active ? COLORS.accent : COLORS.border
                            }`,
                            "&:hover": {
                              bgcolor: active
                                ? COLORS.accentDark
                                : COLORS.accentSoft,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>

                  {selectedOption !== "accessories" && (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                          mt: 3,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: COLORS.textPrimary,
                          }}
                        >
                          Materials
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setIsAddDialogOpen(true);
                            setCustomAddType("material");
                          }}
                          sx={{
                            color: COLORS.accent,
                            p: 0.5,
                            "&:hover": { bgcolor: COLORS.accentSoft },
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {category[selectedOption].materials?.map((mat) => {
                          const active = selectedMaterials.includes(mat);
                          return (
                            <Chip
                              key={mat}
                              label={mat}
                              onClick={() => toggleMaterial(mat)}
                              sx={{
                                borderRadius: 2,
                                px: 0.5,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: "pointer",
                                bgcolor: active
                                  ? COLORS.accent
                                  : COLORS.surface,
                                color: active ? "#fff" : COLORS.textPrimary,
                                border: `1px solid ${
                                  active ? COLORS.accent : COLORS.border
                                }`,
                                "&:hover": {
                                  bgcolor: active
                                    ? COLORS.accentDark
                                    : COLORS.accentSoft,
                                },
                              }}
                            />
                          );
                        })}
                      </Box>
                    </>
                  )}
                </>
              )}
            </Box>

            {/* SECTION 3 — sizes (conditional) */}
            {(selectedOption === "top" ||
              selectedOption === "bottom" ||
              selectedOption === "top/bottom") && (
              <>
                <Divider sx={{ borderColor: COLORS.border }} />
                <Box>
                  <SectionLabel hint="All measurements in inches.">
                    Measurements
                  </SectionLabel>

                  {(selectedOption === "top" ||
                    selectedOption === "top/bottom") && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: COLORS.textPrimary,
                          mb: 1.5,
                        }}
                      >
                        Top
                      </Typography>
                      {sizeFields(topSizes, handleTopSizeChange, [
                        { name: "waist", label: "Waist" },
                        { name: "armLength", label: "Arm length" },
                        { name: "hips", label: "Hips" },
                        { name: "shoulderWidth", label: "Shoulder width" },
                        { name: "bustChest", label: "Bust / chest" },
                        { name: "neckCircumference", label: "Neck" },
                      ])}
                    </Box>
                  )}

                  {(selectedOption === "bottom" ||
                    selectedOption === "top/bottom") && (
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: COLORS.textPrimary,
                          mb: 1.5,
                        }}
                      >
                        Bottom
                      </Typography>
                      {sizeFields(bottomSizes, handleBottomSizeChange, [
                        { name: "waist", label: "Waist" },
                        { name: "hips", label: "Hips" },
                        { name: "inseam", label: "Inseam" },
                        { name: "thighLegOpening", label: "Thigh / leg" },
                        { name: "rise", label: "Rise" },
                      ])}
                    </Box>
                  )}
                </Box>
              </>
            )}

            <Divider sx={{ borderColor: COLORS.border }} />

            {/* SECTION 4 — media */}
            <Box>
              <SectionLabel hint="Up to 5 images. The first one is your cover.">
                Photos
              </SectionLabel>

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
                  py: 5,
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
                  Click or drag images here
                </Typography>
                <Typography
                  sx={{ fontSize: 13, color: COLORS.textSecondary }}
                >
                  PNG or JPG · up to 5 photos
                </Typography>
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageChange}
              />

              {images.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(5, 1fr)",
                    },
                    gap: 1.5,
                    mt: 2,
                  }}
                >
                  {images.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        aspectRatio: "1 / 1",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Box
                        component="img"
                        src={image}
                        alt={`Product ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {index === 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            px: 1,
                            py: 0.25,
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          COVER
                        </Box>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          bgcolor: "rgba(0,0,0,0.65)",
                          color: "#fff",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: COLORS.border }} />

            {/* SECTION 5 — description */}
            <Box>
              <SectionLabel hint="Condition, brand, era, fit notes — be honest.">
                Description
              </SectionLabel>
              <TextField
                fullWidth
                multiline
                minRows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell buyers about the condition, brand, era, fit..."
                sx={inputSx}
              />
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
                onClick={() => navigate(-1)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: COLORS.textSecondary,
                  px: 3,
                  py: 1.25,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "transparent",
                    color: COLORS.textPrimary,
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
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
                  "&:disabled": { bgcolor: "#e0e0e0", color: "#9e9e9e" },
                }}
              >
                {isLoading ? "Publishing…" : "Publish listing"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Custom dialog */}
        <Dialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              minWidth: 360,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 700,
              color: COLORS.textPrimary,
              pb: 1,
            }}
          >
            Add custom {customAddType === "category" ? "category" : "material"}
            <IconButton
              onClick={() => setIsAddDialogOpen(false)}
              size="small"
              sx={{ color: COLORS.textSecondary }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label={customAddType === "category" ? "Category" : "Material"}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              sx={inputSx}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setIsAddDialogOpen(false)}
              sx={{
                textTransform: "none",
                color: COLORS.textSecondary,
                fontWeight: 600,
                "&:hover": { bgcolor: "transparent", color: COLORS.textPrimary },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCustom}
              variant="contained"
              sx={{
                bgcolor: COLORS.accent,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "none",
                px: 2.5,
                "&:hover": { bgcolor: COLORS.accentDark, boxShadow: "none" },
              }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default NewProduct;
