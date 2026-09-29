# Field & Form

A small full-stack shop: React and Tailwind CSS for the storefront, Django REST Framework for the catalog and accounts, and JWT access tokens for sign-in. The demo catalog is seeded locally; the cart is saved in the browser. Checkout is a UI placeholder, not a connected payment service.

## Requirements

- Python 3.11 or newer
- Node.js 20 or newer

## Run locally

From the project root, create and activate a virtual environment, then install the backend packages:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

In a second terminal, install and start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

In the first terminal, from the project root, initialize the database and demo products, then start Django:

```powershell
Copy-Item .env.example .env
python manage.py migrate
python manage.py seed_products
python manage.py runserver
```

Open the Vite URL shown in the frontend terminal (usually `http://localhost:5173`). Vite sends API requests to Django at `http://127.0.0.1:8000/api`. To create an admin user, run `python manage.py createsuperuser`; the admin is at `/admin/`.

## API at a glance

- `GET /api/products/` lists the catalog. Optional `?category=Home` and `?search=lamp` filters are supported.
- `POST /api/auth/register/` creates an account with `username`, `email`, and `password`.
- `POST /api/auth/token/` exchanges a username or email and `password` for JWT access and refresh tokens.
- `POST /api/auth/token/refresh/` refreshes an access token.
- `GET /api/auth/me/` returns the signed-in user and requires `Authorization: Bearer <access-token>`.

## Azure deployment

The first deployment uses one Azure App Service for Django and the built React app, plus Azure Database for PostgreSQL Flexible Server for persistent data. SQLite is only for local development.

1. Create an Azure Database for PostgreSQL Flexible Server and a Linux Azure App Service using Python 3.11 or newer. Allow the App Service to connect to the database.
2. In App Service **Environment variables**, set `DJANGO_SECRET_KEY` to a new random secret, `DJANGO_DEBUG` to `False`, `DJANGO_ALLOWED_HOSTS` to your `*.azurewebsites.net` hostname, and `DATABASE_URL` to the PostgreSQL connection URL. Keep the database password private. Example: `postgresql://USER:PASSWORD@SERVER.postgres.database.azure.com:5432/DATABASE?sslmode=require`.
3. Build the frontend before deployment:

   ```powershell
   cd frontend
   npm ci
   npm run build
   cd ..
   python manage.py collectstatic --noinput
   ```

4. Deploy the repository contents, including `frontend/dist/`, to App Service. Set its startup command to `python manage.py migrate && python manage.py seed_products && gunicorn backend.config.wsgi:application --bind 0.0.0.0:8000`.
5. Browse to the App Service hostname. Django serves both the API and storefront from the same origin.

For a first learning deployment, set App Service and PostgreSQL environment variables in the Azure portal. Later, secrets can move to Azure Key Vault and deployment can be automated with GitHub Actions. Never commit `.env` or production credentials.
