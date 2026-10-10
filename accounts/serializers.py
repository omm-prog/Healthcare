from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    """Serializer for public user information."""
    class Meta:
        model = User
        fields = ['id', 'name', 'email']
        read_only_fields = ['id', 'name', 'email']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new user account.
    Validates email uniqueness and password strength.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Password must meet security requirements (at least 8 characters)."
    )

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password']
        read_only_fields = ['id']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required and cannot be blank.")
        return value.strip()

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return normalized_email

    def validate_password(self, value):
        # Validate password strength against Django's configured AUTH_PASSWORD_VALIDATORS
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for authenticating users and issuing JWT tokens.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid email or password."})

        if not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid email or password."})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account is inactive."})

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            }
        }
