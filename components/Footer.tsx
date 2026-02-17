
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center w-full px-6 md:px-20 pb-10" data-purpose="footer-info">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-30 mb-8"></div>
      <p className="text-lg md:text-2xl font-light tracking-wide text-slate-600">
        Visit our campus at <span className="font-bold text-brand-blue">Downtown Plaza</span> | <span className="text-brand-red/70 hover:text-brand-red transition-colors cursor-pointer">www.eliteacademy.com</span>
      </p>
      <div className="mt-4 flex justify-center gap-6 text-slate-400">
        <i className="fa-brands fa-facebook hover:text-brand-blue cursor-pointer"></i>
        <i className="fa-brands fa-instagram hover:text-brand-blue cursor-pointer"></i>
        <i className="fa-brands fa-linkedin hover:text-brand-blue cursor-pointer"></i>
      </div>
    </footer>
  );
};

export default Footer;
