import nodemailer from 'nodemailer';
import { generateToken, verifyToken } from './jwtUtils.js';
import User from '../models/user.js';

const emailPass = process.env.EMAIL_PASS;

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  authMethod: 'LOGIN',
  logger: true,
  debug: true,
});

// Generate email verification token
export const generateVerificationToken = (user) => {
  return generateToken(
    {
      id: user._id,
      email: user.email,
      type: 'email_verification',
    },
    '24h' // Token valid for 24 hours
  );
};

// Send verification email
export const sendVerificationEmail = async (user) => {
  const verificationToken = generateVerificationToken(user);
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Pass Length:', emailPass.length);

  const mailOptions = {
    from: `Rewind and Revive <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9ff; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px;">
          <div style="text-align: center;">
            <img src="https://via.placeholder.com/100" alt="Logo" style="border-radius: 50%;">
            <h1 style="color: #C3B1E1;">Email Verification</h1>
          </div>
          <p>Hi ${user.username},</p>
          <p>You're almost set to start enjoying our platform. Simply click the link below to verify your email address and get started.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #C3B1E1; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none;">Verify my email address</a>
          </div>
          <p>If you didn't create an account, you can safely ignore this email. This link will expire in 24 hours.</p>
          <div style="text-align: center; padding: 20px;">
            <a href="#">Privacy Policy</a> | <a href="#">Contact Details</a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    console.log('Attempting to send email with config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER.replace(/(.{2}).*(@.*)/, '$1****$2'),
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${user.email}`);
    console.log('Email send details:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return true;
  } catch (error) {
    console.error('Detailed Error sending verification email:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response,
    });

    console.error('Full error object:', error);
    return false;
  }
};

// Verify email route handler
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);

    const user = await User.findOne({ email: decoded.email });
    console.log('User:', user);

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    user.isEmailVerified = true;
    await user.save();

    const accessToken = generateToken(user);
    res.json({ message: 'Email verified successfully', token: accessToken });
  } catch (error) {
    console.error('Verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Verification token expired' });
    }

    res.status(500).json({ message: 'Server error during email verification' });
  }
};