import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  TextareaAutosize,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import Layout from "../Layout/layout";

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
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
   
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!image) {
      setError("Please upload an image");
      setOpenSnackbar(true);
      return;
    }

    // Create a new FormData object
    const data = new FormData();
    
    // Append form data correctly
    data.append("name", formData.name);
    data.append("startingPrice", formData.startingPrice);
    data.append("description", formData.description);
    data.append("bidStartTime", formData.bidStartTime);
    data.append("bidEndTime", formData.bidEndTime);
    data.append("biddingModel", formData.biddingModel);
    
    // Append the image with the key "image" (this must match your backend expectation)
    data.append("image", image);

    try {
  

      
      // Fix the URL - remove /create from the endpoint
      const response = await axios.post(
        `${process.env.REACT_APP_LOCAL_URL}/api/biddingProduct/create`,
        data,
        {
          headers: {
              Authorization: localStorage.getItem('token')
          }
        }
      );

      
      alert("Product created successfully!");
      navigate("/bidProduct");
    } catch (error) {
      console.error("Error creating product:", error);
      
      // Better error handling
      let errorMessage = "Failed to create product.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Layout>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 600,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginTop: 5,
          marginBottom: 5,
          padding: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Create Product
        </Typography>
        
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        
        <TextField
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Starting Price"
          name="startingPrice"
          type="number"
          value={formData.startingPrice}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextareaAutosize
          placeholder="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          minRows={3}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderColor: "#ccc",
            borderRadius: "4px",
          }}
          required
        />
        <TextField
          label="Bid Start Time"
          name="bidStartTime"
          type="datetime-local"
          value={formData.bidStartTime}
          onChange={handleChange}
          required
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        />
        <TextField
          label="Bid End Time"
          name="bidEndTime"
          type="datetime-local"
          value={formData.bidEndTime}
          onChange={handleChange}
          required
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        />

        <FormControl fullWidth required>
          <InputLabel id="bidding-model-label">Bidding Model</InputLabel>
          <Tooltip title="Choose how bidders will be displayed">
            <Select
              labelId="bidding-model-label"
              name="biddingModel"
              value={formData.biddingModel}
              onChange={handleChange}
            >
              <MenuItem value="Top 3 Bidders">Top 3 Bidders</MenuItem>
              <MenuItem value="Highest Bidder">Highest Bidder</MenuItem>
            </Select>
          </Tooltip>
        </FormControl>

        <Button variant="contained" component="label">
          Upload Image
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            hidden
            required
          />
        </Button>
        {image && (
          <Typography variant="body2" color="textSecondary">
            Selected file: {image.name}
          </Typography>
        )}
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ marginTop: 2 }}
        >
          Create Product
        </Button>
      </Box>
    </Layout>
  );
};

export default CreateProductForm;