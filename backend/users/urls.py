from . import views
from django.urls import path

urlpatterns = [
    path('/', views.ExampleAPIView.as_view()),
]
