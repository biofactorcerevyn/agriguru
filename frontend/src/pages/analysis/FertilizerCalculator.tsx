import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Beaker } from "lucide-react";

export default function FertilizerCalculator() {
  const [farmArea, setFarmArea] = useState("");
  const [cropType, setCropType] = useState("");
  const [soilType, setSoilType] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [result, setResult] = useState<any>(null);

  const calculateFertilizer = () => {
    // Simple calculation logic - in real app, this would be more sophisticated
    const baseNitrogen = 120; // kg per hectare
    const basePhosphorus = 60;
    const basePotassium = 40;

    const area = parseFloat(farmArea) || 1;
    const multiplier = cropType === 'rice' ? 1.2 : cropType === 'wheat' ? 1.0 : 0.8;

    const nitrogen = Math.round(baseNitrogen * area * multiplier);
    const phosphorus = Math.round(basePhosphorus * area * multiplier);
    const potassium = Math.round(basePotassium * area * multiplier);

    setResult({
      nitrogen,
      phosphorus,
      potassium,
      urea: Math.round(nitrogen / 0.46), // Urea is 46% nitrogen
      dap: Math.round(phosphorus / 0.46), // DAP is 46% phosphorus
      mop: Math.round(potassium / 0.6), // MOP is 60% potassium
      totalCost: Math.round((nitrogen * 30 + phosphorus * 45 + potassium * 35) / 100) // Rough cost calculation
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Fertilizer Calculator</h1>
        <p className="text-muted-foreground">
          Calculate the optimal fertilizer requirements for your crops based on area, soil type, and growth stage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Calculator className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-semibold">Farm Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="area">Farm Area (hectares)</Label>
              <Input
                id="area"
                type="number"
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                placeholder="Enter area in hectares"
              />
            </div>

            <div>
              <Label htmlFor="crop">Crop Type</Label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="maize">Maize</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="sugarcane">Sugarcane</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="soil">Soil Type</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="loamy">Loamy</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="black">Black Cotton</SelectItem>
                  <SelectItem value="red">Red Soil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stage">Growth Stage</Label>
              <Select value={growthStage} onValueChange={setGrowthStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select growth stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sowing">Sowing/Planting</SelectItem>
                  <SelectItem value="vegetative">Vegetative</SelectItem>
                  <SelectItem value="flowering">Flowering</SelectItem>
                  <SelectItem value="fruiting">Fruiting/Maturity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateFertilizer} 
              className="w-full"
              disabled={!farmArea || !cropType || !soilType || !growthStage}
            >
              Calculate Fertilizer Requirements
            </Button>
          </div>
        </Card>

        {/* Results */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Beaker className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-semibold">Fertilizer Recommendations</h3>
          </div>

          {!result ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Fill in the farm details to get fertilizer recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.nitrogen}</div>
                  <div className="text-xs text-blue-600">kg Nitrogen</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.phosphorus}</div>
                  <div className="text-xs text-green-600">kg Phosphorus</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.potassium}</div>
                  <div className="text-xs text-orange-600">kg Potassium</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Commercial Fertilizers</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Urea (46% N)</span>
                    <span className="font-medium">{result.urea} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DAP (46% P₂O₅)</span>
                    <span className="font-medium">{result.dap} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MOP (60% K₂O)</span>
                    <span className="font-medium">{result.mop} kg</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Estimated Cost</span>
                  <span className="text-primary">₹{result.totalCost}</span>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> These are general recommendations. Consider getting a soil test for more accurate fertilizer requirements.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}