import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSignupNotification(userData: {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    step_provider?: string;
}) {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.warn('ADMIN_EMAIL is not set, skipping signup notification');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Visible Analytics <notifications@resend.dev>',
            to: adminEmail,
            subject: '🚀 New User Signup: ' + (userData.email || userData.id),
            html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #3B82F6;">New User Joined!</h2>
          <p>A new user has just signed up for <strong>Visible Analytics</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <ul style="list-style: none; padding: 0;">
            <li><strong>Name:</strong> ${userData.first_name || 'N/A'} ${userData.last_name || ''}</li>
            <li><strong>Email:</strong> ${userData.email || 'N/A'}</li>
            <li><strong>Step Provider:</strong> ${userData.step_provider || 'N/A'}</li>
            <li><strong>User ID:</strong> <code style="background: #f4f4f4; padding: 2px 4px; border-radius: 4px;">${userData.id}</code></li>
          </ul>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from your Supabase Webhook.</p>
        </div>
      `,
        });

        if (error) {
            console.error('Error sending signup notification:', error);
            throw error;
        }

        return data;
    } catch (err) {
        console.error('Failed to send email notification:', err);
    }
}
