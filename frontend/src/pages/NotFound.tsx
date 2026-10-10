import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 mb-4">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        The clinical portal page you requested does not exist or may have been relocated.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
