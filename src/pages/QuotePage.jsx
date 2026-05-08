import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingForm from '@/components/BookingForm';

const QuotePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <img
              src="https://iili.io/Btud5oF.th.png"
              alt="360 Cleaning Co."
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover border-2 border-cyan-500"
            />
            <div>
              <p className="font-bold text-lg md:text-xl text-slate-800">360 Cleaning Co.</p>
              <p className="text-xs text-cyan-600 font-medium hidden md:block">New Jersey</p>
            </div>
          </Link>
          <Link 
            to="/"
            className="text-slate-600 hover:text-cyan-600 font-medium transition flex items-center gap-2 text-sm md:text-base"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-10 md:py-16 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4">
                Get Your Free Quote Today!
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-cyan-100 max-w-2xl mx-auto">
                Professional cleaning services for your New Jersey home or business. 
                Fill out the simple form below and we'll contact you within 2 hours with your personalized quote.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-white border-b border-slate-200 py-4 md:py-6 px-4 md:px-6">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4 md:gap-8 text-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-lg">4.9/5 Rating</p>
                <p className="text-slate-500 text-sm">287+ Happy Customers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-lg">Licensed & Insured</p>
                <p className="text-slate-500 text-sm">Fully Bonded in NJ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-lg">Same-Week Service</p>
                <p className="text-slate-500 text-sm">Fast Response</p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="py-8 px-4 md:py-12 md:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white shadow-xl rounded-2xl md:rounded-3xl border-slate-200 overflow-hidden">
                <CardContent className="p-4 md:p-8">
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
                      Request Your Free Quote
                    </h2>
                    <p className="text-base md:text-lg text-slate-500">
                      Just 2 simple steps — takes less than 2 minutes!
                    </p>
                  </div>
                  <BookingForm />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-slate-50 py-8 md:py-12 px-4 md:px-6 border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-black text-slate-800 text-center mb-6 md:mb-8">
              Why Choose 360 Cleaning Co.?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="flex gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm">
                <span className="text-2xl md:text-4xl">🏠</span>
                <div>
                  <h4 className="font-bold text-lg md:text-xl text-slate-800 mb-1">Residential & Commercial</h4>
                  <p className="text-slate-600 text-sm md:text-base">We clean homes, apartments, offices, restaurants, and more across all of New Jersey.</p>
                </div>
              </div>
              <div className="flex gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm">
                <span className="text-2xl md:text-4xl">💰</span>
                <div>
                  <h4 className="font-bold text-lg md:text-xl text-slate-800 mb-1">Upfront, Honest Pricing</h4>
                  <p className="text-slate-600 text-sm md:text-base">No hidden fees or surprises. You'll know your price before we start.</p>
                </div>
              </div>
              <div className="flex gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm">
                <span className="text-2xl md:text-4xl">👥</span>
                <div>
                  <h4 className="font-bold text-lg md:text-xl text-slate-800 mb-1">Professional Teams</h4>
                  <p className="text-slate-600 text-sm md:text-base">Trained, background-checked cleaners who take pride in their work.</p>
                </div>
              </div>
              <div className="flex gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm">
                <span className="text-2xl md:text-4xl">💯</span>
                <div>
                  <h4 className="font-bold text-lg md:text-xl text-slate-800 mb-1">100% Satisfaction</h4>
                  <p className="text-slate-600 text-sm md:text-base">Not happy? We'll come back and re-clean at no extra cost.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="bg-cyan-500 text-white py-8 md:py-10 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4">🏆 Proudly Serving All of New Jersey</h3>
            <p className="text-cyan-100 text-base md:text-lg">
              Including Jersey City, Newark, Hoboken, New Brunswick, Trenton, Edison, Paterson, and more!
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-slate-800 text-white py-8 md:py-10 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Need to Talk Right Now?</h3>
            <p className="text-slate-300 mb-4 text-sm md:text-base">Our NJ team is standing by to help!</p>
            <a 
              href="tel:+18622854949" 
              className="inline-flex items-center gap-2 md:gap-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-lg md:text-xl px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl transition shadow-lg"
            >
              <span className="text-xl md:text-2xl">📞</span>
              (862) 285-4949
            </a>
            <p className="text-slate-400 mt-4 text-sm">Mon-Sun: 7AM - 8PM</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-4 md:py-6 px-4 md:px-6 text-center text-xs md:text-sm">
          <p>© 2026 360 Cleaning Co. All rights reserved. | New Jersey</p>
        </footer>
      </main>
    </div>
  );
};

export default QuotePage;
