import { Navbar } from "@/components/navigation/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Smartphone, 
  Cloud, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="text-gradient">AgriGuru</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of farming with our comprehensive AI-powered platform designed specifically for Indian agriculture.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-feature">
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-4">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mobile-First Design</h3>
              <p className="text-muted-foreground">
                Optimized for smartphones with offline capabilities, perfect for rural connectivity.
              </p>
            </Card>
            
            <Card className="card-feature">
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-4">
                <Cloud className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Weather Intelligence</h3>
              <p className="text-muted-foreground">
                Hyperlocal weather forecasts with agricultural insights and risk alerts.
              </p>
            </Card>
            
            <Card className="card-feature">
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Analytics</h3>
              <p className="text-muted-foreground">
                Real-time commodity prices and demand forecasts to maximize profits.
              </p>
            </Card>
            
            <Card className="card-feature">
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Network</h3>
              <p className="text-muted-foreground">
                Connect with agricultural scientists and experienced farmers for guidance.
              </p>
            </Card>
            
            <Card className="card-feature">
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Crop Protection</h3>
              <p className="text-muted-foreground">
                AI-powered disease detection and pest management recommendations.
              </p>
            </Card>
            
            <Card className="card-feature">
              <div className="p-4 bg-primary/10 rounded-lg w-fit mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Automation</h3>
              <p className="text-muted-foreground">
                Automated reminders and scheduling for farming activities and inputs.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Proven Results for Indian Farmers
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">25% Average Yield Increase</h3>
                    <p className="text-muted-foreground">Data-driven recommendations lead to significantly higher crop yields.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">30% Reduction in Input Costs</h3>
                    <p className="text-muted-foreground">Optimize fertilizer and pesticide usage for maximum efficiency.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Real-time Market Access</h3>
                    <p className="text-muted-foreground">Connect directly with buyers and get fair prices for your produce.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Card className="p-6 bg-success/5 border-success/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <p className="text-muted-foreground italic">
                  "AgriGuru transformed my farming. My wheat yield increased by 40% and I reduced fertilizer costs significantly."
                </p>
                <div className="mt-4 font-medium">- Rajesh Kumar, Punjab</div>
              </Card>
              
              <Card className="p-6 bg-success/5 border-success/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold">Exceptional</span>
                </div>
                <p className="text-muted-foreground italic">
                  "The weather alerts saved my crops from unexpected rain. The app is very easy to use even for someone like me."
                </p>
                <div className="mt-4 font-medium">- Priya Sharma, Maharashtra</div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already increasing their yields and profits with AgriGuru's completely free AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
              Join Our Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary text-lg px-8 py-4">
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <span className="text-2xl">🌾</span>
              </div>
              <span className="text-2xl font-bold">AgriGuru</span>
            </div>
            <p className="text-primary-foreground/80 mb-4">
              Empowering Indian farmers with intelligent agricultural solutions.
            </p>
            <p className="text-primary-foreground/60 text-sm">
              © 2024 AgriGuru. All rights reserved. | Made with ❤️ for Indian farmers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
