import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ChefHat } from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Master's Tasting: A5 Wagyu Experience", 
    date: "2024-02-15",
    time: "7:00 PM - 10:00 PM",
    location: "The Warrior's Den, Downtown",
    description: "An exclusive tasting featuring the finest A5 Wagyu cuts from Japan. Learn from Master Chef Tanaka about traditional butchering techniques.",
    attendees: 24,
    maxAttendees: 30,
    dressCode: "Smart Casual",
    price: "$295",
    rsvpStatus: "interested" as "going" | "interested" | "no" | null,
  },
  {
    id: 2,
    title: "Knife Skills Workshop",
    date: "2024-02-20", 
    time: "6:00 PM - 9:00 PM",
    location: "Culinary Studio, Midtown",
    description: "Hands-on workshop teaching traditional Japanese knife techniques. All skill levels welcome.",
    attendees: 12,
    maxAttendees: 16,
    dressCode: "Casual",
    price: "$150",
    rsvpStatus: null,
  },
  {
    id: 3,
    title: "Cigar & Steak Pairing Night",
    date: "2024-02-28",
    time: "8:00 PM - 11:00 PM", 
    location: "Private Lounge, Uptown",
    description: "Premium cigar and wagyu pairing experience. Limited to founding members only. 21+ required.",
    attendees: 8,
    maxAttendees: 12,
    dressCode: "Business Formal",
    price: "$450",
    rsvpStatus: "going" as "going" | "interested" | "no" | null,
  },
];

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState(upcomingEvents);

  const handleRSVP = (eventId: number, status: "going" | "interested" | "no") => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, rsvpStatus: status }
        : event
    ));
  };

  const getRSVPColor = (status: string | null) => {
    switch (status) {
      case "going": return "border-warrior-gold text-warrior-gold bg-warrior-gold/10";
      case "interested": return "border-warrior-ember text-warrior-ember bg-warrior-ember/10";
      case "no": return "border-warrior-smoke text-warrior-smoke bg-warrior-smoke/10";
      default: return "border-muted-foreground text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
        <div className="flex items-center space-x-3">
          <Calendar className="text-warrior-gold" size={24} />
          <div>
            <h2 className="text-xl font-bold text-foreground">Warrior Events</h2>
            <p className="text-sm text-muted-foreground">Exclusive gatherings for elite members</p>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
            {/* Event Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">{event.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users size={14} />
                    <span>{event.attendees}/{event.maxAttendees} attending</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-warrior-gold mb-1">{event.price}</div>
                <Badge variant="outline" className="text-xs">
                  {event.dressCode}
                </Badge>
              </div>
            </div>

            {/* Event Description */}
            <p className="text-sm text-foreground leading-relaxed mb-4">
              {event.description}
            </p>

            {/* RSVP Status */}
            {event.rsvpStatus && (
              <div className="mb-4">
                <Badge variant="outline" className={getRSVPColor(event.rsvpStatus)}>
                  <ChefHat size={12} className="mr-1" />
                  {event.rsvpStatus === "going" ? "Attending" : 
                   event.rsvpStatus === "interested" ? "Interested" : "Not Attending"}
                </Badge>
              </div>
            )}

            {/* RSVP Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant={event.rsvpStatus === "going" ? "warrior" : "warrior-outline"}
                size="sm"
                onClick={() => handleRSVP(event.id, "going")}
              >
                Going
              </Button>
              <Button
                variant={event.rsvpStatus === "interested" ? "warrior-ember" : "warrior-outline"}
                size="sm"
                onClick={() => handleRSVP(event.id, "interested")}
              >
                Interested
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRSVP(event.id, "no")}
                className="text-muted-foreground"
              >
                Can't Attend
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event (Admin only) */}
      <div className="text-center">
        <Button variant="warrior-outline" size="lg">
          Request Private Event
        </Button>
      </div>
    </div>
  );
};