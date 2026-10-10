from django.shortcuts import get_object_or_404
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter

from mappings.models import PatientDoctor
from patients.models import Patient
from mappings.serializers import (
    PatientDoctorCreateSerializer,
    PatientDoctorReadSerializer,
    AssignedDoctorItemSerializer
)


class PatientDoctorListCreateView(generics.ListCreateAPIView):
    """
    View to list all doctor-patient mappings for the authenticated user,
    or assign a doctor to an owned patient.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PatientDoctorCreateSerializer
        return PatientDoctorReadSerializer

    def get_queryset(self):
        """Only return mappings where the patient is owned by the authenticated user."""
        return PatientDoctor.objects.filter(
            patient__owner=self.request.user
        ).select_related('patient', 'doctor')

    @extend_schema(
        summary="List all patient-doctor mappings",
        description="Returns all mappings for patients owned by the authenticated user.",
        responses={200: PatientDoctorReadSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Assign a doctor to a patient",
        description="Assigns a doctor to a patient owned by the authenticated user. Prevents duplicate assignments.",
        request=PatientDoctorCreateSerializer,
        responses={
            201: PatientDoctorReadSerializer,
            400: OpenApiResponse(description="Invalid input, unowned patient, or duplicate assignment."),
            401: OpenApiResponse(description="Unauthenticated request."),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        # Return enriched read representation
        read_serializer = PatientDoctorReadSerializer(instance)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


class PatientDoctorPatientOrDeleteView(APIView):
    """
    Dispatches mapping actions based on HTTP method:
    - GET /api/mappings/<patient_id>/ : Identifies a patient; returns doctors assigned to that patient.
    - DELETE /api/mappings/<id>/ : Identifies a mapping record; removes that assignment.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List doctors assigned to a specific patient",
        description=(
            "The path parameter <pk> identifies the 'patient_id'.\n"
            "Returns all doctors assigned to the specified patient.\n"
            "Returns 404 Not Found if the patient does not exist or is not owned by the caller."
        ),
        parameters=[
            OpenApiParameter(
                name='pk',
                type=int,
                location=OpenApiParameter.PATH,
                description='ID of the patient whose assigned doctors are to be listed.',
            )
        ],
        responses={
            200: AssignedDoctorItemSerializer(many=True),
            404: OpenApiResponse(description="Patient not found or unauthorized."),
        },
    )
    def get(self, request, pk, *args, **kwargs):
        # Interpret pk as patient_id. Verify patient is owned by authenticated user.
        patient = Patient.objects.filter(id=pk, owner=request.user).first()
        if not patient:
            return Response(
                {"detail": "Patient not found or you do not have permission to access this record."},
                status=status.HTTP_404_NOT_FOUND
            )

        mappings = PatientDoctor.objects.filter(
            patient=patient
        ).select_related('doctor')

        serializer = AssignedDoctorItemSerializer(mappings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Remove a doctor assignment",
        description=(
            "The path parameter <pk> identifies the 'mapping_id'.\n"
            "Deletes the doctor-patient assignment record.\n"
            "Returns 404 Not Found if the mapping does not exist or does not belong to an owned patient."
        ),
        parameters=[
            OpenApiParameter(
                name='pk',
                type=int,
                location=OpenApiParameter.PATH,
                description='ID of the Patient-Doctor mapping record to delete.',
            )
        ],
        responses={
            204: OpenApiResponse(description="Doctor assignment successfully removed."),
            404: OpenApiResponse(description="Mapping not found or unauthorized."),
        },
    )
    def delete(self, request, pk, *args, **kwargs):
        # Interpret pk as mapping_id. Verify mapping belongs to user's owned patient.
        mapping = PatientDoctor.objects.filter(
            id=pk,
            patient__owner=request.user
        ).first()

        if not mapping:
            return Response(
                {"detail": "Mapping not found or you do not have permission to delete this record."},
                status=status.HTTP_404_NOT_FOUND
            )

        mapping.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
