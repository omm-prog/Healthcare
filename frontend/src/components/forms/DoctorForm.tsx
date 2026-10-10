import React, { useState, useEffect } from 'react';
import { Doctor, DoctorPayload } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface DoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DoctorPayload) => Promise<void>;
  initialData?: Doctor | null;
  isLoading?: boolean;
}

export const DoctorForm: React.FC<DoctorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSpecialization(initialData.specialization || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setClinicAddress(initialData.clinic_address || '');
    } else {
      setName('');
      setSpecialization('');
      setEmail('');
      setPhone('');
      setClinicAddress('');
    }
    setFormError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Doctor name cannot be blank.');
      return;
    }

    if (!specialization.trim()) {
      setFormError('Medical specialization cannot be blank.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        specialization: specialization.trim(),
        email: email.trim(),
        phone: phone.trim(),
        clinic_address: clinicAddress.trim(),
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save doctor record. Please check inputs.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Doctor Profile' : 'Add Doctor to Directory'}
      subtitle={initialData ? `Updating ${initialData.name}` : 'Doctors added here are globally available for assignment across patient records'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Doctor Name"
              required
              placeholder="e.g. Dr. Gregory House"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Specialization"
              required
              placeholder="e.g. Cardiology, Neurology"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Email Address"
              type="email"
              placeholder="doctor@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Phone Number"
              placeholder="+1-555-0988"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinic / Department Address
            </label>
            <textarea
              rows={2}
              className="block w-full rounded-lg border border-slate-300 py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
              placeholder="e.g. Building B, Department of Diagnostic Medicine, Suite 400"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Add Doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
