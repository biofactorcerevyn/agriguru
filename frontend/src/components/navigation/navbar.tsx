import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sprout } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-natural">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-md">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">AgriGuru</span>
          </Link>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
              className="font-medium"
            >
              Login
            </Button>
            <Button 
              variant="default" 
              onClick={() => navigate("/auth")}
              className="font-medium"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-muted transition-natural"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/features" 
                className="text-foreground hover:text-primary transition-natural font-medium px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-foreground hover:text-primary transition-natural font-medium px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary transition-natural font-medium px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary transition-natural font-medium px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  Login
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};