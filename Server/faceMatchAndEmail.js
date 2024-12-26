const nodemailer = require('nodemailer');
const LostChild = require('./models/lostchildmodel'); // Ensure correct path to your LostChild model
const MissingChild = require('./models/missingchild')
// Setup nodemailer transport with your email credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '22103044@mail.jiit.ac.in', // Your email address
    pass: 'Bolnolgel31', // Your email password (ensure it's not hardcoded in production)
  }
});

async function sendMatchEmail(lostChildId, matchedChildren) {
  try {
    const lostChild = await LostChild.findById(lostChildId);

    if (!lostChild) {
      console.log('Lost child not found');
      return;
    }

    // Start building the email content
    let emailContent = `
      <h2>Match Found for Lost Child: ${lostChild.childName}</h2>
      <p>The following reported children may match your lost child:</p>
      <ul>
    `;

    // Loop through matched children and add their details to the email
    matchedChildren.forEach((child) => {
      emailContent += `
        <li>
          <h3>${child.childName}</h3>
          <p><strong>Age:</strong> ${child.age}</p>
          <p><strong>Gender:</strong> ${child.gender}</p>
          <p><strong>Last Seen Location:</strong> ${child.lastSeenLocation}</p>
          <p><strong>Description:</strong> ${child.description}</p>
          <p><strong>Parent Name:</strong> ${child.parentName}</p>
          <p><strong>Contact Number:</strong> ${child.contactNumber}</p>
          <p><strong>Email:</strong> ${child.email}</p>
          <p><strong>Photo:</strong> ${child.childPhoto}</p>
          <img src="http://localhost:3001/reported/${child.childPhoto}" alt="Child Photo" width="200" />
        </li>
      `;
    });
    emailContent += '</ul>';
    
    const mailOptions = {
      from: '22103044@mail.jiit.ac.in', // Your email address
      to: lostChild.email, // The lost child's guardian email
      subject: `Match Found for Lost Child: ${lostChild.childName}`,
      html: emailContent, // Send the email as HTML
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return;
      }
      console.log('Email sent: ' + info.response);
    });
  } catch (error) {
    console.log('Error in sendMatchEmail:', error);
  }
}
async function sendMatchNotificationToGuardians(lostChild, matchedChildren) {
  try {
    // Loop through matched children (reported children) and send an email for each match
    for (let child of matchedChildren) {
      let emailContent = `
        <h2>Match Found for Lost Child: ${lostChild.childName}</h2>
        <p>The following reported children may match your lost child:</p>
        <ul>
          <li>
            <h3>${child.childName}</h3>
            <p><strong>Age:</strong> ${child.age}</p>
            <p><strong>Gender:</strong> ${child.gender}</p>
            <p><strong>Last Seen Location:</strong> ${child.lastSeenLocation}</p>
            <p><strong>Description:</strong> ${child.description}</p>
            <p><strong>Parent Name:</strong> ${child.parentName}</p>
            <p><strong>Contact Number:</strong> ${child.contactNumber}</p>
            <p><strong>Email:</strong> ${child.email}</p>
            <p><strong>Photo:</strong> <img src="http://localhost:3001/reported/${child.childPhoto}" alt="Child Photo" width="200" /></p>
          </li>
        </ul>
      `;

      // Add the missing child's details to the email content
      emailContent += `
        <h3>Lost Child Details:</h3>
        <p><strong>Name:</strong> ${lostChild.childName}</p>
        <p><strong>Age:</strong> ${lostChild.age}</p>
        <p><strong>Gender:</strong> ${lostChild.gender}</p>
        <p><strong>Last Seen:</strong> ${lostChild.lastSeen}</p>
        <p><strong>Description:</strong> ${lostChild.description}</p>
        <p><strong>Contact:</strong> ${lostChild.contactNumber}</p>
        <p><strong>Email:</strong> ${lostChild.email}</p>
        <p><strong>Photo:</strong> <img src="http://localhost:3001
      
      `;

      // Send the email to the reported child's guardian
      const mailOptions = {
        from: '22103044@mail.jiit.ac.in', // Your email address
        to: child.email, // Send email to the guardian of the matched (reported) child
        subject: `Match Found for Lost Child: ${lostChild.childName}`,
        html: emailContent, // Send the email as HTML
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
          return;
        }
        console.log('Email sent to ' + child.email + ': ' + info.response);
      });
    }
  } catch (error) {
    console.log('Error in sendMatchNotificationToGuardians:', error);
  }
}


// Export both functions
module.exports = { sendMatchEmail, sendMatchNotificationToGuardians };
