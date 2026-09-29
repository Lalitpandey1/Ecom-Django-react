from pathlib import Path

from django.conf import settings
from django.http import HttpResponse
from django.views import View
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated

from backend.shop.models import Product
from backend.shop.serializers import ProductSerializer, RegisterSerializer, UserSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()

    def get_queryset(self):
        products = super().get_queryset()
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        if category and category != "All items":
            products = products.filter(category__iexact=category)
        if search:
            products = products.filter(name__icontains=search) | products.filter(description__icontains=search)
        return products.distinct()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class FrontendView(View):
    def get(self, request):
        index_file = Path(settings.BASE_DIR) / "frontend" / "dist" / "index.html"
        if not index_file.exists():
            return HttpResponse("Build the frontend with `npm run build` in frontend/ first.", status=503)
        return HttpResponse(index_file.read_text(encoding="utf-8"), content_type="text/html")
