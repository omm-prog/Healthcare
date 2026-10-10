from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework_simplejwt.views import TokenRefreshView as SimpleJWTTokenRefreshView

from accounts.serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSummarySerializer
)


class UserRegistrationView(APIView):
    """
    Register a new user account using name, email, and password.
    Returns 201 Created with the registered user profile (excluding password).
    """
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    @extend_schema(
        summary="Register a new user",
        description="Creates a new user account with unique email and validated password.",
        request=UserRegistrationSerializer,
        responses={
            201: OpenApiResponse(response=UserSummarySerializer, description="User successfully registered."),
            400: OpenApiResponse(description="Validation error (e.g. duplicate email or weak password)."),
        },
        auth=[]
    )
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "User registered successfully.",
                "user": UserSummarySerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


class UserLoginView(APIView):
    """
    Authenticate an existing user via email and password.
    Returns 200 OK with JWT access and refresh tokens.
    """
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    @extend_schema(
        summary="User login & obtain JWT tokens",
        description="Authenticates with email and password, returning JWT access and refresh tokens.",
        request=UserLoginSerializer,
        responses={
            200: OpenApiResponse(description="Successful authentication with JWT tokens."),
            400: OpenApiResponse(description="Invalid credentials or inactive account."),
        },
        auth=[]
    )
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class TokenRefreshView(SimpleJWTTokenRefreshView):
    """
    Refresh an expired JWT access token using a valid refresh token.
    """
    @extend_schema(
        summary="Refresh JWT access token",
        description="Takes a valid refresh token and returns a new access token.",
        responses={
            200: OpenApiResponse(description="Token refreshed successfully."),
            401: OpenApiResponse(description="Refresh token is expired or invalid."),
        },
        auth=[]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
