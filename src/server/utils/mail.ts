import nodemailer from "nodemailer";
import { env } from "~/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendReceipt(
  email: string,
  file: { name: string; buffer: Buffer },
) {
  try {
    const mailOptions = {
      from: `"St. Joseph Church, Belman" <${env.SMTP_USER}>`,
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

type ContactNotification = {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: Date;
};

export async function sendContactNotification(inquiry: ContactNotification) {
  try {
    await transporter.sendMail({
      from: `"St. Joseph Church Website" <${env.SMTP_USER}>`,
      to: env.SMTP_USER,
      replyTo: inquiry.email,
      subject: `New website enquiry: ${inquiry.subject}`,
      text: [
        "A new contact enquiry was submitted through the parish website.",
        "",
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Phone: ${inquiry.phone ?? "Not provided"}`,
        `Subject: ${inquiry.subject}`,
        `Submitted: ${inquiry.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
        "",
        inquiry.message,
      ].join("\n"),
    });
    return true;
  } catch (error) {
    console.error("Contact notification email failed:", error);
    return false;
  }
}

type DonationNotification = {
  paymentId: string;
  type: "CHURCH" | "CHAPEL" | "THANKSGIVING";
  amount: number;
  forWhom: string;
  byWhom: string;
  email: string;
  massTiming: string | null;
};

export async function sendDonationNotification(donation: DonationNotification) {
  try {
    const amount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(donation.amount);

    await transporter.sendMail({
      from: `"St. Joseph Church Website" <${env.SMTP_USER}>`,
      to: env.SMTP_USER,
      replyTo: donation.email,
      subject: `New successful donation: ${amount}`,
      text: [
        "A donation was completed successfully through the parish website.",
        "",
        `Donor: ${donation.byWhom}`,
        `Email: ${donation.email}`,
        `Amount: ${amount}`,
        `Purpose: ${donation.type}`,
        `Offering for: ${donation.forWhom}`,
        `Mass timing: ${donation.massTiming ?? "Not applicable"}`,
        `Payment ID: ${donation.paymentId}`,
      ].join("\n"),
    });
    return true;
  } catch (error) {
    console.error("Donation notification email failed:", error);
    return false;
  }
}
