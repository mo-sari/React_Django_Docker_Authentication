from rest_framework import generics
from rest_framework.permissions import IsAuthenticated


class ExampleAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        name_list = ['mamad', 'ali', 'hasan']

        return name_list
