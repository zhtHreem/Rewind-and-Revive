import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Typography, TextareaAutosize,} from "@mui/material";
import Layout from '../Layout/layout';

const CreateProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    startingPrice: "",
    description: "",
    bidStartTime: "",
    bidEndTime: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      await axios.post("http://localhost:5000/api/biddingProduct/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product.");
    }
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
      <TextField
        label="Product Name"
        name="name"
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
