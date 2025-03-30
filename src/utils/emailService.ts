import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

interface WelcomeEmailParams {
  to_email: string;
  to_name: string;
}

export const sendWelcomeEmail = async ({ to_email, to_name }: WelcomeEmailParams) => {
  try {
    const templateParams = {
      to_name,
      to_email,
      from_name: "R-Estate Market",
      reply_to: to_email,
      message: `Welcome to R-Estate Market! Your account has been created successfully. You can now start exploring properties and creating listings.

Key Features:
- Browse properties for sale or rent
- Create your own property listings
- Save favorite properties
- Contact property owners directly

Get started by browsing our available properties or creating your first listing.

Best regards,
The R-Estate Market Team`
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    if (response.status !== 200) {
      throw new Error('Failed to send email');
    }

    console.log('Welcome email sent successfully to:', to_email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}; 