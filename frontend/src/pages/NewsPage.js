import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import axios from 'axios';
import { Newspaper, FileText, ExternalLink, Calendar } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;


const NewsPage = () => {
  const { t } = useLanguage();
  const [news, setNews] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, policiesRes] = await Promise.all([
          axios.get(`${API}/news`),
          axios.get(`${API}/policies`)
        ]);
        setNews(newsRes.data.articles || []);
        setPolicies(policiesRes.data.policies || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingNews(false);
        setLoadingPolicies(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="news-page">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Manrope'] flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-primary" />
            {t('news')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with farming news and government policies
          </p>
        </div>

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="news" data-testid="news-tab">
              <Newspaper className="w-4 h-4 mr-2" />
              {t('latestNews')}
            </TabsTrigger>
            <TabsTrigger value="policies" data-testid="policies-tab">
              <FileText className="w-4 h-4 mr-2" />
              {t('governmentPolicies')}
            </TabsTrigger>
          </TabsList>

          {/* News Tab */}
          <TabsContent value="news">
            {loadingNews ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-80" />)}
              </div>
            ) : news.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article, index) => (
                  <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="h-48 overflow-hidden bg-muted">
                      <img 
                        src={article.image || 'https://images.unsplash.com/photo-1589292144899-2f43a71a1b2b'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        <span className="mx-1">•</span>
                        {article.source?.name}
                      </div>
                      <h3 className="font-semibold line-clamp-2 mb-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {article.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {t('readMore')}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Newspaper className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">{t('noData')}</p>
              </div>
            )}
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            {loadingPolicies ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
              </div>
            ) : policies.length > 0 ? (
              <div className="space-y-6">
                {policies.map((policy, index) => (
                  <Card key={index} className="card-dashboard">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{policy.name}</h3>
                          <p className="text-muted-foreground mb-4">{policy.description}</p>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">{t('eligibility')}</p>
                              <p className="text-sm font-medium">{policy.eligibility}</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-sm text-green-700 dark:text-green-400 mb-1">{t('benefits')}</p>
                              <p className="text-sm font-medium text-green-800 dark:text-green-300">{policy.benefits}</p>
                            </div>
                          </div>

                          <Button variant="outline" size="sm" asChild>
                            <a href={policy.link} target="_blank" rel="noopener noreferrer">
                              Visit Official Website
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">{t('noData')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewsPage;
