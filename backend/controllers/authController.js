const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Student } = require('../models/models');
const { sendOtpEmail } = require('../utils/mailer');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '4h' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { fullName, email, phone, schoolName, yearOfCompletion } = req.body;

    if (!fullName || !email || !phone || !schoolName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload your ID card image.' });
    }

    const exists = await Student.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const student = await Student.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      schoolName,
      yearOfCompletion: yearOfCompletion || '2025',
      markSheetPath: req.cloudImageUrl,
      status: 'approved',
    });

    res.status(201).json({ message: 'Registration successful. You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(404).json({ message: 'Email not registered' });

    // Admin skips OTP — handled by /admin-login
    if (student.role === 'admin') {
      return res.json({ isAdmin: true });
    }
    const otp = generateOtp();
    const expiry = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY) || 10) * 60 * 1000);

    student.otp = otp;
    student.otpExpiry = expiry;
    await student.save();

    // Send email (non-blocking – log error but don't fail)
    sendOtpEmail(student.email, otp).catch(err =>
      console.error('Mail error:', err.message)
    );

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const student = await Student.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');
    if (!student) return res.status(404).json({ message: 'Email not registered' });
    if (!student.otp || student.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }
    if (new Date() > student.otpExpiry) {
      return res.status(401).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Clear OTP after successful login
    student.otp = undefined;
    student.otpExpiry = undefined;
    await student.save();

    const token = signToken(student._id);
    res.json({
      token,
      user: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        hasAttempted: student.hasAttempted,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/admin-login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const admin = await Student.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, admin.password || '');
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(admin._id);
    res.json({
      token,
      user: { id: admin._id, fullName: admin.fullName, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  res.json({
    id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role,
    hasAttempted: req.user.hasAttempted,
  });
};

module.exports = { register, sendOtp, login, adminLogin, me };
