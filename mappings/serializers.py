from rest_framework import serializers
from django.db import IntegrityError, transaction
from mappings.models import PatientDoctor
from patients.models import Patient
from doctors.models import Doctor
from doctors.serializers import DoctorSerializer


class PatientSummarySerializer(serializers.ModelSerializer):
    """Minimal representation of patient for nested responses."""
    class Meta:
        model = Patient
        fields = ['id', 'name', 'age', 'gender']
        read_only_fields = fields


class DoctorSummarySerializer(serializers.ModelSerializer):
    """Minimal representation of doctor for nested responses."""
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization', 'phone', 'email']
        read_only_fields = fields


class PatientDoctorReadSerializer(serializers.ModelSerializer):
    """Detailed read representation of a patient-doctor mapping."""
    patient = PatientSummarySerializer(read_only=True)
    doctor = DoctorSummarySerializer(read_only=True)

    class Meta:
        model = PatientDoctor
        fields = ['id', 'patient', 'doctor', 'assigned_at']
        read_only_fields = fields


class PatientDoctorCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new patient-doctor assignment.
    Enforces that:
    1. The patient belongs to the authenticated user.
    2. The doctor exists.
    3. Duplicate assignments are prevented with a 400 validation error.
    """
    patient = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(),
        help_text="ID of the patient (must be owned by the authenticated user)."
    )
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        help_text="ID of the doctor to assign."
    )

    class Meta:
        model = PatientDoctor
        fields = ['id', 'patient', 'doctor', 'assigned_at']
        read_only_fields = ['id', 'assigned_at']

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        patient = attrs.get('patient')
        doctor = attrs.get('doctor')

        # Ownership validation: verify patient is owned by the authenticated user
        if not user or patient.owner != user:
            raise serializers.ValidationError(
                {"patient": "Patient does not exist or you do not have permission to manage this record."}
            )

        # Duplicate assignment validation
        if PatientDoctor.objects.filter(patient=patient, doctor=doctor).exists():
            raise serializers.ValidationError(
                {"detail": f"Doctor '{doctor.name}' is already assigned to patient '{patient.name}'."}
            )

        return attrs

    def create(self, validated_data):
        try:
            with transaction.atomic():
                return super().create(validated_data)
        except IntegrityError:
            raise serializers.ValidationError(
                {"detail": "This doctor is already assigned to this patient."}
            )


class AssignedDoctorItemSerializer(serializers.Serializer):
    """Serializer representing an assigned doctor for a specific patient."""
    mapping_id = serializers.IntegerField(source='id')
    doctor = DoctorSummarySerializer()
    assigned_at = serializers.DateTimeField()
