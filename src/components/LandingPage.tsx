import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  FileSpreadsheet, 
  Smartphone, 
  Database, 
  Calculator, 
  Sparkles, 
  Keyboard, 
  QrCode, 
  Download,
  ChevronDown,
  TrendingUp,
  Receipt,
  MessageSquare,
  Lock,
  Globe2,
  Check,
  Copy
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
  onStartBilling: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartBilling }) => {
  // Mobile mockup tab state
  const [mobileTab, setMobileTab] = useState<'home' | 'bill' | 'ask'>('home');

  // Interactive Live Calculator State (Demo POS Engine)
  const [calcQty, setCalcQty] = useState(2);
  const [calcPrice, setCalcPrice] = useState(3850);
  const [calcGstRate, setCalcGstRate] = useState(18);
  const [calcIsInterstate, setCalcIsInterstate] = useState(false);

  // Copied indicator
  const [copied, setCopied] = useState(false);

  // Animated numbers
  const [liveSalesNumber, setLiveSalesNumber] = useState(996240);

  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; tag?: string }>>([
    { sender: 'bot', text: 'Namaste! Ask me anything about your October sales, debtors, tax liability, or stock levels.' },
    { sender: 'user', text: 'Who owes me money?' },
    { sender: 'bot', text: 'You have ₹2,31,486 pending across 6 accounts. Top overdue: Apex Infotech (₹92,300) and Metro Security (₹84,976).', tag: 'Receivables aging' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Periodic subtle live counter increment for realism
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSalesNumber(prev => prev + (Math.random() > 0.6 ? 2400 : 0));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleAskQuestion = (question: string, answer: string, tag: string) => {
    if (isTyping) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: question }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'bot', text: answer, tag }]);
    }, 550);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Derived calculation engine
  const taxableValue = calcQty * calcPrice;
  const taxAmount = (taxableValue * calcGstRate) / 100;
  const grandTotal = taxableValue + taxAmount;

  const testimonials = [
    { quote: "Our counter billing used to lag during evening peak rush when the internet was unstable. PayzenMax runs locally without hiccups.", name: "Rajesh Kulkarni", role: "Electronics Dealer, Pune" },
    { quote: "On the 1st of every month, I just hit 'Export GSTR-1 JSON' and send it to my CA. No mismatched tables, zero rounding errors.", name: "Nilesh Patel", role: "Auto Parts Distributor, Surat" },
    { quote: "The dynamic UPI QR code on the bill cut our checkout time in half. Customers scan and pay before we even finish bagging.", name: "Sunita Agarwal", role: "Hardware Retailer, Nagpur" },
    { quote: "Sub-8-second invoice generation is real. It's keyboard driven and doesn't get stuck waiting for a server in Bangalore to reply.", name: "Vikas Mehra", role: "IT Supplies & Networking, Delhi" },
    { quote: "Being able to run intra-state and inter-state GST with 0.00 paise drift gives me complete peace of mind during GST audits.", name: "Anand Rathi", role: "Electrical Trader, Ahmedabad" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 font-sans overflow-x-hidden relative transition-colors duration-200">
      {/* Dynamic Ambient Background Blur Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/40 dark:bg-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-mesh-1 -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[28rem] h-[28rem] bg-amber-100/40 dark:bg-emerald-800/15 rounded-full blur-3xl pointer-events-none animate-mesh-2 -z-10" />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 bg-emerald-100/50 dark:bg-teal-700/20 rounded-full blur-3xl pointer-events-none animate-mesh-1 -z-10" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#f7f6f2]/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm hover:scale-105 hover:rotate-3 transition-transform duration-200 cursor-pointer">
              PM
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">PayzenMax.com</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                Offline-First GST
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-800 dark:hover:text-emerald-400 hover:-translate-y-0.5 transition duration-150">Features</a>
            <a href="#calculator" className="hover:text-emerald-800 dark:hover:text-emerald-400 hover:-translate-y-0.5 transition duration-150">POS Engine</a>
            <a href="#mobile" className="hover:text-emerald-800 dark:hover:text-emerald-400 hover:-translate-y-0.5 transition duration-150">Mobile</a>
            <a href="#stories" className="hover:text-emerald-800 dark:hover:text-emerald-400 hover:-translate-y-0.5 transition duration-150">Stories</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onStartBilling}
              className="flex items-center gap-2 px-4 py-2 shimmer-button text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <span>Start billing — no login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-6 max-w-5xl mx-auto text-center space-y-6 relative">
        {/* Floating badge right */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full shadow-md text-xs font-medium text-slate-700 absolute top-4 right-0 animate-float-reverse hover:scale-105 transition-transform duration-200">
          <span className="text-emerald-700 font-bold">Rule 46</span>
          <span className="text-slate-500">·</span>
          <span>CBIC Audit-Compliant</span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full text-xs font-semibold shadow-xs animate-badge-glow">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>No cloud downtime · No missing invoices · Exact to 0.00 paise</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
          GST billing that keeps <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-400 relative inline-block">
            your books honest.
            <svg className="absolute -bottom-2 left-0 w-full text-emerald-500/30 -z-10" viewBox="0 0 250 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9C50 3 150 2 247 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Rule 46 compliant invoices generated in under 8 seconds. Runs completely in your browser — zero setup, works offline, and files directly to GSTR-1.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={onStartBilling}
            className="px-7 py-3.5 shimmer-button text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 active:scale-95 group"
          >
            <span>Start billing — no login needed</span>
            <kbd className="hidden sm:inline-block bg-emerald-950/40 text-emerald-100 text-[10px] px-2 py-0.5 rounded font-mono group-hover:bg-emerald-950/60 transition">
              Alt+N
            </kbd>
          </button>

          <a
            href="#calculator"
            className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition active:scale-95"
          >
            Try live GST calculator
          </a>
        </div>

        {/* 4 Trust Metrics with Hover Scaling */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 text-left">
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition duration-200 group cursor-default">
            <div className="text-3xl font-extrabold font-mono text-emerald-800 group-hover:scale-105 transition-transform duration-200 origin-left">0</div>
            <div className="text-xs font-bold text-slate-800 mt-1">Logins required</div>
            <div className="text-[11px] text-slate-500">Instant browser launch</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition duration-200 group cursor-default">
            <div className="text-3xl font-extrabold font-mono text-emerald-800 group-hover:scale-105 transition-transform duration-200 origin-left">0.00</div>
            <div className="text-xs font-bold text-slate-800 mt-1">Paise rounding drift</div>
            <div className="text-[11px] text-slate-500">Exact mathematical tax split</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition duration-200 group cursor-default">
            <div className="text-3xl font-extrabold font-mono text-emerald-800 group-hover:scale-105 transition-transform duration-200 origin-left">3</div>
            <div className="text-xs font-bold text-slate-800 mt-1">GSTR-1 tables filed</div>
            <div className="text-[11px] text-slate-500">Table 4, 7, and 12 JSON</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition duration-200 group cursor-default">
            <div className="text-3xl font-extrabold font-mono text-emerald-800 group-hover:scale-105 transition-transform duration-200 origin-left">24x7</div>
            <div className="text-xs font-bold text-slate-800 mt-1">Works 100% offline</div>
            <div className="text-[11px] text-slate-500">Local device persistence</div>
          </div>
        </div>

        {/* Scroll Cue Arrow */}
        <div className="pt-6 flex justify-center">
          <a href="#demo" className="text-slate-400 hover:text-slate-700 transition flex flex-col items-center gap-1 animate-cue text-[11px]">
            <span>See live counter workflow</span>
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Live Interactive POS Calculator Showcase */}
      <section id="calculator" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden hover:shadow-2xl transition duration-300">
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-300 ml-2">Interactive Rule 46 POS Engine</span>
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-mono">
              Live deterministic math
            </span>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#fafaf9]">
            {/* Calculator Controls */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Try it right here</span>
                <h3 className="text-xl font-bold text-slate-900">Live Tax Calculation Engine</h3>
                <p className="text-xs text-slate-500">Change values to see immediate split calculation and zero rounding drift.</p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={calcQty}
                    onChange={e => setCalcQty(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>1 unit</span>
                    <span className="font-bold text-slate-900">{calcQty} units</span>
                    <span>10 units</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="100"
                    value={calcPrice}
                    onChange={e => setCalcPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">GST Slab</label>
                    <select
                      value={calcGstRate}
                      onChange={e => setCalcGstRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    >
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST (Standard)</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Supply Mode</label>
                    <button
                      type="button"
                      onClick={() => setCalcIsInterstate(!calcIsInterstate)}
                      className={`w-full py-1.5 px-2 rounded-lg font-medium border text-[11px] transition ${
                        calcIsInterstate
                          ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                      }`}
                    >
                      {calcIsInterstate ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Receipt Result Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 hover:border-emerald-300 transition duration-200">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-900">Tax Invoice Preview</div>
                  <div className="text-[11px] text-slate-400">Rule 46 deterministic calculation</div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  calcIsInterstate ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {calcIsInterstate ? 'IGST ROUTE' : 'CGST + SGST ROUTE'}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Value ({calcQty} × ₹{calcPrice})</span>
                  <span className="font-bold text-slate-900">₹{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {calcIsInterstate ? (
                  <div className="flex justify-between text-purple-800 font-medium">
                    <span>IGST ({calcGstRate}%)</span>
                    <span>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST ({calcGstRate / 2}%)</span>
                      <span>₹{(taxAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST ({calcGstRate / 2}%)</span>
                      <span>₹{(taxAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Rounding drift</span>
                  <span className="text-emerald-700 font-bold">0.00 paise</span>
                </div>

                <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-xl text-emerald-800 font-mono">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                onClick={onStartBilling}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                <span>Issue bill with this total</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 px-6 transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Six Core Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Designed from the ground up for Indian business realities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fbfbfa] dark:bg-slate-800/60 space-y-3 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-800 group-hover:text-white transition duration-200">
                <Keyboard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">01. Counter billing for speed</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Global shortcut <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded text-[10px]">Alt+N</kbd>, rapid SKU search, quick-add customers on the fly, and sub-8-second invoice generation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fbfbfa] dark:bg-slate-800/60 space-y-3 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-800 group-hover:text-white transition duration-200">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">02. Un-miscalculating GST engine</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatic Place of Supply (POS) detection: instantly routes into CGST + SGST (intra-state) or IGST (inter-state) with 0.00 paise rounding drift.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fbfbfa] dark:bg-slate-800/60 space-y-3 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-800 group-hover:text-white transition duration-200">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">03. Rule 46 invoices with UPI QR</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Original, Duplicate, and Triplicate copies. Dynamic UPI QR payment link generated for instant checkout with PhonePe, GPay, or Paytm.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fbfbfa] dark:bg-slate-800/60 space-y-3 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-800 group-hover:text-white transition duration-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">04. Self-explaining reports</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Transparent "How is this calculated?" drawers for revenue and tax liability. Natural language "Ask your books" assistant.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fbfbfa] dark:bg-slate-800/60 space-y-3 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-800 group-hover:text-white transition duration-200">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">05. Zero-lockin portability</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All data is stored inside your browser. Download complete JSON backups or restore anytime with one click. No vendor lock-in.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fbfbfa] dark:bg-slate-800/60 space-y-3 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-800 group-hover:text-white transition duration-200">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">06. GSTR-1 ready on the 1st</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Auto-classifies into Table 4 (B2B), Table 7 (B2C Small), and Table 12 (HSN summary). Download JSON for direct upload on gst.gov.in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mobile Section with 3-tab transitions */}
      <section id="mobile" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Mobile Point-Of-Sale
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Take your billing counter anywhere on any smartphone
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              No heavy apps to download. Open PayzenMax on your phone's browser, bookmark it, and run your retail sales, inventory checks, and receivables from the counter or warehouse floor.
            </p>

            <div className="space-y-3 pt-2">
              <div 
                onClick={() => setMobileTab('home')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  mobileTab === 'home' ? 'bg-emerald-50 border-emerald-400 shadow-sm translate-x-1' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>1. Today's Numbers</span>
                  {mobileTab === 'home' && <span className="text-[10px] text-emerald-800 font-bold">Active view</span>}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Live dashboard metrics, today's sales, and pending debtors.</div>
              </div>

              <div 
                onClick={() => setMobileTab('bill')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  mobileTab === 'bill' ? 'bg-emerald-50 border-emerald-400 shadow-sm translate-x-1' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>2. 30-Second Mobile Bill</span>
                  {mobileTab === 'bill' && <span className="text-[10px] text-emerald-800 font-bold">Active view</span>}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Quick barcode scanning and dynamic UPI payment QR.</div>
              </div>

              <div 
                onClick={() => setMobileTab('ask')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  mobileTab === 'ask' ? 'bg-emerald-50 border-emerald-400 shadow-sm translate-x-1' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>3. Ask Your Books</span>
                  {mobileTab === 'ask' && <span className="text-[10px] text-emerald-800 font-bold">Active view</span>}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Interactive questions with verified ledger answers.</div>
              </div>
            </div>
          </div>

          {/* Interactive Phone Frame Mockup */}
          <div className="flex justify-center">
            <div className="w-[320px] h-[620px] bg-slate-950 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between hover:rotate-1 transition-transform duration-300">
              {/* Top speaker notch */}
              <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Phone Screen Container */}
              <div className="bg-white rounded-[32px] flex-1 overflow-hidden flex flex-col p-4 relative text-slate-900">
                {mobileTab === 'home' && (
                  <div className="animate-pop space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900">PayzenMax Mobile</div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ONLINE
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3.5 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-semibold">Today's Sales</span>
                      <div className="text-xl font-bold font-mono text-emerald-950 mt-1">₹42,850.00</div>
                      <div className="text-[10px] text-emerald-700 mt-0.5">14 bills · 0 errors</div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-800">Critical Alerts</span>
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-amber-900">TP-Link Archer C6</div>
                          <div className="text-amber-700 text-[10px]">2 units remaining</div>
                        </div>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">REORDER</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="text-[10px] text-slate-500">Uncollected Receivables</div>
                      <div className="text-sm font-bold font-mono text-amber-800">₹2,31,486.00</div>
                      <div className="text-[10px] text-slate-400">Tap to view debtor list</div>
                    </div>
                  </div>
                )}

                {mobileTab === 'bill' && (
                  <div className="animate-pop space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900">Counter Bill #1049</div>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">READY</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1">
                      <div className="text-slate-500 text-[10px]">Customer</div>
                      <div className="font-bold text-slate-900">Shree Ganesh Telecom</div>
                      <div className="font-mono text-[10px] text-slate-600">27AALCG5582K1Z9</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-center space-y-2">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Instant UPI Payment</div>
                      <div className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-lg mx-auto flex items-center justify-center">
                        <QrCode className="w-20 h-20 text-slate-800" />
                      </div>
                      <div className="text-xs font-bold font-mono text-emerald-800">₹45,430.00</div>
                    </div>

                    <button 
                      onClick={onStartBilling}
                      className="w-full py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 transition"
                    >
                      Print & Clear
                    </button>
                  </div>
                )}

                {mobileTab === 'ask' && (
                  <div className="animate-pop flex flex-col h-full space-y-2">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 shrink-0">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-700" />
                        Ask your books
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px]">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`animate-pop p-2 rounded-xl leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-slate-900 text-white ml-6 rounded-tr-xs'
                              : 'bg-slate-100 text-slate-800 mr-4 rounded-tl-xs'
                          }`}
                        >
                          <div>{msg.text}</div>
                          {msg.tag && (
                            <span className="inline-block mt-1 text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-medium">
                              {msg.tag}
                            </span>
                          )}
                        </div>
                      ))}

                      {isTyping && (
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-500 mr-12 rounded-tl-xs flex items-center gap-1">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    <div className="pt-1 border-t border-slate-100 shrink-0 flex flex-wrap gap-1">
                      <button
                        onClick={() => handleAskQuestion("Sales this month?", "October gross sales: ₹9,96,240 across 48 invoices.", "Sales register")}
                        className="text-[9px] px-2 py-0.8 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition"
                      >
                        Sales this month?
                      </button>
                      <button
                        onClick={() => handleAskQuestion("GST liability?", "Output tax due: ₹1,51,969 (CGST: ₹46,769, SGST: ₹46,769, IGST: ₹58,431).", "Tax engine")}
                        className="text-[9px] px-2 py-0.8 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition"
                      >
                        GST liability?
                      </button>
                      <button
                        onClick={() => handleAskQuestion("Any low stock?", "3 items below threshold: Dome Camera (3 left), TP-Link Router (2 left), Cat6 (5 left).", "Inventory")}
                        className="text-[9px] px-2 py-0.8 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition"
                      >
                        Low stock?
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Phone Bar Navigation */}
              <div className="pt-2 px-2 flex justify-around text-slate-400 text-xs">
                <button
                  onClick={() => setMobileTab('home')}
                  className={`p-1.5 rounded-lg transition ${
                    mobileTab === 'home' ? 'text-white bg-slate-800' : 'hover:text-slate-200'
                  }`}
                  title="Dashboard"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMobileTab('bill')}
                  className={`p-1.5 rounded-lg transition ${
                    mobileTab === 'bill' ? 'text-white bg-slate-800' : 'hover:text-slate-200'
                  }`}
                  title="Counter Bill"
                >
                  <Receipt className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMobileTab('ask')}
                  className={`p-1.5 rounded-lg transition ${
                    mobileTab === 'ask' ? 'text-white bg-slate-800' : 'hover:text-slate-200'
                  }`}
                  title="Ask Books"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Scrolling Marquee for Customer Stories */}
      <section id="stories" className="py-20 bg-white border-t border-slate-200 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-10 text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Community Voice</span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Trusted by retailers, distributors, and accountants across India
          </h2>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex gap-6">
            {testimonials.concat(testimonials).map((t, idx) => (
              <div
                key={idx}
                className="w-80 shrink-0 p-5 rounded-2xl bg-[#fbfbfa] border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 cursor-default"
              >
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <strong className="text-xs text-slate-900 block">{t.name}</strong>
                  <span className="text-[11px] text-slate-500">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-950 text-white text-center px-6 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to start billing honest?</h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto">
            Zero setup, no monthly subscription traps, runs offline on your counter terminal.
          </p>
          <button
            onClick={onStartBilling}
            className="px-9 py-4 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-sm rounded-xl shadow-xl hover:shadow-2xl transition active:scale-95 hover:scale-105 duration-200"
          >
            Launch PayzenMax Billing App
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-xs px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong>PayzenMax.com</strong> — CBIC Rule 46 Compliant Universal Billing
          </div>
          <div className="text-[11px] text-slate-500">
            Operates client-side · Not affiliated with GSTN or CBIC
          </div>
        </div>
      </footer>
    </div>
  );
};
