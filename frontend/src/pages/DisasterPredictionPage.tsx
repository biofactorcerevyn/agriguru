import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, AlertTriangle, Calendar, Clock, AlertCircle, Loader2, Zap, CloudRain, Wind, Thermometer, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import axios from "axios";

// API configuration - using our backend proxy to avoid CORS issues
const API_URL = "http://localhost:8000/disasters";

interface DisasterEvent {
  event_type: string;
  event_name: string;
  date: string;
  lat: number;
  lng: number;
  continent: string;
  created_time: string;
  source_event_id: string;
  event_id: string;
  // Note: estimated_end_date is not provided by Ambee API
}

interface ApiResponse {
  message: string;
  hasNextPage: boolean;
  page: number;
  limit: number;
  result: DisasterEvent[];
}

// Event type mapping for display
const eventTypeMap: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "EQ": { 
    label: "Earthquake", 
    icon: Zap, 
    color: "bg-orange-100 text-orange-800 border-orange-300" 
  },
  "FL": { 
    label: "Flood", 
    icon: CloudRain, 
    color: "bg-blue-100 text-blue-800 border-blue-300" 
  },
  "TC": { 
    label: "Tropical Cyclone", 
    icon: Wind, 
    color: "bg-purple-100 text-purple-800 border-purple-300" 
  },
  "DR": { 
    label: "Drought", 
    icon: Thermometer, 
    color: "bg-amber-100 text-amber-800 border-amber-300" 
  },
  "WF": { 
    label: "Wildfire", 
    icon: AlertCircle, 
    color: "bg-red-100 text-red-800 border-red-300" 
  },
  "TN": {
    label: "Tsunami", 
    icon: CloudRain, 
    color: "bg-cyan-100 text-cyan-800 border-cyan-300"
  },
  "ET": {
    label: "Extreme Temperature", 
    icon: Thermometer, 
    color: "bg-rose-100 text-rose-800 border-rose-300"
  },
  "SW": {
    label: "Severe Storm", 
    icon: CloudRain, 
    color: "bg-indigo-100 text-indigo-800 border-indigo-300"
  },
  "SI": {
    label: "Sea Ice", 
    icon: CloudRain, 
    color: "bg-sky-100 text-sky-800 border-sky-300"
  },
  "VO": {
    label: "Volcano", 
    icon: AlertCircle, 
    color: "bg-red-100 text-red-800 border-red-300"
  },
  "LS": {
    label: "Landslide", 
    icon: AlertCircle, 
    color: "bg-amber-100 text-amber-800 border-amber-300"
  },
  "Misc": {
    label: "Miscellaneous", 
    icon: AlertCircle, 
    color: "bg-gray-100 text-gray-800 border-gray-300"
  }
};

export default function DisasterPredictionPage() {
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  
  const fetchDisasters = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    
    try {
      // Call our backend API which proxies the Ambee API
      const response = await axios.get(API_URL);
      
      if (response.data && response.data.message === "success") {
        console.log("Ambee API response:", response.data);
        
        // Store the full API response
        setApiResponse(response.data);
        
        if (response.data.result && response.data.result.length > 0) {
          setDisasters(response.data.result);
          setLastUpdated(new Date());
        } else {
          setDisasters([]);
          setError("No disaster events found for India. This could be temporary.");
        }
      } else {
        throw new Error("Failed to fetch disaster data");
      }
    } catch (err: any) {
      console.error("Error fetching disaster data:", err);
      setError(`Failed to load disaster prediction data: ${err.message || 'Unknown error'}. Please try again later.`);
      setDisasters([]);
      setApiResponse(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchDisasters();
  }, []);

  // Filter disasters based on active tab
  const filteredDisasters = disasters.filter(disaster => {
    if (activeTab === "all") return true;
    return disaster.event_type === activeTab;
  });

  // Get paginated disasters
  const getPaginatedDisasters = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDisasters.slice(startIndex, endIndex);
  };
  
  const paginatedDisasters = getPaginatedDisasters();

  // All supported disaster event types
  const allEventTypes = [
    "EQ", "FL", "TC", "DR", "WF", "TN", 
    "ET", "SW", "SI", "VO", "LS", "Misc"
  ];
  
  // Filter to only show tabs for event types that have data
  const activeEventTypes = [...new Set(disasters.map(d => d.event_type))];
  
  // Update total pages when filtered disasters change
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredDisasters.length / itemsPerPage)));
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filteredDisasters.length, itemsPerPage]);

  // Format a date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Calculate days since event occurred
  const getDaysSinceEvent = (dateString: string) => {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      
      const diffTime = today.getTime() - eventDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  // Get human-friendly event type
  const getEventTypeDetails = (type: string) => {
    return eventTypeMap[type] || { 
      label: type, 
      icon: AlertTriangle,
      color: "bg-gray-100 text-gray-800 border-gray-300"
    };
  };

  // Get event status based on created_time
  const getEventStatus = (dateString: string) => {
    const daysSinceEvent = getDaysSinceEvent(dateString);
    
    if (daysSinceEvent <= 1) {
      return { 
        status: "Active", 
        variant: "destructive" as "destructive" | "outline" | "secondary" 
      };
    } else if (daysSinceEvent <= 7) {
      return { 
        status: "Recent", 
        variant: "outline" as "destructive" | "outline" | "secondary"
      };
    } else {
      return { 
        status: "Past Event", 
        variant: "secondary" as "destructive" | "outline" | "secondary"
      };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold">Disaster Prediction & Alerts</h1>
              <p className="text-gray-600">Monitor natural disaster alerts and predictions for agricultural areas</p>
            </div>
          </div>
          
          <Button 
            onClick={fetchDisasters} 
            disabled={loading || refreshing} 
            className="flex items-center gap-2"
            variant="outline"
          >
            {refreshing ? 
              <Loader2 className="h-4 w-4 animate-spin" /> : 
              <RefreshCw className="h-4 w-4" />
            }
            Refresh
          </Button>
        </div>
        
        {lastUpdated && (
          <p className="text-sm text-muted-foreground mb-4">
            Last updated: {lastUpdated.toLocaleString('en-IN')}
          </p>
        )}
        
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Real-time Early Warning System</AlertTitle>
          <AlertDescription className="text-amber-700">
            Stay informed about potential natural disasters that could affect your farming activities. 
            Live data provided by Ambee API for disaster monitoring in India, covering earthquakes, 
            floods, cyclones, tsunamis, wildfires, droughts, and more.
          </AlertDescription>
        </Alert>
      </div>

      {/* Filter UI */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white rounded-lg shadow p-4 border">
        <div className="flex items-center gap-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[220px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{activeTab === "all" ? "All Disaster Events" : getEventTypeDetails(activeTab).label}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disaster Events</SelectItem>
              {allEventTypes.map(type => (
                <SelectItem 
                  key={type} 
                  value={type}
                  disabled={disasters.length > 0 && !activeEventTypes.includes(type)}
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(getEventTypeDetails(type).icon, { className: `h-4 w-4 ${activeEventTypes.includes(type) ? getEventTypeDetails(type).color.split(' ')[1] : ""}` })}
                    <span>{getEventTypeDetails(type).label}</span>
                    {disasters.length > 0 && !activeEventTypes.includes(type) && (
                      <span className="text-xs text-muted-foreground">(No data)</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center">
            <div className="h-5 w-5 rounded-full bg-green-600 mr-1"></div>
            <span className="text-xs text-muted-foreground mr-3">Active</span>
            
            <div className="h-5 w-5 rounded-full bg-yellow-500 mr-1"></div>
            <span className="text-xs text-muted-foreground mr-3">Recent</span>
            
            <div className="h-5 w-5 rounded-full bg-gray-400 mr-1"></div>
            <span className="text-xs text-muted-foreground">Past</span>
          </div>
        </div>
        
        <Select 
          value={itemsPerPage.toString()} 
          onValueChange={(value) => setItemsPerPage(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <span>{itemsPerPage} items per page</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 items per page</SelectItem>
            <SelectItem value="10">10 items per page</SelectItem>
            <SelectItem value="20">20 items per page</SelectItem>
            <SelectItem value="50">50 items per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-6">
        {/* Main Content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-8 w-2/3 mb-2" />
                    <Skeleton className="h-5 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error && disasters.length === 0 ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="mb-4">
                {error}
              </AlertDescription>
              <div className="flex justify-center">
                <Button variant="outline" onClick={fetchDisasters}>
                  {refreshing ? 
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 
                    <RefreshCw className="h-4 w-4 mr-2" />
                  }
                  Connect to Real-time API
                </Button>
              </div>
            </Alert>
          ) : filteredDisasters.length > 0 ? (
            <div className="space-y-6">
              {/* Desktop View - Table Format */}
              <div className="hidden md:block">
                <Card className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Event Type</TableHead>
                        <TableHead>Location & Details</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDisasters.map(disaster => {
                        const eventType = getEventTypeDetails(disaster.event_type);
                        const EventIcon = eventType.icon;
                        const daysSince = getDaysSinceEvent(disaster.date);
                        const eventStatus = getEventStatus(disaster.date);
                        
                        return (
                          <TableRow key={disaster.event_id}>
                            <TableCell>
                              <Badge variant="outline" className={`flex gap-1 items-center px-2 py-1 ${eventType.color}`}>
                                <EventIcon className="h-4 w-4" />
                                <span>{eventType.label}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{disaster.event_name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>
                                  {disaster.lat.toFixed(3)}°, {disaster.lng.toFixed(3)}°
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{formatDate(disaster.date).split(',')[0]}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{formatDate(disaster.date).split(',')[1]?.trim() || ''}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={eventStatus.variant} className={eventStatus.status === "Active" ? "bg-green-600 hover:bg-green-700" : eventStatus.status === "Recent" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 hover:bg-gray-500"}>
                                {eventStatus.status} {daysSince > 0 ? `(${daysSince}d ago)` : ''}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </div>
              
              {/* Mobile View - Card Format */}
              <div className="md:hidden space-y-4">
                {paginatedDisasters.map(disaster => {
                  const eventType = getEventTypeDetails(disaster.event_type);
                  const EventIcon = eventType.icon;
                  const daysSince = getDaysSinceEvent(disaster.date);
                  const eventStatus = getEventStatus(disaster.date);
                  
                  return (
                    <Card key={disaster.event_id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className={`flex gap-1 items-center px-2 py-1 ${eventType.color}`}>
                            <EventIcon className="h-4 w-4" />
                            <span>{eventType.label}</span>
                          </Badge>
                          
                          <Badge variant={eventStatus.variant} className={eventStatus.status === "Active" ? "bg-green-600 hover:bg-green-700" : eventStatus.status === "Recent" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 hover:bg-gray-500"}>
                            {eventStatus.status}
                          </Badge>
                        </div>
                        <CardTitle className="mt-3 text-lg">{disaster.event_name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>
                            {disaster.lat.toFixed(3)}°, {disaster.lng.toFixed(3)}°
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Event Date:</span>
                            <span className="ml-1">{formatDate(disaster.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Reported:</span>
                            <span className="ml-1">{formatDate(disaster.created_time)}</span>
                          </div>
                          {daysSince > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Event occurred {daysSince} days ago
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {filteredDisasters.length > 0 && (
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min(filteredDisasters.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredDisasters.length, currentPage * itemsPerPage)} of {filteredDisasters.length} events
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No disaster events found</h3>
              <p className="text-muted-foreground mt-2">
                {activeTab !== "all" 
                  ? `No ${getEventTypeDetails(activeTab).label} events were found.`
                  : "No active disasters matching your criteria were found."
                }
              </p>
              <Button variant="outline" className="mt-4" onClick={fetchDisasters}>
                {refreshing ? 
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 
                  <RefreshCw className="h-4 w-4 mr-2" />
                }
                Refresh Data
              </Button>
            </Card>
          )}
      </div>

      {/* We've removed the API Response metadata section as requested */}

      {/* Raw API Results Display - Important Fields Only */}
      {/* {apiResponse && apiResponse.result && apiResponse.result.length > 0 && (
        <div className="mt-8">
          <Card className="bg-white shadow-md">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-xl flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                Current Disaster Data
              </CardTitle>
              <CardDescription>
                Showing key information about detected disasters
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left border-b font-medium">Type</th>
                      <th className="p-2 text-left border-b font-medium">Event Name</th>
                      <th className="p-2 text-left border-b font-medium">Location</th>
                      <th className="p-2 text-left border-b font-medium">Date</th>
                      <th className="p-2 text-left border-b font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiResponse.result.slice(0, 10).map((event) => {
                      const eventType = getEventTypeDetails(event.event_type);
                      const EventIcon = eventType.icon;
                      const daysSince = getDaysSinceEvent(event.date);
                      const eventStatus = getEventStatus(event.date);
                      
                      return (
                        <tr key={event.event_id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <EventIcon className={`h-4 w-4 ${eventType.color.split(' ')[1]}`} />
                              <span className="font-medium">{eventType.label}</span>
                            </div>
                          </td>
                          <td className="p-2">{event.event_name}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span>{event.lat.toFixed(2)}°, {event.lng.toFixed(2)}°</span>
                            </div>
                          </td>
                          <td className="p-2">
                            {formatDate(event.date).split(',')[0]}
                            <div className="text-xs text-gray-500">
                              {formatDate(event.date).split(',')[1]?.trim() || ''}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge className={
                              eventStatus.status === "Active" ? "bg-green-600" : 
                              eventStatus.status === "Recent" ? "bg-yellow-500" : 
                              "bg-gray-400"
                            }>
                              {eventStatus.status}
                              {daysSince > 0 && <span className="text-xs ml-1">({daysSince}d ago)</span>}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {apiResponse.result.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing 10 of {apiResponse.result.length} total disaster events
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )} */}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">How to Use This Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-base mb-2">Earthquake Alerts (EQ)</h3>
              <p className="text-sm text-muted-foreground">
                Monitor for potential damage to irrigation systems and water sources. Secure farm structures and equipment.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-base mb-2">Flood Warnings (FL)</h3>
              <p className="text-sm text-muted-foreground">
                Move livestock and equipment to higher ground. Create drainage channels to divert excess water.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-base mb-2">Cyclone Forecasts (TC)</h3>
              <p className="text-sm text-muted-foreground">
                Harvest mature crops early. Reinforce farm structures and create windbreaks to protect sensitive crops.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-base mb-2">Drought Conditions (DR)</h3>
              <p className="text-sm text-muted-foreground">
                Implement water conservation practices. Consider planting drought-resistant crops and using mulch to retain moisture.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-base mb-2">Tsunami Warnings (TN)</h3>
              <p className="text-sm text-muted-foreground">
                Evacuate coastal farm areas immediately. Move livestock and equipment to higher ground at least 2km inland or 30m above sea level.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-base mb-2">Extreme Temperature (ET)</h3>
              <p className="text-sm text-muted-foreground">
                Provide shade and extra water for crops and livestock. Use row covers to protect plants from excessive heat or cold.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-base mb-2">Severe Storms (SW)</h3>
              <p className="text-sm text-muted-foreground">
                Secure loose items that could become projectiles. Install lightning rods to protect key farm structures.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-base mb-2">Landslides (LS)</h3>
              <p className="text-sm text-muted-foreground">
                Avoid farming on steep slopes during alerts. Create diversion channels to redirect water flow away from unstable areas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
