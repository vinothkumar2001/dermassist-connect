import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  ClipboardCheck, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Star
} from "lucide-react";

const DoctorDashboard = () => {
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const pendingCases = [
    {
      id: "CS-001",
      patient: "Anonymous User #12845",
      condition: "Seborrheic Dermatitis",
      aiConfidence: 94,
      severity: "Mild to Moderate",
      submittedAt: "2 hours ago",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop",
      symptoms: "Itchy, flaky patches on scalp and face area. Started 2 weeks ago.",
      priority: "medium"
    },
    {
      id: "CS-002", 
      patient: "Anonymous User #12846",
      condition: "Psoriasis",
      aiConfidence: 89,
      severity: "Moderate",
      submittedAt: "4 hours ago",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=200&h=200&fit=crop",
      symptoms: "Red, scaly patches on elbows. Family history of psoriasis.",
      priority: "high"
    },
    {
      id: "CS-003",
      patient: "Anonymous User #12847", 
      condition: "Eczema",
      aiConfidence: 92,
      severity: "Mild",
      submittedAt: "6 hours ago",
      image: "https://images.unsplash.com/photo-1559757160-f3c2c0b17c2f?w=200&h=200&fit=crop",
      symptoms: "Dry, itchy skin on hands. Gets worse in winter.",
      priority: "low"
    }
  ];

  const consultations = [
    {
      id: "CON-001",
      patient: "Sarah Johnson",
      time: "2:00 PM - 2:30 PM",
      condition: "Follow-up: Acne Treatment",
      status: "upcoming"
    },
    {
      id: "CON-002", 
      patient: "Michael Chen",
      time: "3:00 PM - 3:30 PM",
      condition: "Initial: Suspicious Mole",
      status: "upcoming"
    },
    {
      id: "CON-003",
      patient: "Emily Rodriguez",
      time: "4:00 PM - 4:30 PM", 
      condition: "Follow-up: Rosacea Management",
      status: "upcoming"
    }
  ];

  const handleCaseReview = (caseData: any, verdict: 'approve' | 'modify' | 'reject') => {
    console.log('Case review:', caseData.id, verdict);
    // In real app, this would send to backend
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-subtle-gradient">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold medical-heading mb-2">Doctor Portal</h1>
          <p className="clinical-text">Review AI diagnoses, manage consultations, and provide expert medical guidance</p>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cases">Pending Cases</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pending Cases */}
          <TabsContent value="cases">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cases List */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="soft-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ClipboardCheck className="w-5 h-5 text-primary" />
                      <span>Cases Awaiting Review</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingCases.map((case_) => (
                      <div
                        key={case_.id}
                        className={`p-4 border rounded-lg cursor-pointer medical-transition hover:medical-shadow ${
                          selectedCase?.id === case_.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary/20'
                        }`}
                        onClick={() => setSelectedCase(case_)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{case_.id}</span>
                          <Badge variant={getPriorityColor(case_.priority) as any} className="text-xs">
                            {case_.priority}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{case_.condition}</p>
                          <p className="text-xs clinical-text">{case_.patient}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs clinical-text">AI: {case_.aiConfidence}%</span>
                            <span className="text-xs clinical-text">{case_.submittedAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Case Details */}
              <div className="lg:col-span-2">
                {selectedCase ? (
                  <Card className="soft-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <span>Case Review: {selectedCase.id}</span>
                        </div>
                        <Badge variant={getPriorityColor(selectedCase.priority) as any}>
                          {selectedCase.priority} priority
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Patient Image */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Submitted Image</h4>
                          <div className="rounded-lg overflow-hidden medical-shadow">
                            <img
                              src={selectedCase.image}
                              alt="Patient submission"
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-3">AI Analysis Results</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span>Detected Condition:</span>
                                <Badge variant="secondary">{selectedCase.condition}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Confidence Level:</span>
                                <Badge variant={selectedCase.aiConfidence > 90 ? "default" : "secondary"}>
                                  {selectedCase.aiConfidence}%
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Severity Assessment:</span>
                                <Badge variant="outline">{selectedCase.severity}</Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Patient Symptoms</h4>
                            <p className="text-sm clinical-text bg-secondary/30 p-3 rounded-lg">
                              {selectedCase.symptoms}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Doctor's Assessment */}
                      <div className="pt-6 border-t space-y-4">
                        <h4 className="font-semibold">Your Professional Assessment</h4>
                        <Textarea
                          placeholder="Provide your diagnosis, treatment recommendations, and any additional notes..."
                          className="min-h-[120px]"
                        />
                      </div>

                      {/* Actions */}
                      <div className="pt-6 border-t">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => handleCaseReview(selectedCase, 'approve')}
                            className="bg-healing-gradient hover:glow-effect flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve AI Diagnosis
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCaseReview(selectedCase, 'modify')}
                            className="flex-1"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Modify Diagnosis
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleCaseReview(selectedCase, 'reject')}
                            className="flex-1"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Reject & Reassess
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="soft-shadow">
                    <CardContent className="p-12 text-center">
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                          <Eye className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Select a Case to Review</h3>
                          <p className="clinical-text">
                            Choose a pending case from the left panel to start your review
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Consultations */}
          <TabsContent value="consultations">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="soft-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Today's Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="p-4 border rounded-lg hover:bg-secondary/20 medical-transition">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{consultation.patient}</span>
                        <Badge variant={consultation.status === 'upcoming' ? 'default' : 'secondary'}>
                          {consultation.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm clinical-text">{consultation.condition}</p>
                        <div className="flex items-center space-x-2 text-sm clinical-text">
                          <Clock className="w-4 h-4" />
                          <span>{consultation.time}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Start Call
                        </Button>
                        <Button size="sm" className="flex-1">
                          <FileText className="w-4 h-4 mr-2" />
                          View History
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="soft-shadow">
                <CardHeader>
                  <CardTitle>Quick Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-secondary/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">23</div>
                      <div className="text-sm text-muted-foreground">Cases Reviewed Today</div>
                    </div>
                    <div className="text-center p-4 bg-accent/30 rounded-lg">
                      <div className="text-2xl font-bold text-accent-foreground">96%</div>
                      <div className="text-sm text-muted-foreground">AI Agreement Rate</div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">8</div>
                      <div className="text-sm text-muted-foreground">Consultations Today</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <div className="text-2xl font-bold text-primary">4.9</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Patient Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Analytics Dashboard Coming Soon</h3>
                  <p className="clinical-text">
                    Detailed performance metrics and insights will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;