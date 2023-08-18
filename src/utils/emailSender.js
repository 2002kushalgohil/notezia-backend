const nodemailer = require("nodemailer");

// -------------------- Send Email using nodemailer --------------------
const emailSender = async (option) => {
  if (!(option && option.email && option.subject && option.message)) {
    throw new Error("Incomplete email information");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: "2002kushalgohil@gmail.com",
      to: option.email,
      subject: option.subject,
      html: option.message,
    };

    await transporter.sendMail(message);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = emailSender;
