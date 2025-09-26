import nodemailer from 'nodemailer';
import { Apartment, Booking } from '@/lib/types';

// Email configuration - using your preferred Gmail setup
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
};

// Create transporter
const createTransporter = () => {
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    throw new Error('Email credentials not configured. Please set EMAIL_SENDER and GOOGLE_APP_PASSWORD environment variables.');
  }
  
  return nodemailer.createTransport(emailConfig);
};

// Email templates
export const createOwnerEmailTemplate = (booking: Booking, apartment: Apartment) => {
  const checkInDate = new Date(booking.check_in).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkOutDate = new Date(booking.check_out).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nights = Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24));

  return {
    subject: `New Booking Request - ${apartment.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .booking-details { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .guest-info { background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .apartment-info { background: #e3f2fd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .price-highlight { background: #4caf50; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; }
          .whatsapp-btn { background: #25d366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 15px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 New Booking Request</h1>
            <p>A new booking request has been submitted for <strong>${apartment.title}</strong></p>
          </div>

          <div class="booking-details">
            <h2>📅 Booking Details</h2>
            <p><strong>Check-in:</strong> ${checkInDate}</p>
            <p><strong>Check-out:</strong> ${checkOutDate}</p>
            <p><strong>Duration:</strong> ${nights} night${nights > 1 ? 's' : ''}</p>
            <p><strong>Guests:</strong> ${booking.total_guests} guest${booking.total_guests > 1 ? 's' : ''}</p>
            <p><strong>Total Price:</strong> $${booking.total_price}</p>
            ${booking.notes ? `<p><strong>Guest Notes:</strong> ${booking.notes}</p>` : ''}
          </div>

          <div class="guest-info">
            <h2>👤 Guest Information</h2>
            <p><strong>Name:</strong> ${booking.guest_name}</p>
            <p><strong>Email:</strong> ${booking.guest_email}</p>
            <p><strong>Phone:</strong> ${booking.guest_phone || 'Not provided'}</p>
          </div>

          <div class="apartment-info">
            <h2>🏡 Apartment Details</h2>
            <p><strong>Title:</strong> ${apartment.title}</p>
            <p><strong>Address:</strong> ${apartment.address}</p>
            <p><strong>Price per night:</strong> $${apartment.price_per_night}</p>
            <p><strong>Max guests:</strong> ${apartment.max_guests}</p>
          </div>

          <div class="price-highlight">
            💰 Total Amount: $${booking.total_price}
          </div>

          <div style="text-align: center;">
            <a href="https://wa.me/${apartment.whatsapp_number?.replace(/[^0-9]/g, '') || apartment.contact_phone?.replace(/[^0-9]/g, '')}" 
               class="whatsapp-btn" 
               target="_blank">
              💬 Contact Guest on WhatsApp
            </a>
          </div>

          <div class="footer">
            <p>Please contact the guest to confirm the booking and arrange payment.</p>
            <p>You can manage this booking in your admin panel.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

export const createGuestEmailTemplate = (booking: Booking, apartment: Apartment) => {
  const checkInDate = new Date(booking.check_in).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkOutDate = new Date(booking.check_out).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nights = Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24));

  return {
    subject: `Booking Request Confirmation - ${apartment.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4caf50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
          .booking-details { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .apartment-info { background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .contact-info { background: #e3f2fd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .price-highlight { background: #ff9800; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; }
          .whatsapp-btn { background: #25d366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 15px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Request Received!</h1>
            <p>Thank you for your interest in <strong>${apartment.title}</strong></p>
          </div>

          <div class="booking-details">
            <h2>📅 Your Booking Details</h2>
            <p><strong>Check-in:</strong> ${checkInDate}</p>
            <p><strong>Check-out:</strong> ${checkOutDate}</p>
            <p><strong>Duration:</strong> ${nights} night${nights > 1 ? 's' : ''}</p>
            <p><strong>Guests:</strong> ${booking.total_guests} guest${booking.total_guests > 1 ? 's' : ''}</p>
            <p><strong>Total Price:</strong> $${booking.total_price}</p>
            ${booking.notes ? `<p><strong>Your Notes:</strong> ${booking.notes}</p>` : ''}
          </div>

          <div class="apartment-info">
            <h2>🏡 Apartment Information</h2>
            <p><strong>Title:</strong> ${apartment.title}</p>
            <p><strong>Address:</strong> ${apartment.address}</p>
            <p><strong>Description:</strong> ${apartment.description}</p>
            <p><strong>Price per night:</strong> $${apartment.price_per_night}</p>
          </div>

          <div class="price-highlight">
            💰 Total Amount: $${booking.total_price}
          </div>

          <div class="contact-info">
            <h2>📞 Next Steps</h2>
            <p>We have received your booking request and will contact you shortly to confirm availability and arrange payment.</p>
            <p><strong>Contact Information:</strong></p>
            <p>📧 Email: ${apartment.contact_email}</p>
            ${apartment.contact_phone ? `<p>📞 Phone: ${apartment.contact_phone}</p>` : ''}
          </div>

          <div style="text-align: center;">
            <a href="https://wa.me/${apartment.whatsapp_number?.replace(/[^0-9]/g, '') || apartment.contact_phone?.replace(/[^0-9]/g, '')}" 
               class="whatsapp-btn" 
               target="_blank">
              💬 Contact Us on WhatsApp
            </a>
          </div>

          <div class="footer">
            <p>We look forward to hosting you in beautiful Mendoza!</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Send email function
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Mendoza Apartments" <${emailConfig.auth.user}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

// Send booking confirmation emails
export async function sendBookingEmails(booking: Booking, apartment: Apartment): Promise<{ ownerSent: boolean; guestSent: boolean }> {
  try {
    // Get owner email from environment variable
    const ownerEmail = process.env.EMAIL_RECIPIENT;
    if (!ownerEmail) {
      console.error('❌ EMAIL_RECIPIENT environment variable not set');
      return { ownerSent: false, guestSent: false };
    }

    // Create email templates
    const ownerEmailTemplate = createOwnerEmailTemplate(booking, apartment);
    const guestEmailTemplate = createGuestEmailTemplate(booking, apartment);

    // Send emails in parallel
    const [ownerSent, guestSent] = await Promise.all([
      sendEmail(ownerEmail, ownerEmailTemplate.subject, ownerEmailTemplate.html),
      sendEmail(booking.guest_email, guestEmailTemplate.subject, guestEmailTemplate.html)
    ]);

    return { ownerSent, guestSent };
  } catch (error) {
    console.error('❌ Error sending booking emails:', error);
    return { ownerSent: false, guestSent: false };
  }
}
