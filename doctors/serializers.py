from rest_framework import serializers
from doctors.models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    """
    Serializer for Doctor CRUD operations.
    Validates required fields like name and medical specialization.
    """
    class Meta:
        model = Doctor
        fields = [
            'id',
            'name',
            'specialization',
            'email',
            'phone',
            'clinic_address',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Doctor name is required and cannot be blank.")
        return value.strip()

    def validate_specialization(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Doctor specialization is required and cannot be blank.")
        return value.strip()
