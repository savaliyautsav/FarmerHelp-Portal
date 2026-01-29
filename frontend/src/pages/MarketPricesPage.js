import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import axios from 'axios';
import { TrendingUp, Search, IndianRupee } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MarketPricesPage = () => {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(`${API}/market-prices`);
        setPrices(response.data.prices);
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const filteredPrices = prices.filter(price => 
    price.commodity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.market?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background" data-testid="market-prices-page">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Manrope'] flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            {t('marketPrices')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time mandi prices from across India
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={`${t('search')} by commodity, market, or state...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <Card className="card-dashboard">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Commodities</p>
                  <p className="text-2xl font-bold">{new Set(prices.map(p => p.commodity)).size}</p>
                </CardContent>
              </Card>
              <Card className="card-dashboard">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Markets</p>
                  <p className="text-2xl font-bold">{new Set(prices.map(p => p.market)).size}</p>
                </CardContent>
              </Card>
              <Card className="card-dashboard">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">States</p>
                  <p className="text-2xl font-bold">{new Set(prices.map(p => p.state)).size}</p>
                </CardContent>
              </Card>
              <Card className="card-dashboard">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{prices.length}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Price Table */}
        <Card className="card-dashboard">
          <CardHeader>
            <CardTitle>Commodity Prices (₹/Quintal)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('commodity')}</TableHead>
                      <TableHead>{t('market')}</TableHead>
                      <TableHead>{t('state')}</TableHead>
                      <TableHead className="text-right">{t('minPrice')}</TableHead>
                      <TableHead className="text-right">{t('maxPrice')}</TableHead>
                      <TableHead className="text-right">{t('modalPrice')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrices.length > 0 ? (
                      filteredPrices.map((price, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{price.commodity}</TableCell>
                          <TableCell>{price.market}</TableCell>
                          <TableCell>{price.state}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatPrice(price.min_price)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatPrice(price.max_price)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {formatPrice(price.modal_price)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? 'No results found' : t('noData')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Cards View */}
        <div className="md:hidden mt-6 space-y-4">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)
          ) : (
            filteredPrices.slice(0, 10).map((price, index) => (
              <Card key={index} className="card-dashboard">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{price.commodity}</h3>
                      <p className="text-sm text-muted-foreground">{price.market}, {price.state}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <IndianRupee className="w-4 h-4" />
                        {price.modal_price}
                      </div>
                      <p className="text-xs text-muted-foreground">per quintal</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {formatPrice(price.min_price)}</span>
                    <span>Max: {formatPrice(price.max_price)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPricesPage;
