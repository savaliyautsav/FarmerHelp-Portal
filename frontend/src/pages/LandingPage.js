import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Leaf, 
  Bug, 
  Cloud, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Smartphone
} from 'lucide-react';

const LandingPage = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Bug,
      title: t('aiDiseaseDetection'),
      description: t('aiDiseaseDesc'),
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    {
      icon: Cloud,
      title: t('weatherForecast'),
      description: t('weatherDesc'),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: TrendingUp,
      title: t('marketPricesFeature'),
      description: t('marketDesc'),
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Calendar,
      title: t('cropCalendarFeature'),
      description: t('cropCalendarDesc'),
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Farmers' },
    { value: '50,000+', label: 'Scans' },
    { value: '95%', label: 'Accuracy' },
    { value: '24/7', label: 'Support' }
  ];

  const benefits = [
    'AI-powered disease detection in seconds',
    'Personalized weather forecasts for your farm',
    'Real-time market prices from across India',
    'Crop calendar with smart reminders',
    'Government scheme information',
    'Expert farming resources'
  ];

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1589292144899-2f43a71a1b2b?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Farmer in field"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Smart Farming Portal</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-['Manrope']">
              {t('heroTitle')}
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full text-lg px-8" asChild data-testid="get-started-btn">
                <Link to="/register">
                  {t('getStarted')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8" asChild>
                <Link to="/about">{t('learnMore')}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary font-['Manrope']">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4" data-testid="features-section">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Manrope']">{t('features')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to make informed farming decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 font-['Manrope']">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-['Manrope']">
                Why Choose Smart Farmer?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our platform combines cutting-edge AI technology with practical farming knowledge to help you grow better crops and earn more.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1677126577258-1a82fdf1a976?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Agricultural technology"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-4 border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Mobile Friendly</div>
                    <div className="text-sm text-muted-foreground">Use anywhere, anytime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-border/50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Manrope']">Farmer Community</h3>
                <p className="text-muted-foreground">Join thousands of farmers already using Smart Farmer to improve their yields</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-border/50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Manrope']">Government Verified</h3>
                <p className="text-muted-foreground">Access authentic government schemes and subsidies information</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-border/50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Bug className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Manrope']">AI Powered</h3>
                <p className="text-muted-foreground">Advanced AI technology for accurate disease detection and recommendations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-['Manrope']">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join Smart Farmer today and get access to AI-powered tools, market insights, and expert resources.
          </p>
          <Button size="lg" variant="secondary" className="rounded-full text-lg px-8" asChild>
            <Link to="/register">
              {t('getStarted')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
