# QR Code Redirect App

## Deployment checklist

### Client
- Install dependencies: `cd client && npm install`
- Build the production bundle: `npm run build`
- Set `VITE_BACKEND_URL` in `.env` to your deployed backend URL

### Server
- Install dependencies: `cd server && npm install`
- Copy `.env.example` to `.env` and fill in the required values
- Start the app: `npm start`

### Notes
- The server now serves the built client in production mode.
- Make sure your hosting platform exposes the backend on the port defined by `PORT`.
- For production cookies, configure `CLIENT_ORIGIN` to the frontend URL and ensure HTTPS is enabled.
