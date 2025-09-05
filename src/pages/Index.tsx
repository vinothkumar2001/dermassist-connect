import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import UserDashboard from "@/components/UserDashboard";
import DoctorDashboard from "@/components/DoctorDashboard";
import AdminDashboard from "@/components/AdminDashboard";

type ViewType = 'home' | 'user' | 'doctor' | 'admin';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'user':
        return <UserDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Hero onGetStarted={() => setCurrentView('user')} />;
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