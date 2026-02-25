
import * as React from 'react';
import logo from '../src/assets/logo.png';

const Header: React.FC = () => {
  return (
    <header className="p-3 lg:px-10 flex justify-center items-center w-full z-10 glass-nav">
      <div className="flex items-center gap-2 animate-logo-glow">
        <img src={logo} alt="Offer Logo" className="h-20 md:h-28 object-contain" />
      </div>
    </header>
  );
};

export default Header;
