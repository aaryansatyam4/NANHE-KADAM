const Adoption = require('../models/adoptionmodel1');
const MissingChild = require('../models/missingchild');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.adoptChild = async (req, res) => {
  const { firstName, lastName, email, phone, address, city, state, zip, preferredAge, preferredGender, income } = req.body;

  try {
    const adoption = new Adoption({ firstName, lastName, email, phone, address, city, state, zip, preferredAge, preferredGender, income });
    const savedAdoption = await adoption.save();

    const child = await MissingChild.findOne({ founded: false, adopted: false });
    if (!child) return res.status(404).json({ message: 'No children available for adoption' });

    child.founded = true;
    child.adopted = true;
    await child.save();

    savedAdoption.adoptedChildId = child._id;
    await savedAdoption.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Adoption Assignment',
      text: `You have been assigned the child: ${child.childName}. Please visit the police station to complete formalities.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Adoption form submitted. Check email for details.' });
  } catch (error) {
    res.status(500).json({ message: 'Adoption failed', error: error.message });
  }
};
