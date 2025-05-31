# Snapix - Wallpaper Website

A modern wallpaper website with user authentication and role-based access control.

## Features

- User authentication (login/register)
- Role-based access control (user/admin)
- Browse and download wallpapers
- Admin features for uploading and managing wallpapers
- Responsive design with Tailwind CSS

## Tech Stack

- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- Image Hosting: Cloudinary

## Project Structure

```
snapix/
├── frontend/          # React frontend application
├── backend/           # Express backend server
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add required environment variables (see respective READMEs)

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## License

MIT 