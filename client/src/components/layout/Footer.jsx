import React from 'react';
import { Github, Heart, Shield, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-pitch-900/60 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">CricketHub 2.0</span>
            <span>•</span>
            <span>Educational MERN Cricket Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Tier Cached</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Cricbuzz Real-time Scraper</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
