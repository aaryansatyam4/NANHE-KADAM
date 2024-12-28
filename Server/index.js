const dotenv = require('dotenv');
dotenv.config();
const Razorpay = require('razorpay');
const express = require('express');
const { PythonShell } = require('python-shell');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { spawn } = require('child_process');
// Import models
const User = require('./models/usermodel');
const MissingChild = require('./models/missingchild');
const LostChild = require('./models/lostchildmodel');
const Event = require('./models/eventmodel');
const Adoption = require('./models/adoptionmodel1');
const { sendMatchEmail, sendMatchNotificationToGuardians } = require('./faceMatchAndEmail');
 // Ensure the correct path to the file
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the appxf
app.use('/reported', express.static(path.join(__dirname, 'reported')));

// Serve missing images similarly if needed
app.use('/missing', express.static(path.join(__dirname, 'missing')));
// Enable CORS for all routes globally
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend origin
  credentials: true, // Allow credentials like cookies
}));

// Middleware setup
app.use(express.json());
app.use(cookieParser()); // For accessing cookies

// MongoDB connection
mongoose.connect('mongodb+srv://aaryansatyam4:Asatyam2604@user.ycc6w.mongodb.net/', {
  useNewUrlParser: true,  
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Multer configuration for image uploads
const storageUserPic = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'userpic/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const uploadUserPic = multer({ storage: storageUserPic });

const storageMissingChild = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'reported/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const uploadMissingChild = multer({ storage: storageMissingChild });

const storageLostChild = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'missing/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const uploadLostChild = multer({ storage: storageLostChild });

// ----------------------------- User Registration API -----------------------------
app.post('/register', uploadUserPic.single('photo'), async (req, res) => {
  try {
    const { name, email, category, password, id } = req.body; // Removed mobile
    if (!name || !email || !category || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Profile photo is required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      category,
      password: hashedPassword,
      id,
      photo: req.file.filename,
    });

    const savedUser = await newUser.save();
    res.status(200).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// ----------------------------- User Login API -----------------------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this email' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    res.cookie('userId', user._id, { httpOnly: true, secure: false });
    res.json({ message: 'Login successful', userId: user._id, category: user.category });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ----------------------------- Get Logged-in User Info API -----------------------------
app.get('/user/me', async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const photoUrl = user.photo ? `http://localhost:3001/${user.photo}` : null;
    res.json({ ...user._doc, photoUrl: photoUrl || 'default-url' });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  // Check if userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ----------------------------- Event Creation API -----------------------------
app.post('/create-event', async (req, res) => {
  const { title, date, location, time, objectives } = req.body;
  const submittedBy = req.cookies.userId; // Assuming userId is stored in cookies

  if (!submittedBy) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!title || !date || !location || !time || !objectives) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newEvent = new Event({
      title,
      date,
      location,
      time,
      objectives,
      submittedBy,
      approved: false, // This will be false by default, but explicitly setting it for clarity
    });
    const savedEvent = await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: savedEvent });
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/add-missing-child', uploadMissingChild.single('childPhoto'), async (req, res) => {
  const { parentName, contactNumber, childName, email, age, gender, lastSeen, description } = req.body;
  const childPhoto = req.file ? req.file.filename : null; // Store the image filename
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Save missing child data in the database
    const newChild = new MissingChild({
      parentName,
      contactNumber,
      childName,
      email,
      age,
      gender,
      lastSeen,
      description,
      childPhoto,
      submittedBy: userId,
    });
    const savedChild = await newChild.save();
    console.log('Missing child saved:', savedChild);

    // Define file paths for comparison (image is in the 'reported' folder, matching with 'missing' folder)
    const missingPhotoPath = path.join(__dirname, 'reported', req.file.filename); // The uploaded image
    const missingFolderPath = path.join(__dirname, 'missing'); // Folder for missing children's photos

    // Run Python face recognition script to find a match
    const pythonProcess = spawn('python', [
      './ReportedFaceRecog.py',
      missingPhotoPath,
      missingFolderPath,
    ]);

    console.log('Starting Python face recognition script...');

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();  // Accumulate output
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        return res.status(500).json({ message: 'Error running face recognition script' });
      }

      console.log('Python process completed successfully');
      console.log('Face recognition results:', output);

      try {
        const matches = JSON.parse(output);

        if (matches.length > 0) {
          // Send an email to the guardian of the missing child and include matched children
          for (let match of matches) {
            const lostChild = { ...req.body, _id: savedChild._id };  // Create an object with the missing child data

            // Ensure the lostChild object includes childPhoto from the database
            lostChild.childPhoto = savedChild.childPhoto || 'default.jpg'; // Fallback if no photo is found

            console.log('Lost Child Data:', lostChild); // Debugging: log lostChild

            // Send email to the guardian of the matched child
            await sendMatchNotificationToGuardians(lostChild, matches); // Pass missing child and matched children to the function
          }

          return res.status(200).json({
            message: 'Missing child added and face matching completed, email sent to guardians of matching children',
            matches,
          });
        } else {
          return res.status(200).json({
            message: 'Missing child added but no match found',
          });
        }
      } catch (error) {
        console.error('Error parsing face recognition output:', error);
        return res.status(500).json({ message: 'Error parsing face recognition output' });
      }
    });

  } catch (err) {
    console.error('Error saving missing child data:', err.message);
    res.status(500).json({ message: 'Error saving child data', error: err.message });
  }
});


// // ----------------------------- Add Lost Child API -----------------------------
// app.post('/add-lost-child', uploadLostChild.single('childPhoto'), async (req, res) => {
//   const { childName, age, gender,email, lastSeenLocation, description, guardianName, contactInfo, additionalComments } = req.body;
//   const childPhoto = req.file ? req.file.filename : null;
//   const userId = req.cookies.userId;
//   if (!userId) {
//     return res.status(401).json({ message: 'User not authenticated' });
//   }
//   try {
//     const newLostChild = new LostChild({
//       submittedBy: userId,
//       childName,
//       age,
//       gender,
//       email,
//       lastSeenLocation,
//       description,
//       guardianName,
//       contactInfo,
//       additionalComments,
//       childPhoto,
//     });
//     const savedLostChild = await newLostChild.save();
//     res.status(201).json({ message: 'Lost child report saved successfully', child: savedLostChild });
//   } catch (err) {
//     console.error('Error saving lost child report:', err.message);
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// });

app.post('/add-lost-child', uploadLostChild.single('childPhoto'), async (req, res) => {
  const { childName, age, gender, email, lastSeenLocation, description, guardianName, contactInfo, additionalComments } = req.body;

  if (!childName || !age || !gender || !email || !lastSeenLocation || !description || !guardianName || !contactInfo) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const childPhoto = req.file ? req.file.filename : null;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const newLostChild = new LostChild({
      submittedBy: userId,
      childName,
      age,
      gender,
      email,
      lastSeenLocation,
      description,
      guardianName,
      contactInfo,
      additionalComments,
      childPhoto,
    });

    const savedLostChild = await newLostChild.save();
    console.log('Lost child saved:', savedLostChild);

    const missingPhotoPath = path.join(__dirname, 'missing', req.file.filename);
    const reportedFolderPath = path.join(__dirname, 'reported');

    const pythonProcess = spawn('python', [
      './Facerecog.py',
      missingPhotoPath,
      reportedFolderPath
    ]);

    console.log("Starting Python face recognition script...");

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();  // Accumulate output
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        return res.status(500).json({ message: 'Error running face recognition script' });
      }

      console.log('Python process completed successfully');
      console.log('Face recognition results:', output);

      try {
        const matches = JSON.parse(output);

        if (matches.length > 0) {
          // Send email dynamically with matched data
          await sendMatchEmail(savedLostChild._id, matches);
          return res.status(200).json({
            message: 'Lost child added and face matching completed, email sent to guardian',
            matches,
          });
        } else {
          return res.status(200).json({
            message: 'Lost child added but no match found',
          });
        }
      } catch (error) {
        console.error('Error parsing face recognition output:', error);
        return res.status(500).json({ message: 'Error parsing face recognition output' });
      }
    });

  } catch (err) {
    console.error('Error saving lost child report:', err.message);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});
// ----------------------------- Get All Lost Children API -----------------------------
app.get('/all-lost-children', async (req, res) => {
  try {
    const lostChildren = await LostChild.find();
    res.status(200).json(lostChildren);
  } catch (err) {
    console.error('Error fetching lost children:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ----------------------------- Close Case API -----------------------------
app.put('/close-case/:id', async (req, res) => {
  const { founded } = req.body;
  const childId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(childId)) {
    return res.status(400).json({ message: 'Invalid child ID' });
  }
  try {
    const updatedChild = await LostChild.findByIdAndUpdate(childId, { founded }, { new: true });
    if (!updatedChild) {
      return res.status(404).json({ message: 'Child not found' });
    }
    res.status(200).json(updatedChild);
  } catch (err) {
    console.error('Error closing the case:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// ----------------------------- Get Unadopted Children API -----------------------------
app.get('/unadopted-children', async (req, res) => {
  try {
    // Fetch children who are not founded and not yet adopted
    const unadoptedChildren = await MissingChild.find({ founded: false, adopted: false });
    
    // If no children are found
    if (!unadoptedChildren.length) {
      return res.status(404).json({ message: 'No unadopted children found' });
    }

    // Send the list of children to the client
    res.status(200).json(unadoptedChildren);
  } catch (err) {
    console.error('Error fetching unadopted children:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ----------------------------- Get Rescue Data API -----------------------------
app.get('/rescue-data', async (req, res) => {
  try {
    const rescuesDone = await LostChild.countDocuments({ founded: true });
    const rescuesRemaining = await LostChild.countDocuments({ founded: false });
    res.status(200).json({ rescuesDone, rescuesRemaining });
  } catch (err) {
    console.error('Error fetching rescue data:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});



const otpMap = new Map(); // Temporary store for OTPs, replace with session if needed

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '22103044@mail.jiit.ac.in',
    pass: "Bolnolgel31",
  },
});

// Send OTP
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  otpMap.set(email, otp);

  const mailOptions = {
    from: '22103036@mail.jiit.ac.in',
    to: email,
    subject: 'Your OTP for Child Adoption',
    text: `Your OTP is ${otp}. Please use this to verify your adoption form.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error in transporter.sendMail:', error);
      return res.status(500).json({ message: 'Error sending OTP', error });
    }
    res.status(200).json({ message: 'OTP sent successfully' });
  });
});


// Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpMap.get(email);

  if (storedOtp === otp) {
    otpMap.delete(email);
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

app.post('/adopt-child', async (req, res) => {
  const { firstName, lastName, email, phone, address, city, state, zip, preferredAge, preferredGender, income } = req.body;

  try {
    // Store the form data in the Adoption model
    const adoptionRecord = new Adoption({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      preferredAge,
      preferredGender,
      income,
    });
    const savedAdoption = await adoptionRecord.save();

    // Find an unfounded and unadopted child
    const child = await MissingChild.findOne({ founded: false, adopted: false });
    if (!child) {
      return res.status(404).json({ message: 'No children available for adoption at the moment' });
    }

    // Update the child’s status in the database
    child.founded = true;
    child.adopted = true;
    await child.save();

    // Update the adoptedChildId in the adoption record
    savedAdoption.adoptedChildId = child._id;
    await savedAdoption.save();

    // Mocked police contact details
    const policeContact = {
      name: 'Officer John Doe',
      phone: '123-456-7890',
      station: 'Downtown Police Station',
    };

    // Send notification email to the applicant
    const mailOptions = {
      from: '22103036@mail.jiit.ac.in',
      to: email,
      subject: 'Adoption Assignment',
      text: `Dear applicant, you have been assigned the child: ${child.childName}. Please proceed to ${policeContact.station} and contact Officer ${policeContact.name} at ${policeContact.phone} for further steps.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Error sending notification email', error });
      }
      res.status(200).json({ message: 'Adoption form submitted successfully. Check your email for details.' });
    });
  } catch (error) {
    console.error('Error processing adoption form:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 

// app.post('/match-face', uploadLostChild.single('childPhoto'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'Child photo is required for face matching' });
//   }

//   // Prepare options to pass the uploaded image path to the Python script
//   const options = {
//     args: [req.file.path], // pass the image path as an argument
//   };

//   // Execute the face matching Python script
//   PythonShell.run('./pythonFaceMatchingScript.py', options, (err, results) => {
//     if (err) {
//       console.error('Error running face matching script:', err);
//       return res.status(500).json({ message: 'Face matching failed', error: err.message });
//     }

//     // Process the Python script's output (results) to determine if a match was found
//     const matchFound = results && results[0] === 'match'; // Example: assuming 'match' indicates a match
//     if (matchFound) {
//       res.status(200).json({ message: 'Match found', details: results });
//     } else {
//       res.status(404).json({ message: 'No match found' });
//     }
  // });
// });


// Initialize Razorpay instance with environment variables
const razorpayInstance = new Razorpay({
  key_id: "rzp_test_VCPpH2MdmvYasW", // Store your Razorpay Key ID in .env
  key_secret: "3uJGzZ0NXZRq16XMmnm9yclD", // Store your Razorpay Key Secret in .env
});

// ----------------------------- Donation Order API -----------------------------
// Endpoint to create a Razorpay order
app.post('/donate', async (req, res) => {
  const { amount } = req.body; // Amount in INR, for example, 500 for 500 INR
  const payment_capture = 1;
  const currency = "INR";

  try {
    const options = {
      amount: amount * 100, // Amount in paisa
      currency,
      receipt: `receipt_order_${Math.random() * 1000}`,
      payment_capture,
    };

    // Create order on Razorpay
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ orderId: order.id, currency: order.currency, amount: order.amount });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Unable to create order', error });
  }
});

// ----------------------------- Payment Verification API (Optional) -----------------------------
// Endpoint to verify payment on the backend
app.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    res.status(200).json({ message: 'Payment verification successful' });
  } else {
    res.status(400).json({ message: 'Invalid payment signature' });
  }
});

// ----------------------------- API to Get Children Where founded=false and adopted=false -----------------------------
app.get('/children-unfound-unadopted', async (req, res) => {
  try {
    const children = await MissingChild.find({ founded: false, adopted: false });
    res.status(200).json(children);
  } catch (err) {
    console.error('Error fetching children:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// ----------------------------- API to Get Children Where founded=true and adopted=false -----------------------------
app.get('/children-found-unadopted', async (req, res) => {
  try {
    const children = await MissingChild.find({ founded: true, adopted: false });
    res.status(200).json(children);
  } catch (err) {
    console.error('Error fetching children:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

app.post('/adopt-child', async (req, res) => {
  const { firstName, lastName, email, phone, address, city, state, zip, preferredAge, preferredGender, income } = req.body;

  try {
    // Log request data for debugging
    console.log('Received adoption form data:', req.body);

    // Store the form data in the Adoption model
    const adoptionRecord = new Adoption({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      preferredAge,
      preferredGender,
      income,
    });

    const savedAdoption = await adoptionRecord.save();
    console.log('Adoption record saved:', savedAdoption);

    // Find an unfounded and unadopted child
    const child = await MissingChild.findOne({ founded: false, adopted: false });
    if (!child) {
      console.warn('No children available for adoption at the moment');
      return res.status(404).json({ message: 'No children available for adoption at the moment' });
    }

    // Update the child’s status in the database
    child.founded = true;
    child.adopted = true;
    await child.save();
    console.log('Child status updated:', child);

    // Update the adoptedChildId in the adoption record
    savedAdoption.adoptedChildId = child._id;
    await savedAdoption.save();
    console.log('Adopted child ID added to adoption record:', savedAdoption);

    // Mocked police contact details
    const policeContact = {
      name: 'Officer John Doe',
      phone: '123-456-7890',
      station: 'Downtown Police Station',
    };

    // Send notification email to the applicant
    const mailOptions = {
      from: '22103036@mail.jiit.ac.in',
      to: email,
      subject: 'Adoption Assignment',
      text: `Dear applicant, you have been assigned the child: ${child.childName}. Please proceed to ${policeContact.station} and contact Officer ${policeContact.name} at ${policeContact.phone} for further steps.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Notification email sent to:', email);
      res.status(200).json({ message: 'Adoption form submitted successfully. Check your email for details.' });
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      res.status(500).json({ message: 'Error sending notification email', error: emailError.message });
    }

  } catch (error) {
    console.error('Error processing adoption form:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


const sharp = require('sharp'); // Import sharp for image processing

const debounceTime = 200; // Time in milliseconds
let debounceTimeouts = {};

// fs.watch('./missing', (eventType, filename) => {
//   if (filename) {
//     const filePath = path.join(__dirname, 'missing', filename);

//     // Clear the previous timeout for this file
//     if (debounceTimeouts[filePath]) {
//       clearTimeout(debounceTimeouts[filePath]);
//     }

//     // Set a new timeout
//     debounceTimeouts[filePath] = setTimeout(() => {
//       console.log(`Processing file: ${filename}`);

//       // Check if the file exists
//       if (fs.existsSync(filePath)) {
//         // Process the image
//         sharp(filePath)
//           .resize(800) // Resize the image to a width of 800px
//           .toBuffer()
//           .then((data) => {
//             // Save the processed image to a new file
//             const outputFilePath = path.join(__dirname, 'missing', filename);
//             fs.writeFileSync(outputFilePath, data);
//             console.log(`Processed image saved to: ${outputFilePath}`);
//           })
//           .catch((err) => {
//             console.error('Error processing image:', err);
//           });
//       } else {
//         console.error(`File not found: ${filePath}`);
//       }
//     }, debounceTime);
//   }
// });



// ----------------------------- Serve Uploaded Images -----------------------------
app.use('/missing', cors(), express.static('missing'));
app.use('/reported', cors(), express.static('reported'));
app.use('/userpic', cors(), express.static('userpic'));

// ----------------------------- Start Server -----------------------------
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
