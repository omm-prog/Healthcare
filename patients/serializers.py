from rest_framework import serializers
from patients.models import Patient, GenderChoices


class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer for Patient CRUD operations.
    Owner is strictly read-only and automatically assigned in views.
    """
    owner_id = serializers.ReadOnlyField(source='owner.id')
    owner_email = serializers.ReadOnlyField(source='owner.email')

    class Meta:
        model = Patient
        fields = [
            'id',
            'owner_id',
            'owner_email',
            'name',
            'age',
            'gender',
            'email',
            'phone',
            'address',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'owner_id', 'owner_email', 'created_at', 'updated_at']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Patient name cannot be blank.")
        return value.strip()

    def validate_age(self, value):
        if value < 0:
            raise serializers.ValidationError("Age must be a non-negative integer.")
        if value > 150:
            raise serializers.ValidationError("Age must be realistic (less than 150).")
        return value

    def validate_gender(self, value):
        valid_choices = [choice[0] for choice in GenderChoices.choices]
        # Match case-insensitively if needed, or exact
        for valid in valid_choices:
            if value.lower() == valid.lower():
                return valid
        raise serializers.ValidationError(
            f"Invalid gender choice '{value}'. Allowed options are: {', '.join(valid_choices)}."
        )
