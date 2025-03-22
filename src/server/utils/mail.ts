/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendReceipt(email: string, file: { name: string; buffer: Buffer }) {
  try {
    const mailOptions = {
      from: `"St. Joseph Church, Belman" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Donation Receipt",
      text: "Attached is your donation receipt. We are truly grateful for your kindness and support. Your generosity is a blessing, and we deeply appreciate your willingness to give. Every gift, no matter the amount, is a reflection of a generous heart. Your contribution means so much, and we thank you for being a part of this journey. May you be blessed abundantly for your kindness. Thank you once again for your support!",
      attachments: [
        {
          filename: file.name, // Use original file name
          content: file.buffer, // Attach the file as Buffer
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Receipt sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: (error as Error).message };
  }
}
