import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Mic, Send, Loader2, Leaf, Globe, Check, Info, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactMarkdown from 'react-markdown';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

// API supported language codes
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
  
  // API-only languages (for completeness)
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

// Available languages for the UI (based on frontend and API mappings)
const availableLanguages: Record<string, { name: string; nativeName: string }> = {
  // Direct matches
  'en': { name: 'English', nativeName: 'English' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी' },
  'gu': { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  'ur': { name: 'Urdu', nativeName: 'اردو' },
  'kn': { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  'ml': { name: 'Malayalam', nativeName: 'മലയാളം' },
  'ta': { name: 'Tamil', nativeName: 'தமிழ்' },
  'te': { name: 'Telugu', nativeName: 'తెలుగు' },
  'mr': { name: 'Marathi', nativeName: 'मराठी' },
  // Additional languages from SUPPORTED_LANGUAGES in LanguageContext.tsx
  'ar': { name: 'Arabic', nativeName: 'العربية' },
  'id': { name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia' },
  'bn': { name: 'Bengali', nativeName: 'বাংলা' },
  'fr': { name: 'French', nativeName: 'Français' },
  'de': { name: 'German', nativeName: 'Deutsch' },
  'or': { name: 'Oriya', nativeName: 'ଓଡ଼ିଆ' },
  'pl': { name: 'Polish', nativeName: 'Polski' },
  'pt': { name: 'Portuguese', nativeName: 'Português' },
  'es': { name: 'Spanish', nativeName: 'Español' },
  'sw': { name: 'Swahili', nativeName: 'Kiswahili' },
  'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt' }
};

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
}

export default function PlantAnalysisChat() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage, setLanguage } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Default welcome message
  const welcomeMessage = {
    id: 1,
    text: "Hello! I'm AgriGuru's AI agricultural assistant. How can I help you with your farming questions today?",
    isUser: false
  };
  
  // State for messages with localStorage persistence
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('plantAnalysisChat');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
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
      localStorage.setItem('plantAnalysisChat', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true
    };
    
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: "",
      isUser: false,
      isLoading: true
    };
    
    // Add the user message and loading indicator to chat
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputText("");
    setError(null);
    setIsLoading(true);
    
    try {
      // Map the app language code to API-supported language code
      const apiLanguageCode = getApiLanguageCode(currentLanguage.code);
      
      // Call the /chat endpoint
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.text,
          language: apiLanguageCode
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from AI');
      }
      
      // Replace loading message with the actual response
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? {
          id: Date.now() + 2,
          text: data.response,
          isUser: false,
          isLoading: false
        } : msg
      ));
    } catch (err) {
      console.error("Error in chat:", err);
      setError(err instanceof Error ? err.message : 'Failed to connect to AI service');
      
      // Replace loading message with error
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now() + 3,
        text: "Sorry, I encountered an error while processing your request. Please try again later.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLanguageCodeForSpeech(currentLanguage.code);

      recognition.onstart = () => {
        setIsRecording(true);
        toast({
          title: "Listening...",
          description: "Speak your question now.",
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
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
    setIsRecording(false);
  };

  const getLanguageCodeForSpeech = (langCode: string): string => {
    const speechCodes: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'bn': 'bn-IN',
      'pa': 'pa-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'ur': 'ur-IN',
    };
    return speechCodes[langCode] || 'en-IN';
  };
  
  const clearChatHistory = () => {
    localStorage.removeItem('plantAnalysisChat');
    setMessages([welcomeMessage]);
    toast({
      description: "Chat history cleared",
    });
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-background">
      <div className="flex h-full flex-col">
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 h-full">
          <div className="text-center pt-4 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Plant Analysis Chat</h1>
            <p className="text-muted-foreground mt-1">
              Get instant AI-powered advice about your crops in {currentLanguage.name}
            </p>
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header with Language Selection */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AgriGuru AI Assistant</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Using {currentLanguage.name} • Agricultural Expert</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select 
                    value={currentLanguage.code || 'en'}
                    onValueChange={(value) => {
                      const langInfo = availableLanguages[value as keyof typeof availableLanguages];
                      if (langInfo) {
                        setLanguage({ 
                          code: value, 
                          name: langInfo.name,
                          nativeName: langInfo.nativeName 
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <Globe className="h-3.5 w-3.5 mr-2" />
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableLanguages).map(([code, langInfo]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center justify-between w-full">
                            <span>{langInfo.name}</span>
                            {code === currentLanguage.code && <Check className="h-4 w-4 ml-2" />}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Clear chat history button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive h-8"
                    onClick={clearChatHistory}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">Clear History</span>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground mt-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation about your crops</p>
                  <p className="text-sm mt-2">Ask in {currentLanguage.name}</p>
                  
                  <div className="mt-8 p-4 bg-muted/40 rounded-lg max-w-md mx-auto">
                    <h3 className="font-medium text-sm mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Sample Topics:
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• District-level crop yield data</li>
                      <li>• Seasonal planting recommendations</li>
                      <li>• Historical price trends for crops</li>
                      <li>• Regional specializations and best practices</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.isUser ? 'bg-primary ml-2' : 'bg-muted mr-2'
                        }`}>
                          {message.isUser ? (
                            <MessageSquare className="h-4 w-4 text-white" />
                          ) : (
                            <Leaf className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        {message.isLoading ? (
                          <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            <span className="text-sm text-muted-foreground ml-2">Analyzing your question...</span>
                          </div>
                        ) : (
                          <div className={`rounded-lg p-3 ${
                            message.isUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            {message.isUser ? (
                              <div className="text-sm">
                                <span>{message.text}</span>
                              </div>
                            ) : (
                              <div className="text-sm prose prose-sm prose-p:text-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground max-w-none">
                                <ReactMarkdown>{message.text}</ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} /> {/* Scroll anchor */}
                </div>
              )}
            </div>
            
            {/* Quick Question Buttons */}
            <div className="py-2 px-4 border-t border-b flex gap-2 overflow-x-auto">
              {[
                "What should I plant this season?",
                "How to treat yellow leaves?",
                "Best fertilizer for my soil?",
                "When to harvest?"
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap text-xs"
                  onClick={() => setInputText(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
            
            {/* Input */}
            <div className="p-4 bg-background shadow-sm">
              <div className="flex space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Ask about your crops in ${currentLanguage.name}...`}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceRecord}
                  className={isRecording ? 'bg-red-500 text-white' : ''}
                  disabled={isLoading}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputText.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
