import React, { useState } from 'react';
import { Mail, MapPin, Clock, MessageSquare, CheckCircle, ArrowLeft, Send } from 'lucide-react';

interface ContactPageProps {
  onNavigate?: (route: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-slate-200">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => onNavigate?.('home')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          Trust Anchor / Contact
        </span>
      </div>

      <header className="mb-12 border-b border-slate-800 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Contact Turbocharger Team
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-3xl">
          We are dedicated to supporting developers, platform engineering teams, and open-source contributors working with Turborepo monorepos and the Turbocharger engine. Reach out to us for technical assistance, partnership opportunities, or feedback.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Direct Email</h2>
            <p className="text-xs text-slate-400 mb-2">Our support team replies within 24 hours.</p>
            <a
              href="mailto:devstack.sdk@gmail.com"
              className="text-sm font-mono text-blue-400 hover:underline break-all"
            >
              devstack.sdk@gmail.com
            </a>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Office Location</h2>
            <p className="text-xs text-slate-400 mb-2">Headquarters &amp; Developer Relations</p>
            <p className="text-sm text-slate-300">
              799 Market St<br />
              San Francisco, CA 94103<br />
              United States
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Support Hours</h2>
            <p className="text-xs text-slate-400 mb-2">Core Engineering Availability</p>
            <p className="text-sm text-slate-300">
              Monday &ndash; Friday<br />
              09:00 &ndash; 18:00 PST (Pacific Standard Time)<br />
              Emergency on-call via automated monitors
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur">
            <h2 className="text-2xl font-bold text-white mb-2">Send us a Message</h2>
            <p className="text-sm text-slate-400 mb-6">
              Fill out the form below to reach our team regarding bug reports, feature requests, or enterprise support.
            </p>

            {submitted ? (
              <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Message Received!</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Thank you for contacting Turbocharger. Our core team has received your inquiry and will respond to <span className="font-mono text-emerald-300">{formData.email}</span> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Remote Cache hash mismatch in CI"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your monorepo configuration, task graph question, or issue in detail..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
