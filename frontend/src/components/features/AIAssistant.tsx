import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, Bot, User, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language?: string;
}

interface AIAssistantProps {
  farmerProfile?: {
    full_name: string;
    state: string;
    district: string;
    experience_level: string;
    preferred_language: string;
  };
}

export default function AIAssistant({ farmerProfile }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: farmerProfile 
        ? `Namaste ${farmerProfile.full_name}! I'm your AI farming assistant. I can help you with crop recommendations, weather updates, yield predictions, and market prices for ${farmerProfile.district}, ${farmerProfile.state}. How can I assist you today?`
        : "Hello! I'm your AI farming assistant. I can help you with crop recommendations, weather updates, yield predictions, and market prices. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(farmerProfile?.preferred_language || 'english');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिंदी (Hindi)' },
    { value: 'tamil', label: 'தமிழ் (Tamil)' },
    { value: 'telugu', label: 'తెలుగు (Telugu)' },
    { value: 'marathi', label: 'मराठी (Marathi)' },
    { value: 'gujarati', label: 'ગુજરાતી (Gujarati)' },
    { value: 'bengali', label: 'বাংলা (Bengali)' },
    { value: 'punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { value: 'kannada', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'malayalam', label: 'മലയാളം (Malayalam)' }
  ];

  const quickQuestions = [
    {
      question: "What crop should I plant now?",
      icon: "🌱",
      category: "crop_recommendation"
    },
    {
      question: "How much yield can I expect?",
      icon: "📈",
      category: "yield_prediction"
    },
    {
      question: "What's the weather forecast?",
      icon: "🌤️",
      category: "weather_forecast"
    },
    {
      question: "What are current market prices?",
      icon: "💰",
      category: "market_prices"
    }
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || currentMessage.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Simulate AI response (in real implementation, this would call your AI service)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = generateAIResponse(text, farmerProfile);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        language: selectedLanguage
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (question: string, profile?: any): string => {
    const location = profile ? `${profile.district}, ${profile.state}` : "your area";
    const experience = profile?.experience_level || "farmer";
    
    if (question.toLowerCase().includes('crop') || question.toLowerCase().includes('plant')) {
      return `Based on the current season and conditions in ${location}, I recommend considering these crops:

🌾 **Rabi Season Crops** (if it's winter season):
- Wheat (good market demand)
- Mustard (oil prices are stable)
- Chickpea (high protein content, good returns)

🌱 **Factors I considered**:
- Your location: ${location}
- Experience level: ${experience}
- Current market trends
- Seasonal weather patterns

Would you like detailed information about any specific crop, including cultivation practices and expected yields?`;
    }

    if (question.toLowerCase().includes('yield') || question.toLowerCase().includes('expect')) {
      return `For yield predictions in ${location}, here's what I can estimate:

📈 **Expected Yields** (based on your profile):
- Wheat: 40-45 quintals/hectare
- Rice: 55-60 quintals/hectare  
- Sugarcane: 700-800 quintals/hectare

🎯 **Factors affecting yield**:
- Soil quality and type
- Weather conditions
- Fertilizer management
- Pest and disease control

As a ${experience} farmer, I recommend focusing on proper soil preparation and timely irrigation for optimal yields. Would you like specific tips for any crop?`;
    }

    if (question.toLowerCase().includes('weather') || question.toLowerCase().includes('forecast')) {
      return `🌤️ **Weather Forecast for ${location}**:

**Next 7 days**:
- Temperature: 18-25°C
- Humidity: 65-75%
- Rainfall: Light showers expected in 3-4 days
- Wind: 10-15 km/h

🚨 **Agricultural Alerts**:
- Good time for land preparation
- Consider protective measures for young crops
- Irrigation may not be needed for next week

**Recommendations**:
- Complete sowing operations before rain
- Prepare drainage systems
- Monitor for fungal diseases post-rainfall

Would you like detailed weather information for specific farming activities?`;
    }

    if (question.toLowerCase().includes('price') || question.toLowerCase().includes('market')) {
      return `💰 **Current Market Prices in ${location}**:

**Grain Prices** (per quintal):
- Wheat: ₹2,100 - ₹2,200
- Rice: ₹2,000 - ₹2,150
- Maize: ₹1,800 - ₹1,900

**Vegetable Prices**:
- Onion: ₹25 - ₹30/kg
- Potato: ₹20 - ₹25/kg
- Tomato: ₹40 - ₹50/kg

📊 **Market Trends**:
- Wheat prices are stable
- Vegetable prices may rise due to season
- Good demand for organic produce

**Best Markets**: Local mandi in ${profile?.district || 'your district'} offers competitive rates. Would you like specific information about any crop prices or selling strategies?`;
    }

    return `Thank you for your question! As your AI farming assistant, I can help you with:

🌱 **Crop Recommendations** - Best crops for your location and season
📈 **Yield Predictions** - Expected output based on your farming practices  
🌤️ **Weather Forecasts** - Agricultural weather insights
💰 **Market Prices** - Current rates and selling opportunities

I have information specific to ${location} and can provide advice suitable for a ${experience} farmer. Please ask me about any of these topics, and I'll provide detailed, actionable insights!`;
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLanguageCode(selectedLanguage);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const getLanguageCode = (lang: string): string => {
    const codes: { [key: string]: string } = {
      'english': 'en-IN',
      'hindi': 'hi-IN',
      'tamil': 'ta-IN',
      'telugu': 'te-IN',
      'marathi': 'mr-IN',
      'gujarati': 'gu-IN',
      'bengali': 'bn-IN',
      'punjabi': 'pa-IN',
      'kannada': 'kn-IN',
      'malayalam': 'ml-IN'
    };
    return codes[lang] || 'en-IN';
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(selectedLanguage);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="card-agricultural backdrop-blur-sm bg-white/95 h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">AI Farming Assistant</h1>
                  <p className="text-sm text-muted-foreground">
                    Get instant agricultural advice in your language
                  </p>
                </div>
              </div>
              
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Quick Questions:</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-3 justify-start"
                  onClick={() => handleSendMessage(q.question)}
                >
                  <span className="mr-2">{q.icon}</span>
                  <span className="text-xs">{q.question}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'ai' && (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      {message.sender === 'user' && (
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.sender === 'ai' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakMessage(message.content)}
                              className="h-6 w-6 p-0"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me about crops, weather, yields, or market prices..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceToggle}
                disabled={isLoading}
                className={isListening ? "bg-destructive text-destructive-foreground" : ""}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!currentMessage.trim() || isLoading}
                variant="farmer"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Ask questions in {languages.find(l => l.value === selectedLanguage)?.label} • Voice supported
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}