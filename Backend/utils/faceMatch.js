const nodemailer = require('nodemailer');
const LostChild = require('../models/lostchildmodel');
const path = require('path');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------ 1. Email to Lost Child Guardian ------------------
async function sendMatchEmail(lostChildId, matchedChildren) {
  try {
    const lostChild = await LostChild.findById(lostChildId);
    if (!lostChild) {
      console.log('Lost child not found');
      return;
    }

    let emailContent = `
      <h2>Match Found for Lost Child: ${lostChild.childName}</h2>
      <p>The following reported children may match your lost child:</p>
      <ul>
    `;

    const attachments = [];
    matchedChildren.forEach((child, index) => {
      const cid = `childPhoto${index}@example.com`;
      attachments.push({
        filename: child.childPhoto || 'default.jpg',
        path: path.join(__dirname, '../reported', child.childPhoto || 'default.jpg'),
        cid
      });

      emailContent += `
        <li>
          <h3>${child.childName}</h3>
          <p><strong>Age:</strong> ${child.age}</p>
          <p><strong>Gender:</strong> ${child.gender}</p>
          <p><strong>Last Seen:</strong> ${child.lastSeenLocation}</p>
          <p><strong>Description:</strong> ${child.description}</p>
          <p><strong>Parent Name:</strong> ${child.parentName}</p>
          <p><strong>Contact Number:</strong> ${child.contactNumber}</p>
          <p><img src="cid:${cid}" alt="Child Photo" width="200" /></p>
        </li>
      `;
    });

    emailContent += '</ul>';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: lostChild.email,
      subject: `Match Found for Lost Child: ${lostChild.childName}`,
      html: emailContent,
      attachments
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Match email sent to:', lostChild.email);
  } catch (error) {
    console.error('❌ Error in sendMatchEmail:', error);
  }
}

// ------------------ 2. Email to Guardians of Matched Children ------------------
async function sendMatchNotificationToGuardians(lostChild, matchedChildren) {
  try {
    for (let child of matchedChildren) {
      const childCid = `childPhoto${child._id}@example.com`;
      const lostCid = `lostPhoto${lostChild._id}@example.com`;

      const attachments = [
        {
          filename: child.childPhoto || 'default.jpg',
          path: path.join(__dirname, '../missing', child.childPhoto || 'default.jpg'),
          cid: childCid
        },
        {
          filename: lostChild.childPhoto || 'default.jpg',
          path: path.join(__dirname, '../reported', lostChild.childPhoto || 'default.jpg'),
          cid: lostCid
        }
      ];

      const emailContent = `
        <h2>Match Alert for Reported Child</h2>
        <p><strong>Reported Child (You submitted):</strong></p>
        <ul>
          <li><strong>Name:</strong> ${child.childName}</li>
          <li><strong>Age:</strong> ${child.age}</li>
          <li><strong>Gender:</strong> ${child.gender}</li>
          <li><strong>Last Seen:</strong> <a href="https://www.google.com/maps?q=${encodeURIComponent(child.lastSeenLocation)}" target="_blank">${child.lastSeenLocation}</a></li>
          <li><strong>Last Seen:</strong> 
  <a href="https://www.google.com/maps?q=28.5868032,77.4373376" target="_blank">📍 View on Map</a>
</li>

          <li><strong>Contact:</strong> ${child.contactNumber}</li>
          <li><img src="cid:${childCid}" alt="Child Photo" width="200" /></li>
        </ul>

        <p><strong>Matched Lost Child Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${lostChild.childName}</li>
          <li><strong>Age:</strong> ${lostChild.age}</li>
          <li><strong>Gender:</strong> ${lostChild.gender}</li>
          <li><strong>Last Seen:</strong> ${lostChild.lastSeen}</li>
          <li><strong>Contact:</strong> ${lostChild.contactNumber}</li>
          <li><img src="cid:${lostCid}" alt="Lost Child Photo" width="200" /></li>
        </ul>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: child.email,
        subject: `Potential Match Found for Your Reported Child`,
        html: emailContent,
        attachments
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Match email sent to ${child.email}`);
    }
  } catch (error) {
    console.error('❌ Error in sendMatchNotificationToGuardians:', error);
  }
}

module.exports = {
  sendMatchEmail,
  sendMatchNotificationToGuardians
};
