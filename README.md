# LokSetu — लोक सेतु

**Bridge to the People · India**

LokSetu is a civic issue reporting platform built for Indian citizens. It enables residents to report local infrastructure problems — potholes, broken streetlights, waterlogging, garbage — and track their resolution in real time through a transparent, government-facing dashboard.

---

## Features

- **Civic Issue Reporting** — Submit reports with title, description, issue type, and photo evidence
- **Live Issue Map** — Leaflet-powered map showing geo-tagged reports by status
- **Community Feed** — Browse, filter, and upvote reports submitted by other citizens
- **Geospatial Duplicate Detection** — Prevents duplicate reports within 150 metres of an existing issue
- **Trust Score System** — Reward mechanism that scores citizen reporting reliability
- **Authentication** — Google Sign-In and Email/Password via Firebase Auth
- **My Reports** — Personal dashboard for tracking submitted issues
- **Responsive Design** — Fully adapted for mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Auth | Firebase Authentication |
| Maps | Leaflet + React Leaflet |
| Icons | Lucide React |
| Fonts | Sora (Google Fonts) |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Dhairyaworks18/LOKSETU.git
cd LOKSETU
```

### 2. Install Dependencies for Frontend

```bash
cd frontend
npm install
```

### 3. Configure Firebase

1. Go to [firebase.google.com](https://firebase.google.com) and create a project named `loksetu`
2. Enable **Firestore Database** in `asia-south1` (Mumbai) region
3. Enable **Firebase Storage**
4. Enable **Firebase Authentication** with Google and Email/Password providers
5. Navigate to **Project Settings → Your Apps → Web App** and copy the config

### 4. Set Up Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Run the Development Server

```bash
# Ensure you are in the frontend directory
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
LOKSETU/
│
├── frontend/                     # Next.js Application
│   ├── app/                      
│   │   ├── components/           
│   │   ├── login/                
│   │   ├── globals.css           
│   │   ├── layout.js             
│   │   └── page.js               
│   ├── lib/                      # Firebase service layer
│   │   ├── firebase.js           
│   │   ├── authHelpers.js        
│   │   └── firebaseHelpers.js    
│   ├── tailwind.config.js        
│   ├── next.config.mjs           
│   └── package.json              
│
├── backend/                      # Firebase Configuration
│   ├── firebase/                 
│   │   ├── firestore.rules       
│   │   └── storage.rules         
│   └── firebase.json             
│
└── README.md
```

---

## Deployment

This project is optimised for deployment on [Vercel](https://vercel.com).

1. Push the repository to GitHub
2. Import the project in the Vercel dashboard
3. Set the **Root Directory** to `frontend`
4. Add all six `NEXT_PUBLIC_FIREBASE_*` environment variables under **Settings → Environment Variables**
5. Deploy

---

## Firestore Security Rules

The project includes production-ready Firestore and Storage rules located in `backend/firebase/firestore.rules` and `backend/firebase/storage.rules`. Review and tighten these rules before going live in production.

---

## Contributing

This project is currently maintained by [Dhairya](https://github.com/Dhairyaworks18). Issues and pull requests are welcome.

---

## License

This project is open source. See the repository for details.
