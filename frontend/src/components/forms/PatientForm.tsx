import React, { useState, useEffect } from 'react';
import { Patient, PatientPayload, GenderType } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientPayload) => Promise<void>;
  initialData?: Patient | null;
  isLoading?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<GenderType>('Male');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAge(initialData.age !== undefined ? initialData.age : '');
      setGender(initialData.gender || 'Male');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
    } else {
      setName('');
      setAge('');
      setGender('Male');
      setEmail('');
      setPhone('');
      setAddress('');
    }
    setFormError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Patient name cannot be blank.');
      return;
    }

    if (age === '' || Number(age) < 0 || Number(age) > 150) {
      setFormError('Age must be a valid number between 0 and 150.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        age: Number(age),
        gender,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save patient. Please check input values.');
      }
    }
  };

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Patient Record' : 'Register New Patient'}
      subtitle={initialData ? `Updating record for ${initialData.name}` : 'Record will be automatically associated with your authenticated account'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Full Name"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Age"
              type="number"
              min="0"
              max="150"
              required
              placeholder="e.g. 42"
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div>
            <Select
              label="Gender"
              required
              options={genderOptions}
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderType)}
            />
          </div>

          <div>
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Phone Number"
              placeholder="+1-555-0144"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Residential Address
            </label>
            <textarea
              rows={2}
              className="block w-full rounded-lg border border-slate-300 py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
              placeholder="Street address, city, state"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
