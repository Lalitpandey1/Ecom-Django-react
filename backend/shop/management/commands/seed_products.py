from django.core.management.base import BaseCommand

from backend.shop.models import Product

PRODUCTS = [
    ("Arc Desk Lamp", "Home", "A warm, focused pool of light for the end of a long day.", "68.00", "photo-1507473885765-e6ed057f782c", True),
    ("Everyday Ceramic Set", "Home", "Hand-finished stoneware mug and tray, made for slow mornings.", "42.00", "photo-1514228742587-6b1558fcca3d", True),
    ("Field Notes Tote", "Accessories", "A sturdy recycled-canvas carryall with room for the essentials.", "28.00", "photo-1544816155-12df9643f363", False),
    ("Studio Headphones", "Tech", "Clear, balanced sound in a light frame built for all-day listening.", "119.00", "photo-1505740420928-5e560c06d30e", True),
    ("Pebble Wireless Speaker", "Tech", "A pocket-sized speaker with surprisingly rich, room-filling sound.", "79.00", "photo-1608043152269-423dbba4e7e1", False),
    ("Sunday Knit Throw", "Home", "A soft cotton layer for reading corners, sofas, and quiet Sundays.", "86.00", "photo-1600210492486-724fe5c67fb0", False),
    ("Daily Planner", "Stationery", "An undated weekly planner with space to make the week your own.", "24.00", "photo-1455390582262-044cdead277a", False),
    ("Pour-over Coffee Kit", "Home", "A considered ceramic dripper and glass server for a better brew.", "54.00", "photo-1495474472287-4d71bcdd2085", True),
    ("Pocket Film Camera", "Tech", "A simple point-and-shoot for keeping the moments that matter.", "95.00", "photo-1516035069371-29a1b244cc32", False),
    ("Canvas Market Bag", "Accessories", "A roomy everyday bag in durable cotton canvas.", "32.00", "photo-1590874103328-eac38a683ce7", False),
    ("Color Study Print", "Stationery", "A small-batch art print on heavyweight archival paper.", "36.00", "photo-1579783902614-a3fb3927b6a5", False),
    ("Soft Touch Desk Mat", "Stationery", "A calm, comfortable workspace foundation in recycled felt.", "39.00", "photo-1498050108023-c5249f4df085", False),
]


class Command(BaseCommand):
    help = "Create or update the demo catalog. Safe to run more than once."

    def handle(self, *args, **options):
        for name, category, description, price, photo, featured in PRODUCTS:
            Product.objects.update_or_create(
                slug=name.lower().replace(" ", "-"),
                defaults={
                    "name": name,
                    "category": category,
                    "description": description,
                    "price": price,
                    "image_url": f"https://images.unsplash.com/{photo}?auto=format&fit=crop&w=900&q=85",
                    "featured": featured,
                    "stock": 12,
                },
            )
        self.stdout.write(self.style.SUCCESS(f"Catalog ready: {Product.objects.count()} products."))
