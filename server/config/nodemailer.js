const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
})

const mailOptions = (to, subject, text) => {
    return {
        from: process.env.SENDER_EMAIL,
        to, 
        subject, 
        text
    }
}

module.exports = {transporter, mailOptions}