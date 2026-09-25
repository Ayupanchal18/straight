import React, { useState } from 'react';
import { 
  Coffee, Heart, Copy, Check, Sparkles, 
  Smartphone, ShieldCheck, ArrowLeft, Send
} from 'lucide-react';

const PRESET_AMOUNTS = [
  { count: 1, amount: 50, label: '1 Coffee', emoji: '☕' },
  { count: 2, amount: 100, label: '2 Coffees', emoji: '☕☕', popular: true },
  { count: 5, amount: 250, label: '5 Coffees', emoji: '☕☕☕' },
  { count: 10, amount: 500, label: 'Super Fan', emoji: '🔥' },
];

export const BuyMeCoffeeView = ({ onNavigate }) => {
  const [selectedCount, setSelectedCount] = useState(2);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [supporterName, setSupporterName] = useState('');
  const [supporterMessage, setSupporterMessage] = useState('');
  const [cheerSent, setCheerSent] = useState(false);

  const upiId = 'aayush.panchal@ptaxis';
  const qrImage = '/qr.jpeg';

  const currentAmount = isCustom 
    ? (parseInt(customAmount, 10) || 0) 
    : (PRESET_AMOUNTS.find(p => p.count === selectedCount)?.amount || 100);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSendCheer = (e) => {
    e.preventDefault();
    if (!supporterName.trim()) return;
    setCheerSent(true);
    setTimeout(() => {
      setSupporterName('');
      setSupporterMessage('');
    }, 3000);
  };

  // UPI deep link for mobile users
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=Aayush%20Panchal&cu=INR${currentAmount > 0 ? `&am=${currentAmount}` : ''}&tn=CricketHub%20Coffee`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 animate-fade-in">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate ? onNavigate('live') : window.history.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Matches</span>
      </button>

      {/* Main Single Card */}
      <div className="relative rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border-b border-slate-100 dark:border-white/5 text-center">
          
          {/* Creator Avatar & Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 mb-4 text-2xl font-black">
            ☕
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>CricketHub Creator</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Buy Aayush a Coffee
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Support the ongoing hosting, live scraper telemetry, and new features. Every coffee keeps CricketHub fast, ad-free, and free for all fans.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-7">

          {/* 1. Coffee / Amount Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center sm:text-left">
              Select Contribution
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_AMOUNTS.map((preset) => {
                const isSelected = !isCustom && selectedCount === preset.count;
                return (
                  <button
                    key={preset.count}
                    type="button"
                    onClick={() => {
                      setSelectedCount(preset.count);
                      setIsCustom(false);
                    }}
                    className={`relative p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 text-slate-950 dark:text-white font-black shadow-sm ring-2 ring-amber-500/30'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1424] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {preset.popular && (
                      <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black uppercase tracking-wider shadow-2xs">
                        Popular
                      </span>
                    )}
                    <span className="text-lg">{preset.emoji}</span>
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">₹{preset.amount}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount option */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">or custom:</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setIsCustom(true);
                  }}
                  className={`w-full pl-7 pr-3 py-1.5 text-xs font-bold rounded-xl border transition-all outline-none ${
                    isCustom
                      ? 'border-amber-500 bg-amber-500/5 text-slate-900 dark:text-white ring-1 ring-amber-500/20'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1424] text-slate-700 dark:text-slate-300'
                  }`}
                />
              </div>
              {isCustom && (
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>


          {/* 2. Straightforward QR Code & UPI Scan Box */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 text-center space-y-4">
            
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Scan to Pay ₹{currentAmount}</span>
            </div>

            {/* Crisp QR Code - always on white background for 100% camera readability */}
            <div className="mx-auto w-52 h-52 sm:w-60 sm:h-60 p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center">
              <img
                src={qrImage}
                alt="Scan to pay Aayush Panchal via UPI"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Direct UPI ID + One-Click Copy */}
            <div className="max-w-sm mx-auto">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                UPI ID (Tap to Copy)
              </span>
              <div 
                onClick={handleCopyUpi}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 cursor-pointer hover:border-amber-500/50 transition-colors shadow-2xs group"
              >
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate ml-2">
                  {upiId}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    copiedUpi
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-white/10 group-hover:bg-amber-500 group-hover:text-white text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Mobile Direct Pay Button (Visible on mobile/tablets) */}
            <div className="pt-1">
              <a
                href={upiDeepLink}
                className="w-full inline-flex sm:hidden items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
              >
                <span>⚡ Pay ₹{currentAmount} with UPI App</span>
              </a>
            </div>

            {/* Supported payment badges */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Accepts Google Pay, PhonePe, Paytm, BHIM, Cred & all banking UPI apps
            </p>
          </div>


          {/* 3. Leave a Quick Cheer (Simple & Clean) */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            {cheerSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 fill-emerald-500" />
                <span>Thank you so much for your cheer! You rock! 🏏</span>
              </div>
            ) : (
              <form onSubmit={handleSendCheer} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Send a quick cheer message (Optional)
                  </span>
                  <span className="text-[10px] text-slate-400">Say hello 👋</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name / Handle"
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Message (e.g. Keep it up!)"
                    value={supporterMessage}
                    onChange={(e) => setSupporterMessage(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
                {supporterName.trim() && (
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Cheer</span>
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Trust & Guarantee strip */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Direct P2P UPI Transfer
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              100% Goes to CricketHub
            </span>
          </div>

        </div>
      </div>

      {/* Subtle Bottom Note */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
        Thank you for being part of the cricket community ❤️
      </p>

    </div>
  );
};
