import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import axios from 'axios';
import { 
  Wrench, 
  Droplets, 
  Pill, 
  Cpu,
  Package
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ResourcesPage = () => {
  const { t } = useLanguage();
  const [tools, setTools] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [toolsRes, fertRes, medRes] = await Promise.all([
          axios.get(`${API}/resources/tools`),
          axios.get(`${API}/resources/fertilizers`),
          axios.get(`${API}/resources/medicines`)
        ]);
        setTools(toolsRes.data.tools);
        setFertilizers(fertRes.data.fertilizers);
        setMedicines(medRes.data.medicines);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="resources-page">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Manrope'] flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            {t('resources')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Essential farming tools, fertilizers, and medicines
          </p>
        </div>

        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="tools" data-testid="tools-tab">
              <Wrench className="w-4 h-4 mr-2" />
              {t('farmingTools')}
            </TabsTrigger>
            <TabsTrigger value="fertilizers" data-testid="fertilizers-tab">
              <Droplets className="w-4 h-4 mr-2" />
              {t('fertilizers')}
            </TabsTrigger>
            <TabsTrigger value="medicines" data-testid="medicines-tab">
              <Pill className="w-4 h-4 mr-2" />
              {t('medicines')}
            </TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => (
                  <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="h-48 overflow-hidden bg-muted">
                      <img 
                        src={tool.image} 
                        alt={tool.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{tool.name}</h3>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Fertilizers Tab */}
          <TabsContent value="fertilizers">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {fertilizers.map((fert, index) => (
                  <Card key={index} className="card-dashboard">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <Droplets className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{fert.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{fert.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Usage</p>
                              <p className="font-medium">{fert.usage}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Dosage</p>
                              <p className="font-medium">{fert.dosage}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Medicines Tab */}
          <TabsContent value="medicines">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {medicines.map((med, index) => (
                  <Card key={index} className="card-dashboard">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{med.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{med.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Target</p>
                              <p className="font-medium">{med.target}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Usage</p>
                              <p className="font-medium">{med.usage}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResourcesPage;
