import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalCases } from "@/hooks/useMedicalCases";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useNearbyDoctors } from "@/hooks/useNearbyDoctors";
import { LocationInput } from "@/components/LocationInput";
import { DoctorMap } from "@/components/DoctorMap";
import { BookingDialog } from "@/components/BookingDialog";
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

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

const UserDashboard = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  
  const { user, profile } = useAuth();
  const { cases, loading, createCase, analyzeWithAI } = useMedicalCases();
  const { uploadMedicalImage, uploading } = useFileUpload();
  const { doctors, loading: doctorsLoading, findNearbyDoctors } = useNearbyDoctors();

  // Search for doctors when location changes
  useEffect(() => {
    if (userLocation) {
      console.log('Searching for doctors at location:', userLocation);
      findNearbyDoctors(userLocation, 5); // Changed to 5km radius
    }
  }, [userLocation, findNearbyDoctors]);

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

      // Create the medical case with location data
      const { case: newCase, error: caseError } = await createCase({
        case_title: caseTitle,
        symptoms: symptoms || undefined,
        image_urls: [imageUrl],
        priority: 'medium',
        user_location: userLocation || undefined
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
    <div className="min-h-screen hero-gradient">
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
                    <div className="flex">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        capture="environment"
                      />
                      <Button 
                        type="button" 
                        asChild
                        className="bg-medical-gradient hover:glow-effect"
                      >
                        <label htmlFor="image-upload" className="cursor-pointer flex items-center">
                          <FileImage className="w-4 h-4 mr-2" />
                          Choose Image
                        </label>
                      </Button>
                    </div>
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

                <LocationInput
                  onLocationChange={setUserLocation}
                  className="pt-4 border-t"
                />

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
                        className="p-4 border rounded-lg hover:bg-secondary/20 medical-transition cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{medicalCase.case_title}</h4>
                          <Badge 
                            variant={medicalCase.status === 'ai_analyzed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {medicalCase.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(medicalCase.created_at).toLocaleDateString()} • {new Date(medicalCase.created_at).toLocaleTimeString()}
                        </p>
                        
                        {medicalCase.ai_diagnosis && (
                          <div className="pt-2 border-t space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-primary flex items-center gap-1">
                                <Brain className="w-3 h-3" />
                                AI Analysis
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {medicalCase.ai_diagnosis.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-xs font-semibold">{medicalCase.ai_diagnosis.condition}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {medicalCase.ai_diagnosis.description}
                            </p>
                            {medicalCase.ai_diagnosis.severity && (
                              <Badge 
                                variant={medicalCase.ai_diagnosis.severity === 'severe' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                Severity: {medicalCase.ai_diagnosis.severity}
                              </Badge>
                            )}
                          </div>
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
              <CardContent>
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="map">Map View</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="list" className="mt-4 space-y-4">
                    {!userLocation ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Set your location to find nearby dermatologists</p>
                      </div>
                    ) : doctorsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Finding doctors near you...</p>
                      </div>
                    ) : doctors.length > 0 ? (
                      doctors.slice(0, 5).map((doctor) => (
                        <div
                          key={doctor.user_id}
                          className="p-4 border rounded-lg hover:bg-secondary/20 medical-transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">
                              {doctor.first_name} {doctor.last_name}
                              {doctor.is_verified && (
                                <CheckCircle className="w-4 h-4 text-green-500 inline ml-1" />
                              )}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">4.8</span>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm clinical-text mb-3">
                            <div className="flex items-center justify-between">
                              <span>{doctor.specialties?.join(', ') || 'Dermatology'}</span>
                              <span className="font-medium text-primary">{doctor.distance}km away</span>
                            </div>
                            {doctor.years_experience && (
                              <span className="text-xs text-muted-foreground">
                                {doctor.years_experience} years experience
                              </span>
                            )}
                            {doctor.bio && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {doctor.bio}
                              </p>
                            )}
                          </div>
                          <BookingDialog 
                            doctor={doctor} 
                            caseId={currentCaseId || undefined}
                            trigger={
                              <Button size="sm" className="w-full bg-medical-gradient">
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule Consultation
                              </Button>
                            }
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No dermatologists found in your area</p>
                        <p className="text-xs mt-1">Try expanding your search radius</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="map" className="mt-4">
                    <div className="h-64 w-full">
                      <DoctorMap 
                        doctors={doctors}
                        userLocation={userLocation}
                        className="h-full w-full"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
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