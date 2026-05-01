import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Blog. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Home
            </Link>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
