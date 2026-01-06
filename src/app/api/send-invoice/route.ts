import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
    try {
        const { to, invoiceNumber, pdfBase64, clientName, companyName, amount } = await req.json()

        if (!to || !pdfBase64) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // In Resend "Onboarding" mode, we must send FROM onboarding@resend.dev
        // and can only send TO the account owner's email.
        const { data, error } = await resend.emails.send({
            from: 'Invoicing App <onboarding@resend.dev>',
            to: [to],
            subject: `Invoice ${invoiceNumber} from ${companyName}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #f97316; margin-bottom: 24px;">New Invoice Received</h1>
          <p>Hi ${clientName},</p>
          <p>Please find your invoice <strong>${invoiceNumber}</strong> attached to this email.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Total Amount Due</p>
            <p style="margin: 4px 0 0 0; font-size: 32px; font-weight: bold; color: #111827;">$${amount}</p>
          </div>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p style="margin-top: 40px; border-top: 1px solid #eee; pt: 20px; font-size: 14px; color: #9ca3af;">
            Sent via ${companyName} Invoicing
          </p>
        </div>
      `,
            attachments: [
                {
                    filename: `Invoice-${invoiceNumber}.pdf`,
                    content: pdfBase64,
                },
            ],
        })

        if (error) {
            return NextResponse.json({ error }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
