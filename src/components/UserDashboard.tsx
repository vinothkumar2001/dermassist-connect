import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Camera, 
  FileImage, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Star,
  Calendar
} from "lucide-react";

const UserDashboard = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        // Simulate AI analysis
        simulateAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        condition: "Seborrheic Dermatitis",
        confidence: 94,
        severity: "Mild to Moderate",
        description: "A common inflammatory skin condition affecting the scalp and face areas rich in sebaceous glands.",
        recommendations: [
          "Use gentle, fragrance-free cleansers",
          "Apply antifungal topical treatments",
          "Avoid harsh scrubbing",
          "Consider professional consultation"
        ],
        doctorsNearby: [
          { name: "Dr. Sarah Mitchell", specialty: "Dermatology", rating: 4.9, distance: "0.8 mi" },
          { name: "Dr. James Chen", specialty: "Dermatology", rating: 4.7, distance: "1.2 mi" },
          { name: "Dr. Emily Rodriguez", specialty: "Dermatology", rating: 4.8, distance: "2.1 mi" }
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-subtle-gradient">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold medical-heading mb-2">Patient Portal</h1>
          <p className="clinical-text">Upload your skin image for AI-powered analysis and get connected with dermatologists</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-primary" />
                <span>Upload Skin Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center medical-transition hover:border-primary/50">
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Upload or take a photo</h3>
                      <p className="text-sm clinical-text mb-4">
                        For best results, ensure good lighting and the affected area is clearly visible
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload">
                      <Button className="bg-medical-gradient hover:glow-effect">
                        <FileImage className="w-4 h-4 mr-2" />
                        Choose Image
                      </Button>
                    </Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden medical-shadow">
                    <img
                      src={uploadedImage}
                      alt="Uploaded skin condition"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedImage(null);
                        setAnalysisResult(null);
                      }}
                      className="flex-1"
                    >
                      Upload Different Image
                    </Button>
                    <Button
                      onClick={simulateAnalysis}
                      disabled={isAnalyzing}
                      className="flex-1 bg-medical-gradient"
                    >
                      {isAnalyzing ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Re-analyze"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional Information Form */}
              <div className="space-y-4 pt-6 border-t">
                <Label htmlFor="symptoms">Describe your symptoms (optional)</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Any itching, pain, changes in appearance, or other symptoms..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="space-y-6">
            {isAnalyzing && (
              <Card className="soft-shadow">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto animate-pulse">
                      <AlertTriangle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">AI Analysis in Progress</h3>
                      <p className="clinical-text">
                        Our advanced models are analyzing your image...
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-medical-gradient h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysisResult && !isAnalyzing && (
              <>
                {/* Diagnosis Results */}
                <Card className="soft-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-secondary-foreground" />
                      <span>Analysis Complete</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Detected Condition:</span>
                        <Badge variant="secondary" className="text-sm">
                          {analysisResult.condition}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Confidence Level:</span>
                        <Badge variant={analysisResult.confidence > 90 ? "default" : "secondary"}>
                          {analysisResult.confidence}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Severity:</span>
                        <Badge variant="outline">{analysisResult.severity}</Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="clinical-text text-sm">
                        {analysisResult.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <h4 className="font-semibold">Recommended Actions:</h4>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-secondary-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm clinical-text">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Nearby Doctors */}
                <Card className="soft-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>Recommended Dermatologists</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisResult.doctorsNearby.map((doctor: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-secondary/20 medical-transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{doctor.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{doctor.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm clinical-text">
                          <span>{doctor.specialty}</span>
                          <span>{doctor.distance} away</span>
                        </div>
                        <Button size="sm" className="mt-3 w-full bg-medical-gradient">
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Consultation
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;