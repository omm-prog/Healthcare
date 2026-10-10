from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from doctors.models import Doctor
from doctors.serializers import DoctorSerializer


@extend_schema_view(
    get=extend_schema(
        summary="List all doctors",
        description="Returns a paginated list of doctors in the healthcare directory.",
        responses={200: DoctorSerializer(many=True)},
    ),
    post=extend_schema(
        summary="Create a new doctor",
        description="Creates a new doctor record with name and medical specialization.",
        request=DoctorSerializer,
        responses={
            201: DoctorSerializer,
            400: OpenApiResponse(description="Validation error in payload."),
            401: OpenApiResponse(description="Authentication credentials were not provided."),
        },
    ),
)
class DoctorListCreateView(generics.ListCreateAPIView):
    """
    View for listing all doctors or creating a new doctor record.
    Requires authentication.
    """
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]


@extend_schema_view(
    get=extend_schema(
        summary="Retrieve a doctor",
        description="Retrieves doctor details by ID. Returns 404 if not found.",
        responses={
            200: DoctorSerializer,
            404: OpenApiResponse(description="Doctor not found."),
        },
    ),
    put=extend_schema(
        summary="Update a doctor",
        description="Updates an existing doctor profile.",
        request=DoctorSerializer,
        responses={
            200: DoctorSerializer,
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Doctor not found."),
        },
    ),
    patch=extend_schema(
        summary="Partially update a doctor",
        description="Partially updates an existing doctor profile.",
        request=DoctorSerializer,
        responses={
            200: DoctorSerializer,
            400: OpenApiResponse(description="Validation error."),
            404: OpenApiResponse(description="Doctor not found."),
        },
    ),
    delete=extend_schema(
        summary="Delete a doctor",
        description="Deletes a doctor record.",
        responses={
            204: OpenApiResponse(description="Doctor deleted successfully."),
            404: OpenApiResponse(description="Doctor not found."),
        },
    ),
)
class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating, and deleting an individual doctor.
    Requires authentication.
    """
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
