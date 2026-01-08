"""
API views for user management.

This module contains RESTful API views for:
- User registration
- User profile retrieval
- Token refresh (handled by SimpleJWT)

All views include proper error handling and logging.
"""

import logging
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import RegisterSerializer, UserSerializer


logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    API view for user registration.
    
    Endpoint: POST /api/auth/register/
    Permission: AllowAny (public endpoint)
    
    Request Body:
        - username (str): Unique username (3-30 chars, alphanumeric with _.-).
        - email (str): Valid unique email address.
        - first_name (str): User's first name.
        - last_name (str): User's last name.
        - password (str): Password (min 8 chars, meets Django requirements).
        - password2 (str): Password confirmation.
    
    Responses:
        - 201 Created: User successfully registered.
        - 400 Bad Request: Validation errors.
    """
    
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """
        Handle user registration request.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: JSON response with user data or errors.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Return user data without password
            response_serializer = UserSerializer(user)
            
            logger.info(f"User registered successfully: {user.username}")
            
            return Response(
                {
                    'message': 'User registered successfully.',
                    'user': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            
            # If validation errors, serializer.errors will be populated
            if hasattr(serializer, 'errors') and serializer.errors:
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generic error response
            return Response(
                {'error': 'Registration failed. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(generics.RetrieveAPIView):
    """
    API view for retrieving the authenticated user's profile.
    
    Endpoint: GET /api/auth/profile/
    Permission: IsAuthenticated (requires valid JWT token)
    
    Headers Required:
        Authorization: Bearer <access_token>
    
    Responses:
        - 200 OK: User profile data.
        - 401 Unauthorized: Invalid or missing token.
    """
    
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """
        Get the currently authenticated user.
        
        Returns:
            User: The authenticated user instance.
        """
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        """
        Handle profile retrieval request.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: JSON response with user profile data.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            
            logger.info(f"Profile retrieved for user: {instance.username}")
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Profile retrieval error: {str(e)}")
            
            return Response(
                {'error': 'Failed to retrieve profile.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """
    API view for user logout (token blacklisting).
    
    Endpoint: POST /api/auth/logout/
    Permission: IsAuthenticated (requires valid JWT token)
    
    Request Body:
        - refresh (str): The refresh token to blacklist.
    
    Headers Required:
        Authorization: Bearer <access_token>
    
    Responses:
        - 200 OK: Successfully logged out.
        - 400 Bad Request: Invalid or missing refresh token.
        - 401 Unauthorized: Invalid or missing access token.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Handle logout request by blacklisting the refresh token.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: JSON response confirming logout or error.
        """
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logger.info(f"User logged out: {request.user.username}")
            
            return Response(
                {'message': 'Successfully logged out.'},
                status=status.HTTP_200_OK
            )
            
        except TokenError as e:
            logger.warning(f"Logout token error: {str(e)}")
            
            return Response(
                {'error': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            
            return Response(
                {'error': 'Logout failed. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class HealthCheckView(APIView):
    """
    API view for health check (useful for monitoring).
    
    Endpoint: GET /api/auth/health/
    Permission: AllowAny (public endpoint)
    
    Responses:
        - 200 OK: API is healthy.
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Handle health check request.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: JSON response indicating API health.
        """
        return Response(
            {
                'status': 'healthy',
                'message': 'User Authentication API is running.'
            },
            status=status.HTTP_200_OK
        )


class AdminUserListView(generics.ListAPIView):
    """
    API view for admins to list and search all users.
    
    Endpoint: GET /api/auth/admin/users/
    Permission: IsAdminUser (requires staff status)
    
    Query Parameters:
        - search (str): Search users by username, email, first_name, or last_name
    
    Headers Required:
        Authorization: Bearer <access_token>
    
    Responses:
        - 200 OK: List of users.
        - 401 Unauthorized: Invalid or missing token.
        - 403 Forbidden: User is not staff.
    """
    
    from rest_framework.permissions import IsAdminUser
    from .serializers import AdminUserSerializer
    
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """
        Get queryset with optional search filtering.
        """
        from django.db.models import Q
        
        queryset = User.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Handle list request with logging."""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            logger.info(f"Admin {request.user.username} listed users (count: {queryset.count()})")
            
            return Response({
                'count': queryset.count(),
                'users': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Admin user list error: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve user list.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for admins to get, update, or delete a specific user.
    
    Endpoints:
        - GET /api/auth/admin/users/<id>/
        - PUT/PATCH /api/auth/admin/users/<id>/
        - DELETE /api/auth/admin/users/<id>/
    
    Permission: IsAdminUser (requires staff status)
    
    Headers Required:
        Authorization: Bearer <access_token>
    
    Responses:
        - 200 OK: User data or update success.
        - 204 No Content: User deleted successfully.
        - 400 Bad Request: Validation errors.
        - 401 Unauthorized: Invalid or missing token.
        - 403 Forbidden: User is not staff or trying to delete self.
        - 404 Not Found: User not found.
    """
    
    from rest_framework.permissions import IsAdminUser
    from .serializers import AdminUserSerializer
    
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'
    
    def update(self, request, *args, **kwargs):
        """Handle user update with logging."""
        try:
            instance = self.get_object()
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            logger.info(f"Admin {request.user.username} updated user: {instance.username}")
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Admin user update error: {str(e)}")
            if hasattr(serializer, 'errors') and serializer.errors:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                {'error': 'Failed to update user.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        """Handle user deletion with safety checks."""
        try:
            instance = self.get_object()
            
            # Prevent admin from deleting themselves
            if instance.pk == request.user.pk:
                return Response(
                    {'error': 'You cannot delete your own account.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Prevent deleting superusers (only via Django admin)
            if instance.is_superuser:
                return Response(
                    {'error': 'Superusers can only be deleted via Django admin.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            username = instance.username
            self.perform_destroy(instance)
            
            logger.info(f"Admin {request.user.username} deleted user: {username}")
            
            return Response(
                {'message': f'User {username} has been deleted.'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Admin user delete error: {str(e)}")
            return Response(
                {'error': 'Failed to delete user.'},
                status=status.HTTP_400_BAD_REQUEST
            )

