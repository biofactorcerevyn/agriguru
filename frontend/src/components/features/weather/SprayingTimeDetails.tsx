import React from 'react';
import { Card } from "@/components/ui/card";
import { Wind, Droplets, Thermometer, Clock, AlertTriangle, Check, X, Info } from 'lucide-react';

interface SprayingTimeDetailsProps {
    forecastData: any;
    currentWeather: any;
}

const SprayingTimeDetails: React.FC<SprayingTimeDetailsProps> = ({ forecastData, currentWeather }) => {
    if (!forecastData || !currentWeather) return null;

    // Calculate optimal spraying conditions
    const getSprayingConditions = () => {
        const currentTemp = currentWeather.temp;
        const currentWindSpeed = currentWeather.wind_speed;
        const currentHumidity = currentWeather.humidity;

        // Ideal conditions for spraying:
        // - Temperature: 10-25°C
        // - Wind speed: < 10 km/h (2.78 m/s)
        // - Humidity: 40-60%

        const tempIdeal = currentTemp >= 10 && currentTemp <= 25;
        const windIdeal = currentWindSpeed < 2.78;
        const humidityIdeal = currentHumidity >= 40 && currentHumidity <= 60;

        return {
            temperature: {
                ideal: tempIdeal,
                value: currentTemp,
                status: tempIdeal ? "optimal" : (currentTemp < 10 ? "moderate" : "unfavourable"),
                message: tempIdeal
                    ? "Ideal temperature for spraying"
                    : currentTemp < 10
                        ? "Too cold for effective spraying"
                        : "Too hot for effective spraying"
            },
            wind: {
                ideal: windIdeal,
                value: currentWindSpeed,
                status: windIdeal ? "optimal" : (currentWindSpeed < 7 ? "moderate" : "unfavourable"),
                message: windIdeal
                    ? "Ideal wind conditions for spraying"
                    : "Wind speed too high for safe spraying"
            },
            humidity: {
                ideal: humidityIdeal,
                value: currentHumidity,
                status: humidityIdeal ? "optimal" : (currentHumidity < 40 ? "moderate" : "unfavourable"),
                message: humidityIdeal
                    ? "Ideal humidity for spraying"
                    : currentHumidity < 40
                        ? "Too dry for effective spraying"
                        : "Too humid for effective spraying"
            }
        };
    };

    // Find optimal spraying times in the next 24 hours
    const getOptimalSprayingTimes = () => {
        if (!forecastData.list || forecastData.list.length === 0) return [];

        return forecastData.list.slice(0, 8).map((item: any) => {
            const temp = item.main.temp;
            const windSpeed = item.wind.speed;
            const humidity = item.main.humidity;

            const tempIdeal = temp >= 10 && temp <= 25;
            const windIdeal = windSpeed < 2.78;
            const humidityIdeal = humidity >= 40 && humidity <= 60;

            const score = (tempIdeal ? 1 : 0) + (windIdeal ? 1 : 0) + (humidityIdeal ? 1 : 0);

            return {
                time: new Date(item.dt * 1000),
                temp,
                windSpeed,
                humidity,
                score,
                status: score === 3 ? "optimal" : (score === 2 ? "moderate" : "unfavourable"),
                isOptimal: score >= 2 // At least 2 conditions should be ideal
            };
        }).sort((a: any, b: any) => b.score - a.score);
    };

    const conditions = getSprayingConditions();
    const optimalTimes = getOptimalSprayingTimes();

    // Get the appropriate icon based on status
    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'optimal':
                return <Check className="h-5 w-5 text-[#166534]" />;
            case 'moderate':
                return <AlertTriangle className="h-5 w-5 text-[#92400E]" />;
            case 'unfavourable':
                return <X className="h-5 w-5 text-[#991B1B]" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-[#92400E]" />;
        }
    };

    // Get the appropriate background color based on status
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'optimal':
                return "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]";
            case 'moderate':
                return "bg-[#FFF8E6] text-[#92400E] border-[#F4D35E]";
            case 'unfavourable':
                return "bg-[#FFD6DB] text-[#991B1B] border-[#FFD6DB]";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <Card className="overflow-hidden border-0 shadow-md rounded-3xl bg-white">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-5 text-gray-800">Spraying Conditions</h2>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Temperature */}
                        <div className="flex flex-col p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-3">
                                        <Thermometer className="h-5 w-5 text-[#3E8E41]" />
                                    </div>
                                    <span className="font-medium text-gray-800">Temperature</span>
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(conditions.temperature.status)}`}>
                                    {getStatusIcon(conditions.temperature.status)}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{Math.round(conditions.temperature.value)}°C</p>
                            <p className="text-gray-500 text-sm mt-1">{conditions.temperature.message}</p>
                        </div>

                        {/* Wind Speed */}
                        <div className="flex flex-col p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-3">
                                        <Wind className="h-5 w-5 text-[#3E8E41]" />
                                    </div>
                                    <span className="font-medium text-gray-800">Wind Speed</span>
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(conditions.wind.status)}`}>
                                    {getStatusIcon(conditions.wind.status)}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{conditions.wind.value.toFixed(1)} m/s</p>
                            <p className="text-gray-500 text-sm mt-1">{conditions.wind.message}</p>
                        </div>

                        {/* Humidity */}
                        <div className="flex flex-col p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#e6f5e6] flex items-center justify-center mr-3">
                                        <Droplets className="h-5 w-5 text-[#3E8E41]" />
                                    </div>
                                    <span className="font-medium text-gray-800">Humidity</span>
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(conditions.humidity.status)}`}>
                                    {getStatusIcon(conditions.humidity.status)}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{conditions.humidity.value}%</p>
                            <p className="text-gray-500 text-sm mt-1">{conditions.humidity.message}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-medium mb-4 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Recommended Spraying Times (Next 24 Hours)
                        </h3>

                        {optimalTimes.filter(time => time.isOptimal).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {optimalTimes.filter(time => time.isOptimal).slice(0, 4).map((time, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-2xl border border-gray-100 bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">
                                                {time.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                time.status === 'optimal' ? 'bg-green-100' : 
                                                time.status === 'moderate' ? 'bg-amber-100' : 'bg-rose-100'
                                            }`}>
                                                {getStatusIcon(time.status)}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Temperature:</span>
                                                <span className="font-medium">{Math.round(time.temp)}°C</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Wind:</span>
                                                <span className="font-medium">{time.windSpeed.toFixed(1)} m/s</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Humidity:</span>
                                                <span className="font-medium">{time.humidity}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                                <p className="text-sm">No optimal spraying times found in the next 24 hours.</p>
                            </div>
                        )}

                        {optimalTimes.filter(time => time.isOptimal).length === 0 && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="text-sm font-medium mb-2">Spraying Recommendations:</h4>
                                <ul className="text-xs text-gray-500 space-y-1">
                                    <li>• Consider spraying early morning or late evening when temperatures are cooler</li>
                                    <li>• Wait for wind speeds to decrease below 10 km/h (2.78 m/s)</li>
                                    <li>• Monitor humidity levels and aim for 40-60% relative humidity</li>
                                    <li>• Check the forecast for the next few days for better conditions</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default SprayingTimeDetails;
