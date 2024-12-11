from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenObtainPairView
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken


# Custom Token Refresh View
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Extract the refresh token from the cookie
        refresh_token = request.COOKIES.get('refreshToken')

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is missing in cookies."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Validate and create a new access token
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)

            # Return only the access token in the response
            return Response({"access": access_token})
        except InvalidToken:
            return Response(
                {"detail": "Invalid refresh token."},
                status=status.HTTP_401_UNAUTHORIZED
            )


# Custom Token Create View
class CustomTokenCreateView(TokenObtainPairView):
    """
    Overrides TokenObtainPairView to set the refresh token in an HTTP-only cookie.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            refresh_token = response.data.get('refresh')
            if refresh_token:
                response.set_cookie(
                    key='refreshToken',
                    value=refresh_token,
                    httponly=True,
                    secure=True,  # Ensure HTTPS in production
                    samesite='Strict',
                    path='/',
                )
                del response.data['refresh']  # Remove refresh token from response body
        return response


# Custom Logout View (Optional)


class LogoutView(APIView):
    """
    Provides functionality to clear the refresh token cookie during logout.
    """
    def post(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('refreshToken', path='/')
        return response