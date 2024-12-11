from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from . import serializers


class ExampleAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.NameSerializer

    def get_queryset(self):
        name_list = ['mamad', 'ali', 'hasan']
        return [{'name': name} for name in name_list]
