"""Custom exception handling for consistent API error responses."""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler to standardize error responses across all endpoints.
    Ensures clear client messages without leaking database internals or stack traces.
    """
    # First call REST framework's default exception handler
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize structured errors
        custom_data = {
            "status_code": response.status_code,
            "errors": response.data,
        }
        response.data = custom_data
        return response

    # Handle Django's built-in validation error if raised directly
    if isinstance(exc, DjangoValidationError):
        return Response(
            {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "errors": exc.message_dict if hasattr(exc, "message_dict") else [str(exc)],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Handle uncaught IntegrityErrors (e.g. unexpected DB uniqueness/foreign key constraints)
    if isinstance(exc, IntegrityError):
        logger.warning("Database integrity error encountered: %s", str(exc))
        return Response(
            {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "errors": {"detail": "A database integrity constraint was violated (such as duplicate record)."},
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Unhandled server errors (500)
    logger.exception("Unhandled server error: %s", str(exc))
    return Response(
        {
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "errors": {"detail": "An internal server error occurred. Please contact system administrator."},
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
