import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const ThankYouPage = () => {
  const location = useLocation();
  const quoteData = location.state || {};

  useEffect(() => {
    // Fire GTM conversion events when page loads
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'thank_you_page_view',
        quote_name: quoteData.name || '',
        quote_phone: quoteData.phone || '',
        quote_email: quoteData.email || '',
        quote_service: quoteData.service || '',
        quote_estimated_price: quoteData.estimatedPrice || '',
      });

      // GA4 conversion event
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          currency: 'USD',
          value: quoteData.estimatedPrice || 0,
          items: [{
            item_name: quoteData.service || 'Quote Request',
            quantity: 1,
          }],
        });
      }

      // Facebook Pixel Lead event
      if (window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: quoteData.service || 'Quote Request',
          value: quoteData.estimatedPrice || 0,
          currency: 'USD',
        });
      }
    }
  }, [quoteData]);

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
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <div className="text-7xl md:text-8xl mb-4">🎉</div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4">
                You're All Set!
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-green-100 max-w-2xl mx-auto">
                Thanks {quoteData.name ? `, ${quoteData.name}!` : '!'} We've received your quote request and will contact you within 2 hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Estimated Price Card */}
        {quoteData.estimatedPrice && (
          <section className="py-8 px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-xl border-2 border-green-200 p-6 md:p-8 text-center"
              >
                <div className="text-4xl mb-3">💰</div>
                <p className="text-slate-500 text-lg mb-2">Your Estimated Price Range</p>
                <p className="text-4xl md:text-5xl font-black text-green-600 mb-4">
                  ${quoteData.estimatedPrice}
                </p>
                <p className="text-sm text-slate-500">
                  Final pricing may vary based on property condition, special requests, and access.
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* What Happens Next */}
        <section className="py-8 px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8"
            >
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 text-center">
                ⏳ What Happens Next?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-cyan-100 text-cyan-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Review in Progress</p>
                    <p className="text-slate-600 text-sm">Our team is reviewing your {quoteData.service || 'cleaning'} request right now.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-cyan-100 text-cyan-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Personalized Quote</p>
                    <p className="text-slate-600 text-sm">You'll receive a detailed quote via text and email within 2 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-cyan-100 text-cyan-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Schedule Your Clean</p>
                    <p className="text-slate-600 text-sm">Ready to book? We can schedule as early as tomorrow!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-8 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-slate-600 mb-4">Need immediate assistance?</p>
            <a 
              href="tel:+18622854949" 
              className="inline-flex items-center gap-2 md:gap-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-lg md:text-xl px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl transition shadow-lg"
              onClick={() => {
                if (window.trackPhoneClick) window.trackPhoneClick();
              }}
            >
              <span className="text-xl md:text-2xl">📞</span>
              (862) 285-4949
            </a>
            <p className="text-slate-400 mt-4 text-sm">Mon-Sun: 7AM - 8PM</p>
          </div>
        </section>

        {/* Back to Home */}
        <section className="pb-12 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold text-lg transition"
            >
              ← Back to Home
            </Link>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-slate-50 border-t border-slate-200 py-6 px-4 md:px-6">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 md:gap-10 text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div className="text-left">
                <p className="font-bold text-slate-800">4.9/5 Rating</p>
                <p className="text-slate-500 text-xs">287+ Happy Customers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <div className="text-left">
                <p className="font-bold text-slate-800">Licensed & Insured</p>
                <p className="text-slate-500 text-xs">Fully Bonded in NJ</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💯</span>
              <div className="text-left">
                <p className="font-bold text-slate-800">100% Satisfaction</p>
                <p className="text-slate-500 text-xs">Guaranteed Results</p>
              </div>
            </div>
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

export default ThankYouPage;
