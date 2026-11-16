# FAKHARA

E-commerce site for Moroccan pottery. React + Vite frontend, Node.js + Express
backend, MongoDB + Mongoose database.

---

## Requirements

- Node.js 20 or newer
- MongoDB 7 or newer (see [Database](#database))

```bash
npm install
```

---

## Environment variables

The repository ships two git-ignored `.env` files and one template per side.

| File | Purpose |
| --- | --- |
| `.env` | Frontend (Vite). Read by the browser bundle. |
| `server/.env` | Backend (Express). Holds every secret. |
| `.env.example` | Frontend template with placeholders. |
| `server/.env.example` | Backend template with placeholders. |

Copy the templates if you are starting from a clean checkout:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Then fill in `server/.env`:

```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/fakhara
MONGO_DB_NAME=fakhara
JWT_SECRET=<generate a random value>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@fakhara.local
ADMIN_PASSWORD=<choose a strong password>
```

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Only variables prefixed with `VITE_` are exposed to the browser. Never put a
secret in `.env` at the repository root.

---

## Database

The database is named **fakhara** and lives at `mongodb://127.0.0.1:27017/fakhara`.

### Starting MongoDB

```bash
npm run mongo
```

This runs `start-mongodb.cmd`, which launches the local `mongod` with its data
directory in `server/data/mongodb`, so the data survives restarts. The script
is a no-op when MongoDB is already listening on port 27017.

To stop the server, close the minimized `FAKHARA MongoDB` window, or run:

```bash
taskkill /IM mongod.exe /F
```

If `mongod.exe` is not at `C:\Users\Hcheum\mongodb-8.2.6\mongod.exe`, edit the
`MONGOD` path at the top of `start-mongodb.cmd`.

### Using MongoDB Atlas instead

Set `MONGODB_URI` in `server/.env` to the connection string Atlas gives you:

```ini
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/fakhara?retryWrites=true&w=majority
```

Then run `npm run db:seed` once. `MONGODB_URI` is only ever read by the backend.

### Inspecting and seeding

```bash
npm run db:seed    # import products + categories, create the admin, migrate legacy data
npm run db:check   # print collections, document counts, variants and indexes
```

`npm run db:seed` is safe to run repeatedly. Records are matched on their slug
or productId, so nothing is ever duplicated and edits made in the admin
dashboard are preserved.

---

## Running the project

```bash
npm run dev        # backend and frontend together
```

Or separately:

```bash
npm run mongo      # 1. start MongoDB on 27017
npm run dev:server # 2. backend  -> http://localhost:5000
npm run dev:client # 3. frontend -> http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build into dist/
npm start          # serve the API and the built frontend from Express
npm run seed:admin # create or reset the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run lint
```

---

## Collections

| Collection | Model | Notes |
| --- | --- | --- |
| `users` | `server/models/User.js` | Customers. bcrypt password, role, orders. |
| `admins` | `server/models/Admin.js` | Administrators. bcrypt password, role, permissions. |
| `categories` | `server/models/Category.js` | Name/description in ar, fr, en. References its products. |
| `products` | `server/models/Category.js` | One document per piece, colours are variants. |
| `orders` | `server/models/Order.js` | Number `FK-XXXXXX`, items with the chosen variant. |
| `reviews` | `server/models/Review.js` | One review per customer and product. |
| `contactmessages` | `server/models/ContactMessage.js` | Contact form submissions. |
| `customizationrequests` | `server/models/CustomizationRequest.js` | Custom gift requests. |
| `favorites` | `server/models/Favorite.js` | Wishlist. |

### Products and colour variants

A product is stored **once**. Its colours are variants inside the same
document, each with its own image, price and stock:

```js
{
  productId: "tagine-1",
  name: { ar: "طاجين مغربي", fr: "Tajine marocain", en: "Moroccan Tagine" },
  category: "tagines",
  categoryRef: ObjectId("..."),   // -> categories
  price: 100,
  image: "/image/tajin/tajin-brown.jpeg",
  images: [
    { key: "tajin-brown",  name: { ar: "بني", fr: "Marron", en: "Brown" },  image: "/image/tajin/tajin-brown.jpeg",  stock: 50 },
    { key: "tajin-purbel", name: { ar: "بنفسجي", fr: "Violet", en: "Purple" }, image: "/image/tajin/tajin-purbel.jpeg", stock: 50 },
    { key: "tajin-yellow", name: { ar: "أصفر", fr: "Jaune", en: "Yellow" },   image: "/image/tajin/tajin-yellow.jpeg", stock: 50 },
    { key: "tajine-blue",  name: { ar: "أزرق", fr: "Bleu", en: "Blue" },      image: "/image/tajin/tajine-blue.jpeg",  stock: 50 }
  ]
}
```

Image paths point at the files in `public/image`, so the existing React design
keeps working unchanged.

---

## API

All routes are prefixed with `/api`. Admin routes require
`Authorization: Bearer <token>`.

### Public

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Service status. |
| GET | `/api/products` | Active products. `?category=`, `?featured=`, `?q=`. |
| GET | `/api/products/:productId` | One product. |
| GET | `/api/categories` | Active categories with their products. |
| POST | `/api/orders` | Place an order. |
| GET | `/api/ratings/:productId` | Rating summary and reviews. |
| POST | `/api/ratings/:productId` | Write or update a review. |
| GET | `/api/favorites` | Wishlist of the current visitor. |
| POST | `/api/favorites/:productId` | Add to the wishlist. |
| DELETE | `/api/favorites/:productId` | Remove from the wishlist. |
| POST | `/api/contact` | Send a message. |
| POST | `/api/customizations` | Request a customized gift. |

### Customers

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/users/register` | Create an account. Returns a JWT. |
| POST | `/api/users/login` | Sign in. Returns a JWT. |
| POST | `/api/users/logout` | Clear the session cookie. |
| POST | `/api/users/forgot-password` | Send a password reset link. |
| POST | `/api/users/reset-password` | Set a new password with the reset token. |
| GET | `/api/users/me` | Current profile. |
| PATCH | `/api/users/me` | Update the profile or the password. |
| GET | `/api/users/orders` | Orders of the signed-in customer. |
| GET | `/api/users/orders/:orderId` | One order, only when it belongs to the customer. |
| GET | `/api/users/addresses` | Delivery addresses of the customer. |
| POST | `/api/users/addresses` | Add a delivery address. |
| PATCH | `/api/users/addresses/:addressId` | Update a delivery address. |
| DELETE | `/api/users/addresses/:addressId` | Delete a delivery address. |

### Admin

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/admin/login` | Sign in as an administrator. |
| GET | `/api/admin/me` | Current administrator. |
| GET | `/api/admin/stats` | Dashboard counters and revenue. |
| GET/POST/PUT/DELETE | `/api/admin/products[/:productId]` | Manage products. |
| GET/POST/PUT/DELETE | `/api/admin/categories[/:categoryId]` | Manage categories. |
| GET | `/api/admin/orders[/:orderId]` | List and read orders. |
| PATCH | `/api/admin/orders/:orderId/status` | Change the order status. |
| DELETE | `/api/admin/orders/:orderId` | Delete an order. |
| GET | `/api/admin/customers` | Customers with their orders. |
| GET | `/api/admin/contacts` | Contact messages. |
| PATCH | `/api/admin/contacts/:messageId/status` | Change the message status. |
| GET | `/api/admin/customizations` | Customization requests. |
| PATCH | `/api/admin/customizations/:requestId/status` | Change the request status. |
| POST | `/api/admin/admins` | Create another administrator (superadmin only). |

---

## Security

- Passwords are hashed with bcrypt (cost 12) and stored in `passwordHash`,
  which is never selected by default and never returned by the API.
- Admin accounts use a separate collection and a JWT that is validated on
  every admin request. `protectAdmin` also checks that the account is active.
- Every write endpoint validates and normalizes its input, and the request
  body is capped at 1 MB.
- Password reset tokens are random, stored only as SHA-256 hashes, expire
  after 30 minutes and are delivered by e-mail when `RESEND_API_KEY` and
  `MAIL_FROM` are set. In development the link is printed in the server
  console and exposed as `devResetUrl` so the flow can be tested locally.
- Customer orders are always filtered by the signed-in account; a customer
  can never read another customer's order.
- Rate limits: 1000 requests / 15 min general, 150 for writes, 20 for logins.
- `.env` files are git-ignored. Only `VITE_` variables reach the browser.

---

## Frontend API access

`src/services/apiConfig.js` is the single place where the backend URL is
resolved:

```js
const configuredBaseUrl = (import.meta.env.VITE_API_URL || "").trim();
export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");
export function buildApiUrl(path) { /* ... */ }
```

Every call goes through `buildApiUrl()` in `src/services/api.js`,
`src/services/ratingsApi.js` and `src/components/contact.jsx`, so changing
`VITE_API_URL` is enough to point the whole frontend at another backend.
#   F A K H A R A  
 