from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationTests(APITestCase):
    """Test suite for User Registration, Authentication, and JWT Token Management."""

    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.refresh_url = reverse('auth-token-refresh')
        self.patients_url = reverse('patient-list-create')

        self.valid_user_data = {
            "name": "Dr. Alice Smith",
            "email": "alice@hospital.org",
            "password": "StrongPassword123!"
        }
        self.existing_user = User.objects.create_user(
            name="Existing User",
            email="existing@hospital.org",
            password="StrongPassword123!"
        )

    def test_successful_registration(self):
        """Verify new user registration with valid details returns 201 and creates user."""
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "alice@hospital.org")
        self.assertNotIn("password", response.data["user"])

        # Verify persisted user and password hashing
        user = User.objects.get(email="alice@hospital.org")
        self.assertTrue(user.check_password("StrongPassword123!"))
        self.assertNotEqual(user.password, "StrongPassword123!")

    def test_duplicate_email_registration(self):
        """Verify registration rejects duplicate email with 400 Bad Request."""
        duplicate_data = {
            "name": "Duplicate User",
            "email": "existing@hospital.org",
            "password": "StrongPassword123!"
        }
        response = self.client.post(self.register_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_case_insensitive_duplicate_email_registration(self):
        """Verify registration rejects email with different case."""
        duplicate_data = {
            "name": "Case Duplicate User",
            "email": "EXISTING@HOSPITAL.ORG",
            "password": "StrongPassword123!"
        }
        response = self.client.post(self.register_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email_format(self):
        """Verify registration rejects invalid email format."""
        data = {
            "name": "Invalid Email",
            "email": "not-an-email",
            "password": "StrongPassword123!"
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_weak_password_rejected(self):
        """Verify password strength validation rejects short passwords."""
        data = {
            "name": "Weak Pass",
            "email": "weak@hospital.org",
            "password": "short"
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_required_fields(self):
        """Verify registration rejects payload missing name or password."""
        response = self.client.post(self.register_url, {"email": "noname@hospital.org"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_login(self):
        """Verify login with valid credentials returns JWT access and refresh tokens."""
        login_data = {
            "email": "existing@hospital.org",
            "password": "StrongPassword123!"
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "existing@hospital.org")

    def test_login_invalid_password(self):
        """Verify login fails with incorrect password."""
        login_data = {
            "email": "existing@hospital.org",
            "password": "WrongPassword!"
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_user(self):
        """Verify login fails for nonexistent email address."""
        login_data = {
            "email": "unknown@hospital.org",
            "password": "AnyPassword123!"
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_refresh(self):
        """Verify valid refresh token can obtain a new access token."""
        login_data = {
            "email": "existing@hospital.org",
            "password": "StrongPassword123!"
        }
        login_resp = self.client.post(self.login_url, login_data, format='json')
        refresh_token = login_resp.data["refresh"]

        refresh_resp = self.client.post(self.refresh_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_resp.data)

    def test_token_refresh_invalid(self):
        """Verify refresh fails with invalid token string."""
        response = self.client.post(self.refresh_url, {"refresh": "invalid.jwt.token"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_jwt_on_protected_endpoint(self):
        """Verify protected endpoint blocks anonymous request with 401."""
        response = self.client.get(self.patients_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_jwt_on_protected_endpoint(self):
        """Verify protected endpoint rejects invalid JWT token."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token_12345')
        response = self.client.get(self.patients_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
