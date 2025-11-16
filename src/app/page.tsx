"use client";

import Link from "next/link";
import GradientText from "@/components/GradientText";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Animated gradient background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-teal-500/25 via-cyan-400/20 to-teal-400/25 rounded-full blur-3xl" style={{ animation: 'pulse-slow 4s ease-in-out infinite' }}></div>
        <div className="absolute top-1/3 -right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/25 via-teal-400/20 to-cyan-400/25 rounded-full blur-3xl" style={{ animation: 'pulse-slow-delay-1 5s ease-in-out infinite 1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-teal-400/20 via-cyan-400/25 to-teal-300/20 rounded-full blur-3xl" style={{ animation: 'pulse-slow-delay-2 6s ease-in-out infinite 2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black/90 backdrop-blur-sm rounded-2xl border border-slate-800/50 px-6 py-3 flex items-center relative">
            {/* Numa Logo - Top Left */}
            <div className="flex items-center gap-3 flex-shrink-0 absolute left-6">
              <GradientText
                colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
                animationSpeed={4}
                showBorder={false}
                className="text-xl font-semibold tracking-tight"
              >
                Numa
              </GradientText>
            </div>
            
            {/* Centered Navigation Links */}
            <div className="flex items-center gap-8 mx-auto">
              <Link href="#" className="text-sm text-slate-300 hover:text-teal-400 transition-colors">
                Home
              </Link>
              <Link href="#features" className="text-sm text-slate-300 hover:text-teal-400 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-slate-300 hover:text-teal-400 transition-colors">
                How It Works
              </Link>
              <Link href="#team" className="text-sm text-slate-300 hover:text-teal-400 transition-colors">
                Team
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500/15 via-cyan-500/15 to-teal-400/15 border border-teal-500/30 backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 animate-pulse shadow-lg shadow-teal-400/60"></span>
              <GradientText
                colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
                animationSpeed={3}
                showBorder={false}
                className="text-sm font-medium"
              >
                AI-Powered Financial Management
              </GradientText>
            </div>
            <div className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Your Intelligent
              <br />
              <GradientText
                colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
                animationSpeed={3}
                showBorder={false}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
              >
                Agent CFO
              </GradientText>
            </div>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent">
              Set budgets, track bills, and let AI manage your finances
              autonomously. Experience the future of financial operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/dashboard"
                className="glare-hover group rounded-xl bg-teal-500 px-8 py-4 text-base font-medium text-slate-950 hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/50 hover:shadow-teal-500/70 hover:scale-105 transform"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-6 py-20 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <GradientText
              colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
              animationSpeed={4}
              showBorder={false}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Everything you need to manage finances
            </GradientText>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your
              budget and expenses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-6 space-y-4 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/20 transition-all hover:scale-105 transform relative overflow-hidden">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-cyan-500/0 to-teal-400/0 group-hover:from-teal-500/10 group-hover:via-cyan-500/10 group-hover:to-teal-400/10 transition-all blur-xl liquid-shape"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-teal-400/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-teal-400/20 border border-teal-500/30 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&q=80&crop=faces,center"
                    alt="Smart Budget Control - Financial Dashboard"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <GradientText
                  colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold"
                >
                  Smart Budget Control
                </GradientText>
                <p className="text-slate-400 leading-relaxed">
                  Set daily spending limits and track your budget in real-time.
                  Get instant visibility into your remaining budget and spending
                  patterns.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-6 space-y-4 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all hover:scale-105 transform relative overflow-hidden">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape-2 opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-teal-400/0 to-cyan-400/0 group-hover:from-cyan-500/10 group-hover:via-teal-400/10 group-hover:to-cyan-400/10 transition-all blur-xl liquid-shape-2"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500/20 via-teal-400/20 to-cyan-400/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape-2"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 via-teal-400/20 to-cyan-400/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&h=100&fit=crop&q=80&crop=faces,center"
                    alt="Bill Management - Invoice Processing"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <GradientText
                  colors={["#67e8f9", "#5eead4", "#40ffaa", "#5eead4", "#67e8f9"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold"
                >
                  Bill Management
                </GradientText>
                <p className="text-slate-400 leading-relaxed">
                  Add bills and subscriptions with receipts. Track due dates,
                  amounts, and payment status. Never miss a payment again.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-6 space-y-4 hover:border-teal-400/40 hover:shadow-2xl hover:shadow-teal-400/20 transition-all hover:scale-105 transform relative overflow-hidden">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape-3 opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 via-cyan-300/0 to-teal-300/0 group-hover:from-teal-400/10 group-hover:via-cyan-300/10 group-hover:to-teal-300/10 transition-all blur-xl liquid-shape-3"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-teal-400/20 via-cyan-300/20 to-teal-300/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape-3"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400/20 via-cyan-300/20 to-teal-300/20 border border-teal-400/30 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop&q=80&crop=faces,center"
                    alt="AI Agent Assistant - Automation Dashboard"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <GradientText
                  colors={["#40ffaa", "#67e8f9", "#5eead4", "#67e8f9", "#40ffaa"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold"
                >
                  AI Agent Assistant
                </GradientText>
                <p className="text-slate-400 leading-relaxed">
                  Let your AI agent make intelligent payment decisions based on
                  your budget and priorities. Full transparency with activity logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative px-6 py-20 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <GradientText
              colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
              animationSpeed={4}
              showBorder={false}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How It Works
            </GradientText>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Get started in seconds with three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-8 space-y-4 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/20 transition-all hover:scale-105 transform relative overflow-hidden text-center">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-cyan-500/0 to-teal-400/0 group-hover:from-teal-500/10 group-hover:via-cyan-500/10 group-hover:to-teal-400/10 transition-all blur-xl liquid-shape"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-teal-400/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/30 via-cyan-500/30 to-teal-400/30 border-2 border-teal-500/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-teal-400">1</span>
                </div>
                <GradientText
                  colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold mb-2"
                >
                  Upload Invoices
                </GradientText>
                <p className="text-slate-400 leading-relaxed">
                  Simply upload your invoices and bills. Our system automatically extracts and organizes all the details.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-8 space-y-4 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all hover:scale-105 transform relative overflow-hidden text-center">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape-2 opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-teal-400/0 to-cyan-400/0 group-hover:from-cyan-500/10 group-hover:via-teal-400/10 group-hover:to-cyan-400/10 transition-all blur-xl liquid-shape-2"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500/20 via-teal-400/20 to-cyan-400/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape-2"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 via-teal-400/30 to-cyan-400/30 border-2 border-cyan-500/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-cyan-400">2</span>
                </div>
                <GradientText
                  colors={["#67e8f9", "#5eead4", "#40ffaa", "#5eead4", "#67e8f9"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold mb-2"
                >
                  Run AI Decisions
                </GradientText>
                <p className="text-slate-400 leading-relaxed">
                  Our AI analyzes your budget, priorities, and spending patterns to make intelligent payment decisions automatically.
                </p>
              </div>
        </div>

            {/* Step 3 */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-8 space-y-4 hover:border-teal-400/40 hover:shadow-2xl hover:shadow-teal-400/20 transition-all hover:scale-105 transform relative overflow-hidden text-center">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape-3 opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 via-cyan-300/0 to-teal-300/0 group-hover:from-teal-400/10 group-hover:via-cyan-300/10 group-hover:to-teal-300/10 transition-all blur-xl liquid-shape-3"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-teal-400/20 via-cyan-300/20 to-teal-300/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape-3"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400/30 via-cyan-300/30 to-teal-300/30 border-2 border-teal-400/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-teal-300">3</span>
                </div>
                <GradientText
                  colors={["#40ffaa", "#67e8f9", "#5eead4", "#67e8f9", "#40ffaa"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold mb-2"
                >
                  Pay with USDC
                </GradientText>
                <p className="text-slate-400 leading-relaxed">
                  Payments are processed securely using USDC. Fast, transparent, and efficient transactions you can track in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative px-6 py-20 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <GradientText
              colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
              animationSpeed={4}
              showBorder={false}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Meet the Team
            </GradientText>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              The people behind Numa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Top Left - Toniya Patil */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-8 space-y-4 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/20 transition-all hover:scale-105 transform relative overflow-hidden text-center">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-cyan-500/0 to-teal-400/0 group-hover:from-teal-500/10 group-hover:via-cyan-500/10 group-hover:to-teal-400/10 transition-all blur-xl liquid-shape"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-teal-400/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape"></div>
              <div className="relative z-10">
                <GradientText
                  colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold mb-3"
                >
                  Toniya Patil
                </GradientText>
                <a
                  href="https://www.linkedin.com/in/toniya/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-teal-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Top Right - Roshini Pothapragada */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-8 space-y-4 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all hover:scale-105 transform relative overflow-hidden text-center">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape-2 opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-teal-400/0 to-cyan-400/0 group-hover:from-cyan-500/10 group-hover:via-teal-400/10 group-hover:to-cyan-400/10 transition-all blur-xl liquid-shape-2"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500/20 via-teal-400/20 to-cyan-400/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape-2"></div>
              <div className="relative z-10">
                <GradientText
                  colors={["#67e8f9", "#5eead4", "#40ffaa", "#5eead4", "#67e8f9"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold mb-3"
                >
                  Roshini Pothapragada
                </GradientText>
                <a
                  href="https://www.linkedin.com/in/roshini-pothapragada-966a31264/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Bottom Left - Anirudh Venkatachalam */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-8 space-y-4 hover:border-teal-400/40 hover:shadow-2xl hover:shadow-teal-400/20 transition-all hover:scale-105 transform relative overflow-hidden text-center">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape-3 opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 via-cyan-300/0 to-teal-300/0 group-hover:from-teal-400/10 group-hover:via-cyan-300/10 group-hover:to-teal-300/10 transition-all blur-xl liquid-shape-3"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-teal-400/20 via-cyan-300/20 to-teal-300/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape-3"></div>
              <div className="relative z-10">
                <GradientText
                  colors={["#40ffaa", "#67e8f9", "#5eead4", "#67e8f9", "#40ffaa"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold mb-3"
                >
                  Anirudh Venkatachalam
                </GradientText>
                <a
                  href="https://www.linkedin.com/in/anirudhvee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-teal-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Bottom Right - Manoj Elango */}
            <div className="glare-hover group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm p-8 space-y-4 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-400/20 transition-all hover:scale-105 transform relative overflow-hidden text-center">
              {/* Silver blur shape */}
              <div className="absolute -inset-3 silver-blur liquid-shape opacity-30 group-hover:opacity-50 transition-opacity -z-20"></div>
              {/* Liquid morphing shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-teal-300/0 to-cyan-300/0 group-hover:from-cyan-400/10 group-hover:via-teal-300/10 group-hover:to-cyan-300/10 transition-all blur-xl liquid-shape"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400/20 via-teal-300/20 to-cyan-300/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity -z-10 liquid-shape"></div>
              <div className="relative z-10">
                <GradientText
                  colors={["#5eead4", "#67e8f9", "#40ffaa", "#67e8f9", "#5eead4"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-xl font-semibold mb-3"
                >
                  Manoj Elango
                </GradientText>
                <a
                  href="https://www.linkedin.com/in/manojelango/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-sm text-slate-500">
            © 2024 Numa. All rights reserved.
          </p>
        </div>
      </footer>

    </main>
  );
}
