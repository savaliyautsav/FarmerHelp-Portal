import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Upload, 
  Bug, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  Pill,
  Droplets,
  History,
  FileImage,
  X
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DiseaseDetectionPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return;
      try {
        const response = await axios.get(`${API}/disease-reports/${user.uid}`);
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage || !user?.uid) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('user_id', user.uid);

      const response = await axios.post(`${API}/detect-disease`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setResult(response.data.report);
        toast.success(t('success'), { description: 'Analysis complete!' });
        
        // Refresh history
        const historyRes = await axios.get(`${API}/disease-reports/${user.uid}`);
        setHistory(historyRes.data);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('error'), { description: 'Failed to analyze image. Please try again.' });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
      case 'healthy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="disease-detection-page">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Manrope'] flex items-center gap-3">
            <Bug className="w-8 h-8 text-primary" />
            {t('diseaseDetection')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload a photo of your crop to detect diseases and get treatment recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="card-dashboard">
              <CardHeader>
                <CardTitle>{t('uploadImage')}</CardTitle>
              </CardHeader>
              <CardContent>
                {!imagePreview ? (
                  <div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    data-testid="upload-area"
                  >
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium mb-2">{t('dragDrop')}</p>
                      <p className="text-sm text-muted-foreground">
                        Supports: JPG, PNG, WEBP (max 10MB)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Selected crop"
                      className="w-full rounded-xl object-cover max-h-[400px]"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full"
                      onClick={clearImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {imagePreview && (
                  <Button 
                    className="w-full mt-4 rounded-full"
                    onClick={analyzeImage}
                    disabled={analyzing}
                    data-testid="analyze-btn"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {t('analyzing')}
                      </>
                    ) : (
                      <>
                        <Bug className="w-4 h-4 mr-2" />
                        Analyze Crop
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Result Section */}
            {result && (
              <Card className="card-dashboard animate-scale-in" data-testid="result-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />
                      Analysis Result
                    </CardTitle>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
                      {result.severity}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">{t('cropName')}</p>
                      <p className="font-semibold">{result.crop_name}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">{t('diseaseName')}</p>
                      <p className="font-semibold">{result.disease_name}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {t('cause')}
                    </p>
                    <p>{result.cause}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-2">{t('symptoms')}</p>
                    <ul className="space-y-1">
                      {result.symptoms?.map((symptom, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400 mb-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {t('treatment')}
                    </p>
                    <p className="text-green-800 dark:text-green-300">{result.treatment}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        {t('fertilizer')}
                      </p>
                      <p className="font-medium">{result.recommended_fertilizer}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        {t('medicine')}
                      </p>
                      <p className="font-medium">{result.recommended_medicine}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Section */}
          <Card className="card-dashboard" data-testid="history-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                {t('scanHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {history.map((report) => (
                    <div 
                      key={report.id}
                      className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setResult(report)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileImage className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{report.crop_name}</p>
                            <p className="text-sm text-muted-foreground">{report.disease_name}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(report.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bug className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No scan history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your first crop image to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionPage;
