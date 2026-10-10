import React, { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  PlusCircle,
  Search,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { doctorsApi } from '../api/doctors';
import { Doctor, DoctorPayload } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { DoctorForm } from '../components/forms/DoctorForm';
import { parseApiError } from '../api/client';

export const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorsApi.getDoctors(1);
      setDoctors(data.results);
      setTotalCount(data.count);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (!searchTerm.trim()) return doctors;
    const term = searchTerm.toLowerCase();
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.specialization.toLowerCase().includes(term) ||
        (d.email && d.email.toLowerCase().includes(term))
    );
  }, [doctors, searchTerm]);

  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: DoctorPayload) => {
    if (editingDoctor) {
      await doctorsApi.updateDoctor(editingDoctor.id, data);
    } else {
      await doctorsApi.createDoctor(data);
    }
    fetchDoctors();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDoctor) return;
    setIsDeleting(true);
    try {
      await doctorsApi.deleteDoctor(deletingDoctor.id);
      setDeletingDoctor(null);
      fetchDoctors();
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsDeleting(false);
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
              Doctor Directory
            </h1>
            <Badge variant="teal" size="md">
              {totalCount} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global directory of verified medical professionals and specialists
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDoctors}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Doctor
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
            placeholder="Search doctors by name, specialization, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Showing {filteredDoctors.length} of {totalCount} doctors
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <Spinner size="lg" label="Loading doctor directory..." className="py-16" />
        ) : filteredDoctors.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="w-8 h-8" />}
            title={searchTerm ? 'No matching doctors found' : 'No doctors in directory yet'}
            description={
              searchTerm
                ? `No doctors match "${searchTerm}". Check the spelling or try another keyword.`
                : 'Click "Add Doctor" to create your first practitioner profile.'
            }
            actionText={searchTerm ? 'Clear Search' : 'Add Doctor'}
            onAction={searchTerm ? () => setSearchTerm('') : handleOpenCreate}
            className="py-16"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Doctor Name</th>
                  <th scope="col" className="px-6 py-3.5">Specialization</th>
                  <th scope="col" className="px-6 py-3.5">Contact Details</th>
                  <th scope="col" className="px-6 py-3.5">Clinic Address</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      Dr. {doc.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="teal" size="sm">
                        {doc.specialization}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs text-slate-600">
                        {doc.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{doc.email}</span>
                          </div>
                        )}
                        {doc.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{doc.phone}</span>
                          </div>
                        )}
                        {!doc.email && !doc.phone && (
                          <span className="text-slate-400 italic">None provided</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {doc.clinic_address || <span className="text-slate-400 italic">Not specified</span>}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingDoctor(doc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingDoctor(doc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Doctor"
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

      {/* Doctor Details Modal */}
      {viewingDoctor && (
        <Modal
          isOpen={!!viewingDoctor}
          onClose={() => setViewingDoctor(null)}
          title={`Dr. ${viewingDoctor.name}`}
          subtitle={`Directory ID: #${viewingDoctor.id} &middot; ${viewingDoctor.specialization}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-3">
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Specialization</span>
                <span className="text-sm font-semibold text-slate-800">{viewingDoctor.specialization}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Email</span>
                  <span className="text-xs text-slate-700">{viewingDoctor.email || '—'}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Phone</span>
                  <span className="text-xs text-slate-700">{viewingDoctor.phone || '—'}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Clinic / Office Address</span>
                <span className="text-xs text-slate-700">{viewingDoctor.clinic_address || '—'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                <span>Added to directory:</span>
                <span>{formatDate(viewingDoctor.created_at)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewingDoctor(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Doctor Create / Edit Modal */}
      <DoctorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDoctor}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingDoctor}
        onClose={() => setDeletingDoctor(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Doctor Record"
        message={`Are you sure you want to remove Dr. "${deletingDoctor?.name}" from the medical directory? Any active patient assignments for this doctor will be removed.`}
        confirmText="Delete Doctor"
        isLoading={isDeleting}
      />
    </div>
  );
};
