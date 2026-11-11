import React from 'react';
import { Shield, Lock, FileText, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate?: (route: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
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
          Trust Anchor / Privacy Policy
        </span>
      </div>

      <header className="mb-12 border-b border-gray-300 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-1000 mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-900 font-mono">
          Last Updated: November 10, 2026 &bull; Effective Immediately
        </p>
      </header>

      <div className="space-y-10 text-gray-900 leading-relaxed text-sm sm:text-base">
        <section className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
          <h2 className="text-xl font-semibold text-gray-1000 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            1. Zero Source Code Ingestion Guarantee
          </h2>
          <p className="mb-3">
            Turbocharger is fundamentally designed with privacy and code isolation by default. When you execute Turbocharger CLI commands (`resolve`, `hash`, `audit`, `diag`) or use the browser-based visualization studio, all parsing of your `turbo.json`, package manifests, directory trees, and Rust crates executes locally within your own runtime environment or browser sandbox.
          </p>
          <p className="text-emerald-400 font-medium">
            We never upload, store, or transmit your proprietary source code, git repository contents, or private package files to our servers.
          </p>
        </section>

        <section className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
          <h2 className="text-xl font-semibold text-gray-1000 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#0096FF]" />
            2. Information Handled by Server Tools
          </h2>
          <p className="mb-3">
            Turbocharger provides optional Node.js server tools for developer convenience, such as verifying NPM registry tokens and dry-running package releases.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-900">
            <li>
              <strong className="text-gray-1000">NPM Authentication Tokens:</strong> Any token entered into the Server Tools interface is held in volatile server memory only. Tokens are masked in user interfaces (`npm_****`) and are used strictly to communicate directly with the official npm registry (`registry.npmjs.org`).
            </li>
            <li>
              <strong className="text-gray-1000">Audit &amp; Diagnostic Logs:</strong> Command history and tool audit logs are maintained in an ephemeral in-memory ring buffer. They are automatically cleared upon server restart and never persisted to external databases.
            </li>
            <li>
              <strong className="text-gray-1000">Telemetry &amp; Tracking:</strong> We do not employ third-party advertising trackers, cross-site beacons, or commercial data broking scripts.
            </li>
          </ul>
        </section>

        <section className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
          <h2 className="text-xl font-semibold text-gray-1000 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            3. Data Retention &amp; Rights
          </h2>
          <p className="mb-3">
            Because Turbocharger operates statelessly without requiring mandatory user account registration or persistent cloud databases, there is no personal profile data stored on our servers.
          </p>
          <p>
            If you communicate with our engineering or support team via email (<a href="mailto:devstack.sdk@gmail.com" className="text-blue-400 underline">devstack.sdk@gmail.com</a>), your email address and message history will be used exclusively to provide customer support and answer technical questions. You retain the right to request deletion of any support email correspondence at any time.
          </p>
        </section>

        <section className="border-t border-gray-300 pt-8">
          <h2 className="text-xl font-semibold text-gray-1000 mb-3">
            4. Security Standards &amp; Inquiries
          </h2>
          <p className="mb-4">
            We employ modern security best practices including HTTPS/TLS encryption in transit, strict Content Security Policies, sanitized inputs, and dependency vulnerability scanning.
          </p>
          <div className="p-4 rounded-lg bg-background-100 border border-gray-300">
            <p className="text-xs text-gray-900 mb-1">Privacy Officer &amp; Contact Point:</p>
            <p className="font-mono text-sm text-gray-1000">devstack.sdk@gmail.com</p>
            <p className="text-xs text-gray-900 mt-1">Turbocharger Team &bull; 799 Market St, San Francisco, CA 94103, USA</p>
          </div>
        </section>
      </div>
    </div>
  );
}
