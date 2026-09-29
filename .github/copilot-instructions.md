# Project Notes

- Frontend: React + Vite + Tailwind CSS, located in `frontend/`.
- Backend: Django REST Framework API and SimpleJWT authentication, located in `backend/`.
- Use SQLite locally; `DATABASE_URL` selects the Azure PostgreSQL database.
- Run `python manage.py seed_products` to populate the catalog.
- In production, build `frontend/` first; Django serves `frontend/dist/` and WhiteNoise serves its assets.
