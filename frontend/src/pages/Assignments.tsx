import React, { useState, useEffect, useMemo } from 'react';
import {
  Link as LinkIcon,
  PlusCircle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  User,
  Stethoscope,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { mappingsApi } from '../api/mappings';
import { patientsApi } from '../api/patients';
import { doctorsApi } from '../api/doctors';
import {
  PatientDoctorMapping,
  Patient,
  Doctor,
  AssignedDoctor,
} from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { AssignDoctorForm } from '../components/forms/AssignDoctorForm';
import { parseApiError } from '../api/client';

export const Assignments: React.FC = () => {
  const [mappings, setMappings] = useState<PatientDoctorMapping[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Patient-specific inspector modal/drawer state
  const [inspectPatient, setInspectPatient] = useState<Patient | null>(null);
  const [inspectDoctors, setInspectDoctors] = useState<AssignedDoctor[]>([]);
  const [isLoadingInspect, setIsLoadingInspect] = useState<boolean>(false);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [deletingMapping, setDeletingMapping] = useState<PatientDoctorMapping | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [mappingsData, patientsData, doctorsData] = await Promise.all([
        mappingsApi.getMappings(1),
        patientsApi.getPatients(1),
        doctorsApi.getDoctors(1),
      ]);

      setMappings(mappingsData.results);
      setTotalCount(mappingsData.count);
      setPatients(patientsData.results);
      setDoctors(doctorsData.results);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter mappings by search keyword or patient filter
  const filteredMappings = useMemo(() => {
    let result = mappings;

    if (selectedPatientFilter !== 'all') {
      const pid = Number(selectedPatientFilter);
      result = result.filter((m) => m.patient.id === pid);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.patient.name.toLowerCase().includes(term) ||
          m.doctor.name.toLowerCase().includes(term) ||
          m.doctor.specialization.toLowerCase().includes(term)
      );
    }

    return result;
  }, [mappings, selectedPatientFilter, searchTerm]);

  const handleCreateMapping = async (data: { patient: number; doctor: number }) => {
    try {
      await mappingsApi.createMapping(data);
      fetchData();
    } catch (err: unknown) {
      throw new Error(parseApiError(err));
    }
  };

  const handleDeleteMappingConfirm = async () => {
    if (!deletingMapping) return;
    setIsDeleting(true);
    try {
      // NOTE: deletion uses the MAPPING ID
      await mappingsApi.deleteMappingById(deletingMapping.id);
      setDeletingMapping(null);
      fetchData();
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInspectPatient = async (patientId: number) => {
    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) return;

    setInspectPatient(targetPatient);
    setIsLoadingInspect(true);
    try {
      // NOTE: GET endpoint uses PATIENT ID
      const docs = await mappingsApi.getAssignedDoctorsByPatientId(patientId);
      setInspectDoctors(docs);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsLoadingInspect(false);
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
              Patient–Doctor Assignments
            </h1>
            <Badge variant="blue" size="md">
              {totalCount} Active Mappings
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atomic relational mappings between your owned patients and certified directory doctors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Assign Doctor
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors placeholder:text-slate-400"
            placeholder="Search by patient or doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            className="text-xs sm:text-sm rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-700 focus:outline-none focus:border-sky-500"
            value={selectedPatientFilter}
            onChange={(e) => setSelectedPatientFilter(e.target.value)}
          >
            <option value="all">Filter by Patient (All)</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Mappings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <Spinner size="lg" label="Loading mappings from database..." className="py-16" />
        ) : filteredMappings.length === 0 ? (
          <EmptyState
            icon={<LinkIcon className="w-8 h-8" />}
            title={searchTerm || selectedPatientFilter !== 'all' ? 'No matching assignments found' : 'No doctor assignments recorded'}
            description={
              searchTerm || selectedPatientFilter !== 'all'
                ? 'No assignments match the selected filter or search keyword. Try clearing filters.'
                : 'Click "Assign Doctor" above to link a healthcare specialist to one of your patients.'
            }
            actionText={searchTerm || selectedPatientFilter !== 'all' ? 'Reset Filters' : 'Assign Doctor'}
            onAction={
              searchTerm || selectedPatientFilter !== 'all'
                ? () => {
                    setSearchTerm('');
                    setSelectedPatientFilter('all');
                  }
                : () => setIsAssignModalOpen(true)
            }
            className="py-16"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Mapping ID</th>
                  <th scope="col" className="px-6 py-3.5">Assigned Patient</th>
                  <th scope="col" className="px-6 py-3.5">Attending Doctor</th>
                  <th scope="col" className="px-6 py-3.5">Specialization</th>
                  <th scope="col" className="px-6 py-3.5">Date Assigned</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                      #{mapping.id}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-sky-50 text-sky-600">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <button
                            onClick={() => handleInspectPatient(mapping.patient.id)}
                            className="font-semibold text-slate-900 hover:text-sky-600 hover:underline text-left block"
                            title="Click to view all doctors assigned to this patient"
                          >
                            {mapping.patient.name}
                          </button>
                          <span className="text-[11px] text-slate-400">
                            Age: {mapping.patient.age} &middot; {mapping.patient.gender}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-teal-50 text-teal-600">
                          <Stethoscope className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-900">Dr. {mapping.doctor.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="teal" size="sm">
                        {mapping.doctor.specialization}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(mapping.assigned_at)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingMapping(mapping)}
                        leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                        className="text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Assigned Doctors Inspection Modal (Uses GET /api/mappings/<patient_id>/) */}
      {inspectPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setInspectPatient(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-150 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Doctors Assigned to {inspectPatient.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Querying endpoint: <code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded">GET /api/mappings/{inspectPatient.id}/</code>
                  </p>
                </div>
                <button
                  onClick={() => setInspectPatient(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  &times;
                </button>
              </div>

              {isLoadingInspect ? (
                <Spinner size="md" label="Loading assigned doctors..." />
              ) : inspectDoctors.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                  No doctors currently mapped to this patient.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                  {inspectDoctors.map((docItem) => (
                    <div key={docItem.mapping_id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Dr. {docItem.doctor.name}</span>
                        <span className="text-slate-500 ml-2">({docItem.doctor.specialization})</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Mapping ID: #{docItem.mapping_id} &middot; {docItem.doctor.email || docItem.doctor.phone || 'No direct phone'}
                        </div>
                      </div>
                      <span className="text-slate-400 text-[11px]">{formatDate(docItem.assigned_at)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setInspectPatient(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Doctor Modal */}
      <AssignDoctorForm
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleCreateMapping}
        patients={patients}
        doctors={doctors}
      />

      {/* Delete Assignment Confirmation Modal (Uses DELETE /api/mappings/<mapping_id>/) */}
      <ConfirmModal
        isOpen={!!deletingMapping}
        onClose={() => setDeletingMapping(null)}
        onConfirm={handleDeleteMappingConfirm}
        title="Remove Doctor Assignment"
        message={`Are you sure you want to remove the assignment of Dr. "${deletingMapping?.doctor.name}" for patient "${deletingMapping?.patient.name}"? (Target: Mapping ID #${deletingMapping?.id})`}
        confirmText="Remove Assignment"
        isLoading={isDeleting}
      />
    </div>
  );
};
