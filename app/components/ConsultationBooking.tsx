'use client'

import React, { useState } from 'react'
import { X, Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle } from 'lucide-react'

interface ConsultationBookingProps {
  isOpen: boolean
  onClose: () => void
  customerContext?: {
    location?: string
    serviceType?: string
    sqft?: number
    quote?: number
  }
  standalone?: boolean
}

interface BookingForm {
  name: string
  email: string
  phone: string
  address: string
  preferredDate: string
  preferredTime: string
  notes: string
}

export default function ConsultationBooking({ isOpen, onClose, customerContext, standalone = false }: ConsultationBookingProps) {
  const [form, setForm] = useState<BookingForm>({
    name: '',
    email: '',
    phone: '',
    address: customerContext?.location || '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const bookingData = {
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        projectDate: form.preferredDate,
        projectTime: form.preferredTime,
        location: form.address,
        projectType: customerContext?.serviceType || 'General Carpet Cleaning',
        additionalNotes: form.notes,
        quote: customerContext?.quote || 0,
        chatHistory: [] // You can pass actual chat history if available
      }

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit booking')
      }

      setIsSubmitted(true)
      console.log('Booking submitted successfully:', result)
      
      // Auto-close after 3 seconds if successful
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        setForm({
          name: '',
          email: '',
          phone: '',
          address: customerContext?.location || '',
          preferredDate: '',
          preferredTime: '',
          notes: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Booking submission failed:', error)
      alert('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ]

  // Render as standalone component (beside chatbot)
  if (standalone) {
    return (
      <div className="flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[70vh] min-h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Book Carpet Cleaning Appointment</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Carpet Cleaning Appointment Booked!</h3>
              <p className="text-gray-600 mb-4">
                We'll contact you within 24 hours to confirm your appointment.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                <p><strong>What's next:</strong></p>
                <p>• You'll receive a confirmation email</p>
                <p>• Our carpet cleaning specialist will call to confirm details</p>
                <p>• Free on-site assessment if needed</p>
              </div>
            </div>
          ) : (
            <>
              {/* Project Summary */}
              {customerContext && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Project Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {customerContext.serviceType && (
                      <p>• Service Type: {customerContext.serviceType.charAt(0).toUpperCase() + customerContext.serviceType.slice(1)}</p>
                    )}
                    {customerContext.sqft && (
                      <p>• Size: {customerContext.sqft.toLocaleString()} sqft</p>
                    )}
                    {customerContext.quote && (
                      <p>• Estimated Quote: ${customerContext.quote.toLocaleString()}</p>
                    )}
                    {customerContext.location && (
                      <p>• Location: {customerContext.location}</p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Property Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="123 Main St, City, ON"
                  />
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={form.preferredDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Preferred Time *
                    </label>
                    <select
                      name="preferredTime"
                      value={form.preferredTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Any specific concerns or requests..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                >
                  {isSubmitting ? 'Booking...' : 'Book Carpet Cleaning Appointment'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to be contacted about your carpet cleaning appointment.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }

  // Render as modal (original behavior)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Book Carpet Cleaning Appointment</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Carpet Cleaning Appointment Booked!</h3>
              <p className="text-gray-600 mb-4">
                We'll contact you within 24 hours to confirm your appointment.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                <p><strong>What's next:</strong></p>
                <p>• You'll receive a confirmation email</p>
                <p>• Our carpet cleaning specialist will call to confirm details</p>
                <p>• Free on-site assessment if needed</p>
              </div>
            </div>
          ) : (
            <>
              {/* Project Summary */}
              {customerContext && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Project Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {customerContext.serviceType && (
                      <p>• Service Type: {customerContext.serviceType.charAt(0).toUpperCase() + customerContext.serviceType.slice(1)}</p>
                    )}
                    {customerContext.sqft && (
                      <p>• Size: {customerContext.sqft.toLocaleString()} sqft</p>
                    )}
                    {customerContext.quote && (
                      <p>• Estimated Quote: ${customerContext.quote.toLocaleString()}</p>
                    )}
                    {customerContext.location && (
                      <p>• Location: {customerContext.location}</p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Property Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="123 Main St, City, ON"
                  />
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={form.preferredDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Preferred Time *
                    </label>
                    <select
                      name="preferredTime"
                      value={form.preferredTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Any specific concerns or requests..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                >
                  {isSubmitting ? 'Booking...' : 'Book Carpet Cleaning Appointment'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to be contacted about your carpet cleaning appointment.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}