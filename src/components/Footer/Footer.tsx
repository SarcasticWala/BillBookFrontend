import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="mt-8 py-3 text-center text-gray-500 border-t border-gray-200 text-xs sm:text-sm">
    <p>© 2025 BillBook. All rights reserved.</p>
    <div className="mt-1 flex items-center justify-center gap-3">
      <Link to="/privacy-policy" className="hover:text-gray-700 transition-colors">
        Privacy Policy
      </Link>
      <span className="text-gray-300">•</span>
      <Link to="/terms-conditions" className="hover:text-gray-700 transition-colors">
        Terms &amp; Conditions
      </Link>
    </div>
  </footer>
);

export default Footer;
