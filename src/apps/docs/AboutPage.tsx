import React from 'react';
import { ShieldCheck, Cpu, Zap, Layers, GitBranch, ArrowLeft, ExternalLink } from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (route: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
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
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          Trust Anchor / About
        </span>
      </div>

      <header className="mb-12 border-b border-slate-800 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          About Turbocharger
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-3xl">
          Turbocharger is an enterprise-grade developer toolchain and acceleration platform engineered for high-velocity Turborepo monorepos. Our mission is to eliminate build latency, enforce architectural integrity across multi-package codebases, and give engineering teams real-time visibility into their dependency graphs.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sub-Millisecond Resolver</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The Turbocharger resolver uses high-speed path traversal to resolve package scopes, package.json exports, and crate targets in under 0.4 milliseconds. This allows automated agents and CI runners to pinpoint affected packages instantly without full filesystem re-indexing.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Remote Cache Simulation</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Accurately computes and simulates 64-bit FNV/SHA artifact signatures to maximize CI cache hit ratios. Teams can simulate whether task nodes will achieve cache hits or require execution before triggering CI/CD pipelines, saving cloud compute costs.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Boundary Tag Enforcement</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Enforces dependency boundaries and package tagging rules to prevent unwanted coupling. Architecture teams can set policies such as prohibiting UI libraries from importing application servers or ensuring internal crates remain private.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
            <GitBranch className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Deterministic DAG Engine</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Generates topological task waves and executes tasks in optimal parallel stages. Turbocharger inspects cycle conditions, computes critical path bottlenecks, and provides visual and programmatic graph representations for developers and AI agents alike.
          </p>
        </div>
      </div>

      <section className="border-t border-slate-800 pt-10 mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Our Commitment &amp; Open Source</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          Turbocharger is distributed as free, open-source software under the MIT License. We believe that developer tooling should be transparent, verifiable, and fast. All code, CLI utilities, and algorithms are accessible for inspection and contribution.
        </p>
        <p className="text-slate-400 leading-relaxed">
          Whether you are managing a small multi-package repository or an enterprise monorepo with thousands of packages, Turbocharger provides the deterministic foundations needed for seamless scaling.
        </p>
      </section>

      <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">Need to talk to our team?</h3>
          <p className="text-sm text-slate-400">Reach out for architecture reviews, integration support, or feature requests.</p>
        </div>
        <button
          onClick={() => onNavigate?.('contact')}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          Contact Us
        </button>
      </div>
    </div>
  );
}
