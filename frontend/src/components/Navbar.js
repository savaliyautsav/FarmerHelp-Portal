import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { 
  Menu, 
  Sun, 
  Moon, 
  Globe, 
  User, 
  LogOut, 
  LayoutDashboard,
  Leaf,
  Bug,
  Calendar,
  Package,
  TrendingUp,
  Newspaper,
  Info,
  Mail,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: t('home'), icon: Leaf },
    ...(user ? [
      { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { path: '/disease-detection', label: t('diseaseDetection'), icon: Bug },
      { path: '/crop-calendar', label: t('cropCalendar'), icon: Calendar },
    ] : []),
    { path: '/resources', label: t('resources'), icon: Package },
    { path: '/market-prices', label: t('marketPrices'), icon: TrendingUp },
    { path: '/news', label: t('news'), icon: Newspaper },
    { path: '/about', label: t('about'), icon: Info },
    { path: '/contact', label: t('contact'), icon: Mail },
    ...(isAdmin ? [{ path: '/admin', label: t('admin'), icon: Shield }] : []),
  ];

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'gu', label: 'ગુજરાતી' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="navbar">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl hidden sm:block font-['Manrope']">Smart Farmer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 6).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                }`}
                data-testid={`nav-${link.path.replace('/', '') || 'home'}`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* More dropdown for additional links */}
            {navLinks.length > 6 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm">
                    {t('more')} ▾
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navLinks.slice(6).map((link) => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link to={link.path} className="flex items-center gap-2">
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="language-selector">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languageOptions.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={language === lang.code ? 'bg-primary/10' : ''}
                    data-testid={`lang-${lang.code}`}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu / Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium border-b">
                    {userProfile?.display_name || user.email}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {t('admin')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild data-testid="login-btn">
                  <Link to="/login">{t('login')}</Link>
                </Button>
                <Button size="sm" className="rounded-full" asChild data-testid="register-btn">
                  <Link to="/register">{t('register')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" data-testid="mobile-menu-btn">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72" aria-describedby="mobile-menu-description">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription id="mobile-menu-description" className="sr-only">
                  Mobile navigation menu with links to all pages
                </SheetDescription>
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(link.path)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/70 hover:bg-muted'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}
                  
                  {!user && (
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                      <Button asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/login">{t('login')}</Link>
                      </Button>
                      <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/register">{t('register')}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
