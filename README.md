# QuickMeet

QuickMeet is a browser-based video meeting application with account authentication, meeting history, WebRTC audio/video, screen sharing, room chat, and Socket.IO signaling.

## Stack

- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS, Socket.IO Client
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Socket.IO

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB running locally, or a MongoDB Atlas connection string
- A modern browser with camera and microphone access

## Backend Setup

```powershell
cd backend
npm install
cp .env.example .env
```

Update `backend/.env`:

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/quickmeet
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

For multiple frontend origins, separate values with commas. Never commit the real `.env` file.

Start the API:

```powershell
npm run dev
```

The API and Socket.IO server run at `http://localhost:8000`.

## Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
cp .env.example .env
npm run dev
```

The Vite app runs at `http://localhost:5173`. Set `VITE_API_URL` in `frontend/.env` when the backend uses another URL.

## API

All responses use:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {}
}
```

Protected endpoints require:

```text
Authorization: Bearer <JWT>
```

| Method | Route | Authentication | Body |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | No | - |
| POST | `/api/v1/users/register` | No | `{ "name", "username", "password" }` |
| POST | `/api/v1/users/login` | No | `{ "username", "password" }` |
| GET | `/api/v1/users/me` | Bearer JWT | - |
| POST | `/api/v1/users/add_to_activity` | Bearer JWT | `{ "meetingCode" }` |
| GET | `/api/v1/users/get_all_activity` | Bearer JWT | - |

For Postman or Thunder Client, register a user, log in, copy `data.token`, and use the Bearer Token authorization type for protected requests.

## Scripts

Backend:

```powershell
npm run dev
npm start
npm test
npm run check
```

Frontend:

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## Production Notes

- Use HTTPS for deployed WebRTC camera and microphone access.
- Set `CORS_ORIGIN` to the deployed frontend URL.
- Set `VITE_API_URL` before running `npm run build`.
- Use a strong, unique `JWT_SECRET`.
- A STUN server is configured for peer discovery. Reliable calls across restrictive networks require a TURN server.
