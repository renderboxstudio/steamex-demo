import { NextRequest, NextResponse } from 'next/server'
import Mailjet from 'node-mailjet'

interface BookingData {
  fullName: string
  email: string
  phone: string
  projectDate: string
  projectTime?: string
  location: string
  projectType: string
  additionalNotes?: string
  quote: number
  chatHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json()

    // Validate required fields
    const requiredFields: (keyof BookingData)[] = ['fullName', 'email', 'phone', 'projectDate', 'location', 'projectType', 'quote']
    const missingFields = requiredFields.filter(field => !bookingData[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(bookingData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Log the booking (in production, save to database)
    console.log('New carpet cleaning booking:', {
      timestamp: new Date().toISOString(),
      customer: {
        name: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone,
      },
      project: {
        type: bookingData.projectType,
        location: bookingData.location,
        preferredDate: bookingData.projectDate,
        preferredTime: bookingData.projectTime,
        estimatedQuote: bookingData.quote,
        notes: bookingData.additionalNotes,
      },
      chatHistoryLength: bookingData.chatHistory?.length || 0
    })

    // Here you would typically:
    // 1. Save to database
    // 2. Send confirmation email to customer
    // 3. Send notification to carpet cleaning team
    // 4. Integrate with CRM/scheduling system
    // 5. Send SMS confirmation

    // For now, we'll simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Send notification email to admin
    await notifyCarpetCleaningTeam(bookingData)

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully',
      bookingId: `CC-${Date.now()}`,
      estimatedResponseTime: '24 hours'
    })

  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'Failed to process booking request' },
      { status: 500 }
    )
  }
}

async function notifyCarpetCleaningTeam(bookingData: BookingData) {
  try {
    const mailjet = new Mailjet({
      apiKey: process.env.MAILJET_API_KEY || '',
      apiSecret: process.env.MAILJET_API_SECRET || ''
    })

    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.SENDER_EMAIL || 'noreply@example.com',
              Name: 'Carpet Cleaning Quote Bot'
            },
            To: [
              {
                Email: process.env.ADMIN_EMAIL || 'admin@example.com',
                Name: 'Carpet Cleaning Team'
              }
            ],
            Subject: `New Carpet Cleaning Booking - ${bookingData.fullName}`,
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Carpet Cleaning Booking Request</h2>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #374151; margin-top: 0;">Customer Information</h3>
                  <p><strong>Name:</strong> ${bookingData.fullName}</p>
                  <p><strong>Email:</strong> ${bookingData.email}</p>
                  <p><strong>Phone:</strong> ${bookingData.phone}</p>
                  <p><strong>Location:</strong> ${bookingData.location}</p>
                </div>

                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #374151; margin-top: 0;">Service Details</h3>
                  <p><strong>Service Type:</strong> ${bookingData.projectType}</p>
                  <p><strong>Preferred Date:</strong> ${bookingData.projectDate}</p>
                  ${bookingData.projectTime ? `<p><strong>Preferred Time:</strong> ${bookingData.projectTime}</p>` : ''}
                  <p><strong>Estimated Quote:</strong> $${bookingData.quote.toLocaleString()}</p>
                  ${bookingData.additionalNotes ? `<p><strong>Additional Notes:</strong> ${bookingData.additionalNotes}</p>` : ''}
                </div>

                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    <strong>Chat History Length:</strong> ${bookingData.chatHistory?.length || 0} messages
                  </p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                    <strong>Submitted:</strong> ${new Date().toLocaleString()}
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #374151;">Follow up with this lead within 24 hours for best conversion rates!</p>
                </div>
              </div>
            `,
            TextPart: `
New Carpet Cleaning Booking Request

Customer Information:
- Name: ${bookingData.fullName}
- Email: ${bookingData.email}
- Phone: ${bookingData.phone}
- Location: ${bookingData.location}

Service Details:
- Service Type: ${bookingData.projectType}
- Preferred Date: ${bookingData.projectDate}
- Preferred Time: ${bookingData.projectTime || 'Not specified'}
- Estimated Quote: $${bookingData.quote.toLocaleString()}
- Additional Notes: ${bookingData.additionalNotes || 'None'}

Chat History: ${bookingData.chatHistory?.length || 0} messages
Submitted: ${new Date().toLocaleString()}

Follow up with this lead within 24 hours for best conversion rates!
            `
          }
        ]
      })

    await request
    console.log('Notification email sent successfully to admin')
  } catch (error) {
    console.error('Failed to send notification email:', error)
    // Don't throw error to avoid failing the booking process
  }
}