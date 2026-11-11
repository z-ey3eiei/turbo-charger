import React from 'react';
import { ShieldCheck, Cpu, Zap, Layers, GitBranch, ArrowLeft, ExternalLink } from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (route: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
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
          Trust Anchor / About
        </span>
      </div>

      <header className="mb-12 border-b border-gray-300 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-1000 mb-4">
          About Turbocharger
        </h1>
        <p className="text-lg text-gray-900 leading-relaxed max-w-3xl">
          Turbocharger is an enterprise-grade developer toolchain and acceleration platform engineered for high-velocity Turborepo monorepos. Our mission is to eliminate build latency, enforce architectural integrity across multi-package codebases, and give engineering teams real-time visibility into their dependency graphs.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
          <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-1000 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-[#FF1E56]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-1000 mb-2">Sub-Millisecond Resolver</h2>
          <p className="text-sm text-gray-900 leading-relaxed">
            The Turbocharger resolver uses high-speed path traversal to resolve package scopes, package.json exports, and crate targets in under 0.4 milliseconds. This allows automated agents and CI runners to pinpoint affected packages instantly without full filesystem re-indexing.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
          <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-1000 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-1000 mb-2">Remote Cache Simulation</h2>
          <p className="text-sm text-gray-900 leading-relaxed">
            Accurately computes and simulates 64-bit FNV/SHA artifact signatures to maximize CI cache hit ratios. Teams can simulate whether task nodes will achieve cache hits or require execution before triggering CI/CD pipelines, saving cloud compute costs.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
          <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-1000 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5 text-[#0096FF]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-1000 mb-2">Boundary Tag Enforcement</h2>
          <p className="text-sm text-gray-900 leading-relaxed">
            Enforces dependency boundaries and package tagging rules to prevent unwanted coupling. Architecture teams can set policies such as prohibiting UI libraries from importing application servers or ensuring internal crates remain private.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small)">
          <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-1000 flex items-center justify-center mb-4">
            <GitBranch className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-1000 mb-2">Deterministic DAG Engine</h2>
          <p className="text-sm text-gray-900 leading-relaxed">
            Generates topological task waves and executes tasks in optimal parallel stages. Turbocharger inspects cycle conditions, computes critical path bottlenecks, and provides visual and programmatic graph representations for developers and AI agents alike.
          </p>
        </div>
      </div>

      <section className="border-t border-gray-300 pt-10 mb-12">
        <h2 className="text-2xl font-bold text-gray-1000 mb-4">Our Commitment &amp; Open Source</h2>
        <p className="text-gray-900 leading-relaxed mb-4">
          Turbocharger is distributed as free, open-source software under the MIT License. We believe that developer tooling should be transparent, verifiable, and fast. All code, CLI utilities, and algorithms are accessible for inspection and contribution.
        </p>
        <p className="text-gray-900 leading-relaxed">
          Whether you are managing a small multi-package repository or an enterprise monorepo with thousands of packages, Turbocharger provides the deterministic foundations needed for seamless scaling.
        </p>
      </section>

      <div className="p-6 rounded-xl border border-gray-300 bg-background-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-1000">Need to talk to our team?</h3>
          <p className="text-sm text-gray-900">Reach out for architecture reviews, integration support, or feature requests.</p>
        </div>
        <button
          onClick={() => onNavigate?.('contact')}
          className="px-4 py-2 rounded-lg bg-gray-1000 text-background-100 hover:bg-gray-900 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          Contact Us
        </button>
      </div>
    </div>
  );
}
