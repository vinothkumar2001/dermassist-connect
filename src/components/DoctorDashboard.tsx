import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConsultations } from "@/hooks/useConsultations";
import { useDoctorCases } from "@/hooks/useDoctorCases";
import { 
  Calendar, 
  ClipboardCheck, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Star,
  Brain
} from "lucide-react";

const DoctorDashboard = () => {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const { cases, loading: casesLoading, updateCaseReview } = useDoctorCases();
  const { consultations, loading: consLoading } = useConsultations();

  useEffect(() => {
    if (selectedCase) {
      setDoctorNotes(selectedCase.doctor_diagnosis?.notes || "");
    }
  }, [selectedCase]);

  const handleCaseReview = async (verdict: 'approve' | 'modify' | 'reject') => {
    if (!selectedCase || !doctorNotes.trim()) {
      return;
    }

    const diagnosis = {
      verdict,
      notes: doctorNotes,
      reviewed_at: new Date().toISOString(),
      ai_agreement: verdict === 'approve'
    };

    await updateCaseReview(selectedCase.id, diagnosis, verdict);
    setSelectedCase(null);
    setDoctorNotes("");
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
                    {casesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : cases.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No cases assigned yet</p>
                      </div>
                    ) : (
                      cases.map((case_) => (
                      <div
                        key={case_.id}
                        className={`p-4 border rounded-lg cursor-pointer medical-transition hover:medical-shadow ${
                          selectedCase?.id === case_.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary/20'
                        }`}
                          onClick={() => setSelectedCase(case_)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">{case_.case_title}</span>
                            <Badge variant={getPriorityColor(case_.priority) as any} className="text-xs">
                              {case_.priority}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{case_.ai_diagnosis?.condition || 'Pending AI Analysis'}</p>
                            <p className="text-xs clinical-text">
                              {case_.patient?.first_name} {case_.patient?.last_name}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs clinical-text">
                                AI: {case_.ai_diagnosis?.confidence || 0}%
                              </span>
                              <span className="text-xs clinical-text">
                                {new Date(case_.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
                          <span>Case Review: {selectedCase.case_title}</span>
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
                          {selectedCase.image_urls && selectedCase.image_urls.length > 0 ? (
                            <div className="rounded-lg overflow-hidden medical-shadow">
                              <img
                                src={selectedCase.image_urls[0]}
                                alt="Patient submission"
                                className="w-full h-64 object-cover"
                              />
                            </div>
                          ) : (
                            <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                              <p className="text-muted-foreground">No image available</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center space-x-2">
                              <Brain className="w-5 h-5 text-primary" />
                              <span>AI Analysis Results</span>
                            </h4>
                            {selectedCase.ai_diagnosis ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span>Detected Condition:</span>
                                  <Badge variant="secondary">{selectedCase.ai_diagnosis.condition}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Confidence Level:</span>
                                  <Badge variant={selectedCase.ai_diagnosis.confidence > 90 ? "default" : "secondary"}>
                                    {selectedCase.ai_diagnosis.confidence}%
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Severity Assessment:</span>
                                  <Badge variant="outline">{selectedCase.ai_diagnosis.severity}</Badge>
                                </div>
                                {selectedCase.ai_diagnosis.description && (
                                  <div className="pt-2">
                                    <p className="text-sm clinical-text">{selectedCase.ai_diagnosis.description}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No AI analysis available yet</p>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Patient Symptoms</h4>
                            <p className="text-sm clinical-text bg-secondary/30 p-3 rounded-lg">
                              {selectedCase.symptoms || 'No symptoms reported'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Doctor's Assessment */}
                      <div className="pt-6 border-t space-y-4">
                        <h4 className="font-semibold">Your Professional Assessment</h4>
                        <Textarea
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Provide your diagnosis, treatment recommendations, and any additional notes..."
                          className="min-h-[120px]"
                        />
                      </div>

                      {/* Actions */}
                      <div className="pt-6 border-t">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => handleCaseReview('approve')}
                            disabled={!doctorNotes.trim()}
                            className="bg-healing-gradient hover:glow-effect flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve AI Diagnosis
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCaseReview('modify')}
                            disabled={!doctorNotes.trim()}
                            className="flex-1"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Modify Diagnosis
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleCaseReview('reject')}
                            disabled={!doctorNotes.trim()}
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
                  {consLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : consultations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No consultations scheduled</p>
                    </div>
                  ) : (
                    consultations.map((consultation) => (
                      <div key={consultation.id} className="p-4 border rounded-lg hover:bg-secondary/20 medical-transition">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Consultation</span>
                          <Badge variant={consultation.status === 'scheduled' ? 'default' : 'secondary'}>
                            {consultation.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm clinical-text">Type: {consultation.consultation_type}</p>
                          <div className="flex items-center space-x-2 text-sm clinical-text">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(consultation.scheduled_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Start Call
                          </Button>
                          <Button size="sm" className="flex-1">
                            <FileText className="w-4 h-4 mr-2" />
                            View Case
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="soft-shadow">
                <CardHeader>
                  <CardTitle>Quick Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-secondary/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{cases.length}</div>
                      <div className="text-sm text-muted-foreground">Total Cases Assigned</div>
                    </div>
                    <div className="text-center p-4 bg-accent/30 rounded-lg">
                      <div className="text-2xl font-bold text-accent-foreground">
                        {cases.filter(c => c.status === 'doctor_approved').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Cases Approved</div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{consultations.length}</div>
                      <div className="text-sm text-muted-foreground">Consultations</div>
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