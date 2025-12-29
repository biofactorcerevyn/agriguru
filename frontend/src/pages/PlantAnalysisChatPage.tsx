import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Bot, User, Leaf, Globe, Check, Lightbulb, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  imageUrl?: string;
}

/**
 * Language support mapping between frontend and API
 * 
 * Frontend languages from LanguageContext.tsx:
 * - ar (Arabic)             - id (Bahasa Indonesia)
 * - bn (Bengali)            - en (English)
 * - fr (French)             - de (German)
 * - gu (Gujarati)           - hi (Hindi)
 * - kn (Kannada)            - ml (Malayalam)
 * - mr (Marathi)            - or (Oriya)
 * - pa (Panjabi)            - pl (Polish)
 * - pt (Portuguese)         - es (Spanish)
 * - sw (Swahili)            - ta (Tamil)
 * - te (Telugu)             - ur (Urdu)
 * - vi (Vietnamese)
 * 
 * API languages from ML/Llama/app.py:
 * - en (English)            - hi (Hindi)
 * - gu (Gujarati)           - ma (Marathi)
 * - pa (Punjabi)            - ur (Urdu)
 * - ka (Kashmiri)           - raj (Rajasthani)
 * - bho (Bhojpuri)          - ne (Nepali)
 * - ta (Tamil)              - te (Telugu)
 * - kn (Kannada)            - ml (Malayalam)
 * - tulu (Tulu)
 */

// API supported language codes from ML/Llama/app.py
const API_SUPPORTED_LANGUAGES = [
  'en', 'hi', 'gu', 'ma', 'pa', 'ur', 'ka', 'raj', 
  'bho', 'ne', 'ta', 'te', 'kn', 'ml', 'tulu'
];

// Complete mapping between app language codes and API language codes
const languageCodeMapping: Record<string, string> = {
  // Direct matches
  'en': 'en',    // English
  'hi': 'hi',    // Hindi
  'gu': 'gu',    // Gujarati
  'pa': 'pa',    // Punjabi
  'ur': 'ur',    // Urdu
  'kn': 'kn',    // Kannada
  'ml': 'ml',    // Malayalam
  'ta': 'ta',    // Tamil
  'te': 'te',    // Telugu
  
  // Special cases - frontend code to API code
  'mr': 'ma',    // Marathi (frontend: mr, API: ma)
  
  // Languages in frontend not directly in API - map to closest matches
  'ar': 'ur',    // Arabic -> Urdu (both RTL Semitic languages)
  'bn': 'hi',    // Bengali -> Hindi (both Indo-Aryan languages)
  'id': 'en',    // Bahasa Indonesia -> English
  'fr': 'en',    // French -> English
  'de': 'en',    // German -> English
  'or': 'hi',    // Oriya -> Hindi (both Indo-Aryan languages)
  'pl': 'en',    // Polish -> English
  'pt': 'en',    // Portuguese -> English
  'es': 'en',    // Spanish -> English
  'sw': 'en',    // Swahili -> English
  'vi': 'en',    // Vietnamese -> English
  
  // API-only languages (for completeness) - these won't typically be used from frontend
  // but are included for reference and future-proofing
  'ka': 'ka',    // Kashmiri
  'raj': 'raj',  // Rajasthani
  'bho': 'bho',  // Bhojpuri
  'ne': 'ne',    // Nepali
  'tulu': 'tulu' // Tulu
};

// Get API language code from app language code
const getApiLanguageCode = (appCode: string): string => {
  return languageCodeMapping[appCode] || 'en'; // Default to English if mapping not found
};

const quickQuestions = [
  "What's wrong with my rice crop?",
  "Best fertilizer for wheat in winter?",
  "How to prevent pest attacks?",
  "When should I harvest my crop?",
  "Soil preparation tips for next season",
  "Organic farming methods"
];

const expertTopics = [
  { icon: "🌱", title: "Crop Selection", desc: "Best crops for your region" },
  { icon: "💧", title: "Irrigation", desc: "Water management tips" },
  { icon: "🐛", title: "Pest Control", desc: "Natural pest solutions" },
  { icon: "🌾", title: "Harvest Time", desc: "Optimal harvesting advice" },
  { icon: "💰", title: "Market Prices", desc: "Current market trends" },
  { icon: "🌡️", title: "Weather Impact", desc: "Weather-based farming" }
];

export default function PlantAnalysisChatPage() {
  // Default welcome message
  const welcomeMessage: Message = {
    id: "1",
    type: "bot",
    content: "Hello! I'm your AI farming assistant. I can help you with crop diseases, fertilizer recommendations, pest control, and general farming advice. What would you like to know?",
    timestamp: new Date(),
    suggestions: quickQuestions.slice(0, 3)
  };

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Initialize messages from localStorage or default message
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('plantAnalysisChatPage');
      if (savedMessages) {
        // Parse stored messages and fix timestamp (convert strings back to Date objects)
        const parsedMessages = JSON.parse(savedMessages);
        const fixedMessages = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(fixedMessages);
      } else {
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat history from localStorage:', error);
      setMessages([welcomeMessage]);
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('plantAnalysisChatPage', JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history to localStorage:', error);
        toast({
          title: "Storage Error",
          description: "Could not save chat history",
          variant: "destructive"
        });
      }
    }
  }, [messages, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): Message => {
    const responses = {
      "rice": {
        content: "For rice crops, I can help with several common issues:\n\n🌾 **Common Rice Problems:**\n• Brown spots on leaves (Brown spot disease)\n• Yellowing leaves (Nitrogen deficiency)\n• Stunted growth (Poor drainage)\n• Pest attacks (Stem borer, BPH)\n\n💡 **Quick Solutions:**\n• Ensure proper drainage\n• Apply balanced NPK fertilizer\n• Use resistant varieties\n• Monitor for pests regularly\n\nCould you describe the specific symptoms you're seeing?",
        suggestions: ["Brown spots on leaves", "Yellowing of plants", "Pest problems", "Low yield issues"]
      },
      "fertilizer": {
        content: "🧪 **Fertilizer Recommendations:**\n\nFor optimal crop nutrition, consider:\n\n**Primary Nutrients:**\n• Nitrogen (N): For leaf growth\n• Phosphorus (P): For root development\n• Potassium (K): For disease resistance\n\n**Application Tips:**\n• Soil test first for accurate needs\n• Split nitrogen applications\n• Apply phosphorus at planting\n• Use organic matter for long-term health\n\nWhat crop are you growing and what's your soil type?",
        suggestions: ["Rice fertilizer", "Wheat fertilizer", "Vegetable fertilizer", "Organic options"]
      },
      "pest": {
        content: "🐛 **Integrated Pest Management:**\n\n**Natural Methods:**\n• Neem oil spray (5ml/liter)\n• Beneficial insects (ladybugs, spiders)\n• Crop rotation\n• Companion planting\n\n**Monitoring:**\n• Weekly field inspection\n• Yellow sticky traps\n• Pheromone traps\n\n**Chemical Control (if needed):**\n• Use only when threshold reached\n• Rotate different chemicals\n• Follow safety guidelines\n\nWhat pests are you dealing with?",
        suggestions: ["Aphids", "Caterpillars", "Stem borer", "Whiteflies"]
      },
      "harvest": {
        content: "🌾 **Harvest Timing Guide:**\n\n**Visual Indicators:**\n• Grain color change (golden/brown)\n• Moisture content (20-25% for rice)\n• Plant maturity (check seed development)\n\n**Testing Methods:**\n• Bite test for hardness\n• Moisture meter reading\n• Field sampling\n\n**Weather Considerations:**\n• Avoid harvesting in rain\n• Early morning is best\n• Check 7-day weather forecast\n\nWhich crop are you planning to harvest?",
        suggestions: ["Rice harvest", "Wheat harvest", "Vegetable harvest", "Storage tips"]
      },
      "default": {
        content: "I understand you're asking about farming. I can help with:\n\n🌱 **Crop Management**\n• Disease diagnosis\n• Nutrient deficiencies\n• Growth problems\n\n🧪 **Fertilizer & Nutrition**\n• NPK recommendations\n• Organic alternatives\n• Application timing\n\n🐛 **Pest & Disease Control**\n• Natural solutions\n• Chemical options\n• Prevention strategies\n\n🌾 **Harvest & Post-Harvest**\n• Timing decisions\n• Storage methods\n• Quality maintenance\n\nCould you be more specific about your farming question?",
        suggestions: ["Crop diseases", "Fertilizer advice", "Pest control", "Harvest timing"]
      }
    };

    const lowerMessage = userMessage.toLowerCase();
    let responseKey = "default";

    if (lowerMessage.includes("rice") || lowerMessage.includes("paddy")) {
      responseKey = "rice";
    } else if (lowerMessage.includes("fertilizer") || lowerMessage.includes("nutrient")) {
      responseKey = "fertilizer";
    } else if (lowerMessage.includes("pest") || lowerMessage.includes("insect") || lowerMessage.includes("bug")) {
      responseKey = "pest";
    } else if (lowerMessage.includes("harvest") || lowerMessage.includes("when to cut")) {
      responseKey = "harvest";
    }

    const response = responses[responseKey as keyof typeof responses];
    
    return {
      id: Date.now().toString(),
      type: "bot",
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions
    };
  };

  const { currentLanguage, setLanguage } = useLanguage();

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Call the actual /chat API endpoint from ML/Llama/app.py
      // Map the app language code to API-supported language code
      const apiLanguageCode = getApiLanguageCode(currentLanguage.code);
      
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          language: apiLanguageCode
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Create bot response using the API response
      const botResponse: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: data.response,
        timestamp: new Date(),
        suggestions: [
          "Tell me more about rice cultivation",
          "Best crops for this season",
          "How to improve soil fertility"
        ]
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error in chat:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to connect to AI service',
        variant: "destructive"
      });
      
      // Add error message
      const errorResponse: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4">
          <div className="text-center pt-6 pb-8">
            <h1 className="text-2xl font-bold text-foreground">AgriGuru AI Assistant</h1>
            <p className="text-muted-foreground mt-1">Using {currentLanguage.name} • Specialized in agricultural knowledge</p>
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AgriGuru AI Assistant</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Online • Responds in seconds
                    </div>
                  </div>
                </div>
                
                {/* Clear chat history button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    localStorage.removeItem('plantAnalysisChatPage');
                    setMessages([welcomeMessage]);
                    toast({
                      description: "Chat history cleared",
                    });
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-primary ml-2" : "bg-muted mr-2"
                    }`}>
                      {message.type === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === "user" 
                        ? "bg-primary text-white" 
                        : "bg-muted"
                    }`}>
                      {message.type === "user" ? (
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      ) : (
                        <div className="text-sm prose prose-sm prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-headings:font-medium max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${
                        message.type === "user" ? "text-white/70" : "text-muted-foreground"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Suggestions */}
              {messages.length > 0 && messages[messages.length - 1].suggestions && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted mr-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white shadow-md">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about crops, diseases, fertilizers, pests..."
                  className="flex-1"
                />
                <Button 
                  onClick={() => sendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => sendMessage(question)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
