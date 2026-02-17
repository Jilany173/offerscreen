
import * as React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-6 lg:px-20 flex justify-between items-center w-full z-10 glass-nav">
      <div className="flex items-center gap-3">
        {/* Logo removed */}
      </div>
      <nav className="hidden md:flex gap-8 text-slate-600 font-medium">
        {/* Navigation links would go here */}
      </nav>
    </header>
  );
};

export default Header;
