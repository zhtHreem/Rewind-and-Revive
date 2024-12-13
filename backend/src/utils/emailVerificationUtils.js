import nodemailer from 'nodemailer';
import { generateToken, verifyToken } from './jwtUtils.js';
import User from '../models/user.js';

// Create a transporter using SMTP
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });
const emailPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: 'gmail',
  //  host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
     authMethod: 'LOGIN',
    // Add these debugging options
    logger: true,
    debug: true
});

// Generate email verification token (reusing your existing generateToken function)
export const generateVerificationToken = (user) => {
  return generateToken({
    id: user._id,
    email: user.email,
    type: 'email_verification'
  }, '24h'); // Extend expiration for verification
};

export const sendVerificationEmail = async (user) => {
    const verificationToken = generateVerificationToken(user);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
 console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass Length:', process.env.EMAIL_PASS);
    const mailOptions = {
        from: `"Rewind and Revive" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: 'Verify Your Email',
        html: `
            <h1>Welcome to Our Platform!</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
        `
    };

    try {
        // Added debug logging
        console.log('Attempting to send email with config:', {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            user: process.env.EMAIL_USER.replace(/(.{2}).*(@.*)/, "$1****$2"), // Partially mask email
        });

        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent successfully to ${user.email}`);
        console.log('Email send details:', {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response
        });
        return true;
    } catch (error) {
        console.error('Detailed Error sending verification email:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            response: error.response
        });

        // Log the full error object
        console.error('Full error object:', error);

        return false;
    }
};
// Verify email route handler
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the token
    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded);
    // Additional check for email verification token
    // if (decoded.type !== 'email_verification') {
    //     console.log("Invalid token type");
    //   return res.status(400).json({ message: 'Invalid verification token' });
    // }

    // Find the user
    const user = await User.findOne({ email: decoded.email });
    console.log("user,",user)

    if (!user) {
        console.log("User not found");
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();

    // Generate a new access token after verification
    const accessToken = generateToken(user);
    res.json({ message: 'Email verified successfully', token: accessToken });
  
  } catch (error) {
    console.error("Verification error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Verification token expired' });
    }
    res.status(500).json({ message: 'Server error during email verification' });
  }
};