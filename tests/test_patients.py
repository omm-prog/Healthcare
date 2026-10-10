from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from patients.models import Patient

User = get_user_model()


class PatientManagementTests(APITestCase):
    """Test suite for Patient CRUD and Multi-Tenant Ownership Isolation."""

    def setUp(self):
        self.user_a = User.objects.create_user(
            name="User A",
            email="usera@hospital.org",
            password="StrongPassword123!"
        )
        self.user_b = User.objects.create_user(
            name="User B",
            email="userb@hospital.org",
            password="StrongPassword123!"
        )

        self.client.force_authenticate(user=self.user_a)

        self.patient_a = Patient.objects.create(
            owner=self.user_a,
            name="John Doe",
            age=45,
            gender="Male",
            email="johndoe@example.com",
            phone="+1234567890",
            address="123 Maple Street"
        )
        self.patient_b = Patient.objects.create(
            owner=self.user_b,
            name="Jane Roe",
            age=32,
            gender="Female",
            email="janeroe@example.com",
            phone="+0987654321",
            address="456 Oak Avenue"
        )

        self.list_url = reverse('patient-list-create')
        self.detail_url_a = reverse('patient-detail', kwargs={'pk': self.patient_a.id})
        self.detail_url_b = reverse('patient-detail', kwargs={'pk': self.patient_b.id})

    def test_create_patient_authenticated(self):
        """Verify patient creation assigns authenticated user as owner."""
        payload = {
            "name": "Robert Brown",
            "age": 58,
            "gender": "Male",
            "email": "robert@example.com",
            "phone": "+1122334455",
            "address": "789 Pine Road"
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Robert Brown")
        self.assertEqual(response.data["owner_id"], self.user_a.id)

        created_patient = Patient.objects.get(id=response.data["id"])
        self.assertEqual(created_patient.owner, self.user_a)

    def test_client_supplied_owner_id_is_ignored(self):
        """Verify client cannot spoof owner ID to associate record with another user."""
        payload = {
            "name": "Tamper Test",
            "age": 25,
            "gender": "Other",
            "owner_id": self.user_b.id,
            "owner": self.user_b.id
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_patient = Patient.objects.get(id=response.data["id"])
        self.assertEqual(created_patient.owner, self.user_a)
        self.assertNotEqual(created_patient.owner, self.user_b)

    def test_list_patients_only_owned(self):
        """Verify list endpoint only returns patient records owned by calling user."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Handle pagination response format
        results = response.data.get('results', response.data)
        patient_ids = [p["id"] for p in results]

        self.assertIn(self.patient_a.id, patient_ids)
        self.assertNotIn(self.patient_b.id, patient_ids)

    def test_retrieve_owned_patient(self):
        """Verify retrieving an owned patient succeeds."""
        response = self.client.get(self.detail_url_a)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "John Doe")

    def test_prevent_cross_user_patient_retrieval(self):
        """Verify retrieving another user's patient returns 404 (isolation)."""
        response = self.client.get(self.detail_url_b)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_owned_patient(self):
        """Verify updating an owned patient succeeds."""
        payload = {
            "name": "Johnathan Doe",
            "age": 46,
            "gender": "Male",
            "email": "johndoe@example.com",
            "phone": "+1234567890",
            "address": "123 Maple Street Updated"
        }
        response = self.client.put(self.detail_url_a, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.patient_a.refresh_from_db()
        self.assertEqual(self.patient_a.name, "Johnathan Doe")
        self.assertEqual(self.patient_a.age, 46)

    def test_prevent_cross_user_patient_update(self):
        """Verify updating another user's patient returns 404 and does not modify record."""
        payload = {
            "name": "Malicious Update",
            "age": 99,
            "gender": "Other"
        }
        response = self.client.put(self.detail_url_b, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.patient_b.refresh_from_db()
        self.assertEqual(self.patient_b.name, "Jane Roe")

    def test_delete_owned_patient(self):
        """Verify deleting an owned patient succeeds with 204 No Content."""
        response = self.client.delete(self.detail_url_a)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Patient.objects.filter(id=self.patient_a.id).exists())

    def test_prevent_cross_user_patient_delete(self):
        """Verify deleting another user's patient returns 404 and preserves record."""
        response = self.client.delete(self.detail_url_b)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Patient.objects.filter(id=self.patient_b.id).exists())

    def test_reject_invalid_age(self):
        """Verify validation rejects negative age."""
        payload = {
            "name": "Invalid Age",
            "age": -5,
            "gender": "Male"
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_invalid_gender(self):
        """Verify validation rejects unsupported gender choice."""
        payload = {
            "name": "Invalid Gender",
            "age": 30,
            "gender": "UnknownGender"
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_access_blocked(self):
        """Verify anonymous requests to patient endpoints are denied."""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
