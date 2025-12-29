import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Calendar, MapPin } from "lucide-react";

interface MarketPrice {
  crop: string;
  variety?: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  market: string;
  lastUpdated: string;
  unit: string;
}

interface MarketDataProps {
  district: string;
  state: string;
}

export default function MarketPrices({ district, state }: MarketDataProps) {
  const [marketData, setMarketData] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Crops' },
    { value: 'cereals', label: 'Cereals' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'oilseeds', label: 'Oil Seeds' }
  ];

  useEffect(() => {
    fetchMarketData();
  }, [district, state]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real implementation, this would call market data API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock market data
      const mockData: MarketPrice[] = [
        {
          crop: "Wheat",
          currentPrice: 2150,
          previousPrice: 2100,
          change: 50,
          changePercent: 2.38,
          market: `${district} Mandi`,
          lastUpdated: "2 hours ago",
          unit: "per quintal"
        },
        {
          crop: "Rice",
          variety: "Basmati",
          currentPrice: 3200,
          previousPrice: 3150,
          change: 50,
          changePercent: 1.59,
          market: `${district} Mandi`,
          lastUpdated: "3 hours ago",
          unit: "per quintal"
        },
        {
          crop: "Onion",
          currentPrice: 28,
          previousPrice: 32,
          change: -4,
          changePercent: -12.5,
          market: `${district} Market`,
          lastUpdated: "1 hour ago",
          unit: "per kg"
        },
        {
          crop: "Potato",
          currentPrice: 22,
          previousPrice: 20,
          change: 2,
          changePercent: 10.0,
          market: `${district} Market`,
          lastUpdated: "4 hours ago",
          unit: "per kg"
        },
        {
          crop: "Tomato",
          currentPrice: 45,
          previousPrice: 48,
          change: -3,
          changePercent: -6.25,
          market: `${district} Market`,
          lastUpdated: "1 hour ago",
          unit: "per kg"
        },
        {
          crop: "Sugarcane",
          currentPrice: 350,
          previousPrice: 340,
          change: 10,
          changePercent: 2.94,
          market: `${district} Sugar Mill`,
          lastUpdated: "6 hours ago",
          unit: "per quintal"
        },
        {
          crop: "Cotton",
          currentPrice: 6200,
          previousPrice: 6100,
          change: 100,
          changePercent: 1.64,
          market: `${state} Cotton Market`,
          lastUpdated: "5 hours ago",
          unit: "per quintal"
        },
        {
          crop: "Soybean",
          currentPrice: 4800,
          previousPrice: 4750,
          change: 50,
          changePercent: 1.05,
          market: `${district} Mandi`,
          lastUpdated: "3 hours ago",
          unit: "per quintal"
        }
      ];

      setMarketData(mockData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = marketData.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'cereals') return ['Wheat', 'Rice', 'Maize'].includes(item.crop);
    if (selectedCategory === 'vegetables') return ['Onion', 'Potato', 'Tomato'].includes(item.crop);
    if (selectedCategory === 'fruits') return ['Apple', 'Banana', 'Orange'].includes(item.crop);
    if (selectedCategory === 'oilseeds') return ['Soybean', 'Mustard', 'Sunflower'].includes(item.crop);
    return true;
  });

  if (loading) {
    return (
      <Card className="card-agricultural p-6 backdrop-blur-sm bg-white/95">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-agricultural backdrop-blur-sm bg-white/95">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Market Prices</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{district}, {state}</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Price List */}
        <div className="space-y-3">
          {filteredData.map((item, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-foreground">
                      {item.crop}
                      {item.variety && (
                        <span className="text-sm text-muted-foreground ml-1">({item.variety})</span>
                      )}
                    </h4>
                    <Badge
                      variant={item.change >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {item.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.market}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    ₹{item.currentPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Previous Price:</span>
                  <span className="font-medium">₹{item.previousPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Change:</span>
                  <span className={`font-medium ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? '+' : ''}₹{item.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No market data available for selected category</p>
          </div>
        )}

        {/* Market Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Market Insights</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Wheat prices showing upward trend due to good demand</li>
            <li>• Vegetable prices fluctuating due to seasonal changes</li>
            <li>• Best time to sell onions - prices expected to rise next week</li>
            <li>• Consider storing wheat for better prices next month</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" onClick={fetchMarketData}>
            Refresh Prices
          </Button>
        </div>
      </div>
    </Card>
  );
}