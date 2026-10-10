from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from patients.models import Patient
from patients.serializers import PatientSerializer


@extend_schema_view(
    get=extend_schema(
        summary="List owned patients",
        description="Returns a paginated list of patient records owned by the authenticated user.",
        responses={200: PatientSerializer(many=True)},
    ),
    post=extend_schema(
        summary="Create a new patient",
        description="Creates a patient record and automatically sets the authenticated user as owner.",
        request=PatientSerializer,
        responses={
            201: PatientSerializer,
            400: OpenApiResponse(description="Validation error in payload."),
            401: OpenApiResponse(description="Authentication credentials were not provided."),
        },
    ),
)
class PatientListCreateView(generics.ListCreateAPIView):
    """
    View for listing and creating patient records owned by the authenticated user.
    """
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only return patient records owned by the authenticated user."""
        return Patient.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """Force the record owner to be the authenticated user."""
        serializer.save(owner=self.request.user)


@extend_schema_view(
    get=extend_schema(
        summary="Retrieve an owned patient",
        description="Retrieves a single patient record owned by the authenticated user. Returns 404 if record belongs to another user.",
        responses={
            200: PatientSerializer,
            404: OpenApiResponse(description="Patient not found or unauthorized."),
        },
    ),
    put=extend_schema(
        summary="Update an owned patient",
        description="Completely updates an existing patient record owned by the authenticated user.",
        request=PatientSerializer,
        responses={
            200: PatientSerializer,
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Patient not found or unauthorized."),
        },
    ),
    patch=extend_schema(
        summary="Partially update an owned patient",
        description="Partially updates an existing patient record owned by the authenticated user.",
        request=PatientSerializer,
        responses={
            200: PatientSerializer,
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Patient not found or unauthorized."),
        },
    ),
    delete=extend_schema(
        summary="Delete an owned patient",
        description="Permanently deletes an existing patient record owned by the authenticated user.",
        responses={
            204: OpenApiResponse(description="Patient deleted successfully."),
            404: OpenApiResponse(description="Patient not found or unauthorized."),
        },
    ),
)
class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating, and deleting an individual patient record owned by the user.
    """
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only allow access to patient records owned by the authenticated user."""
        return Patient.objects.filter(owner=self.request.user)
