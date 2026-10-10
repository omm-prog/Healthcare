from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from patients.models import Patient
from doctors.models import Doctor
from mappings.models import PatientDoctor

User = get_user_model()


class PatientDoctorMappingTests(APITestCase):
    """Test suite for Patient-Doctor Assignments, Authorization, and Conflict Prevention."""

    def setUp(self):
        self.user_a = User.objects.create_user(
            name="Clinic Manager A",
            email="manager_a@hospital.org",
            password="StrongPassword123!"
        )
        self.user_b = User.objects.create_user(
            name="Clinic Manager B",
            email="manager_b@hospital.org",
            password="StrongPassword123!"
        )

        self.client.force_authenticate(user=self.user_a)

        self.patient_a = Patient.objects.create(
            owner=self.user_a,
            name="Alice Cooper",
            age=50,
            gender="Female",
            email="alice@example.com"
        )
        self.patient_b = Patient.objects.create(
            owner=self.user_b,
            name="Bob Martin",
            age=62,
            gender="Male",
            email="bob@example.com"
        )

        self.doctor_1 = Doctor.objects.create(
            name="Stephen Strange",
            specialization="Neuro Surgery"
        )
        self.doctor_2 = Doctor.objects.create(
            name="Leonard McCoy",
            specialization="Chief Medical Officer"
        )

        self.mapping_list_url = reverse('mapping-list-create')

    def test_assign_doctor_to_owned_patient(self):
        """Verify assigning an existing doctor to an owned patient returns 201 Created."""
        payload = {
            "patient": self.patient_a.id,
            "doctor": self.doctor_1.id
        }
        response = self.client.post(self.mapping_list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["patient"]["id"], self.patient_a.id)
        self.assertEqual(response.data["doctor"]["id"], self.doctor_1.id)
        self.assertTrue(
            PatientDoctor.objects.filter(patient=self.patient_a, doctor=self.doctor_1).exists()
        )

    def test_reject_duplicate_assignment(self):
        """Verify assigning the same doctor to the same patient again returns 400 Bad Request."""
        # Initial assignment
        PatientDoctor.objects.create(patient=self.patient_a, doctor=self.doctor_1)

        payload = {
            "patient": self.patient_a.id,
            "doctor": self.doctor_1.id
        }
        response = self.client.post(self.mapping_list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_database_unique_constraint(self):
        """Verify underlying database constraint raises IntegrityError on duplicate assignment."""
        PatientDoctor.objects.create(patient=self.patient_a, doctor=self.doctor_1)
        with self.assertRaises(IntegrityError):
            PatientDoctor.objects.create(patient=self.patient_a, doctor=self.doctor_1)

    def test_reject_assigning_unowned_patient(self):
        """Verify assigning a doctor to another user's patient is rejected with 400."""
        payload = {
            "patient": self.patient_b.id,
            "doctor": self.doctor_1.id
        }
        response = self.client.post(self.mapping_list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            PatientDoctor.objects.filter(patient=self.patient_b, doctor=self.doctor_1).exists()
        )

    def test_reject_nonexistent_patient_or_doctor(self):
        """Verify invalid or nonexistent foreign keys are rejected with 400."""
        # Nonexistent patient
        resp1 = self.client.post(
            self.mapping_list_url,
            {"patient": 999999, "doctor": self.doctor_1.id},
            format='json'
        )
        self.assertEqual(resp1.status_code, status.HTTP_400_BAD_REQUEST)

        # Nonexistent doctor
        resp2 = self.client.post(
            self.mapping_list_url,
            {"patient": self.patient_a.id, "doctor": 999999},
            format='json'
        )
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_mappings_returns_only_owned_patients(self):
        """Verify GET /api/mappings/ only returns mappings for user's owned patients."""
        mapping_a = PatientDoctor.objects.create(patient=self.patient_a, doctor=self.doctor_1)
        mapping_b = PatientDoctor.objects.create(patient=self.patient_b, doctor=self.doctor_2)

        response = self.client.get(self.mapping_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get('results', response.data)
        mapping_ids = [m["id"] for m in results]

        self.assertIn(mapping_a.id, mapping_ids)
        self.assertNotIn(mapping_b.id, mapping_ids)

    def test_list_doctors_for_specific_owned_patient(self):
        """Verify GET /api/mappings/<patient_id>/ returns doctors assigned to specific patient."""
        mapping1 = PatientDoctor.objects.create(patient=self.patient_a, doctor=self.doctor_1)
        mapping2 = PatientDoctor.objects.create(patient=self.patient_a, doctor=self.doctor_2)

        patient_mappings_url = reverse(
            'mapping-patient-or-delete',
            kwargs={'pk': self.patient_a.id}
        )
        response = self.client.get(patient_mappings_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        doctor_ids = [item["doctor"]["id"] for item in response.data]
        self.assertIn(self.doctor_1.id, doctor_ids)
        self.assertIn(self.doctor_2.id, doctor_ids)

    def test_list_doctors_for_unowned_patient_returns_404(self):
        """Verify GET /api/mappings/<patient_id>/ for unowned patient returns 404."""
        PatientDoctor.objects.create(patient=self.patient_b, doctor=self.doctor_1)

        unowned_url = reverse(
            'mapping-patient-or-delete',
            kwargs={'pk': self.patient_b.id}
        )
        response = self.client.get(unowned_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_mapping_by_id(self):
        """Verify DELETE /api/mappings/<id>/ removes assignment and returns 204."""
        mapping = PatientDoctor.objects.create(patient=self.patient_a, doctor=self.doctor_1)

        delete_url = reverse('mapping-patient-or-delete', kwargs={'pk': mapping.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(PatientDoctor.objects.filter(id=mapping.id).exists())

    def test_delete_unowned_patient_mapping_returns_404(self):
        """Verify DELETE /api/mappings/<id>/ on another user's mapping returns 404 and preserves record."""
        mapping_b = PatientDoctor.objects.create(patient=self.patient_b, doctor=self.doctor_1)

        delete_url = reverse('mapping-patient-or-delete', kwargs={'pk': mapping_b.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(PatientDoctor.objects.filter(id=mapping_b.id).exists())

    def test_unauthenticated_mapping_access_blocked(self):
        """Verify anonymous requests to mappings are denied with 401."""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.mapping_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
