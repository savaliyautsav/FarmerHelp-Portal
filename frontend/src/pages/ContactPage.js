import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  MessageSquare
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContactPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success(t('success'), { description: 'Message sent successfully!' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('error'), { description: 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      content: 'Agricultural Hub, Sector 22\nNew Delhi, India - 110001'
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+91 1800-XXX-XXXX (Toll Free)\n+91 11-XXXX-XXXX'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'support@smartfarmer.in\ninfo@smartfarmer.in'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: 'Monday - Saturday\n9:00 AM - 6:00 PM IST'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="contact-page">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-['Manrope']">{t('contact')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help. Reach out to us 
            and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="card-dashboard">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {info.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 card-dashboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {t('sendMessage')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('yourName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Rajesh Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      data-testid="contact-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('yourEmail')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="farmer@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      data-testid="contact-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t('subject')}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    data-testid="contact-subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('message')}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Write your message here..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    data-testid="contact-message"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full md:w-auto rounded-full px-8" 
                  disabled={loading}
                  data-testid="contact-submit"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t('submit')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 font-['Manrope']">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'How accurate is the disease detection?',
                a: 'Our AI model has been trained on thousands of crop images and achieves over 95% accuracy for common diseases. We continuously improve our models with new data.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes, we take data security seriously. All your information is encrypted and we never share your data with third parties without your consent.'
              },
              {
                q: 'Can I use the app offline?',
                a: 'The disease detection feature requires an internet connection for AI analysis. However, you can view your saved reports and calendar offline.'
              },
              {
                q: 'Is the service free?',
                a: 'Basic features including disease detection, weather forecasts, and market prices are free. We may introduce premium features in the future.'
              }
            ].map((faq, index) => (
              <Card key={index} className="card-dashboard">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
