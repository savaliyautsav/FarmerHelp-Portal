import React, { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Leaf, Mail, Lock, Eye, EyeOff, User, MapPin } from 'lucide-react';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px'
};
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center

const RegisterPage = () => {
  const { register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [farmLocation, setFarmLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  
  const mapRef = useRef();
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(pos);
          map.panTo(pos);
        },
        () => {
          console.log('Geolocation not available');
        }
      );
    }
  }, []);

  const onMapClick = useCallback((e) => {
    const location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setFarmLocation(location);
    toast.success('Farm location selected!');
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('error'), { description: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('error'), { description: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    
    try {
      await register(formData.email, formData.password, formData.displayName, farmLocation);
      toast.success(t('success'), { description: 'Account created successfully' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('error'), { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success(t('success'), { description: 'Signed in with Google' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Google registration error:', error);
      toast.error(t('error'), { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12" data-testid="register-page">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-['Manrope']">{t('register')}</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Rajesh Kumar"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  data-testid="name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    data-testid="password-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    data-testid="confirm-password-input"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="rounded"
              />
              <Label htmlFor="showPassword" className="text-sm text-muted-foreground cursor-pointer">
                Show password
              </Label>
            </div>

            {/* Map Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('selectFarmLocation')}
              </Label>
              <p className="text-sm text-muted-foreground">Click on the map to select your farm location</p>
              
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={5}
                  center={mapCenter}
                  onClick={onMapClick}
                  onLoad={onMapLoad}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  {farmLocation && (
                    <Marker
                      position={farmLocation}
                      icon={{
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#1A4D2E">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                        `),
                        scaledSize: { width: 40, height: 40 }
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="w-full h-[300px] bg-muted rounded-xl flex items-center justify-center">
                  <span className="text-muted-foreground">{t('loading')}</span>
                </div>
              )}
              
              {farmLocation && (
                <p className="text-sm text-primary">
                  Selected: {farmLocation.lat.toFixed(4)}, {farmLocation.lng.toFixed(4)}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={loading} data-testid="register-submit">
              {loading ? t('loading') : t('register')}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            onClick={handleGoogleRegister}
            disabled={loading}
            data-testid="google-register"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('signInWithGoogle')}
          </Button>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
