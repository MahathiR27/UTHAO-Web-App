import nodemailer from "nodemailer";
import dotenv from "dotenv";

let SEND_EMAILS = false;

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, subject, body) => {
  if (SEND_EMAILS) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: body,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully to:", email);
      return true;
    } catch (err) {
      console.error("emailService => sendEmail()");
      return false;
    }
  } else {
    console.log(
      `Email sending is disabled.\nEmail to: ${email}\nSubject: ${subject}\nBody: ${body}`
    );
    return true;
  }
};

export const sendOTP = async (email, otp) => {
  const subject = "Your Login OTP - UTHAO";
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d4d2d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; border-bottom: 3px solid #22c55e;">
        <h1 style="color: #22c55e; margin: 0; font-size: 28px; text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);">UTHAO</h1>
      </div>
      <div style="background-color: #1a1a1a; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <h2 style="color: #22c55e; margin-top: 0;">Your Login OTP</h2>
        <p style="color: #d1d5db; font-size: 16px; line-height: 1.5;">
          Use the following One-Time Password to complete your login:
        </p>
        <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); border: 2px solid #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);">
          <span style="font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 8px; text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);">${otp}</span>
        </div>
      </div>
    </div>
  `;
  await sendEmail(email, subject, body);
};

export const sendPromocode = async (email, promoCodes) => {
  const subject = "Your UTHAO Promocode!";
  
  // Generate promo code list HTML
  const promoCodesHTML = promoCodes.map(promo => `
    <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);">
      <div style="text-align: center;">
        <span style="font-size: 24px; font-weight: bold; color: #22c55e; letter-spacing: 4px; text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);">${promo.code}</span>
      </div>
      <p style="text-align: center; margin-top: 10px; color: #10b981; font-weight: bold; font-size: 18px;">${promo.discount}% OFF</p>
    </div>
  `).join('');

  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d4d2d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; border-bottom: 3px solid #22c55e;">
        <h1 style="color: #22c55e; margin: 0; font-size: 28px; text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);">UTHAO</h1>
      </div>
      <div style="background-color: #1a1a1a; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <h2 style="color: #22c55e; margin-top: 0;">🎉 Your Exclusive Promo Codes!</h2>
        <p style="color: #d1d5db; font-size: 16px; line-height: 1.5;">
          Thank you for joining UTHAO through a referral! Here are your <strong style="color: #22c55e;">3 exclusive one-time promo codes</strong>:
        </p>
        ${promoCodesHTML}
        <div style="background-color: #0d4d2d; border-left: 4px solid #22c55e; padding: 15px; margin-top: 30px; border-radius: 4px;">
          <p style="color: #d1d5db; margin: 0; font-size: 14px;">
            <strong style="color: #22c55e;">Important:</strong> Each promo code can only be used once. Apply them at checkout to get amazing discounts on your orders!
          </p>
        </div>
        <p style="margin-top: 32px; color: #22c55e; font-size: 0.95rem; text-align: center;">
          Happy ordering with UTHAO!
        </p>
      </div>
    </div>
  `;
  await sendEmail(email, subject, body);
};

export const sendRideCompletionEmail = async (email, name, price, from, to, distance, duration, completedAt) => {
  const subject = "Your Ride Receipt - UTHAO";
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d4d2d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; border-bottom: 3px solid #22c55e;">
        <h1 style="color: #22c55e; margin: 0; font-size: 28px; text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);">UTHAO</h1>
      </div>
      <div style="background-color: #1a1a1a; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); color: #d1d5db;">
        <h2 style="color: #22c55e; margin-top: 0;">Thank you, ${name}!</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Your ride is complete. Here is your receipt:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; color: #d1d5db;">
          <tr>
            <td style="padding: 8px 0; color: #22c55e;">From:</td>
            <td style="padding: 8px 0;">${from}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #22c55e;">To:</td>
            <td style="padding: 8px 0;">${to}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #22c55e;">Distance:</td>
            <td style="padding: 8px 0;">${distance} km</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #22c55e;">Duration:</td>
            <td style="padding: 8px 0;">${duration} min</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #22c55e;">Fare:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #22c55e;">৳${price}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #22c55e;">Completed At:</td>
            <td style="padding: 8px 0;">${completedAt}</td>
          </tr>
        </table>
        <p style="margin-top: 32px; color: #22c55e; font-size: 0.95rem; text-align: center;">
          Thank you for choosing UTHAO!
        </p>
      </div>
    </div>
  `;
  await sendEmail(email, subject, body);
};

export const sendOrderReceipt = async (email, name, orderDetails) => {
  const subject = "Your Order Receipt - UTHAO";
  const body = ``;
  await sendEmail(email, subject, body);
}

export const sendReservationConfirmation = async (email, name, reservationDetails) => {
  const subject = "Your Reservation Confirmation - UTHAO";
  const body = ``;
  await sendEmail(email, subject, body);
}