import { Button } from "@/components/ui/button";
import { Heart, Menu, Shield, Users, User } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  currentView: 'home' | 'user' | 'doctor' | 'admin';
  onViewChange: (view: 'home' | 'user' | 'doctor' | 'admin') => void;
}

const Header = ({ currentView, onViewChange }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card soft-shadow border-b sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer medical-transition hover:scale-105"
            onClick={() => onViewChange('home')}
          >
            <div className="p-2 bg-primary rounded-xl">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">SkinCare AI</h1>
              <p className="text-xs text-muted-foreground">Smart Diagnosis</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              onClick={() => onViewChange('home')}
              className="medical-transition"
            >
              Home
            </Button>
            <Button
              variant={currentView === 'user' ? 'default' : 'ghost'}
              onClick={() => onViewChange('user')}
              className="medical-transition"
            >
              <User className="w-4 h-4 mr-2" />
              Patient Portal
            </Button>
            <Button
              variant={currentView === 'doctor' ? 'default' : 'ghost'}
              onClick={() => onViewChange('doctor')}
              className="medical-transition"
            >
              <Users className="w-4 h-4 mr-2" />
              Doctor Portal
            </Button>
            <Button
              variant={currentView === 'admin' ? 'default' : 'ghost'}
              onClick={() => onViewChange('admin')}
              className="medical-transition"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                onClick={() => {
                  onViewChange('home');
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                Home
              </Button>
              <Button
                variant={currentView === 'user' ? 'default' : 'ghost'}
                onClick={() => {
                  onViewChange('user');
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Patient Portal
              </Button>
              <Button
                variant={currentView === 'doctor' ? 'default' : 'ghost'}
                onClick={() => {
                  onViewChange('doctor');
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Doctor Portal
              </Button>
              <Button
                variant={currentView === 'admin' ? 'default' : 'ghost'}
                onClick={() => {
                  onViewChange('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;