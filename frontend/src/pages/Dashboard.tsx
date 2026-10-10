import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  Link as LinkIcon,
  UserPlus,
  PlusCircle,
  ArrowRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { patientsApi } from '../api/patients';
import { doctorsApi } from '../api/doctors';
import { mappingsApi } from '../api/mappings';
import { Patient, Doctor, PatientDoctorMapping } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { PatientForm } from '../components/forms/PatientForm';
import { DoctorForm } from '../components/forms/DoctorForm';
import { AssignDoctorForm } from '../components/forms/AssignDoctorForm';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [mappings, setMappings] = useState<PatientDoctorMapping[]>([]);

  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [totalDoctors, setTotalDoctors] = useState<number>(0);
  const [totalMappings, setTotalMappings] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Action Modal states
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [patientsData, doctorsData, mappingsData] = await Promise.all([
        patientsApi.getPatients(1),
        doctorsApi.getDoctors(1),
        mappingsApi.getMappings(1),
      ]);

      setPatients(patientsData.results);
      setTotalPatients(patientsData.count);

      setDoctors(doctorsData.results);
      setTotalDoctors(doctorsData.count);

      setMappings(mappingsData.results);
      setTotalMappings(mappingsData.count);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch dashboard statistics from the backend server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreatePatient = async (data: any) => {
    await patientsApi.createPatient(data);
    fetchDashboardData();
  };

  const handleCreateDoctor = async (data: any) => {
    await doctorsApi.createDoctor(data);
    fetchDashboardData();
  };

  const handleCreateMapping = async (data: { patient: number; doctor: number }) => {
    await mappingsApi.createMapping(data);
    fetchDashboardData();
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
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Practitioner'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            CarePulse Clinical Management Overview &middot; Authenticated as <span className="font-semibold text-slate-700">{user?.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: My Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              My Patient Records
            </span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? '...' : totalPatients}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Isolated to your account</span>
          </p>
        </div>

        {/* Metric 2: Available Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doctor Directory
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? '...' : totalDoctors}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Verified medical practitioners</span>
          </p>
        </div>

        {/* Metric 3: Active Assignments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Assignments
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <LinkIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? '...' : totalMappings}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Doctor-Patient relations</span>
          </p>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Management Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPatientModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Register Patient
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDoctorModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4 text-teal-600" />}
          >
            Add Doctor
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            leftIcon={<LinkIcon className="w-4 h-4 text-sky-600" />}
          >
            Assign Doctor to Patient
          </Button>
        </div>
      </div>

      {/* Two Column Grid: Recent Patients & Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">Recent Patients</h2>
            </div>
            <Link
              to="/patients"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 p-2">
            {isLoading ? (
              <Spinner size="md" label="Loading patients..." />
            ) : patients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No patient records found. Click "Register Patient" to add one.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {patients.slice(0, 5).map((patient) => (
                  <div key={patient.id} className="p-3 hover:bg-slate-50/80 rounded-xl transition-colors flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{patient.name}</span>
                        <Badge size="sm" variant={patient.gender === 'Female' ? 'teal' : patient.gender === 'Male' ? 'blue' : 'slate'}>
                          {patient.gender}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Age: {patient.age} &middot; {patient.email || patient.phone || 'No direct contact'}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(patient.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">Recent Doctor Assignments</h2>
            </div>
            <Link
              to="/assignments"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 p-2">
            {isLoading ? (
              <Spinner size="md" label="Loading assignments..." />
            ) : mappings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No assignments created yet. Assign doctors to patients from the quick action bar above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {mappings.slice(0, 5).map((mapping) => (
                  <div key={mapping.id} className="p-3 hover:bg-slate-50/80 rounded-xl transition-colors flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{mapping.patient.name}</span>
                        <span className="text-slate-400 text-xs">&rarr;</span>
                        <span className="text-xs font-semibold text-teal-700">Dr. {mapping.doctor.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {mapping.doctor.specialization}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(mapping.assigned_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals for Quick Actions */}
      <PatientForm
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSubmit={handleCreatePatient}
      />

      <DoctorForm
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onSubmit={handleCreateDoctor}
      />

      <AssignDoctorForm
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleCreateMapping}
        patients={patients}
        doctors={doctors}
      />
    </div>
  );
};
