import nodemailer from "nodemailer";

const testAcc: nodemailer.TestAccount = {
    user: 'vjhslydgxmfih4bs@ethereal.email',
    pass: '3amBxBvJPYKGpJYa2P',
    smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
    imap: { host: 'imap.ethereal.email', port: 993, secure: true },
    pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
    web: 'https://ethereal.email',
}


const transporter = nodemailer.createTransport({
  host: testAcc.smtp.host,
  port: testAcc.smtp.port,
  secure: testAcc.smtp.secure, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: testAcc.user,
    pass: testAcc.pass,
  },
});

const sendEmail = async (destination: string | string[], subject: string, content: string) => {

  const info = await transporter.sendMail({
    from: `"Random User" <${testAcc.user}>`, // sender address
    to: destination,
    subject: subject,
    text: content, // plain text body
    html: "<b>Hello world?</b>",
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

export {sendEmail};