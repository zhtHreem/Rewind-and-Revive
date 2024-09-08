import React, { useState } from "react";
import './navbar.css';
import { Stack,Link,Box, IconButton, Typography,Button,TextField } from "@mui/material";
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import DensitySmallSharpIcon from '@mui/icons-material/DensitySmallSharp'; /*create drawer for mobile screen */
function Navbar(){
   const [shoppinCart,setShoppingCart]=useState(false);
   const [login,setLogin]=useState(false);
   const [search,setSearch]=useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const handleCart=()=>{
      setShoppingCart(prevState => !prevState);
    }
    const handleLogin=()=>{
      setLogin(prevState => !prevState);
    } 

    const performSearch = () => {
      setSearch(true)
      
     };
   return(
     
    <Box    sx={{display:"flex",paddingX:{xs:1,md:4,lg:8,xl:10},justifyContent:"space-between",borderBottom:"inset",boxShadow: 3,}}>
         
         <Stack direction="row" alignItems="center" px={{xs:1,md:3,xl:4}}>
          <Typography variant="h4" className="logo" > 
            <span style={{fontWeight:"bold"}}> R</span>
            <span style={{color: "orangered"}}>&</span>
            <span style={{fontWeight:"bold"}} className="bold">R</span> 
          </Typography>
          </Stack> 
         <Stack direction="row" alignItems="center" spacing={{sm:1,md:3,lg:5}} borderLeft={{sm:"inset"}} borderRight={{sm:"inset"}} p={2.4} px={{xs:2.4,md:10,lg:20,xl:25}}  >
            <Link href="#" sx={{color:"grey",fontWeight: 'bold', textDecoration: 'none','&:hover': { color:"black",fontWeight: 'bold'}, }} >Home</Link>
            <Link href="#" sx={{color:"black",fontWeight: 'bold', textDecoration: 'none','&:hover': { color:"orange",fontWeight: 'bold'}, }} >Category</Link>
            <Link href="#" sx={{color:"black", textDecoration: 'none','&:hover': { fontWeight: 'bold'}, }} >About US</Link>
            <Link href="#" sx={{color:"black", textDecoration: 'none','&:hover': { fontWeight: 'bold'}, }} >Contact Us</Link>
         </Stack>
         <Stack direction="row" alignItems="center" spacing={{xs:1,md:2}} px={{xs:1,md:3,lg:4}}>
            
            <IconButton onClick={handleCart}>
               {shoppinCart? (
                  <LocalMallIcon/>
                
               ): (
                  <LocalMallOutlinedIcon/>
               )
            }
            </IconButton>

            {!login && ( //change to login
              <IconButton>
                 <PersonIcon/>
              </IconButton>
            )}
              
                

            <IconButton onClick={performSearch}>   {/* Create a Drawer for search like cart */}
                  <SearchIcon fontSize="medium" />
            </IconButton>

            {login ? (
                <Typography component={Button} onClick={handleLogin} sx={{color:"orange",textDecoration: 'none','&:hover': { fontWeight: 'bold'},}}>Login</Typography>
            ):(
                <Typography component={Button} onClick={handleLogin} sx={{color:"orange",textDecoration: 'none','&:hover': { fontWeight: 'bold'},}}>Logout</Typography>
            )}
         </Stack>
    </Box>
   );
}
export default Navbar;