import { NextRequest, NextResponse } from 'next/server';
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, customerName } = body; // Include dynamic data if necessary

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    // Send one email to the user and CC the admin
    await sendgrid.send({
      to: email, // Recipient email
      from: 'info@cinetechai.com', // Your email address
      cc: 'info@cinetechai.com', // CC to your admin email
      templateId: 'd-5a3e779c123646da94fecd7ffe9ef0fe', // Your new template ID
    });

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}
