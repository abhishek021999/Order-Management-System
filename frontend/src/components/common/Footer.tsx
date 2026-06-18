import React from "react";

const Footer: React.FC = () => (
  <footer className="flex-shrink-0 h-11 border-t border-slate-100 bg-white/60 backdrop-blur-sm
                     flex items-center justify-between px-6 text-[11px] text-slate-400">
    <span>&copy; {new Date().getFullYear()} InvenTrack — All rights reserved</span>
    <span className="hidden sm:inline text-slate-300">FastAPI · React · PostgreSQL · v1.0.0</span>
  </footer>
);

export default Footer;
