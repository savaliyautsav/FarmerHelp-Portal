import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    diseaseDetection: "Disease Detection",
    cropCalendar: "Crop Calendar",
    resources: "Resources",
    marketPrices: "Market Prices",
    news: "News & Policies",
    about: "About Us",
    contact: "Contact Us",
    login: "Login",
    register: "Register",
    logout: "Logout",
    admin: "Admin Panel",
    
    // Hero Section
    heroTitle: "Smart Farming for a Better Tomorrow",
    heroSubtitle: "AI-powered crop disease detection, weather forecasts, and market prices at your fingertips",
    getStarted: "Get Started",
    learnMore: "Learn More",
    
    // Features
    features: "Features",
    aiDiseaseDetection: "AI Disease Detection",
    aiDiseaseDesc: "Upload crop images and get instant disease diagnosis with treatment recommendations",
    weatherForecast: "Weather Forecast",
    weatherDesc: "Live weather updates based on your farm location",
    marketPricesFeature: "Market Prices",
    marketDesc: "Real-time mandi prices for your crops",
    cropCalendarFeature: "Crop Calendar",
    cropCalendarDesc: "Plan and track your farming activities",
    
    // Dashboard
    welcome: "Welcome",
    currentWeather: "Current Weather",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    recentReports: "Recent Disease Reports",
    upcomingActivities: "Upcoming Activities",
    quickActions: "Quick Actions",
    scanCrop: "Scan Crop",
    viewCalendar: "View Calendar",
    checkPrices: "Check Prices",
    
    // Disease Detection
    uploadImage: "Upload Crop Image",
    dragDrop: "Drag and drop or click to upload",
    analyzing: "Analyzing...",
    cropName: "Crop Name",
    diseaseName: "Disease",
    cause: "Cause",
    symptoms: "Symptoms",
    treatment: "Treatment",
    fertilizer: "Recommended Fertilizer",
    medicine: "Recommended Medicine",
    severity: "Severity",
    scanHistory: "Scan History",
    
    // Calendar
    addActivity: "Add Activity",
    activityName: "Activity",
    selectDate: "Select Date",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    markComplete: "Mark Complete",
    delete: "Delete",
    
    // Resources
    farmingTools: "Farming Tools",
    fertilizers: "Fertilizers",
    medicines: "Medicines",
    technologies: "Technologies",
    
    // Market
    commodity: "Commodity",
    market: "Market",
    state: "State",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    modalPrice: "Modal Price",
    
    // News
    latestNews: "Latest Farming News",
    governmentPolicies: "Government Policies",
    readMore: "Read More",
    eligibility: "Eligibility",
    benefits: "Benefits",
    
    // Contact
    sendMessage: "Send Message",
    yourName: "Your Name",
    yourEmail: "Your Email",
    subject: "Subject",
    message: "Message",
    submit: "Submit",
    
    // About
    aboutTitle: "About Smart Farmer Portal",
    aboutDesc: "We are dedicated to empowering farmers with technology",
    ourMission: "Our Mission",
    missionDesc: "To provide accessible, AI-powered agricultural solutions to farmers across India",
    ourVision: "Our Vision",
    visionDesc: "A future where every farmer has access to smart farming technologies",
    
    // Admin
    userManagement: "User Management",
    reports: "Reports",
    apiHealth: "API Health",
    totalUsers: "Total Users",
    totalReports: "Total Reports",
    totalMessages: "Total Messages",
    
    // Auth
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signInWithGoogle: "Sign in with Google",
    selectFarmLocation: "Select Farm Location",
    
    // Footer
    copyright: "© 2024 Smart Farmer Portal. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    noData: "No data available",
    search: "Search",
    filter: "Filter",
    all: "All",
    
    // Language
    language: "Language",
    english: "English",
    hindi: "हिंदी",
    gujarati: "ગુજરાતી"
  },
  hi: {
    // Navigation
    home: "होम",
    dashboard: "डैशबोर्ड",
    diseaseDetection: "रोग पहचान",
    cropCalendar: "फसल कैलेंडर",
    resources: "संसाधन",
    marketPrices: "मंडी भाव",
    news: "समाचार और नीतियां",
    about: "हमारे बारे में",
    contact: "संपर्क करें",
    login: "लॉगिन",
    register: "रजिस्टर",
    logout: "लॉगआउट",
    admin: "एडमिन पैनल",
    
    // Hero Section
    heroTitle: "बेहतर कल के लिए स्मार्ट खेती",
    heroSubtitle: "AI-संचालित फसल रोग पहचान, मौसम पूर्वानुमान और मंडी भाव आपकी उंगलियों पर",
    getStarted: "शुरू करें",
    learnMore: "और जानें",
    
    // Features
    features: "विशेषताएं",
    aiDiseaseDetection: "AI रोग पहचान",
    aiDiseaseDesc: "फसल की तस्वीर अपलोड करें और तुरंत रोग निदान प्राप्त करें",
    weatherForecast: "मौसम पूर्वानुमान",
    weatherDesc: "आपके खेत के स्थान के आधार पर लाइव मौसम अपडेट",
    marketPricesFeature: "मंडी भाव",
    marketDesc: "आपकी फसलों के लिए रीयल-टाइम मंडी भाव",
    cropCalendarFeature: "फसल कैलेंडर",
    cropCalendarDesc: "अपनी खेती गतिविधियों की योजना बनाएं और ट्रैक करें",
    
    // Dashboard
    welcome: "स्वागत है",
    currentWeather: "वर्तमान मौसम",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    wind: "हवा",
    recentReports: "हाल की रोग रिपोर्ट",
    upcomingActivities: "आगामी गतिविधियां",
    quickActions: "त्वरित कार्य",
    scanCrop: "फसल स्कैन करें",
    viewCalendar: "कैलेंडर देखें",
    checkPrices: "भाव देखें",
    
    // Disease Detection
    uploadImage: "फसल की तस्वीर अपलोड करें",
    dragDrop: "खींचें और छोड़ें या अपलोड करने के लिए क्लिक करें",
    analyzing: "विश्लेषण हो रहा है...",
    cropName: "फसल का नाम",
    diseaseName: "रोग",
    cause: "कारण",
    symptoms: "लक्षण",
    treatment: "उपचार",
    fertilizer: "अनुशंसित उर्वरक",
    medicine: "अनुशंसित दवा",
    severity: "गंभीरता",
    scanHistory: "स्कैन इतिहास",
    
    // Calendar
    addActivity: "गतिविधि जोड़ें",
    activityName: "गतिविधि",
    selectDate: "तारीख चुनें",
    notes: "नोट्स",
    save: "सेव करें",
    cancel: "रद्द करें",
    markComplete: "पूर्ण चिह्नित करें",
    delete: "हटाएं",
    
    // Resources
    farmingTools: "खेती के उपकरण",
    fertilizers: "उर्वरक",
    medicines: "दवाइयां",
    technologies: "तकनीक",
    
    // Market
    commodity: "वस्तु",
    market: "मंडी",
    state: "राज्य",
    minPrice: "न्यूनतम मूल्य",
    maxPrice: "अधिकतम मूल्य",
    modalPrice: "औसत मूल्य",
    
    // News
    latestNews: "ताज़ा कृषि समाचार",
    governmentPolicies: "सरकारी योजनाएं",
    readMore: "और पढ़ें",
    eligibility: "पात्रता",
    benefits: "लाभ",
    
    // Contact
    sendMessage: "संदेश भेजें",
    yourName: "आपका नाम",
    yourEmail: "आपका ईमेल",
    subject: "विषय",
    message: "संदेश",
    submit: "जमा करें",
    
    // About
    aboutTitle: "स्मार्ट फार्मर पोर्टल के बारे में",
    aboutDesc: "हम किसानों को तकनीक से सशक्त बनाने के लिए समर्पित हैं",
    ourMission: "हमारा मिशन",
    missionDesc: "भारत भर के किसानों को सुलभ, AI-संचालित कृषि समाधान प्रदान करना",
    ourVision: "हमारी दृष्टि",
    visionDesc: "एक भविष्य जहां हर किसान को स्मार्ट खेती तकनीक उपलब्ध हो",
    
    // Admin
    userManagement: "उपयोगकर्ता प्रबंधन",
    reports: "रिपोर्ट्स",
    apiHealth: "API स्वास्थ्य",
    totalUsers: "कुल उपयोगकर्ता",
    totalReports: "कुल रिपोर्ट्स",
    totalMessages: "कुल संदेश",
    
    // Auth
    email: "ईमेल",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    forgotPassword: "पासवर्ड भूल गए?",
    noAccount: "खाता नहीं है?",
    haveAccount: "पहले से खाता है?",
    signInWithGoogle: "Google से साइन इन करें",
    selectFarmLocation: "खेत का स्थान चुनें",
    
    // Footer
    copyright: "© 2024 स्मार्ट फार्मर पोर्टल। सर्वाधिकार सुरक्षित।",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
    
    // Common
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफल",
    noData: "कोई डेटा उपलब्ध नहीं",
    search: "खोजें",
    filter: "फ़िल्टर",
    all: "सभी",
    
    // Language
    language: "भाषा",
    english: "English",
    hindi: "हिंदी",
    gujarati: "ગુજરાતી"
  },
  gu: {
    // Navigation
    home: "હોમ",
    dashboard: "ડેશબોર્ડ",
    diseaseDetection: "રોગ શોધ",
    cropCalendar: "પાક કેલેન્ડર",
    resources: "સંસાધનો",
    marketPrices: "માર્કેટ ભાવ",
    news: "સમાચાર અને નીતિઓ",
    about: "અમારા વિશે",
    contact: "સંપર્ક કરો",
    login: "લોગિન",
    register: "નોંધણી",
    logout: "લોગઆઉટ",
    admin: "એડમિન પેનલ",
    
    // Hero Section
    heroTitle: "વધુ સારી આવતીકાલ માટે સ્માર્ટ ખેતી",
    heroSubtitle: "AI-સંચાલિત પાક રોગ શોધ, હવામાન આગાહી અને માર્કેટ ભાવ તમારી આંગળીના ટેરવે",
    getStarted: "શરૂ કરો",
    learnMore: "વધુ જાણો",
    
    // Features
    features: "વિશેષતાઓ",
    aiDiseaseDetection: "AI રોગ શોધ",
    aiDiseaseDesc: "પાકની છબી અપલોડ કરો અને તાત્કાલિક રોગ નિદાન મેળવો",
    weatherForecast: "હવામાન આગાહી",
    weatherDesc: "તમારા ખેતરના સ્થાન પર આધારિત લાઇવ હવામાન અપડેટ્સ",
    marketPricesFeature: "માર્કેટ ભાવ",
    marketDesc: "તમારા પાક માટે રીયલ-ટાઇમ માર્કેટ ભાવ",
    cropCalendarFeature: "પાક કેલેન્ડર",
    cropCalendarDesc: "તમારી ખેતીની પ્રવૃત્તિઓનું આયોજન અને ટ્રેક કરો",
    
    // Dashboard
    welcome: "સ્વાગત છે",
    currentWeather: "વર્તમાન હવામાન",
    temperature: "તાપમાન",
    humidity: "ભેજ",
    wind: "પવન",
    recentReports: "તાજેતરના રોગ અહેવાલો",
    upcomingActivities: "આગામી પ્રવૃત્તિઓ",
    quickActions: "ઝડપી ક્રિયાઓ",
    scanCrop: "પાક સ્કેન કરો",
    viewCalendar: "કેલેન્ડર જુઓ",
    checkPrices: "ભાવ તપાસો",
    
    // Disease Detection
    uploadImage: "પાકની છબી અપલોડ કરો",
    dragDrop: "ખેંચો અને મૂકો અથવા અપલોડ કરવા ક્લિક કરો",
    analyzing: "વિશ્લેષણ થઈ રહ્યું છે...",
    cropName: "પાકનું નામ",
    diseaseName: "રોગ",
    cause: "કારણ",
    symptoms: "લક્ષણો",
    treatment: "સારવાર",
    fertilizer: "ભલામણ કરેલ ખાતર",
    medicine: "ભલામણ કરેલ દવા",
    severity: "ગંભીરતા",
    scanHistory: "સ્કેન ઇતિહાસ",
    
    // Calendar
    addActivity: "પ્રવૃત્તિ ઉમેરો",
    activityName: "પ્રવૃત્તિ",
    selectDate: "તારીખ પસંદ કરો",
    notes: "નોંધો",
    save: "સેવ કરો",
    cancel: "રદ કરો",
    markComplete: "પૂર્ણ તરીકે ચિહ્નિત કરો",
    delete: "કાઢી નાખો",
    
    // Resources
    farmingTools: "ખેતીના સાધનો",
    fertilizers: "ખાતર",
    medicines: "દવાઓ",
    technologies: "ટેકનોલોજી",
    
    // Market
    commodity: "ચીજવસ્તુ",
    market: "માર્કેટ",
    state: "રાજ્ય",
    minPrice: "ન્યૂનતમ ભાવ",
    maxPrice: "મહત્તમ ભાવ",
    modalPrice: "સરેરાશ ભાવ",
    
    // News
    latestNews: "તાજા ખેતી સમાચાર",
    governmentPolicies: "સરકારી યોજનાઓ",
    readMore: "વધુ વાંચો",
    eligibility: "પાત્રતા",
    benefits: "લાભો",
    
    // Contact
    sendMessage: "સંદેશ મોકલો",
    yourName: "તમારું નામ",
    yourEmail: "તમારો ઈમેલ",
    subject: "વિષય",
    message: "સંદેશ",
    submit: "સબમિટ કરો",
    
    // About
    aboutTitle: "સ્માર્ટ ફાર્મર પોર્ટલ વિશે",
    aboutDesc: "અમે ખેડૂતોને ટેકનોલોજીથી સશક્ત બનાવવા માટે સમર્પિત છીએ",
    ourMission: "અમારું મિશન",
    missionDesc: "ભારતભરના ખેડૂતોને સુલભ, AI-સંચાલિત કૃષિ ઉકેલો પ્રદાન કરવું",
    ourVision: "અમારી દ્રષ્ટિ",
    visionDesc: "એક ભવિષ્ય જ્યાં દરેક ખેડૂતને સ્માર્ટ ખેતી ટેકનોલોજી ઉપલબ્ધ હોય",
    
    // Admin
    userManagement: "વપરાશકર્તા વ્યવસ્થાપન",
    reports: "અહેવાલો",
    apiHealth: "API આરોગ્ય",
    totalUsers: "કુલ વપરાશકર્તાઓ",
    totalReports: "કુલ અહેવાલો",
    totalMessages: "કુલ સંદેશાઓ",
    
    // Auth
    email: "ઈમેલ",
    password: "પાસવર્ડ",
    confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
    forgotPassword: "પાસવર્ડ ભૂલી ગયા?",
    noAccount: "એકાઉન્ટ નથી?",
    haveAccount: "પહેલેથી એકાઉન્ટ છે?",
    signInWithGoogle: "Google સાથે સાઇન ઇન કરો",
    selectFarmLocation: "ખેતરનું સ્થાન પસંદ કરો",
    
    // Footer
    copyright: "© 2024 સ્માર્ટ ફાર્મર પોર્ટલ. બધા હકો અમારી પાસે રાખેલા છે.",
    privacyPolicy: "ગોપનીયતા નીતિ",
    termsOfService: "સેવાની શરતો",
    
    // Common
    loading: "લોડ થઈ રહ્યું છે...",
    error: "ભૂલ",
    success: "સફળ",
    noData: "કોઈ ડેટા ઉપલબ્ધ નથી",
    search: "શોધો",
    filter: "ફિલ્ટર",
    all: "બધા",
    
    // Language
    language: "ભાષા",
    english: "English",
    hindi: "हिंदी",
    gujarati: "ગુજરાતી"
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const changeLanguage = (lang) => {
    if (['en', 'hi', 'gu'].includes(lang)) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
