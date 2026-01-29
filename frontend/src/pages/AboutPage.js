import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { 
  Leaf, 
  Target, 
  Eye, 
  Users, 
  CheckCircle,
  Smartphone,
  Shield,
  Heart
} from 'lucide-react';

const AboutPage = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Target,
      title: t('ourMission'),
      description: t('missionDesc')
    },
    {
      icon: Eye,
      title: t('ourVision'),
      description: t('visionDesc')
    }
  ];

  const features = [
    { icon: Leaf, label: 'AI-Powered Disease Detection' },
    { icon: Smartphone, label: 'Mobile-Friendly Interface' },
    { icon: Shield, label: 'Secure & Private' },
    { icon: Users, label: 'Community Support' },
  ];

  const team = [
    { name: 'Dr. Rajesh Sharma', role: 'Agricultural Expert', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { name: 'Priya Patel', role: 'AI/ML Lead', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { name: 'Amit Kumar', role: 'Product Manager', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="about-page">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-['Manrope']">
              {t('aboutTitle')}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t('aboutDesc')}. We believe that technology can transform agriculture and 
              help farmers make better decisions for their crops and livelihoods.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="card-dashboard">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 font-['Manrope']">{value.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Manrope']">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="font-medium">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-['Manrope']">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Smart Farmer Portal was born from a simple observation: farmers in India 
                  face numerous challenges in identifying crop diseases early and getting 
                  timely treatment recommendations.
                </p>
                <p>
                  We assembled a team of agricultural experts, AI researchers, and 
                  technology enthusiasts to build a platform that puts the power of 
                  artificial intelligence in the hands of every farmer.
                </p>
                <p>
                  Today, we serve thousands of farmers across India, helping them protect 
                  their crops, access market information, and make informed decisions 
                  about their agricultural practices.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1696371269777-88d1ce71642c?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Farmer in field"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Manrope']">
            Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                />
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Manrope']">
            Our Values
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Farmer First', desc: 'Every feature we build starts with the question: How does this help the farmer?' },
              { title: 'Accessibility', desc: 'Our platform is designed to be easy to use, even for those new to technology' },
              { title: 'Accuracy', desc: 'We continuously improve our AI models to provide the most accurate disease detection' },
              { title: 'Privacy', desc: 'Your data is yours. We never share your information without your consent' },
            ].map((value, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-['Manrope']">
            Made with love for Indian Farmers
          </h2>
          <p className="opacity-90 max-w-xl mx-auto">
            We're committed to supporting the agricultural community and helping 
            farmers across India grow better, earn more, and live better lives.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
