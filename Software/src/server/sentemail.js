// filepath: d:\landslide_admin\backend\server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('D:\\leanhtu\\C.A.C\\Software\\landslide_ledws-master\\landslide_ledws-master\\data.json'); // Replace with the path to your Firebase service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://landslide-7cf2a-default-rtdb.firebaseio.com/', // Replace with your Firebase database URL
});

// Endpoint to fetch and print emails from information_users
app.get('/list-emails', async (req, res) => {
  try {
    const usersRef = admin.database().ref('information_users'); // Reference to the information_users node
    const snapshot = await usersRef.once('value'); // Fetch data from Firebase

    /*
    if (!snapshot.exists()) {
      console.log('No data found in information_users.');
      return res.status(404).send('No data found');
    }
    */

    const emails = [];
    snapshot.forEach((childSnapshot) => {
      const email = childSnapshot.val();
      emails.push(email);
      console.log('Found email:', email); // Log each email
    });

    res.status(200).json({ emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).send('Error fetching emails');
  }
});

let timer = -1; // Initialize the timer variable

app.post('/send-email', async (req, res) => {
  const { riskValue } = req.body;
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

  try {
    // Check if the timer allows sending emails
    if (timer === -1 || currentTime - timer >= 60) {
      
      timer = currentTime; // Update the timer to the current time

      // Fetch sensor data for the current day
      const currentDate = new Date().toISOString().split('T')[0];
      const dataRef = admin.database().ref(`sensor_data/${currentDate}*`);
      const snapshot = await dataRef.once('value');

      /*
      if (!snapshot.exists()) {
        console.log('No data found in sensor_data for the current day.');
        return res.status(404).send('No data found');
      }
        */

      const emailsRef = admin.database().ref('information_users');
      const emailsSnapshot = await emailsRef.once('value');

      /*
      if (!emailsSnapshot.exists()) {
        console.log('No data found in information_users.');
        return res.status(404).send('No data found');
      }
        */

      const emails = [];
      emailsSnapshot.forEach((childSnapshot) => {
        const email = childSnapshot.val();
        emails.push(email);
      });

      /*
      if (emails.length === 0) {
        console.log('No emails found.');
        return res.status(404).send('No emails found');
      }
      */

      // Extract latitude and longitude from sensor data
      let latitude = null;
      let longitude = null;
      snapshot.forEach((timestampSnapshot) => {
        const sensors = timestampSnapshot.val();

        if (sensors) {
          latitude = sensors.latitude;
          longitude = sensors.longitude;
        }
      });

      /*
      if (!latitude || !longitude) {
        console.log('No latitude or longitude found for sensor 1.');
        return res.status(404).send('No latitude or longitude found for sensor 1');
      }
        */

      // Configure the email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'landslide.detection.and.warning@gmail.com',
          pass: 'hjeq meqt vwkd rwoc',
        },
      });

      // Send email to each recipient
      for (const email of emails) {
        const mailOptions = {
          from: 'landslide.detection.and.warning@gmail.com',
          to: email,
          subject: 'URGENT: Landslide Risk Detected in Your Area - Take Action Now',
          
          text: `Dear sir,\n\n` +
            `Our system has detected a high risk of landslide in your area based on real-time environmental data.\n\n` +
            `Link: https://maps.google.com/?q=${latitude},${longitude}\n` +
            `Risk Level: ${riskValue}\n\n` +
            `Please take the following precautions immediately:\n` +
            `1. Evacuate the area if necessary.\n` +
            `2. Stay away from steep slopes and unstable ground.\n` +
            `3. Monitor local news and weather updates.\n\n` +
            `Your safety is our top priority. If you have any questions or need assistance, please contact us.\n\n` +
            `Best regards,\n` +
            `Landslide Detection System Team`,
/*
            text: `Dear sir,\n\n` +
            `Our system has detected a high risk of landslide in your area based on real-time environmental data.\n\n` +
            `Link: https://maps.google.com/?q=16.07352951647323,108.21905188010119\n` +
            `Risk Level: ${riskValue}\n\n` +
            `Please take the following precautions immediately:\n` +
            `1. Evacuate the area if necessary.\n` +
            `2. Stay away from steep slopes and unstable ground.\n` +
            `3. Monitor local news and weather updates.\n\n` +
            `Your safety is our top priority. If you have any questions or need assistance, please contact us.\n\n` +
            `Best regards,\n` +
            `Landslide Detection System Team`,
            */
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Email sent to: ${email}`);
        } catch (error) {
          console.error(`Error sending email to ${email}:`, error);
        }
      }

      res.status(200).send('Emails sent successfully');
    } else {
      // console.log('Email sending skipped due to timer restriction.');
      // console.log(currentTime - timer);
      res.status(429).send('Emails were sent recently. Please wait before sending again.');
    }
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).send('Error sending emails');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});