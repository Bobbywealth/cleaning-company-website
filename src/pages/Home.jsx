import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Dynamic next-available scheduling text
const getNextAvailable = () => {
  const now = new Date();
  const hour = now.getHours();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  if (hour < 17) {
    return `Today at ${hour < 9 ? '9:00 AM' : `${((hour + 1) % 12) || 12}:00 ${hour + 1 < 12 ? 'AM' : 'PM'}`}`;
  }
  return `${dayNames[tomorrow.getDay()]} at 9:00 AM`;
};

const services = [
  {
    icon: "🏠",
    title: "Residential Cleaning",
    desc: "Routine home cleaning, deep cleaning, move-in/move-out cleaning, and customized weekly or monthly plans for New Jersey homeowners.",
    cityKeywords: "house cleaning NJ, home cleaning New Jersey"
  },
  {
    icon: "🏢",
    title: "Commercial Cleaning",
    desc: "Office, retail, salon, restaurant, and facility cleaning with reliable crews and recurring service options across New Jersey.",
    cityKeywords: "office cleaning NJ, business cleaning New Jersey"
  },
  {
    icon: "✨",
    title: "Deep Cleaning",
    desc: "Detailed cleaning for kitchens, bathrooms, floors, appliances, baseboards, windows, and high-touch surfaces in New Jersey homes.",
    cityKeywords: "deep cleaning NJ, thorough cleaning New Jersey"
  },
  {
    icon: "🛡️",
    title: "Post-Construction",
    desc: "Dust removal, debris wipe-downs, floor cleanup, and final polish after renovations or construction projects in New Jersey.",
    cityKeywords: "post construction cleaning NJ, after builders cleaning"
  },
  {
    icon: "🏠",
    title: "Apartment Cleaning",
    desc: "Professional apartment cleaning services for tenants and landlords in Essex, Union, Hudson, and Bergen County NJ.",
    cityKeywords: "apartment cleaning NJ, condo cleaning New Jersey"
  },
  {
    icon: "🔑",
    title: "Airbnb Cleaning",
    desc: "Fast turnkey cleaning for short-term rentals and vacation homes throughout New Jersey. Keep your guests happy!",
    cityKeywords: "Airbnb cleaning NJ, vacation rental cleaning New Jersey"
  },
  {
    icon: "🍽️",
    title: "Restaurant Cleaning",
    desc: "Comprehensive restaurant cleaning services including kitchen hoods, dining areas, restrooms, and health-code ready sanitation.",
    cityKeywords: "restaurant cleaning NJ, commercial kitchen cleaning New Jersey"
  },
];

const packages = [
  {
    name: "Basic Refresh",
    price: "From $99",
    details: ["Kitchen + bathroom wipe-down", "Sweeping and mopping", "Trash removal", "Surface dusting"],
  },
  {
    name: "Deep Clean",
    price: "From $199",
    details: ["Full home detail", "Appliance exterior cleaning", "Baseboards", "Interior windows", "High-touch sanitizing"],
    featured: true,
  },
  {
    name: "Commercial Plan",
    price: "Custom Quote",
    details: ["Daily/weekly service", "Restroom maintenance", "Floor care", "Supply restocking", "Inspection reports"],
  },
];

const serviceAreas = [
  "Jersey City", "Newark", "Hoboken", "New Brunswick", "Trenton", 
  "Edison", "Paterson", "Elizabeth", "Camden", "Atlantic City",
  "Princeton", "Morristown", "Asbury Park", "Weehawken", "Bayonne"
];

const counties = [
  { name: "Union County", cities: ["Elizabeth", "Jersey City", "Union", "Westfield", "Summit", "Cranford", "Scotch Plains", "Fanwood"] },
  { name: "Essex County", cities: ["Newark", "East Orange", "Orange", "Bloomfield", "Montclair", "West Orange", "Livingston", "South Orange"] },
  { name: "Hudson County", cities: ["Hoboken", "Jersey City", "Weehawken", "Bayonne", "Union City", "North Bergen", "West New York", "Secaucus"] },
  { name: "Bergen County", cities: ["Hackensack", "Englewood", "Teaneck", "Fort Lee", "Ridgefield", "Garfield", "Fair Lawn", "Paramus"] },
];

const faqs = [
  {
    question: "How much does professional cleaning service cost in New Jersey?",
    answer: "Our residential cleaning services in New Jersey start from $99 for basic cleaning. Deep cleaning starts at $199. Commercial and specialty services are quoted custom based on your property size and specific needs. Contact us for a free personalized quote for your Essex, Union, Hudson, or Bergen County home or business."
  },
  {
    question: "Do you offer both residential and commercial cleaning services in NJ?",
    answer: "Yes! 360 Cleaning Co. offers comprehensive cleaning services for both homes and businesses throughout New Jersey. Our residential services include regular home cleaning, deep cleaning, move-in/move-out cleaning, and apartment cleaning. Our commercial services cover offices, restaurants, retail spaces, and other business properties."
  },
  {
    question: "Do you bring your own cleaning supplies and equipment?",
    answer: "Yes, our professional cleaning teams in New Jersey arrive with all necessary supplies, equipment, and eco-friendly cleaning products. We use professional-grade cleaners that are effective yet safe for your family, pets, and employees."
  },
  {
    question: "Do you offer move-in and move-out cleaning services in New Jersey?",
    answer: "Absolutely! We provide comprehensive move-in and move-out cleaning services throughout New Jersey, including deep cleaning of kitchens, bathrooms, all rooms, appliances, and hard-to-reach areas. Our move-out cleaning helps ensure you get your security deposit back."
  },
  {
    question: "What counties and areas of New Jersey do you serve?",
    answer: "360 Cleaning Co. proudly serves all of New Jersey, with primary coverage in Essex County, Union County, Hudson County, and Bergen County. We service cities including Jersey City, Newark, Hoboken, New Brunswick, Trenton, Edison, Paterson, Elizabeth, and all surrounding areas in North Jersey."
  },
  {
    question: "How do I get a free cleaning quote in New Jersey?",
    answer: "Getting a free quote is easy! You can call us directly at (862) 285-4949, fill out our online quote form, or use the contact form on our website. We typically respond to quote requests within 2 hours during business hours (7AM-8PM, 7 days a week)."
  },
  {
    question: "Do you offer recurring or subscription cleaning services in NJ?",
    answer: "Yes, we offer flexible recurring cleaning plans for homes and businesses throughout New Jersey. Choose from weekly, bi-weekly, or monthly service to keep your space consistently clean. Many of our customers prefer our recurring plans for ongoing maintenance."
  },
  {
    question: "Do you clean Airbnb properties and short-term rentals in New Jersey?",
    answer: "Yes! We specialize in Airbnb turnkey cleaning and short-term rental cleaning services throughout New Jersey. We understand the importance of quick turnaround times for hosts in Jersey City, Hoboken, and all NJ vacation rentals."
  }
];

const galleryImages = [
  { before: "Kitchen with grease buildup", after: "Spotless kitchen in Newark NJ" },
  { before: "Bathroom with hard water stains", after: "Sparkling bathroom in Jersey City" },
  { before: "Dusty post-construction space", after: "Move-in ready apartment in Hoboken" },
];

const Home = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const bookingRef = useRef(null);
  const servicesRef = useRef(null);
  const packagesRef = useRef(null);
  const faqRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const handleGetQuote = () => {
    if (window.trackQuoteClick) window.trackQuoteClick();
    if (window.trackMetaQuoteClick) window.trackMetaQuoteClick();
    navigate('/admin');
  };

  const handlePhoneClick = () => {
    if (window.trackPhoneClick) window.trackPhoneClick();
    if (window.trackMetaPhoneClick) window.trackMetaPhoneClick();
  };

  const handleQuoteButtonClick = () => {
    if (window.trackQuoteClick) window.trackQuoteClick();
    if (window.trackMetaQuoteClick) window.trackMetaQuoteClick();
    navigate('/quote');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-blue-700 blur-3xl" />
      </div>

      <header className={`relative z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/10' : 'bg-slate-950/75 backdrop-blur-xl'} border-b border-white/10`}>
        <div className="hidden md:block bg-cyan-500/10 border-b border-cyan-500/20">
          <div className="max-w-7xl mx-auto px-5 py-2 flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <span className="text-slate-300">🏆 Rated #1 in New Jersey</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">⭐ 4.9/5 from 287+ Reviews</span>
            </div>
            <span className="text-slate-300">Mon-Sun: 7AM - 8PM</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <img
                  src="https://iili.io/Btud5oF.th.png"
                  alt="360 Cleaning Co. - Professional Cleaning Services in Essex, Union, Hudson, Bergen County New Jersey"
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105"
                />
                <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  NJ
                </div>
              </div>
              <div>
                <p className="font-bold text-xl leading-none text-white">360 Cleaning Co.</p>
                <p className="text-xs text-cyan-400 font-medium">New Jersey's Premier Cleaners</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection(servicesRef)} className="relative text-slate-200 hover:text-cyan-400 transition font-medium group">
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection(packagesRef)} className="relative text-slate-200 hover:text-cyan-400 transition font-medium group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection(faqRef)} className="relative text-slate-200 hover:text-cyan-400 transition font-medium group">
                FAQ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection(bookingRef)} className="relative text-slate-200 hover:text-cyan-400 transition font-medium group">
                Book Now
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </button>
              <div className="h-6 w-px bg-white/20"></div>
              <button onClick={handleGetQuote} className="text-slate-300 hover:text-white transition flex items-center gap-2 text-sm">
                <span>🔐</span>
                <span>Admin</span>
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <a 
                href="tel:+18622854949" 
                onClick={handlePhoneClick}
                className="hidden md:flex items-center gap-2 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 px-4 py-2 rounded-xl transition border border-cyan-400/30"
              >
                <span>📞</span>
                <span className="font-semibold">(862) 285-4949</span>
              </a>
              <Button 
                onClick={handleQuoteButtonClick}
                className="hidden md:inline-flex bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 rounded-xl font-bold shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50"
              >
                Get Free Quote
              </Button>
              <button 
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-xl">×</motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="text-xl">☰</motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="max-w-7xl mx-auto px-5 py-6 space-y-4">
                <button onClick={() => scrollToSection(servicesRef)} className="block w-full text-left py-3 px-4 rounded-xl text-lg font-medium text-slate-200 hover:bg-white/10 transition">🧹 Services</button>
                <button onClick={() => scrollToSection(packagesRef)} className="block w-full text-left py-3 px-4 rounded-xl text-lg font-medium text-slate-200 hover:bg-white/10 transition">💰 Pricing</button>
                <button onClick={() => scrollToSection(faqRef)} className="block w-full text-left py-3 px-4 rounded-xl text-lg font-medium text-slate-200 hover:bg-white/10 transition">❓ FAQ</button>
                <button onClick={() => scrollToSection(bookingRef)} className="block w-full text-left py-3 px-4 rounded-xl text-lg font-medium text-slate-200 hover:bg-white/10 transition">📅 Book Now</button>
                <div className="pt-4 border-t border-white/10">
                  <a href="tel:+18622854949" onClick={handlePhoneClick} className="flex items-center gap-3 py-3 px-4 text-cyan-400 font-semibold">📞 (862) 285-4949</a>
                  <button onClick={handleGetQuote} className="block w-full text-left py-3 px-4 rounded-xl text-lg font-medium text-slate-400 hover:bg-white/10 transition">🔐 Admin Login</button>
                </div>
                <Button onClick={handleQuoteButtonClick} className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 rounded-xl font-bold py-4">
                  Get Free Quote Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-12 items-center" aria-labelledby="hero-heading">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 mb-6" role="status">
              ✅ #1 Rated Cleaning Service in New Jersey
            </div>
            <h1 id="hero-heading" className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              New Jersey's Most Trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Cleaning Professionals</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-xl">
              Professional residential, commercial, deep cleaning, Airbnb, apartment, and restaurant cleaning serving all of New Jersey with fast quotes, easy booking, and reliable service teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleQuoteButtonClick}
                className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 rounded-xl px-8 py-6 text-base font-bold shadow-lg shadow-cyan-500/30"
                aria-label="Book professional cleaning service in New Jersey"
              >
                Book Cleaning Now ✨
              </Button>
              <Button 
                onClick={() => scrollToSection(servicesRef)}
                variant="outline" 
                className="border-2 border-white/20 text-white hover:bg-white/10 rounded-xl px-8 py-6 text-base"
              >
                View Services
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-slate-300">
              <span className="flex items-center gap-1">⭐ 4.9 Rating (287+ Reviews)</span>
              <span className="text-cyan-400/50">|</span>
              <span>🛡️ Licensed & Insured in NJ</span>
              <span className="text-cyan-400/50">|</span>
              <span>⚡ Same-Week Availability</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <article className="bg-white/10 border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-cyan-950/40" aria-label="Quick booking card">
              <Card className="bg-white/10 border-white/10 rounded-[2rem]">
                <CardContent className="p-4">
                  <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-200 via-white to-blue-200 p-8 text-slate-950 min-h-[430px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-600">Instant Quote • New Jersey</p>
                        <h2 className="text-3xl font-black mt-2">Schedule your next clean in NJ</h2>
                      </div>
                      <div className="text-4xl" aria-hidden="true">✨</div>
                    </div>
                    <div className="grid gap-4 mt-8">
                      {["Choose home or business cleaning in NJ", "Select one-time or recurring NJ service", "Receive confirmation and crew assignment"].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
                          <span className="text-cyan-700" aria-hidden="true">✅</span>
                          <span className="font-semibold">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 rounded-3xl bg-slate-950 text-white p-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Next Available in NJ</p>
                        <p className="font-bold text-xl">{getNextAvailable()}</p>
                      </div>
                      <div className="text-4xl" aria-hidden="true">📅</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </article>
          </motion.div>
        </section>

        <section className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-y border-cyan-500/20 py-12" aria-labelledby="north-jersey-heading">
          <div className="max-w-7xl mx-auto px-5">
            <h2 id="north-jersey-heading" className="text-3xl md:text-4xl font-black text-center mb-4">Cleaning Services Across North Jersey</h2>
            <p className="text-center text-slate-300 mb-8 text-lg max-w-3xl mx-auto">
              360 Cleaning Co. proudly provides professional cleaning services throughout <strong className="text-cyan-300">Essex County</strong>, <strong className="text-cyan-300">Union County</strong>, <strong className="text-cyan-300">Hudson County</strong>, and <strong className="text-cyan-300">Bergen County</strong> New Jersey.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {counties.map((county) => (
                <div key={county.name} className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-cyan-500/20">
                  <h3 className="font-bold text-cyan-300 text-lg mb-3 flex items-center gap-2"><span>📍</span> {county.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {county.cities.map((city) => (
                      <span key={city} className="text-sm text-slate-300 bg-slate-700/50 px-2 py-1 rounded-lg">{city}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-300 mt-8 text-sm">
              Also serving: Jersey City, Newark, Hoboken, New Brunswick, Trenton, Edison, Paterson, Elizabeth, Camden, Atlantic City, Princeton, Morristown, Asbury Park, Weehawken, Bayonne
            </p>
          </div>
        </section>

        <section ref={servicesRef} className="max-w-7xl mx-auto px-5 py-16" aria-labelledby="services-heading">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
            <div>
              <p className="text-cyan-300 font-semibold">Our Services in New Jersey</p>
              <h2 id="services-heading" className="text-4xl font-black mt-2">Professional Cleaning Services for Every NJ Need</h2>
            </div>
            <p className="text-slate-300 max-w-xl">
              360 Cleaning Co. is New Jersey's premium cleaning service for homeowners, offices, restaurants, real estate agents, landlords, Airbnb hosts, and contractors throughout the Garden State.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map((service) => (
              <Card key={service.title} className="bg-white/10 border-white/10 rounded-3xl hover:bg-white/[0.14] transition cursor-pointer group" onClick={handleQuoteButtonClick}>
                <CardContent className="p-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-400/30 flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform">{service.icon}</div>
                  <h3 className="text-xl font-bold text-white">{service.title}</h3>
                  <p className="text-slate-300 mt-3 text-sm leading-relaxed">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/50 py-16" aria-labelledby="why-choose-heading">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-10">
              <p className="text-cyan-300 font-semibold">Why 360 Cleaning Co. in New Jersey</p>
              <h2 id="why-choose-heading" className="text-4xl font-black mt-2">The #1 Choice for NJ Cleaning Services</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20">
                <div className="text-5xl mb-4">⭐</div>
                <h3 className="text-xl font-bold text-white mb-2">4.9 Star Rating</h3>
                <p className="text-slate-300">287+ satisfied customers across New Jersey</p>
              </div>
              <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20">
                <div className="text-5xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-2">Licensed & Insured</h3>
                <p className="text-slate-300">Fully bonded in New Jersey for your peace of mind</p>
              </div>
              <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-white mb-2">Same-Week Service</h3>
                <p className="text-slate-300">Fast booking available throughout NJ</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-5 py-16" aria-labelledby="gallery-heading">
          <div className="text-center mb-10">
            <p className="text-cyan-300 font-semibold">Our Work in New Jersey</p>
            <h2 id="gallery-heading" className="text-4xl font-black mt-2">Real Cleaning Transformations in NJ</h2>
            <p className="text-slate-300 mt-4 max-w-2xl mx-auto">
              See before and after cleaning transformations for kitchens, bathrooms, apartments, offices, restaurants, and luxury spaces throughout Essex, Union, Hudson, and Bergen County New Jersey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {galleryImages.map((item, index) => (
              <Card key={index} className="bg-white/10 border-white/10 rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="bg-slate-800 p-4 text-center">
                      <p className="text-3xl mb-2">🔍</p>
                      <p className="text-xs text-slate-400">{item.before}</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 p-4 text-center">
                      <p className="text-3xl mb-2">✨</p>
                      <p className="text-xs text-cyan-300">{item.after}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button onClick={handleQuoteButtonClick} className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 rounded-xl px-8 py-4 text-lg font-bold shadow-lg shadow-cyan-500/30">
              Get Your Space Transformation →
            </Button>
          </div>
        </section>

        <section ref={packagesRef} className="max-w-7xl mx-auto px-5 py-16" aria-labelledby="pricing-heading">
          <div className="text-center mb-10">
            <p className="text-cyan-300 font-semibold">Affordable NJ Pricing</p>
            <h2 id="pricing-heading" className="text-4xl font-black mt-2">Simple, Transparent Pricing for New Jersey</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.name} className={`rounded-3xl border ${pkg.featured ? "bg-gradient-to-b from-cyan-400 to-cyan-500 text-slate-950 border-cyan-300 scale-[1.02] shadow-xl shadow-cyan-500/20" : "bg-white/10 text-white border-white/10"}`}>
                <CardContent className="p-8">
                  {pkg.featured && <span className="inline-block rounded-full bg-slate-950 text-white px-3 py-1 text-xs font-bold mb-4">⭐ Most Popular in NJ</span>}
                  <h3 className="text-2xl font-black">{pkg.name}</h3>
                  <p className={`text-4xl font-black mt-4 ${pkg.featured ? 'text-slate-950' : 'text-cyan-400'}`}>{pkg.price}</p>
                  <div className="mt-6 space-y-3">
                    {pkg.details.map((detail) => (
                      <p key={detail} className={`flex items-center gap-3 text-sm ${pkg.featured ? 'text-slate-800' : ''}`}>✅ {detail}</p>
                    ))}
                  </div>
                  <Button onClick={handleQuoteButtonClick} className={`w-full mt-8 rounded-xl ${pkg.featured ? "bg-slate-950 text-white hover:bg-slate-800 shadow-lg" : "bg-white text-slate-950 hover:bg-slate-200"}`}>
                    Request Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section ref={faqRef} className="bg-slate-900/50 py-16" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto px-5">
            <div className="text-center mb-10">
              <p className="text-cyan-300 font-semibold">Common Questions</p>
              <h2 id="faq-heading" className="text-4xl font-black mt-2">Frequently Asked Questions About NJ Cleaning</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-white/10 border-white/10 rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex items-center justify-between p-6 text-left">
                      <span className="font-bold text-lg text-white pr-4">{faq.question}</span>
                      <span className={`text-cyan-400 text-2xl transition-transform ${openFaq === index ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="px-6 pb-6 text-slate-300">{faq.answer}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-cyan-900/20 to-slate-900/50 py-16" aria-labelledby="testimonials-heading">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-10">
              <p className="text-cyan-300 font-semibold">What NJ Customers Say</p>
              <h2 id="testimonials-heading" className="text-4xl font-black mt-2">Trusted by 287+ New Jersey Families & Businesses</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-white/10 rounded-3xl p-6">
                <div className="text-yellow-400 text-xl mb-2">⭐⭐⭐⭐⭐</div>
                <p className="text-slate-300 italic">"Best cleaning service in New Jersey! They cleaned our entire office in Jersey City and did an amazing job. Highly recommend!"</p>
                <p className="text-cyan-400 mt-3 font-semibold">— Sarah M., Jersey City NJ</p>
              </Card>
              <Card className="bg-white/10 border-white/10 rounded-3xl p-6">
                <div className="text-yellow-400 text-xl mb-2">⭐⭐⭐⭐⭐</div>
                <p className="text-slate-300 italic">"Professional, punctual, and thorough. Our deep cleaning in Newark was perfect. Will definitely book again for our NJ home."</p>
                <p className="text-cyan-400 mt-3 font-semibold">— Michael R., Newark NJ</p>
              </Card>
              <Card className="bg-white/10 border-white/10 rounded-3xl p-6">
                <div className="text-yellow-400 text-xl mb-2">⭐⭐⭐⭐⭐</div>
                <p className="text-slate-300 italic">"After our Hoboken apartment renovation, 360 Cleaning Co. made it spotless. Best post-construction cleaners in NJ!"</p>
                <p className="text-cyan-400 mt-3 font-semibold">— Jennifer L., Hoboken NJ</p>
              </Card>
            </div>
          </div>
        </section>

        <section ref={bookingRef} className="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-2 gap-8 items-start" aria-labelledby="booking-heading">
          <div>
            <p className="text-cyan-300 font-semibold">Book Your NJ Cleaning</p>
            <h2 id="booking-heading" className="text-4xl font-black mt-2">Request a Free Estimate in New Jersey</h2>
            <p className="text-slate-300 mt-4">Get your personalized cleaning quote for your New Jersey home or business. Our NJ team responds quickly with competitive pricing.</p>
            <div className="mt-8 space-y-4 text-slate-300">
              <p className="flex items-center gap-3"><span className="text-2xl" aria-hidden="true">📞</span><a href="tel:+18622854949" onClick={handlePhoneClick} className="hover:text-cyan-300 text-lg">(862) 285-4949</a></p>
              <p className="flex items-center gap-3"><span className="text-2xl" aria-hidden="true">✉️</span><a href="mailto:info@360cleaningco.com" className="hover:text-cyan-300">info@360cleaningco.com</a></p>
              <p className="flex items-center gap-3"><span className="text-2xl" aria-hidden="true">📍</span><span>Serving <strong className="text-cyan-400">All of New Jersey</strong> including Jersey City, Newark, Hoboken, and surrounding areas</span></p>
            </div>
            <Button onClick={handleQuoteButtonClick} className="mt-8 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 rounded-xl px-8 py-6 text-lg font-bold shadow-lg shadow-cyan-500/30">
              Get Your Free Quote →
            </Button>
          </div>
          <Card className="bg-white/10 border-white/10 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Book?</h3>
            <p className="text-slate-300 mb-6">Fill out our simple form and get a personalized quote in under 2 minutes.</p>
            <Button onClick={handleQuoteButtonClick} className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 rounded-xl font-bold py-4">
              Go to Quote Form →
            </Button>
          </Card>
        </section>

        <footer className="border-t border-white/10 mt-16 bg-slate-950" role="contentinfo">
          <div className="max-w-7xl mx-auto px-5 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://iili.io/Btud5oF.th.png" alt="360 Cleaning Co. - Professional Cleaning Services in New Jersey" className="h-12 w-12 rounded-xl object-cover border border-white/10" />
                  <div>
                    <p className="font-bold text-white">360 Cleaning Co.</p>
                    <p className="text-xs text-cyan-400">New Jersey's Premier Cleaners</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">Professional cleaning services serving all of New Jersey with residential, commercial, and deep cleaning solutions.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Services</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="hover:text-cyan-400 cursor-pointer">Residential Cleaning</li>
                  <li className="hover:text-cyan-400 cursor-pointer">Commercial Cleaning</li>
                  <li className="hover:text-cyan-400 cursor-pointer">Deep Cleaning</li>
                  <li className="hover:text-cyan-400 cursor-pointer">Apartment Cleaning</li>
                  <li className="hover:text-cyan-400 cursor-pointer">Airbnb Cleaning</li>
                  <li className="hover:text-cyan-400 cursor-pointer">Restaurant Cleaning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Service Areas</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>Essex County NJ</li>
                  <li>Union County NJ</li>
                  <li>Hudson County NJ</li>
                  <li>Bergen County NJ</li>
                  <li>Jersey City</li>
                  <li>Newark & Hoboken</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Contact</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>📞 (862) 285-4949</li>
                  <li>✉️ info@360cleaningco.com</li>
                  <li>🕐 Mon-Sun: 7AM - 8PM</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">© 2026 360 Cleaning Co. All rights reserved.</p>
              <p className="text-slate-500 text-sm">Privacy Policy • Terms of Service • Careers</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Sticky Mobile Quote Button */}
      <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden pointer-events-none">
        <div className="flex gap-3 pointer-events-auto max-w-md mx-auto">
          <a href="tel:+18622854949" onClick={handlePhoneClick} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-center gap-2 transition border border-white/20">
            <span className="text-xl">📞</span>
            <span>Call Now</span>
          </a>
          <button onClick={handleQuoteButtonClick} className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-center gap-2 transition hover:from-cyan-300 hover:to-cyan-400">
            <span className="text-xl">✨</span>
            <span>Get Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
