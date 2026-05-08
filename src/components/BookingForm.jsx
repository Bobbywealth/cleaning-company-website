import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const BookingForm = ({ onSuccess }) => {
  const { submitLead } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.service) newErrors.service = 'Please select a service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    submitLead(formData);
    
    setFormData({ name: '', phone: '', email: '', service: '', notes: '' });
    setIsSubmitting(false);
    
    if (onSuccess) onSuccess();
  };

  return (
    <Card className="bg-white/10 border-white/10 rounded-3xl">
      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-2xl bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-white/10'} px-4 py-3 outline-none focus:border-cyan-300 transition`}
                placeholder="Full Name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full rounded-2xl bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-white/10'} px-4 py-3 outline-none focus:border-cyan-300 transition`}
                placeholder="Phone Number"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
          
          <div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-2xl bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-white/10'} px-4 py-3 outline-none focus:border-cyan-300 transition`}
              placeholder="Email Address"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className={`w-full rounded-2xl bg-slate-900 border ${errors.service ? 'border-red-500' : 'border-white/10'} px-4 py-3 outline-none focus:border-cyan-300 transition`}
            >
              <option value="">Choose Service</option>
              <option value="Residential Cleaning">Residential Cleaning</option>
              <option value="Commercial Cleaning">Commercial Cleaning</option>
              <option value="Deep Cleaning">Deep Cleaning</option>
              <option value="Post-Construction Cleaning">Post-Construction Cleaning</option>
            </select>
            {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service}</p>}
          </div>
          
          <div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300 transition min-h-32"
              placeholder="Tell us about the property, square footage, preferred date, and cleaning needs."
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl py-6 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : '📨 Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
