import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConsultations } from "@/hooks/useConsultations";
import { Calendar, Clock } from "lucide-react";

interface Doctor {
  user_id: string;
  first_name: string;
  last_name: string;
  specialties: string[];
  years_experience: number;
  distance: number;
  is_verified: boolean;
}

interface BookingDialogProps {
  doctor: Doctor;
  caseId?: string;
  trigger: React.ReactNode;
}

export function BookingDialog({ doctor, caseId, trigger }: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState<'video' | 'phone' | 'in-person'>('video');
  const [notes, setNotes] = useState('');
  
  const { createConsultation, loading } = useConsultations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      return;
    }

    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    const { consultation } = await createConsultation({
      doctor_id: doctor.user_id,
      case_id: caseId,
      scheduled_at: scheduledDateTime,
      consultation_type: consultationType,
      notes: notes || undefined
    });

    if (consultation) {
      setOpen(false);
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    }
  };

  // Generate available time slots (9 AM to 5 PM, every 30 minutes)
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Book Consultation</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">
              Dr. {doctor.first_name} {doctor.last_name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {doctor.specialties?.join(', ') || 'Dermatology'} • {doctor.distance}km away
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                min={minDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultation-type">Consultation Type</Label>
            <Select value={consultationType} onValueChange={(value: 'video' | 'phone' | 'in-person') => setConsultationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="in-person">In-Person Visit</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className="flex-1 bg-medical-gradient"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}