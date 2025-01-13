import React, { useState, useEffect  } from "react";
import { MenuItem,Select,Paper,Box,TextField,IconButton,Dialog,DialogActions,DialogTitle,DialogContent,CardMedia,Typography,Stack,Checkbox,FormControl, FormLabel, FormControlLabel, Button,Grid,Radio, RadioGroup } from "@mui/material";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from "../Layout/layout";
import LoadingOverlay from "../Utils/loading";
import { useNavigate } from "react-router-dom";
  const category = {
    "top": {
      categories: ["Shirt", "Blouse", "Sweater", "Jacket", "Cardigan", "Tank Top"],
      materials: ["Cotton", "Wool", "Silk", "Polyester", "Linen", "Rayon"]
    },
    "bottom": {
      categories: ["Pants", "Jeans", "Skirt", "Shorts", "Leggings", "Trousers"],
      materials: ["Denim", "Chino", "Corduroy", "Wool", "Cotton", "Linen"]
    },
    "top/bottom": {
    categories: [
      "Shirt", "Blouse", "Sweater", "Jacket", "Cardigan", "Tank Top",
      "Pants", "Jeans", "Skirt", "Shorts", "Leggings", "Trousers"
    ],
    materials: [
      "Cotton", "Wool", "Silk", "Polyester", "Linen", "Rayon", 
      "Denim", "Chino", "Corduroy"
    ]},
    "accessories": {
      categories: ["Bag", "Belt", "Scarf", "Hat", "Watch", "Gloves"]
    }
  };
   

function NewProduct({ setAddProduct =true }){

        const navigate = useNavigate(); 
        const [isLoading, setIsLoading] = useState(false);
        const [images, setImages] = useState([]);
        const [imageFiles, setImageFiles] = useState([]);
        const[color,setColor]=useState("");
        const [description,setDescription]=useState("");
        const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
        const [customAddType, setCustomAddType] = useState(''); // 'category' or 'material'
        const [customValue, setCustomValue] = useState('');
        
      const [name, setName] = useState("");
      const [price, setPrice] = useState("");
      const [selectedOption, setSelectedOption] = useState("top");
      const [isExpanded, setIsExpanded] = useState(false); 
      const [selectedCategories, setSelectedCategories] = useState([]);
      const [selectedMaterials, setSelectedMaterials] = useState([]);
      const [selectedCategory, setSelectedCategory] = useState("");


      const [topSizes, setTopSizes] = useState({
        waist: '',
        armLength: '',
        hips: '',
        shoulderWidth: '',
        bustChest: '',
        neckCircumference: ''
    });

    const [bottomSizes, setBottomSizes] = useState({
        waist: '',
        hips: '',
        inseam: '',
        thighLegOpening: '',
        rise: ''
    });
     const handleTopSizeChange = (e) => {
        setTopSizes({
            ...topSizes,
            [e.target.name]: e.target.value
        });
    };

    const handleBottomSizeChange = (e) => {
        setBottomSizes({
            ...bottomSizes,
            [e.target.name]: e.target.value
        });
    };


   



        const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Show loading at start
        // Validate required fields
        if (!name || !price || !color || !selectedOption ||!selectedCategory) {
                    setIsLoading(false); // Hide loading if validation fails

            Swal.fire({
                icon: 'error',
                title: 'Incomplete Information',
                text: 'Please fill in all required fields.'
            });
            return;
        }

        // Prepare form data
        const formData = new FormData();
        
        // Add text fields
        formData.append('name', name);
      
        formData.append('price', price);
        formData.append('color', color);
        formData.append('description', description);
        formData.append('type', selectedOption);
        formData.append('category', selectedCategory);
 
        // Add image files
        imageFiles.forEach((file, index) => {
            formData.append('images', file);
            console.log('f',file)
        });

         // Add selected categories and materials
        formData.append('categories', JSON.stringify(selectedCategories));
         formData.append('materials', JSON.stringify(selectedMaterials));


       
        // Add sizes based on selected type
        if (selectedOption === 'top' || selectedOption === 'top/bottom') {
            formData.append('topSizes', JSON.stringify(topSizes));
        }

        if (selectedOption === 'bottom' || selectedOption === 'top/bottom') {
            formData.append('bottomSizes', JSON.stringify(bottomSizes));
        }
        // formData.forEach((value, key) => {
        //   console.log(`${key}: ${value}`);
        //  });


        try {
 
            const response = await axios.post( `${process.env.REACT_APP_LOCAL_URL}/api/product/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': localStorage.getItem('token') 
                }
            });

            // Success handling
             setIsLoading(false); // Hide loading on success
            Swal.fire({
                icon: 'success',
                title: 'Product Added',
                timer: 2000,
                text: 'Your product has been successfully added!',
                
            });
            
            // Redirect to product page
            console.log('Product added:', response.data);
            setTimeout(() => {
               navigate(`/product/${response.data.product._id}`);
              }, 2000); 
            // Reset form or close dialog
            resetForm();
        } catch (error) {
            // Error handling
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.response?.data?.message || 'Failed to add product. Please try again.'
            });
            console.error('Product submission error:', error);
        }
    }; const resetForm = () => {
        // Reset all form fields
        setName('');
        setPrice('');
        setColor('');
        setDescription('');
        setImages([]);
        setImageFiles([]);
        setTopSizes({
            waist: '', armLength: '', hips: '', 
            shoulderWidth: '', bustChest: '', 
            neckCircumference: ''
        });
        setBottomSizes({
            waist: '', hips: '', inseam: '', 
            thighLegOpening: '', rise: ''
        });
    };
       const handleImageChange = (event) => {
        const newFiles = Array.from(event.target.files);
        
        // Limit to 5 images
        if (images.length + newFiles.length > 5) {
            Swal.fire({
                icon: 'warning',
                title: 'Image Limit',
                text: 'You can only upload up to 5 images.',
                confirmButtonText: 'OK'
            });
            return;
        }

        const newImages = newFiles.map(file => URL.createObjectURL(file));
        
        setImageFiles(prevFiles => [...prevFiles, ...newFiles]);
        setImages(prevImages => [...prevImages, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
        setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

      

   const handleAddCustom = () => {
        if (!customValue.trim()) return;

        // Create a deep copy of the category object
        const updatedCategory = JSON.parse(JSON.stringify(category));

        if (customAddType === 'category') {
            // Add to the specific category's categories
            updatedCategory[selectedOption].categories.push(customValue);
        } else if (customAddType === 'material' && selectedOption !== 'accessories') {
            // Add to the specific category's materials
            updatedCategory[selectedOption].materials.push(customValue);
        }

        // Update the global category object (you might want to manage this differently in a real app)
        Object.assign(category, updatedCategory);

        // Close dialog and reset custom value
        setIsAddDialogOpen(false);
        setCustomValue('');
    };
    const handleCategoryChange = (event) => {
  const { checked, value } = event.target;
  setSelectedCategories((prev) =>
    checked ? [...prev, value] : prev.filter((category) => category !== value)
  );
};

const handleMaterialChange = (event) => {
  const { checked, value } = event.target;
  setSelectedMaterials((prev) =>
    checked ? [...prev, value] : prev.filter((material) => material !== value)
  );
};

    
    
    return(
        <>
            <Layout>

         
         <Box   p={6} sx={{backgroundColor: 'rgba(0, 0, 0, 0.5)',}}>
            <Paper sx={{p:{xs:3,sm:3},border:"1px solid black"}} elevation={24}>
                <LoadingOverlay show={isLoading} />
                        <form onSubmit={handleSubmit}>

                
                    <Typography variant="h3" sx={{textAlign:"center"}}>Create New Product</Typography>
                    <Grid container direction={{xs:"column",md:"row"}} md={12}  justifyContent="space-between">

                         <Grid item md={6}>  
                           <Typography marginTop={2} variant="h5" >Name</Typography> 
                           <TextField label='Enter Product Name' value={name} onChange={(e) => setName(e.target.value)} />

                          <Typography   marginTop={2}  variant="h5" >Price</Typography> 
                          <TextField   id="standard-number" label="Rs" name="bustChest" type="number" variant="standard" value={price} onChange={(e) => setPrice(e.target.value)}/>

                              {/* Category Dropdown */}
                        <Grid item>
                            <Typography variant="h5" marginTop={2}>Category</Typography>
                            <Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                displayEmpty
                        
                            >
                                <MenuItem value="" disabled>Select a Category</MenuItem>
                                <MenuItem value="men">Men</MenuItem>
                                <MenuItem value="women">Women</MenuItem>
                                <MenuItem value="kids">Kids</MenuItem>
                            </Select>
                        </Grid>

                          <Typography   marginTop={2}  variant="h5" >Color</Typography> 
                          <TextField label='color' value={color} onChange={(e) => setColor(e.target.value)} />
                          <Typography  marginTop={2}  variant="h5" sx={{marginTop:4}}>Type</Typography> 
                          <Grid container p={4} spacing={2} >
                                <FormControl component="fieldset">
                                <FormLabel component="legend">Select Category</FormLabel>
                                <RadioGroup  row aria-label="category" name="category" value={selectedOption}onChange={(e) => setSelectedOption(e.target.value)}>
                                     <FormControlLabel value="top" control={<Radio />} label="Top" />
                                     <FormControlLabel value="bottom" control={<Radio />} label="Bottom" />
                                      <FormControlLabel value="top/bottom" control={<Radio />} label="top/bottom" />
                                     <FormControlLabel value="accessories" control={<Radio />} label="Accessories" />
                                </RadioGroup>
                                </FormControl>
                            </Grid>

            
            {selectedOption && category[selectedOption] && (
                <Box p={2}>
                    <Typography variant="h6" gutterBottom>
                        Select Tags for {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}
                    </Typography>

                    {/* Categories section with Add button */}
                    <Typography variant="subtitle1" gutterBottom>
                        Categories 
                        <IconButton  size="small"    onClick={() => {  setIsAddDialogOpen(true);  setCustomAddType('category');  }}  >
                            <AddIcon />
                        </IconButton>
                    </Typography>
                    <Grid container spacing={2} p={2}>
                        {category[selectedOption].categories.map(tag => (
                            <Grid item xs={6} md={4} lg={3} key={tag}>
                                <FormControlLabel    control={<Checkbox value={tag} onChange={handleCategoryChange} />}   label={tag}   sx={{ width: '100%' }}  />
                            </Grid>
                        ))}
                    </Grid>
                    

                    {/* Materials section (for non-accessories) with Add button */}
                    {selectedOption !== "accessories" && (
                        <>
                            <Typography variant="subtitle1" gutterBottom mt={4}>
                                Cloth Materials
                                <IconButton    size="small"   onClick={() => {  setIsAddDialogOpen(true); setCustomAddType('material');   }} >
                                    <AddIcon />
                                </IconButton>
                            </Typography>
                            <Grid container spacing={2} p={2}>
                                {category[selectedOption].materials.map(material => (
                                    <Grid item xs={6} md={4} lg={3} key={material}>
                                        <FormControlLabel 
                                          control={<Checkbox value={material} onChange={handleMaterialChange} />}
                                            label={material} 
                                           
                                            sx={{ width: '100%' }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Box>
            )}

            {/* Dialog for adding custom category/material */}
            <Dialog  open={isAddDialogOpen}     onClose={() => setIsAddDialogOpen(false)} >
                <DialogTitle>
                    Add Custom {customAddType === 'category' ? 'Category' : 'Material'}
                </DialogTitle>
                <DialogContent>
                    <TextField  autoFocus margin="dense"   label={`Enter ${customAddType === 'category' ? 'Category' : 'Material'}`} fullWidth  value={customValue} onChange={(e) => setCustomValue(e.target.value)}  />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddCustom}>Add</Button>
                </DialogActions>
            </Dialog>
                     
   
                     
                         

                        </Grid>

                       {/* Left side */}
                       <Grid container direction={{xs:"column",md:"row" }} py={4}  md={6} spacing={2} sx={{maxHeight: isExpanded ? 'none' : 650,}}> {/*will not apply height when user clicks button */}

                               <Grid item md={12}>
                                       <Typography variant="h5">Add Image</Typography>
                                                   {/* Image Upload Section */}
                                            <Paper    variant="outlined"  sx={{  p: 2,  textAlign: 'center',  border: '2px dashed',    borderColor: 'grey.400',  cursor: 'pointer'  }} >
                                               <input  type="file"   accept="image/*"   multiple  hidden   id="image-upload" onChange={handleImageChange} />
                                               <label htmlFor="image-upload">
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                         <AddPhotoAlternateIcon sx={{ fontSize: 50, color: 'grey.600' }} />
                                                         <Typography variant="body1" color="text.secondary">    Click to Upload Images (Max 5) </Typography>
                                                    </Box>
                                              </label>
                                           </Paper>
                                             {/* Uploaded Images Preview */}
                                       {images.length > 0 && (
                                    <Box sx={{  display: 'flex',    flexWrap: 'wrap',   gap: 2,   mt: 2,   justifyContent: 'center'   }}>
                                      {images.map((image, index) => (
                                           <Box   key={index}  sx={{   position: 'relative',   width: 100,  height: 100, border: '1px solid grey'   }}   >
                                                 <CardMedia   component="img"  image={image}  alt={`Product image ${index + 1}`}sx={{   width: '100%',   height: '100%',   objectFit: 'cover'   }}  />
                                                <IconButton     size="small"  sx={{ position: 'absolute',  top: 0,  right: 0,    color: 'red',  backgroundColor: 'white',  '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' } }}  onClick={() => removeImage(index)}  >
                                                   <DeleteIcon fontSize="small" />
                                                 </IconButton>
                                           </Box>
                                      ))}
                                  </Box>
                                    )}
                                  
                               </Grid>

                              <Grid item md={12}>
                                 { (selectedOption === 'top' || selectedOption ==="top/bottom")&& (
                            <>
                                   <Stack direction="row" alignItems="center" marginTop={2}>
                                       <Typography variant="h5" >Top Size</Typography>
                                       <FormLabel component="legend"> (Inches)</FormLabel>
                                   </Stack>
                                   <Grid container spacing={2} md={10} p={2}>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Waist" name="waist" type="number" variant="standard" value={topSizes.waist}   onChange={handleTopSizeChange} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Arm Length" name="armLength" type="number" variant="standard" value={topSizes.armLength}   onChange={handleTopSizeChange} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Hips" name="hips" type="number" variant="standard" value={topSizes.hips}   onChange={handleTopSizeChange} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Shoulder Width" name="shoulderWidth" type="number" variant="standard" value={topSizes.shoulderWidth}   onChange={handleTopSizeChange} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Bust/Chest" name="bustChest" type="number" variant="standard" value={topSizes.bustChest}   onChange={handleTopSizeChange} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Neck Circumference" name="neckCircumference" type="number" variant="standard" value={topSizes.neckCircumference}   onChange={handleTopSizeChange} />
                                          </Grid>
                                   </Grid>
                            </>
                              )}

                              

                            {( selectedOption === 'bottom' || selectedOption ==="top/bottom")&& (
                             <>
                                    <Stack direction="row" alignItems="center" marginTop={2}>
                                       <Typography variant="h5" >Bottom Size</Typography>
                                       <FormLabel component="legend">(Inches)</FormLabel>
                                    </Stack>
                                    <Grid container spacing={2} md={10} p={2}>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Waist" name="waist" type="number" variant="standard" value={bottomSizes.waist}   onChange={handleBottomSizeChange} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Hips" name="hips" type="number" variant="standard" value={bottomSizes.hips}   onChange={handleBottomSizeChange} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Inseam" name="inseam" type="number" variant="standard" value={bottomSizes.inseam}   onChange={handleBottomSizeChange} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Thigh and Leg Opening" name="thighLegOpening" type="number" variant="standard" value={bottomSizes.thighLegOpening}   onChange={handleBottomSizeChange} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Rise" type="number" name="rise" variant="standard" value={bottomSizes.rise}   onChange={handleBottomSizeChange} />
                                            </Grid>

                                    </Grid>
                             </>

                            )} 


                            

                              </Grid>

                                <Grid item md={12}>
                                        <TextField  label="Description" value={description} onChange={(e) => setDescription(e.target.value)}multiline  rows={6} sx={{ width: "100%", border: "1px ridge white" }}/>
                                        <Button type="submit" marginTop={2} sx={{ color: "black", backgroundColor:"#A86464" }}> Enter</Button>
                                 </Grid>
                       </Grid>
                 

                </Grid>

                   </form>
                 
            </Paper>
     </Box>   
        </Layout>
        </>
    );  
    
}

export default NewProduct;