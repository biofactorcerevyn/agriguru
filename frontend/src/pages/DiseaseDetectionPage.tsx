import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function DiseaseDetectionPage() {
  // Use context for language and toast
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNotPlant, setIsNotPlant] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Default welcome message
  const welcomeMessage = {
    id: 1,
    type: 'system' as const,
    content: `Hello! I'm AgriGuru's AI disease detection assistant. Upload or take a photo of your plant, and I'll analyze it to identify any diseases and provide treatment recommendations.`
  };
  
  // State for chat-like interface with localStorage persistence
  const [messages, setMessages] = useState<{
    id: number;
    type: 'system' | 'user' | 'ai';
    content: string;
    image?: string;
  }[]>([]);
  
  // Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('diseaseDetectionPage');
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
      localStorage.setItem('diseaseDetectionPage', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Add a message to the chat
  const addMessage = (type: 'system' | 'user' | 'ai', content: string, image?: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type,
      content,
      image
    }]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
        setIsNotPlant(false); // Reset non-plant error when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  // Create a reference for the video element to stream camera feed
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  const handleCameraCapture = async () => {
    try {
      // Get list of available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setVideoDevices(cameras);
      
      if (cameras.length > 0) {
        setSelectedCamera(cameras[0].deviceId);
      }
      
      // Start camera stream with more relaxed constraints
      const constraints = {
        video: { 
          deviceId: cameras.length > 0 ? { ideal: cameras[0].deviceId } : undefined,
          facingMode: { ideal: "environment" }, // Prefer back camera but don't require it
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      // First try with environment preference
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } catch (innerErr) {
        console.log("Could not use preferred camera, trying with default", innerErr);
        
        // If that fails, try with any camera
        const basicConstraints = {
          video: true
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please allow camera permissions or use the upload option.",
        variant: "destructive"
      });
      
      // Fallback to file input method if camera access fails
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.addEventListener('change', (e: Event) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setSelectedImage(e.target?.result as string);
            setAnalysisResult(null);
            setIsNotPlant(false);
          };
          reader.readAsDataURL(file);
        }
      });
      cameraInput.click();
    }
  };

  // Function to switch between cameras if multiple are available
  const switchCamera = async (deviceId: string) => {
    setSelectedCamera(deviceId);
    
    if (videoRef.current && videoRef.current.srcObject) {
      // Stop all tracks in the current stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      
      // Start new stream with selected camera
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } }
        });
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      } catch (err) {
        console.error("Error switching camera: ", err);
        toast({
          title: "Camera Error",
          description: "Could not switch cameras. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Function to take a snapshot from the video stream
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Make sure video is playing and has dimensions
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          console.log("Video not ready yet");
          return;
        }
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        console.log(`Canvas dimensions set to ${canvas.width}x${canvas.height}`);
        
        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear canvas first
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to data URL with quality parameter
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          console.log("Image captured successfully");
          
          // Verify we got a valid data URL
          if (imageDataUrl && imageDataUrl.startsWith('data:image/jpeg;base64,')) {
            setSelectedImage(imageDataUrl);
            
            // Stop camera stream
            const stream = video.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            
            setCameraActive(false);
          } else {
            console.error("Failed to create valid data URL");
          }
        }
      } catch (err) {
        console.error("Error taking snapshot:", err);
        
        // Fallback method for some mobile browsers
        try {
          const video = videoRef.current;
          // Use a fixed size if videoWidth/Height is not available
          const width = video.videoWidth || 640;
          const height = video.videoHeight || 480;
          
          // Create a temporary canvas
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          
          // Draw to this temporary canvas
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(video, 0, 0, width, height);
            const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
            setSelectedImage(dataUrl);
            
            // Stop camera stream
            const stream = video.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            
            setCameraActive(false);
          }
        } catch (err2) {
          console.error("Fallback snapshot method failed:", err2);
          toast({
            title: "Camera Error",
            description: "Unable to capture photo. Please try uploading an image instead.",
            variant: "destructive"
          });
        }
      }
    }
  };
  
  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Map frontend language codes to API language codes
  const getAPILanguageCode = (frontendCode: string): string => {
    // API language codes from ML/Llama/app.py
    const apiLanguages = {
      'en': 'en',    // English
      'hi': 'hi',    // Hindi
      'gu': 'gu',    // Gujarati
      'ma': 'ma',    // Marathi
      'pa': 'pa',    // Punjabi
      'ur': 'ur',    // Urdu
      'ka': 'ka',    // Kashmiri
      'raj': 'raj',  // Rajasthani
      'bho': 'bho',  // Bhojpuri
      'ne': 'ne',    // Nepali
      'ta': 'ta',    // Tamil
      'te': 'te',    // Telugu
      'kn': 'kn',    // Kannada
      'ml': 'ml',    // Malayalam
      'tulu': 'tulu' // Tulu
    };
    
    // Mapping of frontend codes to API codes with fallbacks
    const frontendToAPIMap: Record<string, string> = {
      'en': 'en',    // English
      'hi': 'hi',    // Hindi
      'bn': 'hi',    // Bengali -> Hindi fallback
      'te': 'te',    // Telugu
      'ta': 'ta',    // Tamil
      'mr': 'ma',    // Marathi
      'gu': 'gu',    // Gujarati
      'kn': 'kn',    // Kannada
      'ml': 'ml',    // Malayalam
      'pa': 'pa',    // Punjabi
      'or': 'hi',    // Odia -> Hindi fallback
      'as': 'ne',    // Assamese -> Nepali fallback
      'ur': 'ur',    // Urdu
      'ar': 'ur',    // Arabic -> Urdu fallback
      'zh': 'en',    // Chinese -> English fallback
      'es': 'en',    // Spanish -> English fallback
      'fr': 'en',    // French -> English fallback
      'de': 'en',    // German -> English fallback
      'ja': 'en',    // Japanese -> English fallback
      'ko': 'en',    // Korean -> English fallback
      'ru': 'en',    // Russian -> English fallback
      'pt': 'en',    // Portuguese -> English fallback
      'it': 'en'     // Italian -> English fallback
    };
    
    // Return mapped code or default to English if not found
    return frontendToAPIMap[frontendCode] || 'en';
  };

  // Function to analyze image and add results to chat
  // Function to scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const analyzeImageAndAddToChat = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    // Add user message with the image
    addMessage('user', 'Here is my plant image for diagnosis:', selectedImage);
    
      // Add AI thinking message
      const analysisMessageId = Date.now();
      addMessage('system', 'Analyzing your plant image...');
      
      // Reset states
      setMarkdownResponse("");
      setIsNotPlant(false);
      setIsValidating(true);
      setLoading(true);
    
    try {
      // Convert base64 data to a Blob
      const base64Response = await fetch(selectedImage);
      const blob = await base64Response.blob();
      
      // Create FormData and append the image file
      const formData = new FormData();
      formData.append('image', blob, 'plant-image.jpg');
      
      // Map frontend language code to API language code
      const apiLanguageCode = getAPILanguageCode(currentLanguage.code || 'en');
      formData.append('language', apiLanguageCode);
      
      console.log(`Using language for chat analysis: ${currentLanguage.name} (Frontend: ${currentLanguage.code}, API: ${apiLanguageCode})`);
      
      // Call the plant disease classification endpoint
      const response = await fetch('http://localhost:8000/classify_plant_disease', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze disease');
      }
      
      // Check if it's a valid plant image
      const isNonPlantImage = data.diagnosis.toLowerCase().includes("does not contain any plants") || 
                              data.diagnosis.toLowerCase().includes("not a plant") || 
                              data.diagnosis.toLowerCase().includes("unable to identify any plant");

      if (isNonPlantImage) {
        setIsNotPlant(true);
        setIsValidating(false);
        
        // Add error message to chat
        addMessage('ai', "I couldn't detect any plants in this image. Please upload a clear image of plant leaves, stems, or fruits for accurate disease detection.");
        
        toast({
          title: "Invalid Image",
          description: "The image does not appear to contain a plant.",
          variant: "destructive",
        });
      } else {
        // Store the markdown response
        setMarkdownResponse(data.diagnosis);
        
        // Remove the analyzing message and add the result
        setMessages(prev => prev.filter(msg => msg.content !== 'Analyzing your plant image...'));
        addMessage('ai', data.diagnosis);
        
        toast({
          title: "Analysis Complete",
          description: "Disease diagnosis complete!",
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      
      // Add error message to chat
      addMessage('ai', "Sorry, I encountered a problem analyzing your image. Please try again with a different image.");
      
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
      setIsValidating(false);
    } finally {
      setLoading(false);
    }
  };
  
  // State to store markdown response
  const [markdownResponse, setMarkdownResponse] = useState<string>("");

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-background">
      <div className="flex h-full flex-col">
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 h-full">
          <div className="text-center pt-4 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Plant Disease Detection</h1>
            <p className="text-muted-foreground mt-1">
              Using {currentLanguage.name} • Upload or capture plant images for diagnosis
            </p>
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Disease Diagnosis Assistant</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Ready • Upload an image to begin analysis
                    </div>
                  </div>
                </div>
                
                {/* Clear chat history button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    localStorage.removeItem('diseaseDetectionPage');
                    setMessages([welcomeMessage]);
                    toast({
                      description: "Chat history cleared",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
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
                        <Upload className="h-4 w-4 text-white" />
                      ) : (
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === "user" 
                        ? "bg-primary text-white" 
                        : "bg-muted"
                    }`}>
                      {message.content && (
                        <div className="text-sm">
                          {message.type === "ai" ? (
                            <div className="prose prose-sm prose-p:text-foreground prose-headings:text-foreground prose-headings:font-bold max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p>{message.content}</p>
                          )}
                        </div>
                      )}
                      {message.image && (
                        <div className="mt-2">
                          <img
                            src={message.image}
                            alt="Plant image"
                            className="rounded-md max-h-60 max-w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isValidating && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4 max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-sm text-muted-foreground">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Camera View */}
              {cameraActive && (
                <div className="flex flex-col items-center justify-center mb-6">
                  <Card className="p-4 w-full max-w-md">
                    <div className="relative">
                      <video 
                        ref={videoRef} 
                        className="w-full h-auto rounded-lg"
                        playsInline
                        autoPlay
                      />
                    </div>
                  </Card>
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Make the capture button more prominent and outside the video */}
                  <Button
                    size="lg"
                    className="mt-4 py-6 px-8 text-lg shadow-lg"
                    onClick={takeSnapshot}
                  >
                    <Camera className="h-6 w-6 mr-2" />
                    Capture Photo
                  </Button>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the button above to take a photo for disease analysis
                  </p>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t bg-background shadow-sm">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full h-10 w-10"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCameraCapture}
                  className="rounded-full h-10 w-10"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
                <Button
                  disabled={!selectedImage || isAnalyzing}
                  onClick={analyzeImageAndAddToChat}
                  className="flex-grow"
                >
                  {selectedImage && !cameraActive 
                    ? "Analyze Selected Image" 
                    : "Select an Image to Analyze"}
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
