import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Icon = ({ children, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

const services = [
  {
    icon: "🏠",
    title: "Residential Cleaning",
    desc: "Routine home cleaning, deep cleaning, move-in/move-out cleaning, and customized weekly or monthly plans.",
  },
  {
    icon: "🏢",
    title: "Commercial Cleaning",
    desc: "Office, retail, salon, restaurant, and facility cleaning with reliable crews and recurring service options.",
  },
  {
    icon: "✨",
    title: "Deep Cleaning",
    desc: "Detailed cleaning for kitchens, bathrooms, floors, appliances, baseboards, windows, and high-touch surfaces.",
  },
  {
    icon: "🛡️",
    title: "Post-Construction",
    desc: "Dust removal, debris wipe-downs, floor cleanup, and final polish after renovations or construction projects.",
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

const adminStats = [
  { label: "New Leads", value: "24", icon: "👥" },
  { label: "Booked Jobs", value: "18", icon: "📅" },
  { label: "Revenue", value: "$8,420", icon: "💵" },
  { label: "Completion Rate", value: "96%", icon: "📊" },
];

const jobs = [
  { client: "Johnson Residence", service: "Deep Clean", date: "Today, 10:00 AM", status: "Confirmed" },
  { client: "Bright Dental Office", service: "Commercial", date: "Today, 7:00 PM", status: "Scheduled" },
  { client: "Miller Apartment", service: "Move-Out", date: "Tomorrow, 1:30 PM", status: "Pending" },
];

export default function CleaningCompanyWebsite() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState("website");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-blue-700 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://iili.io/Btud5oF.th.png"
              alt="Cleaning Company Logo"
              className="h-14 w-14 rounded-2xl object-cover border border-white/10 shadow-lg shadow-cyan-500/20"
            />
            <div>
              <p className="font-bold text-xl leading-none">360 Cleaning Co.</p>
              <p className="text-xs text-cyan-200">Residential • Commercial • Deep Cleaning</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-200">
            <a href="#services" className="hover:text-cyan-300">Services</a>
            <a href="#packages" className="hover:text-cyan-300">Pricing</a>
            <a href="#booking" className="hover:text-cyan-300">Book</a>
            <button onClick={() => setActiveView("backend")} className="hover:text-cyan-300 flex items-center gap-2">🔐 Admin</button>
          </nav>

          <Button className="hidden md:inline-flex bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl">Get a Quote</Button>
          <button className="md:hidden text-2xl" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? "×" : "☰"}</button>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-5 pb-5 space-y-3 text-slate-200">
            <a href="#services" className="block">Services</a>
            <a href="#packages" className="block">Pricing</a>
            <a href="#booking" className="block">Book</a>
            <button onClick={() => setActiveView("backend")} className="block">Admin Dashboard</button>
          </div>
        )}
      </header>

      {activeView === "website" ? (
        <main className="relative z-10">
          <section className="max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 mb-6">
                ✅ Trusted cleaning crews for homes and businesses
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                Cleaning services that make every space shine.
              </h1>
              <p className="mt-6 text-lg text-slate-300 max-w-xl">
                Professional residential, commercial, deep cleaning, and post-construction cleanup with fast quotes, easy booking, and reliable service teams.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl px-8 py-6 text-base">Book Cleaning Now</Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-2xl px-8 py-6 text-base">View Services</Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-slate-300">
                <span className="flex items-center gap-1">⭐ 4.9 Rating</span>
                <span>Licensed & insured</span>
                <span>Same-week availability</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <Card className="bg-white/10 border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-cyan-950/40">
                <CardContent className="p-4">
                  <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-200 via-white to-blue-200 p-8 text-slate-950 min-h-[430px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-600">Instant Quote</p>
                        <h2 className="text-3xl font-black mt-2">Schedule your next clean</h2>
                      </div>
                      <div className="text-4xl">✨</div>
                    </div>
                    <div className="grid gap-4 mt-8">
                      {[
                        "Choose home or business cleaning",
                        "Select one-time or recurring service",
                        "Receive confirmation and crew assignment",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
                          <span className="text-cyan-700">✅</span>
                          <span className="font-semibold">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 rounded-3xl bg-slate-950 text-white p-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Next Available</p>
                        <p className="font-bold text-xl">Tomorrow at 9:00 AM</p>
                      </div>
                      <div className="text-4xl">📅</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          <section id="services" className="max-w-7xl mx-auto px-5 py-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
              <div>
                <p className="text-cyan-300 font-semibold">Our Services</p>
                <h2 className="text-4xl font-black mt-2">Built for every cleaning need</h2>
              </div>
              <p className="text-slate-300 max-w-xl">360 Cleaning Co. can be positioned as a premium local brand serving homeowners, offices, restaurants, real estate agents, landlords, and contractors.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((service) => (
                <Card key={service.title} className="bg-white/10 border-white/10 rounded-3xl hover:bg-white/[0.14] transition">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center mb-5 text-2xl">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{service.title}</h3>
                    <p className="text-slate-300 mt-3 text-sm leading-relaxed">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="packages" className="max-w-7xl mx-auto px-5 py-16">
            <div className="text-center mb-10">
              <p className="text-cyan-300 font-semibold">Packages</p>
              <h2 className="text-4xl font-black mt-2">Simple pricing options</h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.name} className={`rounded-3xl border ${pkg.featured ? "bg-cyan-400 text-slate-950 border-cyan-300 scale-[1.02]" : "bg-white/10 text-white border-white/10"}`}>
                  <CardContent className="p-8">
                    {pkg.featured && <p className="inline-block rounded-full bg-slate-950 text-white px-3 py-1 text-xs font-bold mb-4">Most Popular</p>}
                    <h3 className="text-2xl font-black">{pkg.name}</h3>
                    <p className="text-4xl font-black mt-4">{pkg.price}</p>
                    <div className="mt-6 space-y-3">
                      {pkg.details.map((detail) => (
                        <p key={detail} className="flex items-center gap-3 text-sm">✅ {detail}</p>
                      ))}
                    </div>
                    <Button className={`w-full mt-8 rounded-2xl ${pkg.featured ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-white text-slate-950 hover:bg-slate-200"}`}>Request Quote</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="booking" className="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-cyan-300 font-semibold">Book Online</p>
              <h2 className="text-4xl font-black mt-2">Request a free estimate</h2>
              <p className="text-slate-300 mt-4">This form can connect to your backend CRM, email notifications, SMS follow-up, quote pipeline, and job scheduling system.</p>
              <div className="mt-8 space-y-4 text-slate-300">
                <p className="flex items-center gap-3">📞 (555) 123-4567</p>
                <p className="flex items-center gap-3">✉️ info@360cleaningco.com</p>
                <p className="flex items-center gap-3">📍 Serving New Jersey and surrounding areas</p>
              </div>
            </div>

            <Card className="bg-white/10 border-white/10 rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input className="rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300" placeholder="Full Name" />
                  <input className="rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300" placeholder="Phone Number" />
                </div>
                <input className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300" placeholder="Email Address" />
                <select className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300">
                  <option>Choose Service</option>
                  <option>Residential Cleaning</option>
                  <option>Commercial Cleaning</option>
                  <option>Deep Cleaning</option>
                  <option>Post-Construction Cleaning</option>
                </select>
                <textarea className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300 min-h-32" placeholder="Tell us about the property, square footage, preferred date, and cleaning needs." />
                <Button className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl py-6">📨 Submit Request</Button>
              </CardContent>
            </Card>
          </section>

          <footer className="border-t border-white/10 mt-16">
            <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-slate-400">
              <p>{"© 2026 360 Cleaning Co. All rights reserved."}</p>
              <p>Privacy Policy • Terms • Careers</p>
            </div>
          </footer>
        </main>
      ) : (
        <main className="relative z-10 max-w-7xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-cyan-300 font-semibold">Backend Preview</p>
              <h1 className="text-4xl font-black">Cleaning Business Admin Dashboard</h1>
              <p className="text-slate-300 mt-2">Manage leads, quotes, jobs, customers, crews, payments, and reports.</p>
            </div>
            <Button onClick={() => setActiveView("website")} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl">Back to Website</Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {adminStats.map((stat) => (
              <Card key={stat.label} className="bg-white/10 border-white/10 rounded-3xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-black mt-1 text-white">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center text-2xl">
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white/10 border-white/10 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-black text-white">Upcoming Jobs</h2>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-2xl">Add Job</Button>
                </div>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.client} className="rounded-2xl bg-slate-900/80 border border-white/10 p-4 grid md:grid-cols-4 gap-3 items-center">
                      <div>
                        <p className="font-bold text-white">{job.client}</p>
                        <p className="text-sm text-slate-400">{job.service}</p>
                      </div>
                      <p className="text-slate-300 md:col-span-2">{job.date}</p>
                      <span className="rounded-full bg-cyan-400/15 text-cyan-200 px-3 py-1 text-sm text-center">{job.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/10 rounded-3xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-white mb-5">Backend Modules</h2>
                <div className="space-y-3">
                  {[
                    ["📋", "Lead & Quote CRM"],
                    ["📅", "Job Scheduling"],
                    ["👥", "Crew Management"],
                    ["💵", "Invoices & Payments"],
                    ["📊", "Reports & Analytics"],
                    ["🛡️", "Admin Login & Roles"],
                  ].map(([emoji, label]) => (
                    <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-900/80 border border-white/10 p-4">
                      <span className="text-xl">{emoji}</span>
                      <span className="font-semibold text-white">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      )}
    </div>
  );
}
