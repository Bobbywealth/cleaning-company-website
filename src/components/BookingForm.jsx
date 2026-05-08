import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const serviceTypes = [
  { id: 'residential', icon: '🏠', name: 'Residential Cleaning', desc: 'Homes, apartments, condos' },
  { id: 'commercial', icon: '🏢', name: 'Commercial Cleaning', desc: 'Offices, retail, businesses' },
  { id: 'deep', icon: '✨', name: 'Deep Cleaning', desc: 'Thorough top-to-bottom clean' },
  { id: 'move', icon: '🚚', name: 'Move In/Out', desc: 'Pre/post move cleaning' },
  { id: 'construction', icon: '🏗️', name: 'Post-Construction', desc: 'After renovation cleanup' },
];

const propertySizes = [
  { id: 'studio', label: 'Studio/1 Bedroom', sqft: 'Under 700 sq ft' },
  { id: '2bed', label: '2 Bedrooms', sqft: '700-1,000 sq ft' },
  { id: '3bed', label: '3 Bedrooms', sqft: '1,000-1,500 sq ft' },
  { id: '4bed', label: '4+ Bedrooms', sqft: '1,500-2,500 sq ft' },
  { id: 'large', label: 'Large Home', sqft: '2,500+ sq ft' },
  { id: 'small-office', label: 'Small Office', sqft: 'Under 2,000 sq ft' },
  { id: 'medium-office', label: 'Medium Office', sqft: '2,000-5,000 sq ft' },
  { id: 'large-office', label: 'Large Office', sqft: '5,000+ sq ft' },
];

const BookingForm = ({ onSuccess }) => {
  const { submitLead } = useApp();
  
  // Step 1: Contact Info (submits immediately)
  const [step1Data, setStep1Data] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [step1Errors, setStep1Errors] = useState({});
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [leadId, setLeadId] = useState(null);
  
  // Step 2: Property Details
  const [step2Data, setStep2Data] = useState({
    serviceType: '',
    propertySize: '',
    bathrooms: '',
    frequency: '',
    specialRequests: ''
  });
  const [selectedService, setSelectedService] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate Step 1
  const validateStep1 = () => {
    const errors = {};
    if (!step1Data.name.trim()) errors.name = 'Name is required';
    if (!step1Data.phone.trim()) errors.phone = 'Phone is required';
    if (!step1Data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1Data.email)) {
      errors.email = 'Valid email required';
    }
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Step 1 immediately
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lead = submitLead({
      name: step1Data.name,
      phone: step1Data.phone,
      email: step1Data.email,
      service: 'Pending Selection',
      notes: 'Contact info submitted - awaiting property details'
    });
    
    setLeadId(lead.id);
    setContactSubmitted(true);
    setIsSubmitting(false);
  };

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep2Data(prev => ({ ...prev, serviceType: service.name }));
  };

  // Submit Step 2 (complete the lead)
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    
    if (!step2Data.serviceType) {
      alert('Please select a service type');
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update lead with full details
    const fullNotes = `
Contact: ${step1Data.name} | ${step1Data.phone} | ${step1Data.email}
Service: ${step2Data.serviceType}
Property: ${step2Data.propertySize} | ${step2Data.bathrooms} bathrooms
Frequency: ${step2Data.frequency || 'One-time'}
Special Requests: ${step2Data.specialRequests || 'None'}
    `.trim();
    
    // Update lead with full details
    const leads = JSON.parse(localStorage.getItem('360cleaning_leads') || '[]');
    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          service: step2Data.serviceType,
          notes: fullNotes,
          propertySize: step2Data.propertySize,
          bathrooms: step2Data.bathrooms,
          frequency: step2Data.frequency
        };
      }
      return l;
    });
    localStorage.setItem('360cleaning_leads', JSON.stringify(updatedLeads));
    
    setShowSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 3000);
  };

  const getRelevantSizes = () => {
    if (selectedService?.id === 'commercial') {
      return propertySizes.filter(s => s.label.includes('Office'));
    }
    return propertySizes.filter(s => !s.label.includes('Office'));
  };

  // Show success screen
  if (showSuccess) {
    return (
      <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Quote Request Received!</h3>
          <p className="text-slate-600 text-lg mb-4">
            Thanks {step1Data.name}! We've received your request and will contact you at <span className="text-cyan-600 font-semibold">{step1Data.phone}</span> within 2 hours with your custom quote.
          </p>
          <div className="bg-white/70 rounded-xl p-4 text-left border border-green-200">
            <p className="text-sm text-slate-500 mb-2 font-medium">What happens next:</p>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>✅ We'll review your {step2Data.serviceType} request</li>
              <li>✅ You'll receive a personalized quote via text/email</li>
              <li>✅ We can schedule as early as tomorrow</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Quick Contact Form (Light Theme, Large Text)
  if (!contactSubmitted) {
    return (
      <Card className="bg-slate-50 border-slate-200 rounded-3xl shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">1</div>
            <div>
              <h3 className="font-bold text-xl text-slate-800">Step 1: Your Contact Info</h3>
              <p className="text-base text-slate-500">So we can reach you with your quote</p>
            </div>
          </div>
          
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-2">Full Name *</label>
              <input
                value={step1Data.name}
                onChange={(e) => setStep1Data({...step1Data, name: e.target.value})}
                className={`w-full rounded-2xl bg-white border-2 ${step1Errors.name ? 'border-red-400' : 'border-slate-300'} px-5 py-4 text-lg outline-none focus:border-cyan-400 transition`}
                placeholder="Enter your full name"
              />
              {step1Errors.name && <p className="text-red-500 text-sm mt-1 font-medium">{step1Errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-2">Phone Number *</label>
              <input
                value={step1Data.phone}
                onChange={(e) => setStep1Data({...step1Data, phone: e.target.value})}
                className={`w-full rounded-2xl bg-white border-2 ${step1Errors.phone ? 'border-red-400' : 'border-slate-300'} px-5 py-4 text-lg outline-none focus:border-cyan-400 transition`}
                placeholder="(862) 285-4949"
                type="tel"
              />
              {step1Errors.phone && <p className="text-red-500 text-sm mt-1 font-medium">{step1Errors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-2">Email Address *</label>
              <input
                value={step1Data.email}
                onChange={(e) => setStep1Data({...step1Data, email: e.target.value})}
                className={`w-full rounded-2xl bg-white border-2 ${step1Errors.email ? 'border-red-400' : 'border-slate-300'} px-5 py-4 text-lg outline-none focus:border-cyan-400 transition`}
                placeholder="you@example.com"
                type="email"
              />
              {step1Errors.email && <p className="text-red-500 text-sm mt-1 font-medium">{step1Errors.email}</p>}
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl py-5 text-xl font-bold shadow-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Continue to Step 2 →'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Property Details (Light Theme, Large Text)
  return (
    <Card className="bg-slate-50 border-slate-200 rounded-3xl shadow-lg">
      <CardContent className="p-8 space-y-8">
        {/* Progress Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">✓</div>
            <div>
              <p className="text-base text-green-600 font-semibold">Step 1 Complete!</p>
              <p className="text-sm text-slate-500">{step1Data.name} • {step1Data.phone}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-300 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">2</div>
            <div>
              <p className="font-bold text-lg text-slate-800">Property Details</p>
              <p className="text-sm text-slate-500">Tell us about your space</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleStep2Submit} className="space-y-8">
          {/* Service Type Selection */}
          <div>
            <label className="block text-xl font-bold text-slate-800 mb-4">What type of cleaning do you need?</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {serviceTypes.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service)}
                  className={`p-5 rounded-2xl border-2 transition ${
                    selectedService?.id === service.id 
                      ? 'bg-cyan-100 border-cyan-500 text-slate-800' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-cyan-300'
                  }`}
                >
                  <span className="text-3xl block mb-2">{service.icon}</span>
                  <span className="text-base font-semibold block">{service.name}</span>
                  <span className="text-sm text-slate-500 block mt-1">{service.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Property Size */}
          {selectedService && (
            <div>
              <label className="block text-xl font-bold text-slate-800 mb-4">Property Size</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getRelevantSizes().map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setStep2Data({...step2Data, propertySize: size.label})}
                    className={`p-4 rounded-xl border-2 transition text-left ${
                      step2Data.propertySize === size.label 
                        ? 'bg-cyan-100 border-cyan-500' 
                        : 'bg-white border-slate-200 hover:border-cyan-300'
                    }`}
                  >
                    <span className="text-base font-semibold block text-slate-800">{size.label}</span>
                    <span className="text-sm text-slate-500">{size.sqft}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bathrooms & Frequency */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">Number of Bathrooms</label>
              <select
                value={step2Data.bathrooms}
                onChange={(e) => setStep2Data({...step2Data, bathrooms: e.target.value})}
                className="w-full rounded-2xl bg-white border-2 border-slate-300 px-5 py-4 text-lg outline-none focus:border-cyan-400"
              >
                <option value="">Select...</option>
                <option value="1">1 Bathroom</option>
                <option value="1.5">1.5 Bathrooms</option>
                <option value="2">2 Bathrooms</option>
                <option value="2.5">2.5 Bathrooms</option>
                <option value="3">3 Bathrooms</option>
                <option value="4+">4+ Bathrooms</option>
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">How Often?</label>
              <select
                value={step2Data.frequency}
                onChange={(e) => setStep2Data({...step2Data, frequency: e.target.value})}
                className="w-full rounded-2xl bg-white border-2 border-slate-300 px-5 py-4 text-lg outline-none focus:border-cyan-400"
              >
                <option value="">Select...</option>
                <option value="One-time">One-time Clean</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">Special Requests or Notes (Optional)</label>
            <textarea
              value={step2Data.specialRequests}
              onChange={(e) => setStep2Data({...step2Data, specialRequests: e.target.value})}
              className="w-full rounded-2xl bg-white border-2 border-slate-300 px-5 py-4 text-lg outline-none focus:border-cyan-400 min-h-28"
              placeholder="Pets, specific areas to focus on, access instructions, preferred time, etc."
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl py-5 text-xl font-bold shadow-lg"
          >
            {isSubmitting ? 'Submitting...' : '💰 Get My Free Quote!'}
          </Button>
          
          <p className="text-center text-base text-slate-500">
            Your quote will be ready within 2 hours. No commitment required.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
