# AutoHunt

AutoHunt is a modern vehicle classifieds platform combining a listings marketplace, real-time buyer-seller messaging, background image processing, and subscription-based ad slots for company accounts.

**Core problems it solves:**
- **Buyers**: discover and filter vehicles with advanced search; save favourites; message sellers instantly
- **Sellers**: post ads with multi-image upload (auto-watermarked); manage listings; chat
- **Companies**: unlock additional ad capacity through tiered subscription plans with PayPal checkout
- **Admins**: moderate listings, manage catalog data, and view revenue analytics

## Features

### Authentication & Accounts
- JWT-based login via djangorestframework-simplejwt
- Email-based user model with Google OAuth sign-in/sign-up
- Two account types: **Private** and **Company** (with subscription purchasing)
- Profile management: view, update, delete; public profile endpoint for active users
- Persistent frontend sessions

### Listings & Search
- Full CRUD for ads with ownership checks (staff can bypass)
- Full-text search over title, description, and catalog fields
- Advanced filters: price/year/mileage/power ranges, multi-select body/drive/transmission/color, boolean flags (warranty, A/C, first owner, airbags)
- Flexible ordering and paginated results
- Filters are URL-synced - shareable filtered views

### Images & Media
- Multiple images per ad with type/size validation
- **Asynchronous watermarking** via Celery + Redis - uploads don't block the request
- Image management on edit (add/remove per image)

### Location
- Location autocomplete via OpenStreetMap Nominatim
- Reverse geocoding endpoint
- Coordinates stored on ads and company profiles
- Interactive map (Leaflet) on the ad detail page

### Real-time Chat
- Chat threads scoped to an ad (buyer - seller)
- WebSocket connections via Django Channels + Redis channel layer
- JWT authentication over the WebSocket query param
- Read receipts via REST and WebSocket broadcast
- Chat list with ad preview per thread

### Subscriptions (Company Accounts)
- Tiered plans with additional ad slots
- PayPal checkout flow with activation endpoint
- Upgrade-only logic: no downgrades; prevents re-buying active plan
- Deactivates previous subscription on upgrade
- Stores PayPal order/payer IDs and amount paid

### Admin Panel
- User management: list/filter/search, ban/unban, toggle staff status, delete
- Ad moderation: view and delete any listing
- Catalog CRUD: brands, models, body types, fuel types, etc.
- Plan CRUD: create and manage subscription tiers
- Revenue dashboard: total revenue, active subs, period aggregations, revenue by plan, recent purchases list


## Tech Stack

### Backend

- Python
- Django
- Django REST Framework 
- djangorestframework-simplejwt
- Django Channels + channels_redis 
- Celery + Redis 
- django-filter 
- Pillow 
- OpenStreetMap Nominatim
- uvicorn 

### Frontend

- React + TypeScript (Vite) 
- Material UI (MUI) 
- Redux
- React Router 
- Formik + Yup 
- @paypal/react-paypal-js
- Leaflet
- Recharts


## Installation

The project is split into `backend/` and `frontend/`

### Prerequisites
- Python 3.11
- Node.js 

### Backend Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/yankkvx/autohunt-platform.git
   ```
2. Navigate to the project directory:
   ```sh
   cd autohunt
   ```
3. Create a `.env` file in `backend/` (where `manage.py` is located):
   ```sh
   SECRET_KEY=your_secret_key_here
   DEBUG=True
   USER_AGENT=your_app_name/0.1
   GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
   GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
   ```
4. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   venv/scripts/activate   # On Linux: source venv/bin/activate
   ```
5. Install dependencies:
   ```sh
   cd backend
   pip install -r requirements.txt
   ```
6. Apply migrations:
   ```sh
   python manage.py migrate
   ```
7. Start the ASGI server:
   ```sh
   uvicorn backend.asgi:application --port 8000
   ```
8. In a separate terminal, start the Celery worker (for image watermarking):
   ```sh
   celery -A backend worker --loglevel=info
   ```
9. Create a superuser for admin access (Optional):
   ```sh
   python manage.py createsuperuser
   ```

#### Option B — Docker (recommended)

Starts `web`, `celery_worker`, and `redis` together:
```sh
cd backend
docker compose up --build
```


### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Create a `.env` file in `frontend/`:
   ```sh
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the React development server:
   ```sh
   npm run dev
   ```

## Roadmap

- PostgreSQL support with Docker migrations and seed data
- Email verification and password reset
- Bulk admin moderation actions and audit log


## Demonstration

![HomeScreen](https://github.com/yankkvx/autohunt-platform/blob/d311da6b494f02552531c74bc164a19230091ca6/screenshots/HomeScreen_Light.png)

## Contributing

Contributions are welcome - feel free to open issues or pull requests.


## Contact

Questions or feedback? Reach out at **yankkvx@gmail.com**
