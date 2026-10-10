from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from doctors.models import Doctor

User = get_user_model()


class DoctorManagementTests(APITestCase):
    """Test suite for Doctor Management and Directory operations."""

    def setUp(self):
        self.user = User.objects.create_user(
            name="Medical Admin",
            email="admin@hospital.org",
            password="StrongPassword123!"
        )
        self.client.force_authenticate(user=self.user)

        self.doctor = Doctor.objects.create(
            name="Gregory House",
            specialization="Diagnostic Medicine",
            email="house@princetonplainsboro.org",
            phone="+1987654321",
            clinic_address="Princeton-Plainsboro Teaching Hospital"
        )

        self.list_url = reverse('doctor-list-create')
        self.detail_url = reverse('doctor-detail', kwargs={'pk': self.doctor.id})

    def test_create_doctor(self):
        """Verify creating a doctor record returns 201 Created."""
        payload = {
            "name": "James Wilson",
            "specialization": "Oncology",
            "email": "wilson@hospital.org",
            "phone": "+1234567800",
            "clinic_address": "Building B, Oncology Wing"
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "James Wilson")
        self.assertEqual(response.data["specialization"], "Oncology")
        self.assertTrue(Doctor.objects.filter(name="James Wilson").exists())

    def test_list_doctors(self):
        """Verify listing doctors returns 200 OK and includes doctor records."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertTrue(len(results) >= 1)
        names = [d["name"] for d in results]
        self.assertIn("Gregory House", names)

    def test_retrieve_doctor(self):
        """Verify retrieving doctor by ID returns details."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Gregory House")
        self.assertEqual(response.data["specialization"], "Diagnostic Medicine")

    def test_update_doctor(self):
        """Verify updating doctor profile succeeds."""
        payload = {
            "name": "Dr. Gregory House",
            "specialization": "Nephrology & Diagnostic Medicine",
            "email": "dr.house@hospital.org",
            "phone": "+1987654321",
            "clinic_address": "Room 101, Diagnostics Clinic"
        }
        response = self.client.put(self.detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.doctor.refresh_from_db()
        self.assertEqual(self.doctor.name, "Dr. Gregory House")
        self.assertEqual(self.doctor.specialization, "Nephrology & Diagnostic Medicine")

    def test_delete_doctor(self):
        """Verify deleting doctor removes record and returns 204 No Content."""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Doctor.objects.filter(id=self.doctor.id).exists())

    def test_reject_invalid_doctor_payload(self):
        """Verify doctor creation rejects blank name or specialization."""
        payload = {
            "name": "",
            "specialization": ""
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_nonexistent_doctor_returns_404(self):
        """Verify retrieving nonexistent doctor returns 404."""
        nonexistent_url = reverse('doctor-detail', kwargs={'pk': 999999})
        response = self.client.get(nonexistent_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_doctor_access_blocked(self):
        """Verify unauthenticated requests cannot access doctor endpoints."""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
