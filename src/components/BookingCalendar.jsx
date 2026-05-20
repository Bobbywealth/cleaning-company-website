import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import "react-datepicker/dist/react-datepicker.css";

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const generateBookedDates = () => {
  const booked = new Set();
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + Math.floor(Math.random() * 60));
    if (Math.random() > 0.6) {
      booked.add(date.toDateString());
    }
  }
  return booked;
};

const BookingCalendar = ({ selectedDate, selectedTime, onDateChange, onTimeChange, onContinue }) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  const bookedDates = useMemo(() => generateBookedDates(), []);

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    if (date.getDay() === 0) return true;
    if (bookedDates.has(date.toDateString())) return true;
    return false;
  };

  const handleDateSelect = (date) => {
    onDateChange(date);
  };

  const handleTimeSelect = (time) => {
    onTimeChange(time);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Select Your Preferred Date & Time</h3>
        <p className="text-slate-500">Choose a convenient time for your cleaning service in New Jersey</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelect}
              onHover={setHoveredDate}
              inline
              minDate={new Date()}
              monthsShown={1}
              showDisabledMonthNavigation
              className="w-full"
              dayClassName={(date) => {
                if (isDateDisabled(date)) return 'text-slate-300 cursor-not-allowed';
                if (date.toDateString() === selectedDate?.toDateString()) return 'bg-cyan-500 text-white rounded-full';
                if (date.toDateString() === hoveredDate?.toDateString()) return 'bg-cyan-100 rounded-full';
                return 'hover:bg-cyan-50 rounded-full transition';
              }}
              renderCustomHeader={({ monthDate, decreaseMonth, increaseMonth }) => (
                <div className="flex items-center justify-between mb-4 px-2">
                  <button
                    onClick={decreaseMonth}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <span className="font-bold text-slate-800">
                    {monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={increaseMonth}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white border-slate-200 rounded-2xl">
            <CardContent className="p-4">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span>🕐</span> Available Time Slots
              </h4>
              {selectedDate ? (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`py-3 px-2 rounded-xl text-sm font-semibold transition ${
                        selectedTime === time
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-cyan-100 hover:text-cyan-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <span className="text-amber-500 text-2xl mb-2 block">📅</span>
                  <p className="text-amber-700 text-sm font-medium">Please select a date first to see available times</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedDate && selectedTime && (
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 rounded-2xl">
              <CardContent className="p-4">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span>✅</span> Your Selected Appointment
                </h4>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="font-bold text-slate-800">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-cyan-600 font-semibold text-lg">{selectedTime}</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">We'll send a confirmation email once booked</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-slate-100 rounded-xl p-4">
            <h5 className="font-semibold text-slate-700 mb-2 text-sm">📍 Service Area Note</h5>
            <p className="text-slate-500 text-xs">
              We service all of New Jersey including Jersey City, Newark, Hoboken, and surrounding areas. 
              Exact arrival times may vary by ±30 minutes based on crew scheduling.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onContinue}
          disabled={!selectedDate || !selectedTime}
          className={`rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition ${
            selectedDate && selectedTime
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-cyan-500/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {selectedDate && selectedTime ? (
            <>Continue to Payment →</>
          ) : (
            <>Select Date & Time to Continue</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BookingCalendar;