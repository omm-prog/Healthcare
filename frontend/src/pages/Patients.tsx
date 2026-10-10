import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
} from 'lucide-react';
import { patientsApi } from '../api/patients';
import { mappingsApi } from '../api/mappings';
import { Patient, PatientPayload, AssignedDoctor } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PatientForm } from '../components/forms/PatientForm';
import { parseApiError } from '../api/client';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [assignedDoctors, setAssignedDoctors] = useState<AssignedDoctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientsApi.getPatients(1);
      setPatients(data.results);
      setTotalCount(data.count);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients locally by search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.phone && p.phone.includes(term))
    );
  }, [patients, searchTerm]);

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: PatientPayload) => {
    if (editingPatient) {
      await patientsApi.updatePatient(editingPatient.id, data);
    } else {
      await patientsApi.createPatient(data);
    }
    fetchPatients();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPatient) return;
    setIsDeleting(true);
    try {
      await patientsApi.deletePatient(deletingPatient.id);
      setDeletingPatient(null);
      fetchPatients();
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDetails = async (patient: Patient) => {
    setViewingPatient(patient);
    setIsLoadingDoctors(true);
    try {
      const doctorsList = await mappingsApi.getAssignedDoctorsByPatientId(patient.id);
      setAssignedDoctors(doctorsList);
    } catch {
      setAssignedDoctors([]);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Patient Management
            </h1>
            <Badge variant="blue" size="md">
              {totalCount} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Multi-tenant isolated health records owned by your authenticated account
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Register Patient
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors placeholder:text-slate-400"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Showing {filteredPatients.length} of {totalCount} records
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <Spinner size="lg" label="Loading patients from database..." className="py-16" />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={searchTerm ? 'No matching patient records found' : 'No patients registered yet'}
            description={
              searchTerm
                ? `No patients match the search query "${searchTerm}". Try a different keyword.`
                : 'Click "Register Patient" to add your first clinical patient record.'
            }
            actionText={searchTerm ? 'Clear Search' : 'Register Patient'}
            onAction={searchTerm ? () => setSearchTerm('') : handleOpenCreate}
            className="py-16"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Patient Name</th>
                  <th scope="col" className="px-6 py-3.5">Age & Gender</th>
                  <th scope="col" className="px-6 py-3.5">Contact Info</th>
                  <th scope="col" className="px-6 py-3.5">Registered</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {patient.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-700">{patient.age} yrs</span>
                        <Badge
                          size="sm"
                          variant={
                            patient.gender === 'Female'
                              ? 'teal'
                              : patient.gender === 'Male'
                              ? 'blue'
                              : 'slate'
                          }
                        >
                          {patient.gender}
                        </Badge>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs text-slate-600">
                        {patient.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.email}</span>
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {!patient.email && !patient.phone && (
                          <span className="text-slate-400 italic">None provided</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(patient.created_at)}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetails(patient)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="View Details & Assignments"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(patient)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Edit Patient"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPatient(patient)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {viewingPatient && (
        <Modal
          isOpen={!!viewingPatient}
          onClose={() => setViewingPatient(null)}
          title={`Patient Record: ${viewingPatient.name}`}
          subtitle={`Internal ID: #${viewingPatient.id} &middot; Owned by current account`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Core Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-150">
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Age</span>
                <span className="text-sm font-semibold text-slate-800">{viewingPatient.age} years</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Gender</span>
                <span className="text-sm font-semibold text-slate-800">{viewingPatient.gender}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Created</span>
                <span className="text-xs font-medium text-slate-700">{formatDate(viewingPatient.created_at)}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Email</span>
                <span className="text-xs text-slate-700">{viewingPatient.email || '—'}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Phone</span>
                <span className="text-xs text-slate-700">{viewingPatient.phone || '—'}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Residential Address</span>
                <span className="text-xs text-slate-700">{viewingPatient.address || '—'}</span>
              </div>
            </div>

            {/* Assigned Doctors Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Assigned Medical Doctors ({assignedDoctors.length})
                </h4>
              </div>

              {isLoadingDoctors ? (
                <Spinner size="sm" label="Fetching doctor assignments..." />
              ) : assignedDoctors.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-50 border border-slate-100">
                  No doctors currently assigned to this patient. You can assign doctors from the Patient-Doctor Mapping page.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                  {assignedDoctors.map((item) => (
                    <div key={item.mapping_id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Dr. {item.doctor.name}</span>
                        <span className="text-slate-500 ml-2">({item.doctor.specialization})</span>
                      </div>
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.assigned_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-150">
              <Button variant="outline" size="sm" onClick={() => setViewingPatient(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Patient Create / Edit Modal */}
      <PatientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPatient}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete the patient record for "${deletingPatient?.name}"? All related doctor mappings for this patient will also be removed.`}
        confirmText="Delete Patient"
        isLoading={isDeleting}
      />
    </div>
  );
};
