import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sprout, Cloud, TrendingUp, Users } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent"></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Text */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Transform Your{" "}
                <span className="text-gradient bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                  Farming
                </span>{" "}
                with AI
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-2xl">
                AgriGuru empowers Indian farmers with intelligent crop recommendations, 
                weather forecasts, and market insights to maximize yields and profits.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                Start Farming Smarter
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary text-lg px-8 py-4">
                Join Community
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-white/80 text-sm">Active Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">25%</div>
                <div className="text-white/80 text-sm">Yield Increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">₹50L+</div>
                <div className="text-white/80 text-sm">Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-white/80 text-sm">Satisfaction Rate</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Feature Cards */}
          <div className="space-y-6">
            <Card className="card-agricultural p-6 backdrop-blur-sm bg-white/90">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Smart Crop Recommendations</h3>
                  <p className="text-muted-foreground">AI-powered suggestions based on soil, weather, and market conditions.</p>
                </div>
              </div>
            </Card>
            
            <Card className="card-agricultural p-6 backdrop-blur-sm bg-white/90">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Weather Intelligence</h3>
                  <p className="text-muted-foreground">Accurate forecasts and alerts to protect your crops.</p>
                </div>
              </div>
            </Card>
            
            <Card className="card-agricultural p-6 backdrop-blur-sm bg-white/90">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Market Insights</h3>
                  <p className="text-muted-foreground">Real-time pricing and demand analytics for better decisions.</p>
                </div>
              </div>
            </Card>
            
            <Card className="card-agricultural p-6 backdrop-blur-sm bg-white/90">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Expert Community</h3>
                  <p className="text-muted-foreground">Connect with agricultural experts and fellow farmers.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};