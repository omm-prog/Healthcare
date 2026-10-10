import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { parseApiError } from '../api/client';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setErrorMessage(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-200 mb-4">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Staff Account
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Register for the CarePulse Healthcare Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200/80 sm:px-10">
          {errorMessage && (
            <div className="mb-5">
              <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Dr. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            <Input
              label="Work Email Address"
              type="email"
              autoComplete="email"
              required
              placeholder="name@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Min. 8 characters"
              helperText="Must be at least 8 characters with a mix of characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full" size="md" isLoading={isLoading}>
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-150 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700 hover:underline">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
