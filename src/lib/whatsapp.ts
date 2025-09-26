import { Apartment, Booking } from '@/lib/types';

/**
 * Generate WhatsApp chat URL for contacting the apartment owner
 */
export function generateWhatsAppUrl(apartment: Apartment, booking?: Booking): string {
  // Use WhatsApp number if available, otherwise fall back to contact phone
  const phoneNumber = apartment.whatsapp_number || apartment.contact_phone;
  
  if (!phoneNumber) {
    console.warn('No WhatsApp or contact phone number available for apartment:', apartment.id);
    return '';
  }

  // Clean the phone number (remove all non-digit characters)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  // Create the message based on whether we have booking details
  let message = '';
  
  if (booking) {
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

    message = `Hi! I'm interested in booking ${apartment.title} for ${nights} nights (${checkInDate} to ${checkOutDate}) for ${booking.total_guests} guest${booking.total_guests > 1 ? 's' : ''}. Total: $${booking.total_price}. Please let me know about availability and payment details.`;
  } else {
    message = `Hi! I'm interested in ${apartment.title}. Could you please provide more information about availability and pricing?`;
  }

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Return WhatsApp URL
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp chat in a new window/tab
 */
export function openWhatsAppChat(apartment: Apartment, booking?: Booking): void {
  const whatsappUrl = generateWhatsAppUrl(apartment, booking);
  
  if (!whatsappUrl) {
    console.error('Unable to generate WhatsApp URL - no phone number available');
    return;
  }

  // Open in new window/tab
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Generate a WhatsApp button element with proper styling
 */
export function createWhatsAppButton(apartment: Apartment, booking?: Booking, className?: string): string {
  const whatsappUrl = generateWhatsAppUrl(apartment, booking);
  
  if (!whatsappUrl) {
    return '';
  }

  return `
    <a href="${whatsappUrl}" 
       target="_blank" 
       rel="noopener noreferrer"
       class="${className || 'whatsapp-button'}"
       style="
         background: #25d366;
         color: white;
         padding: 12px 24px;
         border-radius: 6px;
         text-decoration: none;
         display: inline-block;
         font-weight: bold;
         transition: background-color 0.3s ease;
       "
       onmouseover="this.style.backgroundColor='#128c7e'"
       onmouseout="this.style.backgroundColor='#25d366'">
      💬 Contact on WhatsApp
    </a>
  `;
}
