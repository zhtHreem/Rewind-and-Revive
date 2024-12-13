import User from "../models/user.js";
//import { generateToken } from "../utils/jwtUtils.js";
import { generateToken } from "../utils/jwtUtils.js";
import { OAuth2Client } from 'google-auth-library';
import { sendVerificationEmail } from "../utils/emailVerificationUtils.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const registerUser = async (req, res) => {
  console.log("Registration request body:", req.body);
  const { username, email, password } = req.body;

  try {
    // Check for existing users with the same email or username
    const existingUser = await User.findOne({ 
      $or: [
        { email },  // Check if email exists
        { username } // Check if username exists
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists", 
        field: existingUser.email === email ? 'email' : 'username'
      });
    }

    // Create new user
    const newUser = new User({ 
      username, 
      email, 
      password,
      isEmailVerified: false,  // Explicitly set to false
    });

    try {
      // Save the user to the database
      const savedUser = await newUser.save();

      // Send verification email (make sure the function works as expected)
      const emailSent = await sendVerificationEmail(savedUser);

      if (!emailSent) {
        return res.status(500).json({
          message: 'User created, but verification email could not be sent',
          user: {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email
          }
        });
      }

      // Successfully created and sent email
      return res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email
        }
      });
      
    } catch (saveError) {
      console.error("User Save Error:", saveError);

      if (saveError.code === 11000) {
        // Handle unique constraint violation (email or username)
        const duplicateField = Object.keys(saveError.keyValue)[0];
        return res.status(409).json({
          message: `${duplicateField} already exists`,
          duplicateField
        });
      }

      return res.status(500).json({
        message: 'Error creating user',
        error: saveError.message
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

   const token = generateToken(user);
    res.status(200).json({  token,});
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const GoogleloginUser = async (req, res) => {
    console.log("Google Login Request Started");
    const { token } = req.body;

    try {
        // Verify the token
        const ticket = await client.verifyIdToken({  idToken: token,  audience: process.env.GOOGLE_CLIENT_ID });

        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        console.log("Payload Details:", {   email,  name,  googleId: sub });

        // Check if user exists in your database
        let user = await User.findOne({ 
            $or: [
                { googleId: sub },
                { email: email }
            ]
        });

        console.log("Existing User Check:", user);

        if (!user) {
            // If the user doesn't exist, create a new user with Google login
            const newUser = new User({ username: name, email: email, googleId: sub   });

            try {
                // Attempt to save new user
                const savedUser = await newUser.save();
                const token = generateToken(savedUser);
                console.log("User Save Attempt Result:", {  savedUser, savedSuccessfully: true });
                console.log("s",token)
                // Respond with saved user
                return res.status(201).json({
                    message: 'User created successfully',
                    user: savedUser,
                    token
                });
            } catch (saveError) {
                console.error("User Save Error:", saveError);

                // Check for validation or duplicate key error
                if (saveError.name === 'ValidationError') {
                    return res.status(400).json({
                        message: 'Validation Error',
                        errors: saveError.errors
                    });
                }
                if (saveError.code === 11000) {
                    return res.status(409).json({
                        message: 'User already exists',
                        duplicateFields: saveError.keyValue
                    });
                }

                // Generic error response
                return res.status(500).json({
                    message: 'Error creating user',
                    error: saveError.message
                });
            }
        } else {
            // If the user already exists, check if Google ID is linked
            if (!user.googleId) {
                // User exists but Google is not linked, link the Google account
                user.googleId = sub; // Link the Google ID
                await user.save();  // Save the updated user
                const token = generateToken(user);
                return res.status(200).json({
                    message: 'Google account linked successfully!',
                    user,
                    token
                });
            }

            // If Google ID is already linked, proceed normally
            const token = generateToken(user);
            return res.status(200).json({
                message: 'Login successful!',
                user,
                token
            });
        }
    } catch (error) {
        console.error("Complete Google Login Error:", error);

        res.status(400).json({ 
            message: 'Invalid Google token', 
            error: error.message 
        });
    }
}
