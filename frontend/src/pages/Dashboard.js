import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import axios from 'axios';
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Bug,
  Calendar,
  TrendingUp,
  ArrowRight,
  Sun,
  CloudRain
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch weather based on farm location
        // const location = userProfile?.farm_location || { lat: 28.6139, lng: 77.2090 }; // Default Delhi
        // Fetch weather using firebase UID (backend gets lat/lng from Firebase)
        if (!user) return;

        const weatherRes = await axios.get(
          `${API}/weather/${user.uid}`
        );

        setWeather(weatherRes.data);

        // Fetch recent disease reports
        if (user?.uid) {
          const reportsRes = await axios.get(`${API}/disease-reports/${user.uid}`);
          setRecentReports(reportsRes.data.slice(0, 3));

          // Fetch calendar entries
          const calendarRes = await axios.get(`${API}/crop-calendar/${user.uid}`);
          setCalendarEntries(calendarRes.data.filter(e => !e.completed).slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userProfile]);

  const getWeatherIcon = (code) => {
    if (code >= 0 && code <= 3) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (code >= 45 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Cloud className="w-8 h-8 text-gray-500" />;
  };

  const quickActions = [
    {
      icon: Bug,
      label: t('scanCrop'),
      path: '/disease-detection',
      color: 'bg-red-500/10 text-red-500'
    },
    {
      icon: Calendar,
      label: t('viewCalendar'),
      path: '/crop-calendar',
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      icon: TrendingUp,
      label: t('checkPrices'),
      path: '/market-prices',
      color: 'bg-green-500/10 text-green-500'
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="dashboard">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Manrope']">
            {t('welcome')}, {userProfile?.display_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening on your farm today
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Card - Takes 2 columns */}
          <Card className="lg:col-span-2 card-dashboard" data-testid="weather-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" />
                {t('currentWeather')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                </div>
              ) : weather ? (
                <div>
                  {/* Current Weather */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(weather.current_weather?.weathercode)}
                      <div>
                        <span className="text-5xl font-bold">
                          {Math.round(weather.current_weather?.temperature)}°C
                        </span>
                        <p className="text-muted-foreground">
                          Feels like {Math.round(weather.hourly?.apparent_temperature?.[0] || weather.current_weather?.temperature)}°C
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">
                        {userProfile?.farm_location ? 'Your Farm' : 'Default Location'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>

                  {/* Weather Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Thermometer className="w-4 h-4" />
                        <span className="text-sm">High/Low</span>
                      </div>
                      <p className="font-semibold">
                        {weather.daily?.temperature_2m_max?.[0] !== undefined
                          ? Math.round(weather.daily.temperature_2m_max[0])
                          : "--"}°
                        {" / "}
                        {weather.daily?.temperature_2m_min?.[0] !== undefined
                          ? Math.round(weather.daily.temperature_2m_min[0])
                          : "--"}°
                      </p>


                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Droplets className="w-4 h-4" />
                        <span className="text-sm">{t('humidity')}</span>
                      </div>
                      <p className="font-semibold">
                        {weather.hourly?.relativehumidity_2m?.[0] !== undefined
                          ? `${weather.hourly.relativehumidity_2m[0]}%`
                          : "--"}
                      </p>

                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Wind className="w-4 h-4" />
                        <span className="text-sm">{t('wind')}</span>
                      </div>
                      <p className="font-semibold">{weather.current_weather?.windspeed} km/h</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CloudRain className="w-4 h-4" />
                        <span className="text-sm">Rain Chance</span>
                      </div>
                      <p className="font-semibold">
                        {weather.daily?.precipitation_probability_max?.[0] !== undefined
                          ? `${weather.daily.precipitation_probability_max[0]}%`
                          : "--"}
                      </p>

                    </div>
                  </div>

                  {/* 5-Day Forecast */}
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">5-Day Forecast</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {weather.daily?.time?.slice(0, 5).map((date, index) => (
                        <div key={date} className="text-center p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })}
                          </p>
                          <p className="font-semibold mt-1">
                            {Math.round(weather.daily?.temperature_2m_max?.[index])}°
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(weather.daily?.temperature_2m_min?.[index])}°
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noData')}</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="card-dashboard" data-testid="quick-actions-card">
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.path}
                  variant="ghost"
                  className="w-full justify-start h-14"
                  asChild
                  data-testid={`action-${action.path.replace('/', '')}`}
                >
                  <Link to={action.path}>
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left">{action.label}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Disease Reports */}
          <Card className="lg:col-span-2 card-dashboard" data-testid="recent-reports-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-primary" />
                {t('recentReports')}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/disease-detection">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                    >
                      <div>
                        <p className="font-medium">{report.crop_name}</p>
                        <p className="text-sm text-muted-foreground">{report.disease_name}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${report.severity === 'High' || report.severity === 'Critical'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : report.severity === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {report.severity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bug className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No disease reports yet</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link to="/disease-detection">Scan Your First Crop</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Activities */}
          <Card className="card-dashboard" data-testid="activities-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t('upcomingActivities')}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/crop-calendar">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : calendarEntries.length > 0 ? (
                <div className="space-y-3">
                  {calendarEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {new Date(entry.scheduled_date).getDate()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{entry.activity}</p>
                        <p className="text-xs text-muted-foreground">{entry.crop_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No upcoming activities</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link to="/crop-calendar">Plan Activities</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
