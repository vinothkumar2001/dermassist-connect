import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalCases } from "@/hooks/useMedicalCases";
import { useFileUpload } from "@/hooks/useFileUpload";
import { 
  Upload, 
  Camera, 
  FileImage, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Star,
  Calendar,
  History,
  Brain
} from "lucide-react";

const UserDashboard = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  
  const { user, profile } = useAuth();
  const { cases, loading, createCase, analyzeWithAI } = useMedicalCases();
  const { uploadMedicalImage, uploading } = useFileUpload();

  // Mock data for doctors (in a real app, this would come from the database)
  const mockDoctors = [
    { id: '1', name: "Dr. Sarah Mitchell", specialty: "Dermatology", rating: 4.9, distance: "0.8 mi" },
    { id: '2', name: "Dr. James Chen", specialty: "Dermatology", rating: 4.7, distance: "1.2 mi" },
    { id: '3', name: "Dr. Emily Rodriguez", specialty: "Dermatology", rating: 4.8, distance: "2.1 mi" }
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAndAnalyze = async () => {
    if (!selectedFile || !caseTitle.trim()) {
      return;
    }

    try {
      // First upload the image
      const { url: imageUrl, error: uploadError } = await uploadMedicalImage(selectedFile);
      if (uploadError || !imageUrl) {
        return;
      }

      // Create the medical case
      const { case: newCase, error: caseError } = await createCase({
        case_title: caseTitle,
        symptoms: symptoms || undefined,
        image_urls: [imageUrl],
        priority: 'medium'
      });

      if (caseError || !newCase) {
        return;
      }

      setCurrentCaseId(newCase.id);

      // Analyze with AI
      await analyzeWithAI(newCase.id, imageUrl, symptoms || undefined);
      
      // Reset form
      setCaseTitle('');
      setSymptoms('');
      setUploadedImage(null);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error creating case and analyzing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-gradient">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold medical-heading mb-2">Patient Portal</h1>
          <p className="clinical-text">Upload your skin image for AI-powered analysis and get connected with dermatologists</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image Upload Section */}
          <Card className="soft-shadow lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-primary" />
                <span>Upload Skin Image for Analysis</span>
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadedImage(null);
                      setSelectedFile(null);
                    }}
                    className="w-full"
                  >
                    Upload Different Image
                  </Button>
                </div>
              )}

              {/* Case Information Form */}
              <div className="space-y-4 pt-6 border-t">
                <div className="space-y-2">
                  <Label htmlFor="case-title">Case Title *</Label>
                  <Input
                    id="case-title"
                    placeholder="e.g., Suspicious mole on arm"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Describe your symptoms (optional)</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Any itching, pain, changes in appearance, or other symptoms..."
                    className="min-h-[100px]"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>

                {uploadedImage && caseTitle.trim() && (
                  <Button
                    onClick={handleCreateAndAnalyze}
                    disabled={uploading || loading}
                    className="w-full bg-medical-gradient hover:glow-effect"
                  >
                    {uploading || loading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        {uploading ? 'Uploading...' : 'Creating Case...'}
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Cases & Doctors */}
          <div className="space-y-6">
            {/* Recent Cases */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-primary" />
                  <span>Recent Cases</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading cases...</p>
                  </div>
                ) : cases.length > 0 ? (
                  <div className="space-y-3">
                    {cases.slice(0, 3).map((medicalCase) => (
                      <div
                        key={medicalCase.id}
                        className="p-3 border rounded-lg hover:bg-secondary/20 medical-transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{medicalCase.case_title}</h4>
                          <Badge 
                            variant={medicalCase.status === 'ai_analyzed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {medicalCase.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(medicalCase.created_at).toLocaleDateString()}
                        </p>
                        {medicalCase.ai_diagnosis && (
                          <p className="text-xs text-primary mt-1">
                            AI: {medicalCase.ai_diagnosis.condition}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No cases yet. Upload an image to get started!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Nearby Doctors */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Dermatologists Near You</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
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
          </div>
        </div>

        {/* Analysis Results - Show Latest Case Analysis */}
        {cases.length > 0 && cases[0].ai_diagnosis && (
          <div className="mt-8">
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-secondary-foreground" />
                  <span>Latest AI Analysis: {cases[0].case_title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Detected Condition:</span>
                    <Badge variant="secondary" className="text-sm">
                      {cases[0].ai_diagnosis.condition}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Confidence Level:</span>
                    <Badge variant={cases[0].ai_diagnosis.confidence > 90 ? "default" : "secondary"}>
                      {cases[0].ai_diagnosis.confidence}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Severity:</span>
                    <Badge variant="outline">{cases[0].ai_diagnosis.severity}</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="clinical-text text-sm">
                    {cases[0].ai_diagnosis.description}
                  </p>
                </div>

                {cases[0].ai_diagnosis.recommendations && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold">Recommended Actions:</h4>
                    <ul className="space-y-2">
                      {cases[0].ai_diagnosis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-secondary-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm clinical-text">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      This AI analysis is for educational purposes only. Please consult with a licensed dermatologist for proper medical diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;