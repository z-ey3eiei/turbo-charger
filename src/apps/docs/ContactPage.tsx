import React, { useState } from 'react';
import { Mail, MapPin, Clock, CheckCircle, ArrowLeft, Send } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 py-12 text-gray-1000">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => onNavigate?.('home')}
          className="inline-flex items-center gap-2 text-sm text-gray-900 hover:text-gray-1000 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <span className="text-xs px-2.5 py-1 rounded-full bg-background-100 text-gray-900 border border-gray-300 font-mono">
          Trust Anchor / Contact
        </span>
      </div>

      <header className="mb-12 border-b border-gray-300 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-1000 mb-4">
          Contact Turbocharger Team
        </h1>
        <p className="text-lg text-gray-900 leading-relaxed max-w-3xl">
          We are dedicated to supporting developers, platform engineering teams, and open-source contributors working with Turborepo monorepos and the Turbocharger engine. Reach out to us for technical assistance, partnership opportunities, or feedback.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
            <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-1000 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-[#0096FF]" />
            </div>
            <h2 className="text-base font-semibold text-gray-1000 mb-1">Direct Email</h2>
            <p className="text-xs text-gray-900 mb-2">Our support team replies within 24 hours.</p>
            <a
              href="mailto:devstack.sdk@gmail.com"
              className="text-sm font-mono text-gray-1000 hover:underline break-all"
            >
              devstack.sdk@gmail.com
            </a>
          </div>

          <div className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
            <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-1000 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-1000 mb-1">Office Location</h2>
            <p className="text-xs text-gray-900 mb-2">Headquarters &amp; Developer Relations</p>
            <p className="text-sm text-gray-900">
              799 Market St<br />
              San Francisco, CA 94103<br />
              United States
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
            <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-1000 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-[#FF1E56]" />
            </div>
            <h2 className="text-base font-semibold text-gray-1000 mb-1">Support Hours</h2>
            <p className="text-xs text-gray-900 mb-2">Core Engineering Availability</p>
            <p className="text-sm text-gray-900">
              Monday &ndash; Friday<br />
              09:00 &ndash; 18:00 PST (Pacific Standard Time)<br />
              Emergency on-call via automated monitors
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="p-8 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
            <h2 className="text-2xl font-bold text-gray-1000 mb-2">Send us a Message</h2>
            <p className="text-sm text-gray-900 mb-6">
              Fill out the form below to reach our team regarding bug reports, feature requests, or enterprise support.
            </p>

            {submitted ? (
              <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-1000 mb-1">Message Received!</h3>
                <p className="text-sm text-gray-900">
                  Thank you for contacting the Turbocharger team. A platform engineer will review your inquiry and follow up at <strong className="text-gray-1000">{formData.email}</strong> shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 rounded-lg bg-background-200 border border-gray-300 text-gray-1000 text-sm focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full px-3 py-2 rounded-lg bg-background-200 border border-gray-300 text-gray-1000 text-sm focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Monorepo caching inquiry / Resolver optimization"
                    className="w-full px-3 py-2 rounded-lg bg-background-200 border border-gray-300 text-gray-1000 text-sm focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your architecture requirements, monorepo scale, or any questions..."
                    className="w-full px-3 py-2 rounded-lg bg-background-200 border border-gray-300 text-gray-1000 text-sm focus:outline-none focus:border-gray-500"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-1000 text-background-100 hover:bg-gray-900 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
