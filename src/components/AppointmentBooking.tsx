import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, CheckCircle } from "lucide-react";

interface Doctor {
  user_id: string;
  first_name: string;
  last_name: string;
  specialties: string[];
  years_experience: number;
  avatar_url?: string;
  bio?: string;
  distance: number;
  is_verified: boolean;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface AppointmentBookingProps {
  doctor: Doctor;
  caseId?: string;
}

export function AppointmentBooking({ doctor, caseId }: AppointmentBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const handleBookAppointment = async () => {
    if (!user || !selectedDate || !selectedTime) {
      toast({
        title: "Incomplete Information",
        description: "Please select a date and time for the consultation.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    try {
      // Combine date and time
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('consultations')
        .insert({
          patient_id: user.id,
          doctor_id: doctor.user_id,
          case_id: caseId || null,
          scheduled_at: scheduledDateTime.toISOString(),
          notes: notes || undefined,
          status: 'scheduled',
          consultation_type: 'video'
        });

      if (error) {
        console.error('Booking error:', error);
        toast({
          title: "Booking Failed",
          description: "Failed to book the appointment. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Appointment Booked!",
        description: `Your consultation with Dr. ${doctor.first_name} ${doctor.last_name} is scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
      });

      // Reset form and close dialog
      setSelectedDate(undefined);
      setSelectedTime("");
      setNotes("");
      setIsOpen(false);

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Error",
        description: "An unexpected error occurred while booking the appointment.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full bg-medical-gradient">
          <CalendarIcon className="w-4 h-4 mr-2" />
          Schedule Consultation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Book Consultation</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Doctor Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                {doctor.avatar_url ? (
                  <img 
                    src={doctor.avatar_url} 
                    alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {doctor.first_name[0]}{doctor.last_name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">
                    Dr. {doctor.first_name} {doctor.last_name}
                    {doctor.is_verified && (
                      <CheckCircle className="w-4 h-4 text-green-500 inline ml-1" />
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {doctor.specialties?.join(', ') || 'Dermatology'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Select Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{time}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific concerns or questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Book Button */}
          <Button
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedTime || isBooking}
            className="w-full bg-medical-gradient"
          >
            {isBooking ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book Consultation
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}