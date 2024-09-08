import React, { useState, useEffect  } from "react";
import { Paper,Box,TextField,IconButton,CardMedia, Typography,Stack,Checkbox,FormControl, FormLabel, FormControlLabel, Button,Grid,Radio, RadioGroup } from "@mui/material";

import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import axios from 'axios';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';





const tagCategories = {
    "Style": ["Casual", "Formal", "Business", "Streetwear", "Vintage"],
    "Color": ["Black", "White", "Blue", "Red", "Green"],
    "fitOptions" : ["Slim Fit", "Regular Fit", "Loose Fit", "Relaxed Fit", "Skinny Fit", "Oversized"],
    "seasonOptions" :["Summer", "Winter", "Spring", "Fall", "All-season"],
    "occasionOptions" : ["Casual", "Workwear", "Party", "Wedding", "Outdoor", "Gym", "Travel", "Evening", "Lounge"],

  };


  const tagOptions = {
    "top": {
      categories: ["Shirt", "Blouse", "Sweater", "Jacket", "Cardigan", "Tank Top"],
      materials: ["Cotton", "Wool", "Silk", "Polyester", "Linen", "Rayon"]
    },
    "bottom": {
      categories: ["Pants", "Jeans", "Skirt", "Shorts", "Leggings", "Trousers"],
      materials: ["Denim", "Chino", "Corduroy", "Wool", "Cotton", "Linen"]
    },
    "accessories": {
      categories: ["Bag", "Belt", "Scarf", "Hat", "Watch", "Gloves"]
    }
  };
   

function NewProduct({ setAddProduct }){
      const [detail,setDetail]=useState("");
      const[tags,setTags]=useState(false);
      const [description,setDescription]=useState("");
      const [image, setImage] = useState(null);
      const [imageFile, setImageFile] = useState(null);
      const [userId, setUserId] = useState(null);
      const [name, setName] = useState("");
      const [price, setPrice] = useState("");
      const [selectedOption, setSelectedOption] = useState("top");
     


      useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUserId(storedUser.id);
        }
    }, []); 
    
    useEffect(() => {
        console.log("userid", userId);
    }, [userId]); 
    


    const handleEnter = async () => {
        try {

            const formData = new FormData();
            
            if (!imageFile ) {
                
                alert('Choose an Image.');
                return;
            }
            else if(!name){
                alert('Please enter the Recipe name.');
                return;
            }else if(!description){
                alert('Description is required.');
                return; 
            }else if(!detail){
                alert('Enter detail');
                return;
            }

            formData.append('user', userId);
                formData.append('name', name);
                formData.append('description', description);
                
                formData.append(`detail`, detail);
               
                
        
                formData.append('image', imageFile);
    

            for (let pair of formData.entries()) {
                if (pair[0] === 'image') {
                    console.log(pair[0] + 'image: ' + pair[1].name); 
                } else {
                    console.log(pair[0] + ': ' + pair[1]);
                }
            }
            const response = await axios.post('https://localhost:3500/api/recipes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Recipe created successfully:', response.data);
    
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Recipe created successfully!',
                confirmButtonText: 'OK'
            });
    
            setAddRecipe(false); // Close the form on success
        } catch (error) {
            console.error('Error creating recipe:', error);
        }
    };
    
    

     const handleImageChange = (event) => {
        console.log("handleImageChange triggered");
            const file = event.target.files[0];
            console.log("Image Data URL:", event.target.files[0]); 
            if (file) {
                setImageFile(file);
                const imageURL = URL.createObjectURL(file);
                setImage(imageURL);
                
            }
        };

    
    
    return(
         <Box  sx={{position: 'absolute', zIndex: 4,backgroundColor: 'rgba(0, 0, 0, 0.5)',width:"80%",top:"10%",left:"10%"}}>
            <Paper sx={{p:{xs:3,sm:6}}} elevation={24}>

                    <IconButton onClick={() => setAddProduct(false)}> {/*To close the product page*/}
                        <CloseIcon/>
                    </IconButton>
                
                    <Typography variant="h3" sx={{textAlign:"center"}}>Create New Product</Typography>
                    <Grid container direction={{xs:"column",md:"row"}} md={12}  justifyContent="space-between">

                         <Grid item md={6}>  
                           <Typography marginTop={2} variant="h4" >Name</Typography> 
                           <TextField label='Enter recipe name' value={name} onChange={(e) => setName(e.target.value)} />

                          <Typography   marginTop={2}  variant="h4" >Price</Typography> 
                          <TextField label='Rs' value={price} onChange={(e) => setPrice(e.target.value)} />

                          <Typography  marginTop={2}  variant="h4" sx={{marginTop:4}}>Type</Typography> 
                          <Grid container p={4} spacing={2} >
                                <FormControl component="fieldset">
                                <FormLabel component="legend">Select Category</FormLabel>
                                <RadioGroup  row aria-label="category" name="category" value={selectedOption}onChange={(e) => setSelectedOption(e.target.value)}>
                                     <FormControlLabel value="top" control={<Radio />} label="Top" />
                                     <FormControlLabel value="bottom" control={<Radio />} label="Bottom" />
                                     <FormControlLabel value="accessories" control={<Radio />} label="Accessories" />
                                </RadioGroup>
                                </FormControl>
                            </Grid>


                            {/* Display tags based on selected category */}
                            {selectedOption && tagOptions[selectedOption] && (
                            <Box p={2}>
                                   <Typography variant="h6" gutterBottom> Select Tags for {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}</Typography>

                                    {/* Display Category Tags */}
                                   <Typography variant="subtitle1" gutterBottom>Categories </Typography>
                                   <Grid  container spacing={2} p={2}>
                                   {tagOptions[selectedOption].categories.map(tag => (
                                           <Grid item xs={4}  lg={3} key={tag}>
                                                <FormControlLabel control={<Checkbox />}label={tag} sx={{ width: '100%' }}/>
                                           </Grid>
                                    ))}
                                   </Grid>

                                    {/* Display Cloth Material Tags if applicable */}
                                    {selectedOption !== "accessories" && (
                                       <>
                                          <Typography variant="subtitle1" gutterBottom mt={4}>Cloth Materials</Typography>
                                          <Grid container spacing={2} p={2}>
                                          {tagOptions[selectedOption].materials.map(material => (
                                              <Grid item xs={4}  lg={3} key={material}>
                                                 <FormControlLabel control={<Checkbox />} label={material} sx={{ width: '100%' }}   />
                                              </Grid>
                                          ))}
                                         </Grid>
                                       </>
                                    )}
                            </Box>
                             )}
                     
                            { selectedOption === 'top' && (
                            <>
                                   <Stack direction="row" alignItems="center" marginTop={2}>
                                       <Typography variant="h4" >Size</Typography>
                                       <FormLabel component="legend">Inches</FormLabel>
                                   </Stack>
                                   <Grid container spacing={2} md={10} p={2}>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Waist" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Arm Length" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Hips" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Shoulder Width" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Bust/Chest" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                          </Grid>
                                          <Grid item xs={6} sm={4}>
                                               <TextField   id="standard-number" label="Neck Circumference" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                          </Grid>
                                   </Grid>
                            </>
                              )}

                            { selectedOption === 'bottom'&& (
                             <>
                                    <Stack direction="row" alignItems="center" marginTop={2}>
                                       <Typography variant="h4" >Size</Typography>
                                       <FormLabel component="legend">Inches</FormLabel>
                                    </Stack>
                                    <Grid container spacing={2} md={10} p={2}>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Waist" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Hips" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Inseam" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Thigh and Leg Opening" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <TextField   id="standard-number" label="Rise" type="number" variant="standard" slotProps={{ inputLabel: {shrink: true, },  }} />
                                            </Grid>

                                    </Grid>
                             </>

                            )} 


                            <Grid item md={12}>
                                   <Typography  marginTop={2}  variant="h4"  >Detail</Typography> 
                                   <TextField  label='Enter product detail' value={detail} onChange={(e) => setDetail(e.target.value)} />
                           </Grid>

                        </Grid>


                       <Grid container direction={{xs:"column",md:"row"}} py={4}  md={6} spacing={2}>

                               <Grid item md={12}>
                                       <Typography variant="h5">Add Image</Typography>
                                       <Paper component="label" sx={{  position: 'relative', padding: 3,backgroundColor: "lightgrey", cursor: "pointer",width: {xs:'200px',sm:'300px'}, display: 'flex',flexDirection: 'column', alignItems: 'center', }} >
                                                 <input type="file" name="image" accept="image/*" hidden onChange={handleImageChange} />
                                                 <CardMedia  component="img" image={typeof image === 'string' ? image : "https://via.placeholder.com/150"} alt="Selected"  sx={{ height: 150,width: '100%',  objectFit: 'cover', maxWidth: '100%',   }} />
                                                 {!image && (
                                                         <Box sx={{   position: 'absolute', top: 0,left: 0, height: '100%',width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', }}>
                                                              <IconButton size="large">
                                                                  <AddIcon sx={{ color: "black" }} />
                                                              </IconButton>
                                                         </Box>
                                                   )}
                                      </Paper>
                               </Grid>

                              <Grid item md={12}>
                                       <Box >
                                          <Button  onClick={() => setTags(prev => !prev)} sx={{color:"black",width:"100%", borderBottom: "1px outset black",borderLeft: "1px outset black", }}  endIcon={<KeyboardArrowDown />}>Add Descriptive Tags</Button>
                                             {tags &&( 
                                                <Box mt={2}>
                                                    {Object.keys(tagCategories).map(category => (
                                                    <Box mb={4} px={3} key={category}>
                                                         <Typography variant="h6" gutterBottom>  {category} </Typography>
                                                          <Grid  container spacing={2} p={2}>
                                                              {tagCategories[category].map(tag => (
                                                                   <Grid item xs={6} sm={4}  lg={3} key={tag}>
                                                                          <FormControlLabel control={<Checkbox />}label={tag}sx={{ width: '100%' }}/>
                                                                  </Grid>
                                                                 ))}
                                                         </Grid>
                                                  </Box>
                                                   ))}
                                                </Box>
                                            )}  
                                      </Box>

                                 </Grid>


                                <Grid item md={12}>
                                        <TextField  label="Description" value={description} onChange={(e) => setDescription(e.target.value)}multiline  rows={6} sx={{ width: "100%", border: "1px ridge white" }}/>
                                        <Button marginTop={2} sx={{ color: "black", backgroundColor: "yellow" }} onClick={handleEnter}> Enter</Button>
                                 </Grid>
                       </Grid>
                 

                </Grid>

                   
                 
            </Paper>
     </Box>   
    );  
    
}

export default NewProduct;