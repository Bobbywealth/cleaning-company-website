import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingCalendar from './BookingCalendar';
import PaymentForm from './PaymentForm';
import { useApp } from '@/context/AppContext';

const OnlineBooking = () => {
  const navigate = useNavigate();
  const { submitLead } = useApp();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    service: '',
    propertySize: '',
    bathrooms: '',
    frequency: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Continue = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setContactData({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      });
      setStep(2);
    }
  };

  const handleStep2Continue = (e) => {
    e.preventDefault();
    if (!formData.service) {
      alert('Please select a service');
      return;
    }
    setServiceData({
      service: formData.service,
      propertySize: formData.propertySize,
      bathrooms: formData.bathrooms,
      frequency: formData.frequency,
      notes: formData.notes
    });
    setStep(3);
  };

  const handleCalendarContinue = () => {
    setStep(4);
  };

  const handlePaymentSuccess = (result) => {
    setPaymentComplete(true);
    setPaymentResult(result);

    const leadData = {
      name: contactData.name,
      phone: contactData.phone,
      email: contactData.email,
      address: contactData.address,
      service: serviceData.service,
      notes: `BOOKING CONFIRMED\nDate: ${selectedDate?.toLocaleDateString()}\nTime: ${selectedTime}\nProperty: ${serviceData.propertySize}\nBathrooms: ${serviceData.bathrooms}\nFrequency: ${serviceData.frequency}\nPayment: Deposit paid via ${result.id}`
    };

    submitLead(leadData);

    setTimeout(() => {
      navigate('/thank-you', {
        state: {
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          service: serviceData.service,
          date: selectedDate?.toLocaleDateString(),
          time: selectedTime,
          paymentId: result.id
        }
      });
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const calculateEstimate = () => {
    const basePrice = formData.service === 'deep' ? 260 : formData.service === 'commercial' ? 300 : 120;
    const sizeMultiplier = formData.propertySize === 'Large Home' ? 1.5 : formData.propertySize === '4+ Bedrooms' ? 1.3 : 1;
    const bathroomExtra = (parseInt(formData.bathrooms) || 1) * 25;
    const deposit = basePrice * sizeMultiplier + bathroomExtra;
    return Math.round(deposit);
  };

  const inputClass = (field) => `w-full rounded-xl border-2 ${errors[field] ? 'border-red-400' : 'border-slate-300'} px-4 py-3 text-lg outline-none focus:border-cyan-400 transition`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
            Book Your Cleaning Online
          </h1>
          <p className="text-slate-500">Complete all steps to schedule your NJ cleaning service</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          {['Contact', 'Service', 'Schedule', 'Payment'].map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-cyan-500' : step === i + 1 ? 'text-cyan-600' : 'text-slate-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step > i + 1 ? 'bg-cyan-500 text-white' : step === i + 1 ? 'bg-cyan-100 border-2 border-cyan-500 text-cyan-600' : 'bg-slate-200 text-slate-400'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className="font-semibold text-sm hidden md:inline">{label}</span>
              </div>
              {i < 3 && <div className={`h-1 w-8 rounded ${step > i + 1 ? 'bg-cyan-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white rounded-3xl shadow-xl border-slate-200 overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {step === 1 && (
                <form onSubmit={handleStep1Continue} className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Step 1: Your Contact Information</h2>

                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-2">Full Name *</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputClass('name')}
                      placeholder="John Smith"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-semibold text-slate-700 mb-2">Phone *</label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={inputClass('phone')}
                        placeholder="(862) 285-4949"
                        type="tel"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-slate-700 mb-2">Email *</label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClass('email')}
                        placeholder="john@example.com"
                        type="email"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-2">Service Address</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={inputClass('address')}
                      placeholder="123 Main St, Jersey City, NJ"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl py-4 text-lg font-bold">
                    Continue to Service Selection →
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleStep2Continue} className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Step 2: Select Your Service</h2>

                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-2">Service Type *</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className={inputClass('service')}
                    >
                      <option value="">Select a service...</option>
                      <option value="residential">🏠 Residential Cleaning - From $120</option>
                      <option value="commercial">🏢 Commercial Cleaning - From $300</option>
                      <option value="deep">✨ Deep Cleaning - From $260</option>
                      <option value="move">🚚 Move In/Out - From $200</option>
                      <option value="construction">🏗️ Post-Construction - From $350</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-semibold text-slate-700 mb-2">Property Size</label>
                      <select
                        name="propertySize"
                        value={formData.propertySize}
                        onChange={handleInputChange}
                        className={inputClass('propertySize')}
                      >
                        <option value="">Select size...</option>
                        <option value="Studio">Studio / 1 Bedroom</option>
                        <option value="2 Bedroom">2 Bedrooms</option>
                        <option value="3 Bedroom">3 Bedrooms</option>
                        <option value="4+ Bedroom">4+ Bedrooms</option>
                        <option value="Large Home">Large Home</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-slate-700 mb-2">Bathrooms</label>
                      <select
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className={inputClass('bathrooms')}
                      >
                        <option value="">Select...</option>
                        <option value="1">1 Bathroom</option>
                        <option value="2">2 Bathrooms</option>
                        <option value="3">3 Bathrooms</option>
                        <option value="4+">4+ Bathrooms</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-2">Frequency</label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      className={inputClass('frequency')}
                    >
                      <option value="">Select frequency...</option>
                      <option value="One-time">One-time Clean</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-2">Special Instructions</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className={inputClass('notes')}
                      rows="3"
                      placeholder="Any special requests or notes..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl py-4">
                      ← Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl py-4 text-lg font-bold">
                      Continue to Schedule →
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Step 3: Choose Date & Time</h2>
                  <BookingCalendar
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateChange={setSelectedDate}
                    onTimeChange={setSelectedTime}
                    onContinue={handleCalendarContinue}
                  />
                  <Button type="button" onClick={() => setStep(2)} variant="outline" className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl py-3">
                    ← Back to Service Selection
                  </Button>
                </div>
              )}

              {step === 4 && !paymentComplete && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Step 4: Payment</h2>

                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-cyan-100">
                      <p><strong>Name:</strong> {contactData?.name}</p>
                      <p><strong>Service:</strong> {serviceData?.service}</p>
                      <p><strong>Property:</strong> {serviceData?.propertySize} • {serviceData?.bathrooms} baths</p>
                      <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()} at {selectedTime}</p>
                      <p><strong>Frequency:</strong> {serviceData?.frequency}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-cyan-400/30">
                      <p className="text-3xl font-black">Deposit: ${calculateEstimate()}</p>
                      <p className="text-sm text-cyan-100 mt-1">Remaining balance due after service</p>
                    </div>
                  </div>

                  <PaymentForm
                    amount={calculateEstimate()}
                    serviceDetails={{
                      service: serviceData?.service,
                      propertySize: serviceData?.propertySize
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />

                  <Button type="button" onClick={() => setStep(3)} variant="outline" className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl py-3">
                    ← Back to Calendar
                  </Button>
                </div>
              )}

              {paymentComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Payment Successful!</h2>
                  <p className="text-slate-500 mb-4">Your cleaning has been booked for {selectedDate?.toLocaleDateString()} at {selectedTime}</p>
                  <p className="text-cyan-500 font-semibold">Confirmation email sent to {contactData?.email}</p>
                  <div className="mt-6 animate-pulse">
                    <p className="text-slate-400 text-sm">Redirecting to confirmation page...</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OnlineBooking;