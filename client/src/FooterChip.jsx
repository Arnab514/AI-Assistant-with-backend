import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

const FooterChip = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="glass-morphism bg-gray-800/80 text-white px-4 py-2 rounded-full shadow-lg border border-gray-700/50 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
        <a
          href="https://github.com/Arnab514/AI-Assistant-with-backend"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <Github className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Made by Arnab
          </span>
          <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </a>
      </div>
    </div>
  );
};

export default FooterChip;