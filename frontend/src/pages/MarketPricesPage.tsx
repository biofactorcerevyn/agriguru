import React from 'react';
import MarketPricesTable from '@/components/features/market/MarketPricesTable';
import { Store, Filter, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MarketPricesPage: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-0 flex items-center">
            <Store className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
            Market Commodity Prices
          </h1>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm p-4 sm:p-6">
          {/* Market Prices Table with All Crops */}
          <MarketPricesTable showLocationFilter={true} />
        </Card>
      </div>
    </div>
  );
};

export default MarketPricesPage;
