const nodemailer = require('nodemailer');
const otpMap = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOtp = (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpMap.set(email, otp);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Child Adoption',
    text: `Your OTP is ${otp}. Please use this to verify your adoption form.`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) return res.status(500).json({ message: 'OTP send failed', error });
    res.status(200).json({ message: 'OTP sent successfully' });
  });
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpMap.get(email);

  if (storedOtp === otp) {
    otpMap.delete(email);
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};
