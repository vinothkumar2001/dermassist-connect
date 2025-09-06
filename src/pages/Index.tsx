import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import UserDashboard from "@/components/UserDashboard";
import DoctorDashboard from "@/components/DoctorDashboard";
import AdminDashboard from "@/components/AdminDashboard";

type ViewType = 'home' | 'user' | 'doctor' | 'admin';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if trying to access protected views without authentication
  useEffect(() => {
    if (!loading && !user && (currentView === 'user' || currentView === 'doctor' || currentView === 'admin')) {
      navigate('/auth');
    }
  }, [user, loading, currentView, navigate]);

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // If user is not authenticated and tries to access protected views
    if (!user && (currentView === 'user' || currentView === 'doctor' || currentView === 'admin')) {
      return <Hero onGetStarted={() => navigate('/auth')} />;
    }

    switch (currentView) {
      case 'user':
        return user ? <UserDashboard /> : <Hero onGetStarted={() => navigate('/auth')} />;
      case 'doctor':
        return user ? <DoctorDashboard /> : <Hero onGetStarted={() => navigate('/auth')} />;
      case 'admin':
        return user ? <AdminDashboard /> : <Hero onGetStarted={() => navigate('/auth')} />;
      default:
        return <Hero onGetStarted={() => user ? setCurrentView('user') : navigate('/auth')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      {renderCurrentView()}
    </div>
  );
};

export default Index;