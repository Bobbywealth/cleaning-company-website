import React, { useState } from "react";

const services = [
  { icon: "🏠", title: "Residential Cleaning", desc: "Recurring & one-time cleans for homes, apartments, and condos." },
  { icon: "🏢", title: "Commercial Cleaning", desc: "Offices, retail, and medical facilities kept spotless." },
  { icon: "✨", title: "Deep Cleaning", desc: "Top-to-bottom detail cleans for move-ins and seasonal resets." },
  { icon: "🧽", title: "Post-Construction", desc: "Dust, debris, and residue removal after renovations." },
  { icon: "🛡️", title: "Disinfection", desc: "EPA-grade disinfecting for high-traffic spaces." },
  { icon: "📅", title: "Recurring Plans", desc: "Weekly, bi-weekly, or monthly schedules tailored to you." },
];

const adminStats = [
  { label: "Active Jobs", value: "24", icon: "📅" },
  { label: "This Month Revenue", value: "$18,420", icon: "💵" },
  { label: "Crew Members", value: "12", icon: "👥" },
  { label: "Open Quotes", value: "7", icon: "📋" },
];

const jobs = [
  { client: "Acme Offices", service: "Commercial Deep Clean", date: "May 9, 9:00 AM", status: "Scheduled" },
  { client: "The Johnson Home", service: "Recurring Residential", date: "May 9, 1:00 PM", status: "In Progress" },
  { client: "Riverside Clinic", service: "Disinfection", date: "May 10, 8:00 AM", status: "Scheduled" },
];

export default function CleaningCompanyWebsite() {
  const [activeView, setActiveView] = useState("website");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {activeView === "website" ? (
        <div>
          <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-400 text-slate-950 font-black flex items-center justify-center">360</div>
                <span className="font-black text-xl">360 Cleaning Co.</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-slate-300">
                <a href="#services" className="hover:text-white">Services</a>
                <a href="#about" className="hover:text-white">About</a>
                <a href="#contact" className="hover:text-white">Contact</a>
              </nav>
              <button onClick={() => setActiveView("admin")} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl px-4 py-2 font-bold">Admin</button>
            </div>
          </header>

          <section className="max-w-7xl mx-auto px-6 py-20 text-center">
            <p className="text-cyan-300 font-semibold tracking-wide uppercase">Trusted local cleaners</p>
            <h1 className="text-5xl md:text-7xl font-black mt-3">A Sparkling Clean, Every Time.</h1>
            <p className="text-slate-300 mt-6 max-w-2xl mx-auto text-lg">360 Cleaning Co. delivers premium residential and commercial cleaning services with vetted crews, eco-friendly products, and a satisfaction guarantee.</p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <a href="#contact" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl px-6 py-3 font-bold">Get a Free Quote</a>
              <a href="#services" className="border border-white/20 hover:bg-white/10 rounded-2xl px-6 py-3 font-bold">Our Services</a>
            </div>
          </section>

          <section id="services" className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-3xl md:text-4xl font-black mb-8">Our Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <div key={s.title} className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center text-2xl mb-4">{s.icon}</div>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="text-slate-400 mt-2">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="about" className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">Why 360 Cleaning Co.?</h2>
              <ul className="space-y-3 text-slate-300">
                <li>Background-checked, insured crews</li>
                <li>Eco-friendly, family-safe products</li>
                <li>Flexible scheduling, online booking</li>
                <li>100% satisfaction guarantee</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 border border-white/10 p-10 text-center">
              <p className="text-6xl font-black">5★</p>
              <p className="text-slate-300 mt-2">Average rating from 500+ happy clients</p>
            </div>
          </section>

          <section id="contact" className="max-w-3xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready for a sparkling space?</h2>
            <p className="text-slate-300 mb-6">Email us at <a href="mailto:hello@360cleaningco.com" className="text-cyan-300 underline">hello@360cleaningco.com</a> or call (555) 360-0360.</p>
            <a href="mailto:hello@360cleaningco.com" className="inline-block bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl px-6 py-3 font-bold">Request a Quote</a>
          </section>

          <footer className="border-t border-white/10 mt-10">
            <div className="max-w-7xl mx-auto px-6 py-8 text-slate-400 text-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <p>{`\u00A9 ${new Date().getFullYear()} 360 Cleaning Co. All rights reserved.`}</p>
              <p>Built with care.</p>
            </div>
          </footer>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <button onClick={() => setActiveView("website")} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl px-4 py-2 font-bold">Back to Website</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {adminStats.map((stat) => (
              <div key={stat.label} className="bg-white/10 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-black mt-1 text-white">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center text-2xl">{stat.icon}</div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/10 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black text-white">Upcoming Jobs</h2>
                <button className="border border-white/20 text-white hover:bg-white/10 rounded-2xl px-4 py-2">Add Job</button>
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
            </div>
            <div className="bg-white/10 border border-white/10 rounded-3xl p-6">
              <h2 className="text-2xl font-black text-white mb-5">Backend Modules</h2>
              <div className="space-y-3">
                {[["📋", "Lead & Quote CRM"],["📅", "Job Scheduling"],["👥", "Crew Management"],["💵", "Invoices & Payments"],["📊", "Reports & Analytics"],["🛡️", "Admin Login & Roles"]].map(([emoji, label]) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-900/80 border border-white/10 p-4">
                    <span className="text-xl">{emoji}</span>
                    <span className="font-semibold text-white">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
