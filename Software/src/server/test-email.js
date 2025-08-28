const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'leducchinhld@gmail.com',
    pass: 'pwrk rtsa awmd ykec',
  },
});

const mailOptions = {
  from: 'leducchinhld@gmail.com',
  to: 'accfreefirecuaducchinh4@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});