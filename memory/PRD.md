# Smart Farmer Portal - Product Requirements Document

## Original Problem Statement
Build a full-stack Smart Farmer Web Portal with separate User and Admin dashboards using a modern, responsive, farmer-friendly green UI with support for dark and light modes. Features include Firebase Authentication, Google Maps farm location selection, Live Weather Forecasts, Crop Calendar, AI-based Crop Disease Detection, Farming resources, Market prices, News & Policies, and Admin Dashboard.

## User Personas
1. **Farmers** - Primary users who need disease detection, weather info, market prices
2. **Farm Owners** - Need comprehensive dashboard and crop calendar management
3. **Agricultural Administrators** - Need admin panel for user and report management

## Core Requirements
- Firebase Authentication (Email/Password + Google Sign-in)
- Google Maps integration for farm location selection
- Azure OpenAI GPT-4o for crop disease detection
- Multi-language support (English, Hindi, Gujarati)
- Dark/Light theme modes
- Responsive design for mobile field use

## Technology Stack
- **Frontend**: React 19, TailwindCSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Firebase Auth
- **AI**: Azure OpenAI GPT-4o
- **Maps**: Google Maps API
- **Weather**: Open-Meteo API

## What's Been Implemented (January 2025)

### Backend APIs
- `/api/health` - System health check
- `/api/users` - User management CRUD
- `/api/detect-disease` - AI crop disease detection with image upload
- `/api/disease-reports` - Disease report storage and retrieval
- `/api/crop-calendar` - Calendar entry management
- `/api/weather` - Weather forecast proxy
- `/api/news` - Farming news (with fallback data)
- `/api/market-prices` - Mandi prices (with fallback data)
- `/api/policies` - Government policy information
- `/api/contact` - Contact form submissions
- `/api/resources/*` - Farming tools, fertilizers, medicines
- `/api/admin/stats` - Admin statistics

### Frontend Pages
- Landing Page with hero, features, stats, CTA sections
- Login/Register with Firebase Auth
- User Dashboard with weather, quick actions, recent reports
- Disease Detection with image upload and AI analysis
- Crop Calendar with activity scheduling
- Resources Page (Tools, Fertilizers, Medicines tabs)
- Market Prices with searchable table
- News & Government Policies tabs
- About Us with mission, vision, team
- Contact Us with form and FAQ
- Admin Dashboard with user management, reports, API health

### Features
- Complete multi-language system (EN/HI/GU) for entire portal
- Dark/Light theme toggle with persistence
- Role-based access control (admin/user)
- Protected routes with authentication
- Responsive design with mobile optimization

## Prioritized Backlog

### P0 - Critical (Completed)
- [x] Firebase Authentication
- [x] AI Disease Detection
- [x] Weather Forecast
- [x] Multi-language support
- [x] Theme switching

### P1 - High Priority (Next Phase)
- [ ] Push notifications for crop calendar reminders
- [ ] Offline mode for disease reports
- [ ] Image gallery for scan history
- [ ] Export reports to PDF

### P2 - Medium Priority
- [ ] Community forum for farmers
- [ ] Expert consultation booking
- [ ] Crop yield prediction
- [ ] Soil health analysis integration

### P3 - Future Enhancements
- [ ] Voice input for non-literate users
- [ ] WhatsApp bot integration
- [ ] Regional weather alerts
- [ ] Marketplace for farmers

## Next Action Items
1. Enable Google Maps billing for production use
2. Add push notification service for calendar reminders
3. Implement report export functionality
4. Add more Indian languages (Tamil, Telugu, Marathi)
5. Set up proper admin user via Firebase console
