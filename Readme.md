# Reviews App

## Requirements

- Node.js v20+
- pnpm v9+

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Build shared types

```bash
pnpm --filter @reviews/types build
```

### 3. Set up environment variables

Create `apps/backend/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173
```

Create `apps/frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### 4. Run database migrations

```bash
pnpm --filter backend migrate
```

### 5. Seed admin user

```bash
pnpm --filter backend seed
```

Default credentials: `admin@reviewsapp.com` / `changeme123`

### 6. Build the widget

```bash
pnpm --filter widget build
```

## Running

Open three terminals:

```bash
# Terminal 1
pnpm dev:backend

# Terminal 2
pnpm dev:frontend

# Terminal 3 (only if editing widget source)
pnpm dev:widget
```

Admin dashboard → `http://localhost:5173`