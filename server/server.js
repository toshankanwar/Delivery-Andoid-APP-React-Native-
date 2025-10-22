// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { db, admin } from './firebaseAdmin.js';

const app = express();
app.use(cors());
app.use(express.json());

// Brevo configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = process.env.EMAIL_FROM ;
const FROM_NAME = process.env.EMAIL_FROM_NAME ;

// Helper function to send email via Brevo
async function sendBrevoEmail(to, subject, htmlContent) {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );
    
    console.log(`✅ Email sent to ${to} | Subject: ${subject}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.response?.data || error.message);
    throw error;
  }
}

// Generate a 6-digit OTP
function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp);
  return otp;
}

// Build OTP email HTML
function getOtpEmailBody(orderId, otp) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #3b82f6; margin-top: 0;">🧁 Toshan Bakery - Order Verification</h2>
      <p>Hello 👋,</p>
      <p>Your OTP for order <strong>#${orderId.slice(-8)}</strong> is:</p>
      <div style="font-size: 32px; font-weight: bold; margin: 20px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; text-align: center; color: #10b981; letter-spacing: 4px;">
        ${otp}
      </div>
      <p style="color: #ef4444; font-weight: 500;">⏰ This OTP is valid for 10 minutes only.</p>
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">Thank you for ordering with Toshan Bakery!</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">Raipur's Most Famous Local Bakery 🍰</p>
      </div>
    </div>
  `;
}

// Email on delivery
function getDeliveryEmail(order) {
  let itemHTML = 'N/A';
  if (order.items && order.items.length > 0) {
    itemHTML = order.items.map(item => 
      `<li style="padding: 4px 0;">${item.name || 'Item'} × ${item.quantity || 1}</li>`
    ).join('');
    itemHTML = `<ul style="margin: 8px 0; padding-left: 20px;">${itemHTML}</ul>`;
  }

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="background-color: #10b981; color: white; padding: 16px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
        <h2 style="margin: 0; font-size: 24px;">✅ Order Delivered Successfully!</h2>
      </div>
      
      <p>Hi <strong>${order.address?.name || 'Customer'}</strong>,</p>
      
      <p>Your order <strong>#${order.id.slice(-8)}</strong> has been successfully delivered! 🎉</p>
      
      <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin-top: 0; color: #374151;">📦 Order Details</h3>
        <p style="margin: 8px 0;"><strong>Items:</strong></p>
        ${itemHTML}
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 4px 0;"><strong>Total Amount:</strong> ₹${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}</p>
          <p style="margin: 4px 0;"><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">Confirmed ✓</span></p>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 16px;">🙏 Thank you for your order!</p>
        <p style="margin: 8px 0 0 0; font-size: 14px;">We appreciate your support and hope you enjoy our products! 🧁</p>
      </div>
      
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">Toshan Bakery - Raipur's Most Famous Local Bakery</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 8px;">
          <a href="https://bakery.toshankanwar.website" style="color: #3b82f6; text-decoration: none;">Visit Our Shop</a> | 
          <a href="mailto:contact@toshankanwar.website" style="color: #3b82f6; text-decoration: none;">Contact Us</a>
        </p>
      </div>
    </div>
  `;
}

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: 'ok',
    service: 'Toshan Bakery Delivery OTP Server',
    timestamp: new Date().toISOString(),
    brevoConfigured: !!BREVO_API_KEY
  });
});

// Ping endpoint for keep-alive
app.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { orderId, email } = req.body;

  console.log('Incoming send-otp:', orderId, email);

  if (!orderId || !email) {
    return res.status(400).json({ success: false, message: 'Missing orderId or email.' });
  }

  const otp = generateOtp();
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60000)); // 10 mins

  try {
    await db.collection('otps').doc(orderId).set({ 
      otp: otp, 
      email: email, 
      expiresAt: expiresAt 
    });
    console.log('Saved OTP for order:', orderId);

    await sendBrevoEmail(
      email,
      '🧾 Your OTP for Toshan Bakery Order',
      getOtpEmailBody(orderId, otp)
    );

    console.log('OTP sent to', email);
    return res.json({ success: true });

  } catch (err) {
    console.error('Error sending OTP:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { orderId, otp } = req.body;

  console.log('Incoming verify-otp:', orderId, otp);

  if (!orderId || !otp) {
    return res.status(400).json({ valid: false, error: 'orderId and otp are required.' });
  }

  try {
    const otpDoc = await db.collection('otps').doc(orderId).get();

    if (!otpDoc.exists) {
      console.warn('No OTP record for', orderId);
      return res.json({ valid: false });
    }

    const data = otpDoc.data();
    const now = new Date();
    const expiresAt = data.expiresAt.toDate();

    console.log('Stored OTP:', data.otp, '| Expires:', expiresAt.toISOString());

    if (data.otp === otp && expiresAt > now) {
      await otpDoc.ref.delete();

      const orderRef = db.collection('orders').doc(orderId);
      await orderRef.update({
        delivered: true,
        orderStatus: 'delivered',
        paymentStatus: 'confirmed',
      });

      const updatedOrder = await orderRef.get();
      const orderData = updatedOrder.data();
      const orderObj = { id: orderId, ...orderData };

      await sendBrevoEmail(
        data.email,
        '✅ Your Toshan Bakery Order has been Delivered!',
        getDeliveryEmail(orderObj)
      );

      console.log('OTP verified and delivery email sent.');
      return res.json({ valid: true });
    } else {
      console.warn('OTP invalid or expired.');
      return res.json({ valid: false });
    }
  } catch (err) {
    console.error('Error in verify-otp:', err);
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
});

// Self-ping service
let pingInterval = null;

function startSelfPing() {
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  
  if (!SELF_URL) {
    console.warn('⚠️  No SERVER_URL set. Self-ping disabled.');
    return;
  }

  const PING_INTERVAL = 12 * 60 * 1000; // 12 minutes

  console.log('🔔 Starting self-ping service...');
  console.log(`📍 Target URL: ${SELF_URL}/ping`);
  console.log(`⏱️  Interval: Every 14 minutes`);

  // Initial ping after 1 minute
  setTimeout(() => performPing(SELF_URL), 60000);

  // Regular pings
  pingInterval = setInterval(() => performPing(SELF_URL), PING_INTERVAL);

  console.log('✅ Self-ping service started');
}

async function performPing(url) {
  try {
    const response = await axios.get(`${url}/ping`, { timeout: 10000 });
    console.log(`🏓 Self-ping successful at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  } catch (error) {
    console.error('❌ Self-ping failed:', error.message);
  }
}

function stopSelfPing() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('🛑 Self-ping service stopped');
  }
}

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🍰 Toshan Bakery OTP Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📧 Email From: ${FROM_EMAIL}`);
  console.log(`🔑 Brevo API: ${BREVO_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Start self-ping in production
  if (process.env.NODE_ENV === 'production') {
    startSelfPing();
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received');
  stopSelfPing();
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received');
  stopSelfPing();
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});
