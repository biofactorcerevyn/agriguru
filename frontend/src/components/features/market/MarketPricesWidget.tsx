import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Loader2, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CommodityPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

const MarketPricesWidget: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commodityPrices, setCommodityPrices] = useState<CommodityPrice[]>([]);
  const navigate = useNavigate();

  // Fetch latest commodity prices (all crops)
  useEffect(() => {
    const fetchLatestCommodityPrices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Using Data.gov.in API to fetch latest records
        const API_KEY = "579b464db66ec23bdd000001d41e71302d7a40167298a85076c62422";
        const response = await axios.get(
          "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
          {
            params: {
              "api-key": API_KEY,
              format: "json",
              limit: 8 // Get 8 records for the widget
            }
          }
        );
        
        if (response.data && response.data.records && response.data.records.length > 0) {
          // Sort by arrival date (newest first) and take unique commodities
          const sortedRecords = response.data.records.sort((a: CommodityPrice, b: CommodityPrice) => {
            const dateA = new Date(a.arrival_date.split('/').reverse().join('-'));
            const dateB = new Date(b.arrival_date.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
          });
          
          // Get unique commodities (avoid duplicates)
          const uniqueCommodities = sortedRecords.reduce((acc: CommodityPrice[], current: CommodityPrice) => {
            const exists = acc.find(item => item.commodity === current.commodity);
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          setCommodityPrices(uniqueCommodities.slice(0, 5)); // Show top 5 unique commodities
        } else {
          setError("No market price data available");
        }
      } catch (err) {
        console.error("Error fetching commodity prices:", err);
        setError("Failed to fetch market prices. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestCommodityPrices();
  }, []);

  // Get price trend indicator
  const getPriceTrend = (min: string, max: string) => {
    const minPrice = parseFloat(min);
    const maxPrice = parseFloat(max);
    const difference = maxPrice - minPrice;
    const percentDiff = (difference / minPrice) * 100;
    
    if (percentDiff > 10) {
      return { icon: TrendingUp, color: "text-success", label: "Rising" };
    } else if (percentDiff < -10) {
      return { icon: TrendingDown, color: "text-destructive", label: "Falling" };
    } else {
      return { icon: Minus, color: "text-muted-foreground", label: "Stable" };
    }
  };

  return (
    <Card variant="info" className="shadow-medium h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center">
            <Store className="h-6 w-6 mr-2 text-info" />
            Market Prices
          </CardTitle>
          <Badge variant="info" className="text-base">
            Latest Prices
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-info animate-spin mb-4" />
              <p className="text-base text-muted-foreground">Loading market prices...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center px-4">
              <p className="text-base text-muted-foreground mb-2">{error}</p>
              <p className="text-sm text-muted-foreground">Please try again later.</p>
            </div>
          </div>
        ) : commodityPrices.length > 0 ? (
          <div className="space-y-4">
            {commodityPrices.map((item, index) => {
              const trend = getPriceTrend(item.min_price, item.max_price);
              const TrendIcon = trend.icon;
              
              return (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <div>
                    <p className="font-medium text-base">{item.commodity}</p>
                    <p className="text-sm text-muted-foreground">{item.market}, {item.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">₹{item.modal_price}</p>
                    <div className="flex items-center justify-end">
                      <TrendIcon className={`h-4 w-4 ${trend.color} mr-1`} />
                      <span className={`text-xs ${trend.color}`}>{trend.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-center py-16">
            <div className="text-center px-4">
              <p className="text-base text-muted-foreground">No market price data available.</p>
              <p className="text-sm text-muted-foreground mt-2">Please check back later.</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="info" 
          className="w-full text-base"
          onClick={() => navigate('/market-prices')}
        >
          View All Market Prices
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MarketPricesWidget;