import React, { useState, useEffect } from 'react';
import { Patient, Doctor } from '../../types';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface AssignDoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { patient: number; doctor: number }) => Promise<void>;
  patients: Patient[];
  doctors: Doctor[];
  selectedPatientId?: number | null;
  isLoading?: boolean;
}

export const AssignDoctorForm: React.FC<AssignDoctorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patients,
  doctors,
  selectedPatientId,
  isLoading = false,
}) => {
  const [patientId, setPatientId] = useState<number | ''>('');
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPatientId) {
      setPatientId(selectedPatientId);
    } else if (patients.length > 0) {
      setPatientId(patients[0].id);
    } else {
      setPatientId('');
    }

    if (doctors.length > 0) {
      setDoctorId(doctors[0].id);
    } else {
      setDoctorId('');
    }

    setFormError(null);
  }, [selectedPatientId, patients, doctors, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!patientId) {
      setFormError('Please select a patient.');
      return;
    }

    if (!doctorId) {
      setFormError('Please select a doctor to assign.');
      return;
    }

    try {
      await onSubmit({
        patient: Number(patientId),
        doctor: Number(doctorId),
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create doctor assignment.');
      }
    }
  };

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.name} (Age: ${p.age}, ${p.gender})`,
  }));

  const doctorOptions = doctors.map((d) => ({
    value: d.id,
    label: `Dr. ${d.name} — ${d.specialization}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Doctor to Patient"
      subtitle="Creates a verifiable assignment between an owned patient and a directory doctor"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}

        {patients.length === 0 ? (
          <Alert
            type="warning"
            message="You do not have any patient records registered yet. Please create a patient record first."
          />
        ) : doctors.length === 0 ? (
          <Alert
            type="warning"
            message="No doctors are currently available in the directory. Please add a doctor profile first."
          />
        ) : (
          <>
            <div>
              <Select
                label="Select Patient"
                required
                options={patientOptions}
                value={patientId}
                onChange={(e) => setPatientId(Number(e.target.value))}
              />
            </div>

            <div>
              <Select
                label="Select Doctor"
                required
                options={doctorOptions}
                value={doctorId}
                onChange={(e) => setDoctorId(Number(e.target.value))}
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Atomic Integrity Guarantee:</span> The backend enforces unique doctor-patient assignments. Attempting to assign the same doctor to this patient twice will be automatically rejected.
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={patients.length === 0 || doctors.length === 0}
          >
            Assign Doctor
          </Button>
        </div>
      </form>
    </Modal>
  );
};
