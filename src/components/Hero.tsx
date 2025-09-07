import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stethoscope, Brain, Shield, Users } from "lucide-react";
import heroImage from "@/assets/medical-hero.jpg";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold medical-heading leading-tight">
                AI-Powered 
                <span className="bg-medical-gradient bg-clip-text text-transparent"> Skin Disease</span> Detection
              </h1>
              <p className="text-xl clinical-text max-w-lg">
                Early detection saves lives. Our advanced AI system helps identify skin conditions 
                quickly and connects you with certified dermatologists for expert care.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-medical-gradient hover:glow-effect medical-transition text-lg px-8 py-6"
                onClick={onGetStarted}
              >
                Start Diagnosis
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 hover:bg-secondary medical-transition"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Diagnoses Made</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Partner Doctors</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="medical-shadow rounded-2xl overflow-hidden">
              <img 
                src={heroImage}
                alt="AI-powered skin disease detection technology"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Floating Cards */}
            <Card className="absolute -top-4 -left-4 p-4 soft-shadow glass-effect">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">AI Analysis</div>
                  <div className="text-xs text-muted-foreground">Real-time Detection</div>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-4 -right-4 p-4 soft-shadow glass-effect">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/50 rounded-lg">
                  <Shield className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-sm">HIPAA Compliant</div>
                  <div className="text-xs text-muted-foreground">Secure & Private</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold medical-heading mb-4">
            Why Choose SkinCare AI?
          </h2>
          <p className="text-xl clinical-text max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge AI with expert medical knowledge
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center card-gradient hover:medical-shadow medical-transition hover:-translate-y-2">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-6">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4">AI-Powered Detection</h3>
            <p className="clinical-text">
              Advanced deep learning models trained on millions of dermatological images 
              for accurate diagnosis.
            </p>
          </Card>

          <Card className="p-8 text-center card-gradient hover:medical-shadow medical-transition hover:-translate-y-2">
            <div className="p-4 bg-secondary/50 rounded-2xl w-fit mx-auto mb-6">
              <Stethoscope className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-4">Expert Consultation</h3>
            <p className="clinical-text">
              Connect with certified dermatologists for professional verification 
              and treatment recommendations.
            </p>
          </Card>

          <Card className="p-8 text-center card-gradient hover:medical-shadow medical-transition hover:-translate-y-2">
            <div className="p-4 bg-accent/50 rounded-2xl w-fit mx-auto mb-6">
              <Users className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-4">Complete Management</h3>
            <p className="clinical-text">
              Comprehensive platform for patients, doctors, and administrators 
              with full case management.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Hero;