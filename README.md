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

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Go to [firebase.google.com](https://firebase.google.com) and create a project named `loksetu`
2. Enable **Firestore Database** in `asia-south1` (Mumbai) region
3. Enable **Firebase Storage**
4. Enable **Firebase Authentication** with Google and Email/Password providers
5. Navigate to **Project Settings → Your Apps → Web App** and copy the config

### 4. Set Up Environment Variables

Create a `.env.local` file in the project root:

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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
LOKSETU/
│
├── app/                          # Frontend — Next.js application
│   ├── components/
│   │   ├── IssueMap.js           # Leaflet map component
│   │   └── Toast.js              # Notification toast system
│   ├── login/
│   │   └── page.js               # Authentication page
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout and metadata
│   └── page.js                   # Main dashboard page
│
├── lib/                          # Service layer — Firebase integrations
│   ├── firebase.js               # Firebase app initialisation
│   ├── authHelpers.js            # Authentication utilities
│   └── firebaseHelpers.js        # Firestore CRUD operations
│
├── firebase/                     # Backend — Firebase configuration
│   ├── firestore.rules           # Firestore security rules
│   └── storage.rules             # Firebase Storage security rules
│
├── firebase.json                 # Firebase CLI configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── next.config.mjs               # Next.js configuration
```

---

## Deployment

This project is optimised for deployment on [Vercel](https://vercel.com).

1. Push the repository to GitHub
2. Import the project in the Vercel dashboard
3. Add all six `NEXT_PUBLIC_FIREBASE_*` environment variables under **Settings → Environment Variables**
4. Deploy

---

## Firestore Security Rules

The project includes production-ready Firestore and Storage rules located in `firestore.rules` and `storage.rules`. Review and tighten these rules before going live in production.

---

## Contributing

This project is currently maintained by [Dhairya](https://github.com/Dhairyaworks18). Issues and pull requests are welcome.

---

## License

This project is open source. See the repository for details.
