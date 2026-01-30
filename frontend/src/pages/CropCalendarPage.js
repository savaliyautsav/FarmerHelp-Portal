import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  Trash2,
  Leaf,
  Droplets,
  Bug,
  Shovel,
  Sun,
  CloudRain,
  Sprout,
  Wheat
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Seasonal Crop Data for Indian Agriculture
const seasonalCropData = {
  kharif: {
    name: 'Kharif Season',
    nameHi: 'खरीफ मौसम',
    nameGu: 'ખરીફ સીઝન',
    period: 'June - October',
    description: 'Monsoon crops sown with the onset of monsoon',
    crops: [
      { name: 'Rice', nameHi: 'चावल', nameGu: 'ચોખા', sowingMonths: [6, 7], harvestMonths: [10, 11], duration: '120-150 days', icon: '🌾' },
      { name: 'Maize', nameHi: 'मक्का', nameGu: 'મકાઈ', sowingMonths: [6, 7], harvestMonths: [9, 10], duration: '90-120 days', icon: '🌽' },
      { name: 'Cotton', nameHi: 'कपास', nameGu: 'કપાસ', sowingMonths: [5, 6], harvestMonths: [10, 11, 12], duration: '150-180 days', icon: '🏵️' },
      { name: 'Soybean', nameHi: 'सोयाबीन', nameGu: 'સોયાબીન', sowingMonths: [6, 7], harvestMonths: [9, 10], duration: '90-100 days', icon: '🫘' },
      { name: 'Groundnut', nameHi: 'मूंगफली', nameGu: 'મગફળી', sowingMonths: [6, 7], harvestMonths: [10, 11], duration: '100-130 days', icon: '🥜' },
      { name: 'Sugarcane', nameHi: 'गन्ना', nameGu: 'શેરડી', sowingMonths: [2, 3, 6, 7], harvestMonths: [1, 2, 3], duration: '10-12 months', icon: '🎋' },
      { name: 'Jowar', nameHi: 'ज्वार', nameGu: 'જુવાર', sowingMonths: [6, 7], harvestMonths: [9, 10], duration: '90-120 days', icon: '🌾' },
      { name: 'Bajra', nameHi: 'बाजरा', nameGu: 'બાજરી', sowingMonths: [6, 7], harvestMonths: [9, 10], duration: '80-90 days', icon: '🌾' },
    ]
  },
  rabi: {
    name: 'Rabi Season',
    nameHi: 'रबी मौसम',
    nameGu: 'રવી સીઝન',
    period: 'October - March',
    description: 'Winter crops sown after monsoon',
    crops: [
      { name: 'Wheat', nameHi: 'गेहूं', nameGu: 'ઘઉં', sowingMonths: [10, 11], harvestMonths: [3, 4], duration: '120-150 days', icon: '🌾' },
      { name: 'Mustard', nameHi: 'सरसों', nameGu: 'સરસવ', sowingMonths: [10, 11], harvestMonths: [2, 3], duration: '110-140 days', icon: '🌼' },
      { name: 'Chickpea', nameHi: 'चना', nameGu: 'ચણા', sowingMonths: [10, 11], harvestMonths: [2, 3], duration: '90-120 days', icon: '🫘' },
      { name: 'Barley', nameHi: 'जौ', nameGu: 'જવ', sowingMonths: [10, 11], harvestMonths: [3, 4], duration: '120-150 days', icon: '🌾' },
      { name: 'Peas', nameHi: 'मटर', nameGu: 'વટાણા', sowingMonths: [10, 11], harvestMonths: [1, 2], duration: '90-100 days', icon: '🫛' },
      { name: 'Lentil', nameHi: 'मसूर', nameGu: 'મસૂર', sowingMonths: [10, 11], harvestMonths: [2, 3], duration: '100-120 days', icon: '🫘' },
      { name: 'Potato', nameHi: 'आलू', nameGu: 'બટાટા', sowingMonths: [10, 11], harvestMonths: [1, 2, 3], duration: '80-120 days', icon: '🥔' },
      { name: 'Onion', nameHi: 'प्याज', nameGu: 'ડુંગળી', sowingMonths: [10, 11, 12], harvestMonths: [3, 4, 5], duration: '120-150 days', icon: '🧅' },
    ]
  },
  zaid: {
    name: 'Zaid Season',
    nameHi: 'जायद मौसम',
    nameGu: 'ઝૈદ સીઝન',
    period: 'March - June',
    description: 'Summer crops grown between Rabi and Kharif',
    crops: [
      { name: 'Watermelon', nameHi: 'तरबूज', nameGu: 'તડબૂચ', sowingMonths: [2, 3], harvestMonths: [5, 6], duration: '80-110 days', icon: '🍉' },
      { name: 'Muskmelon', nameHi: 'खरबूजा', nameGu: 'શક્કરટેટી', sowingMonths: [2, 3], harvestMonths: [5, 6], duration: '80-100 days', icon: '🍈' },
      { name: 'Cucumber', nameHi: 'खीरा', nameGu: 'કાકડી', sowingMonths: [2, 3, 4], harvestMonths: [4, 5, 6], duration: '45-60 days', icon: '🥒' },
      { name: 'Moong', nameHi: 'मूंग', nameGu: 'મગ', sowingMonths: [3, 4], harvestMonths: [5, 6], duration: '60-75 days', icon: '🫘' },
      { name: 'Bitter Gourd', nameHi: 'करेला', nameGu: 'કારેલા', sowingMonths: [2, 3], harvestMonths: [4, 5, 6], duration: '55-60 days', icon: '🥒' },
      { name: 'Pumpkin', nameHi: 'कद्दू', nameGu: 'કોળું', sowingMonths: [2, 3], harvestMonths: [5, 6], duration: '90-120 days', icon: '🎃' },
    ]
  },
  vegetables: {
    name: 'Year-Round Vegetables',
    nameHi: 'साल भर की सब्जियां',
    nameGu: 'વર્ષભર શાકભાજી',
    period: 'Year-round with proper care',
    description: 'Vegetables that can be grown throughout the year',
    crops: [
      { name: 'Tomato', nameHi: 'टमाटर', nameGu: 'ટામેટા', sowingMonths: [7, 8, 9, 11, 12, 1], harvestMonths: [10, 11, 12, 2, 3, 4], duration: '60-90 days', icon: '🍅' },
      { name: 'Brinjal', nameHi: 'बैंगन', nameGu: 'રીંગણ', sowingMonths: [6, 7, 8, 11, 12], harvestMonths: [9, 10, 11, 2, 3], duration: '70-80 days', icon: '🍆' },
      { name: 'Chilli', nameHi: 'मिर्च', nameGu: 'મરચું', sowingMonths: [6, 7, 11, 12], harvestMonths: [9, 10, 11, 2, 3, 4], duration: '60-90 days', icon: '🌶️' },
      { name: 'Cabbage', nameHi: 'पत्ता गोभी', nameGu: 'કોબી', sowingMonths: [8, 9, 10], harvestMonths: [11, 12, 1, 2], duration: '80-100 days', icon: '🥬' },
      { name: 'Cauliflower', nameHi: 'फूल गोभी', nameGu: 'ફુલાવર', sowingMonths: [7, 8, 9, 10], harvestMonths: [10, 11, 12, 1, 2], duration: '90-120 days', icon: '🥦' },
      { name: 'Spinach', nameHi: 'पालक', nameGu: 'પાલક', sowingMonths: [9, 10, 11, 2, 3], harvestMonths: [10, 11, 12, 1, 3, 4, 5], duration: '30-45 days', icon: '🥬' },
    ]
  }
};

const months = [
  { num: 1, name: 'January', nameHi: 'जनवरी', nameGu: 'જાન્યુઆરી', short: 'Jan' },
  { num: 2, name: 'February', nameHi: 'फरवरी', nameGu: 'ફેબ્રુઆરી', short: 'Feb' },
  { num: 3, name: 'March', nameHi: 'मार्च', nameGu: 'માર્ચ', short: 'Mar' },
  { num: 4, name: 'April', nameHi: 'अप्रैल', nameGu: 'એપ્રિલ', short: 'Apr' },
  { num: 5, name: 'May', nameHi: 'मई', nameGu: 'મે', short: 'May' },
  { num: 6, name: 'June', nameHi: 'जून', nameGu: 'જૂન', short: 'Jun' },
  { num: 7, name: 'July', nameHi: 'जुलाई', nameGu: 'જુલાઈ', short: 'Jul' },
  { num: 8, name: 'August', nameHi: 'अगस्त', nameGu: 'ઓગસ્ટ', short: 'Aug' },
  { num: 9, name: 'September', nameHi: 'सितंबर', nameGu: 'સપ્ટેમ્બર', short: 'Sep' },
  { num: 10, name: 'October', nameHi: 'अक्टूबर', nameGu: 'ઓક્ટોબર', short: 'Oct' },
  { num: 11, name: 'November', nameHi: 'नवंबर', nameGu: 'નવેમ્બર', short: 'Nov' },
  { num: 12, name: 'December', nameHi: 'दिसंबर', nameGu: 'ડિસેમ્બર', short: 'Dec' },
];

const activities = [
  { value: 'sowing', label: 'Sowing', icon: Sprout },
  { value: 'irrigation', label: 'Irrigation', icon: Droplets },
  { value: 'fertilizing', label: 'Fertilizing', icon: Shovel },
  { value: 'pesticide', label: 'Pesticide Application', icon: Bug },
  { value: 'harvesting', label: 'Harvesting', icon: Wheat },
  { value: 'weeding', label: 'Weeding', icon: Shovel },
  { value: 'pruning', label: 'Pruning', icon: Leaf },
  { value: 'other', label: 'Other', icon: CalendarIcon },
];

const CropCalendarPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    crop_name: '',
    activity: '',
    notes: ''
  });

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchEntries();
}, []);


  const fetchEntries = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API}/crop-calendar/${user.uid}`);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.crop_name || !formData.activity) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`${API}/crop-calendar`, {
        user_id: user.uid,
        crop_name: formData.crop_name,
        activity: formData.activity,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        notes: formData.notes
      });

      toast.success('Activity added successfully');
      setDialogOpen(false);
      setFormData({ crop_name: '', activity: '', notes: '' });
      fetchEntries();
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add activity');
    }
  };

  const toggleComplete = async (entryId, completed) => {
    try {
      await axios.put(`${API}/crop-calendar/${entryId}?completed=${!completed}`);
      toast.success(completed ? 'Marked as pending' : 'Marked as complete');
      fetchEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update');
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      await axios.delete(`${API}/crop-calendar/${entryId}`);
      toast.success('Activity deleted');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete');
    }
  };

  const getCropName = (crop) => {
    if (language === 'hi') return crop.nameHi;
    if (language === 'gu') return crop.nameGu;
    return crop.name;
  };

  const getSeasonName = (season) => {
    if (language === 'hi') return seasonalCropData[season].nameHi;
    if (language === 'gu') return seasonalCropData[season].nameGu;
    return seasonalCropData[season].name;
  };

  const getMonthName = (month) => {
    const m = months.find(m => m.num === month);
    if (language === 'hi') return m?.nameHi;
    if (language === 'gu') return m?.nameGu;
    return m?.name;
  };

  const getCropsForMonth = (monthNum) => {
    const result = { sowing: [], harvesting: [] };
    
    Object.values(seasonalCropData).forEach(season => {
      season.crops.forEach(crop => {
        if (crop.sowingMonths.includes(monthNum)) {
          result.sowing.push({ ...crop, season: season.name });
        }
        if (crop.harvestMonths.includes(monthNum)) {
          result.harvesting.push({ ...crop, season: season.name });
        }
      });
    });
    
    return result;
  };

  const currentMonthCrops = getCropsForMonth(selectedMonth);

  const getEntriesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.filter(e => e.scheduled_date === dateStr);
  };

  const selectedDateEntries = getEntriesForDate(selectedDate);

  const getActivityIcon = (activityValue) => {
    const activity = activities.find(a => a.value === activityValue?.toLowerCase());
    return activity?.icon || CalendarIcon;
  };

  const modifiers = {
    hasEntry: entries.map(e => new Date(e.scheduled_date))
  };

  const modifiersStyles = {
    hasEntry: {
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      borderRadius: '50%'
    }
  };

  const allCrops = Object.values(seasonalCropData).flatMap(s => s.crops.map(c => c.name));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="crop-calendar-page">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Manrope'] flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            {t('cropCalendar')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'hi' ? 'मौसम के अनुसार बुवाई और कटाई का कैलेंडर' : 
             language === 'gu' ? 'સિઝન મુજબ વાવણી અને લણણીનું કેલેન્ડર' :
             'Seasonal planting and harvesting guide for Indian agriculture'}
          </p>
        </div>

        <Tabs defaultValue="seasonal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="seasonal" data-testid="seasonal-tab">
              <Sun className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'मौसमी गाइड' : language === 'gu' ? 'સિઝનલ ગાઈડ' : 'Seasonal Guide'}
            </TabsTrigger>
            <TabsTrigger value="planner" data-testid="planner-tab">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'मेरा प्लानर' : language === 'gu' ? 'મારું પ્લાનર' : 'My Planner'}
            </TabsTrigger>
          </TabsList>

          {/* Seasonal Guide Tab */}
          <TabsContent value="seasonal" className="space-y-6">
            {/* Month Selector */}
            <Card className="card-dashboard">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{language === 'hi' ? 'महीना चुनें' : language === 'gu' ? 'મહિનો પસંદ કરો' : 'Select Month'}</span>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger className="w-40" data-testid="month-selector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(m => (
                        <SelectItem key={m.num} value={m.num.toString()}>
                          {language === 'hi' ? m.nameHi : language === 'gu' ? m.nameGu : m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Crops to Sow */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Sprout className="w-5 h-5" />
                      {language === 'hi' ? 'बुवाई के लिए' : language === 'gu' ? 'વાવણી માટે' : 'Best for Sowing'}
                    </h3>
                    {currentMonthCrops.sowing.length > 0 ? (
                      <div className="space-y-2">
                        {currentMonthCrops.sowing.map((crop, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{crop.icon}</span>
                              <div>
                                <p className="font-medium">{getCropName(crop)}</p>
                                <p className="text-xs text-muted-foreground">{crop.duration}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              {language === 'hi' ? 'बुवाई' : language === 'gu' ? 'વાવણી' : 'Sow'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {language === 'hi' ? 'इस महीने कोई फसल नहीं' : language === 'gu' ? 'આ મહિને કોઈ પાક નથી' : 'No crops for this month'}
                      </p>
                    )}
                  </div>

                  {/* Crops to Harvest */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Wheat className="w-5 h-5" />
                      {language === 'hi' ? 'कटाई के लिए' : language === 'gu' ? 'લણણી માટે' : 'Ready for Harvest'}
                    </h3>
                    {currentMonthCrops.harvesting.length > 0 ? (
                      <div className="space-y-2">
                        {currentMonthCrops.harvesting.map((crop, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{crop.icon}</span>
                              <div>
                                <p className="font-medium">{getCropName(crop)}</p>
                                <p className="text-xs text-muted-foreground">{crop.duration}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              {language === 'hi' ? 'कटाई' : language === 'gu' ? 'લણણી' : 'Harvest'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {language === 'hi' ? 'इस महीने कोई कटाई नहीं' : language === 'gu' ? 'આ મહિને કોઈ લણણી નથી' : 'No harvests this month'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Season Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(seasonalCropData).map(([key, season]) => (
                <Card key={key} className="card-dashboard overflow-hidden">
                  <CardHeader className={`${
                    key === 'kharif' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    key === 'rabi' ? 'bg-orange-50 dark:bg-orange-900/20' :
                    key === 'zaid' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                    'bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {key === 'kharif' ? <CloudRain className="w-5 h-5 text-blue-500" /> :
                         key === 'rabi' ? <Sun className="w-5 h-5 text-orange-500" /> :
                         key === 'zaid' ? <Sun className="w-5 h-5 text-yellow-500" /> :
                         <Leaf className="w-5 h-5 text-green-500" />}
                        {getSeasonName(key)}
                      </span>
                      <Badge variant="secondary">{season.period}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{season.description}</p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {season.crops.map((crop, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 rounded-full text-sm"
                        >
                          <span>{crop.icon}</span>
                          <span>{getCropName(crop)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Year Calendar View */}
            <Card className="card-dashboard">
              <CardHeader>
                <CardTitle>
                  {language === 'hi' ? 'वार्षिक फसल कैलेंडर' : language === 'gu' ? 'વાર્ષિક પાક કેલેન્ડર' : 'Annual Crop Calendar'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2 border-b font-semibold">
                          {language === 'hi' ? 'फसल' : language === 'gu' ? 'પાક' : 'Crop'}
                        </th>
                        {months.map(m => (
                          <th key={m.num} className="p-2 border-b text-center font-medium">
                            {m.short}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(seasonalCropData).flatMap(season => 
                        season.crops.slice(0, 4).map((crop, idx) => (
                          <tr key={`${crop.name}-${idx}`} className="border-b border-border/50">
                            <td className="p-2 font-medium flex items-center gap-2">
                              <span>{crop.icon}</span>
                              {getCropName(crop)}
                            </td>
                            {months.map(m => {
                              const isSowing = crop.sowingMonths.includes(m.num);
                              const isHarvest = crop.harvestMonths.includes(m.num);
                              return (
                                <td key={m.num} className="p-1 text-center">
                                  {isSowing && (
                                    <div className="w-6 h-6 mx-auto rounded-full bg-green-500/20 flex items-center justify-center" title="Sowing">
                                      <Sprout className="w-3 h-3 text-green-600" />
                                    </div>
                                  )}
                                  {isHarvest && (
                                    <div className="w-6 h-6 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center" title="Harvest">
                                      <Wheat className="w-3 h-3 text-amber-600" />
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-6 mt-4 justify-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Sprout className="w-3 h-3 text-green-600" />
                    </div>
                    <span>{language === 'hi' ? 'बुवाई का समय' : language === 'gu' ? 'વાવણીનો સમય' : 'Sowing Time'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Wheat className="w-3 h-3 text-amber-600" />
                    </div>
                    <span>{language === 'hi' ? 'कटाई का समय' : language === 'gu' ? 'લણણીનો સમય' : 'Harvest Time'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full" data-testid="add-activity-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addActivity')}
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby="add-activity-description">
                  <DialogHeader>
                    <DialogTitle>{t('addActivity')}</DialogTitle>
                    <DialogDescription id="add-activity-description">
                      {language === 'hi' ? 'अपनी फसल के लिए नई गतिविधि जोड़ें' : 
                       language === 'gu' ? 'તમારા પાક માટે નવી પ્રવૃત્તિ ઉમેરો' :
                       'Schedule a new farming activity for your crops'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('selectDate')}</Label>
                      <div className="border rounded-lg p-2">
                        <p className="text-sm font-medium mb-2">
                          {language === 'hi' ? 'चयनित:' : language === 'gu' ? 'પસંદ કરેલ:' : 'Selected:'} {format(selectedDate, 'PPP')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'hi' ? 'फसल' : language === 'gu' ? 'પાક' : 'Crop'}</Label>
                      <Select 
                        value={formData.crop_name} 
                        onValueChange={(v) => setFormData({...formData, crop_name: v})}
                      >
                        <SelectTrigger data-testid="crop-select">
                          <SelectValue placeholder={language === 'hi' ? 'फसल चुनें' : language === 'gu' ? 'પાક પસંદ કરો' : 'Select crop'} />
                        </SelectTrigger>
                        <SelectContent>
                          {[...new Set(allCrops)].map(crop => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('activityName')}</Label>
                      <Select 
                        value={formData.activity} 
                        onValueChange={(v) => setFormData({...formData, activity: v})}
                      >
                        <SelectTrigger data-testid="activity-select">
                          <SelectValue placeholder={language === 'hi' ? 'गतिविधि चुनें' : language === 'gu' ? 'પ્રવૃત્તિ પસંદ કરો' : 'Select activity'} />
                        </SelectTrigger>
                        <SelectContent>
                          {activities.map(activity => (
                            <SelectItem key={activity.value} value={activity.label}>
                              {activity.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('notes')}</Label>
                      <Input
                        placeholder={language === 'hi' ? 'नोट्स जोड़ें (वैकल्पिक)' : language === 'gu' ? 'નોંધો ઉમેરો (વૈકલ્પિક)' : 'Add notes (optional)'}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        data-testid="notes-input"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        {t('cancel')}
                      </Button>
                      <Button type="submit" data-testid="save-activity-btn">
                        {t('save')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <Card className="lg:col-span-2 card-dashboard" data-testid="calendar-card">
                <CardContent className="p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="rounded-md w-full"
                  />
                </CardContent>
              </Card>

              {/* Selected Date Activities */}
              <Card className="card-dashboard" data-testid="activities-card">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                    </div>
                  ) : selectedDateEntries.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEntries.map((entry) => {
                        const Icon = getActivityIcon(entry.activity);
                        return (
                          <div 
                            key={entry.id}
                            className={`p-4 rounded-xl border transition-colors ${
                              entry.completed 
                                ? 'bg-muted/30 border-border/50 opacity-60' 
                                : 'bg-card border-border hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  entry.completed ? 'bg-muted' : 'bg-primary/10'
                                }`}>
                                  <Icon className={`w-5 h-5 ${entry.completed ? 'text-muted-foreground' : 'text-primary'}`} />
                                </div>
                                <div>
                                  <p className={`font-medium ${entry.completed ? 'line-through' : ''}`}>
                                    {entry.activity}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{entry.crop_name}</p>
                                  {entry.notes && (
                                    <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleComplete(entry.id, entry.completed)}
                                >
                                  <Check className={`w-4 h-4 ${entry.completed ? 'text-primary' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => deleteEntry(entry.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'कोई गतिविधि शेड्यूल नहीं' : 
                         language === 'gu' ? 'કોઈ પ્રવૃત્તિ શેડ્યૂલ નથી' :
                         'No activities scheduled'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setDialogOpen(true)}
                      >
                        {t('addActivity')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All Upcoming Activities */}
            {entries.filter(e => !e.completed).length > 0 && (
              <Card className="card-dashboard" data-testid="upcoming-activities-card">
                <CardHeader>
                  <CardTitle>{t('upcomingActivities')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entries
                      .filter(e => !e.completed)
                      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                      .slice(0, 9)
                      .map((entry) => {
                        const Icon = getActivityIcon(entry.activity);
                        return (
                          <div 
                            key={entry.id}
                            className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedDate(new Date(entry.scheduled_date))}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{entry.activity}</p>
                                <p className="text-xs text-muted-foreground">{entry.crop_name}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(entry.scheduled_date), 'EEE, MMM d')}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CropCalendarPage;
