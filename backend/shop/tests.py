from rest_framework.test import APITestCase

from backend.shop.models import Product


class ShopApiTests(APITestCase):
    def setUp(self):
        Product.objects.create(
            name="Test Lamp",
            slug="test-lamp",
            category="Home",
            description="A small desk lamp.",
            price="25.00",
            image_url="https://example.com/lamp.jpg",
        )
        Product.objects.create(
            name="Test Tote",
            slug="test-tote",
            category="Accessories",
            description="A reusable canvas bag.",
            price="15.00",
            image_url="https://example.com/tote.jpg",
        )

    def test_catalog_search_and_category_filters(self):
        category_response = self.client.get("/api/products/?category=Home")
        search_response = self.client.get("/api/products/?search=canvas")

        self.assertEqual(category_response.status_code, 200)
        self.assertEqual([item["name"] for item in category_response.data], ["Test Lamp"])
        self.assertEqual(search_response.status_code, 200)
        self.assertEqual([item["name"] for item in search_response.data], ["Test Tote"])

    def test_signup_email_login_and_authenticated_profile(self):
        registration = self.client.post("/api/auth/register/", {
            "username": "sam",
            "email": "sam@example.com",
            "password": "valid-password-42",
        }, format="json")
        self.assertEqual(registration.status_code, 201)

        token_response = self.client.post("/api/auth/token/", {
            "username": "sam@example.com",
            "password": "valid-password-42",
        }, format="json")
        self.assertEqual(token_response.status_code, 200)
        self.assertIn("access", token_response.data)
        self.assertIn("refresh", token_response.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")
        profile = self.client.get("/api/auth/me/")
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.data["email"], "sam@example.com")
