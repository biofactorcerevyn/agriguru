import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";



export default function Auth() {
//skip login/signup for testing
  

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    farmLocation: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in to AgriGuru.",
          });
          navigate('/dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            // Remove emailRedirectTo to prevent email confirmation flow
            data: {
              full_name: formData.name,
              phone_number: formData.phone,
              farm_location: formData.farmLocation,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Account created!",
            description: "Please complete your farmer profile to get personalized recommendations.",
          });
          navigate('/onboarding');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-natural"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="card-agricultural p-8 backdrop-blur-sm bg-white/95">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">AgriGuru</span>
          </div>

          {/* Auth Toggle */}
          <div className="flex bg-muted rounded-lg p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-natural ${
                isLogin 
                  ? "bg-white shadow-natural text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-natural ${
                !isLogin 
                  ? "bg-white shadow-natural text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required={!isLogin}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                className="mt-1"
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required={!isLogin}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                className="mt-1"
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="farmLocation">Farm Location (City/District)</Label>
                <Input
                  id="farmLocation"
                  name="farmLocation"
                  type="text"
                  value={formData.farmLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., Ludhiana, Punjab"
                  required={!isLogin}
                  className="mt-1"
                />
              </div>
            )}

            <Button 
              type="submit" 
              variant="gradient" 
              className="w-full text-lg py-3"
              disabled={loading}
            >
              {loading ? "Please wait..." : (isLogin ? "Login to AgriGuru" : "Create Farmer Account")}
            </Button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {isLogin ? "New to AgriGuru?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Create account" : "Login here"}
              </button>
            </p>

            {isLogin && (
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            )}
          </div>

          {/* Social Proof */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Trusted by 10,000+ farmers across India
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <span>🌾 Punjab</span>
                <span>🌾 Maharashtra</span>
                <span>🌾 Karnataka</span>
                <span>🌾 Tamil Nadu</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Benefits */}
        <div className="mt-8 text-center text-white/80 text-sm">
          <p className="mb-2">Why farmers choose AgriGuru:</p>
          <div className="space-y-1">
            <p>✓ 25% average yield increase</p>
            <p>✓ 30% reduction in input costs</p>
            <p>✓ Expert guidance & community support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
