const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `${process.env.FROM_NAME} <${process.env.SMTP_USERNAME}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      //SENDGRID
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT, // Port for STARTTLS
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
        authMethod: "PLAIN",
      },
      tls: {
        // Ensure compatibility with various TLS versions
        minVersion: "TLSv1.2", // Adjust this as needed (TLSv1.2 is commonly supported)
        ciphers: "SSLv3",
        rejectUnauthorized: false, // Allows self-signed certificates (use with caution)
      },
    });
  }

  async send(template, subject) {
    // RENDER HTML BASED ON A PUG TEMPLATE
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // DEFINE EMAIL OPTIONS
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    // CREATE A TRANSPORT AND SEND MAIL
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
