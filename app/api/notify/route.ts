import { NextRequest, NextResponse } from 'next/server';
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    // Send one email to the user and CC the admin (info@cinetechai.com)
    await sendgrid.send({
      to: email, // Recipient email
      from: 'info@cinetechai.com', // Your email address
      cc: 'info@cinetechai.com', // CC to your admin email
      subject: 'Thank you for your interest in CineTech AI!',
      html: `<p>Dear CineTech enthusiast,</p>
             <p>Thank you for signing up to receive updates about our platform. We are excited to welcome you once we go live!</p>
             <p>Stay tuned for more updates.</p>
             <p>Best regards,</p>
             <p>The CineTech AI Team</p>`,
    });

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}
