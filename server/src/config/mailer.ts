import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail adresin
    pass: process.env.EMAIL_PASS, // Gmail'den aldığın "Uygulama Şifresi"
  },
});

// Mail gönderme yardımcı fonksiyonu
export const sendInvitationEmail = async (
  to: string,
  projectName: string,
  inviteLink: string,
) => {
  const mailOptions = {
    from: `"WorkHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Invitation to join project: ${projectName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #333;">You've been invited!</h2>
        <p>You have been invited to collaborate on the project <strong>${projectName}</strong> on WorkHub.</p>
        <p>To accept the invitation and start working, please register by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Project</a>
        </div>
        <p style="font-size: 12px; color: #777;">If you already have an account, simply log in after clicking the link.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
