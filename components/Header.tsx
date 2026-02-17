
import * as React from 'react';
import logo from '../src/assets/logo.png';

const Header: React.FC = () => {
  return (
    <header className="p-6 lg:px-20 flex justify-center items-center w-full z-10 glass-nav">
      <div className="flex items-center gap-3 animate-logo-glow">
        <img src={logo} alt="Offer Logo" className="h-24 md:h-32 object-contain" />
      </div>
    </header>
  );
};

export default Header;
