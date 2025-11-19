import React from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Machine Learning",
    type: "Lecture",
    day: "Monday",
    startTime: "09:00",
    endTime: "11:00",
    color: "#5A54F1",
  },
  {
    id: 2,
    title: "Data Science",
    type: "Lecture",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "11:50",
    color: "#9B5CF6",
  },
  {
    id: 3,
    title: "Machine Learning",
    type: "Practice",
    day: "Wednesday",
    startTime: "09:00",
    endTime: "11:00",
    color: "#5A54F1",
  },
  {
    id: 4,
    title: "Web Development",
    type: "Lecture",
    day: "Friday",
    startTime: "10:00",
    endTime: "12:00",
    color: "#4A8BFF",
  },
  {
    id: 5,
    title: "AI Ethics",
    type: "Seminar",
    day: "Monday",
    startTime: "14:00",
    endTime: "15:50",
    color: "#18A57E",
  },
  {
    id: 6,
    title: "Data Science",
    type: "Lab",
    day: "Thursday",
    startTime: "13:00",
    endTime: "14:50",
    color: "#9B5CF6",
  },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const EventCard = ({ event }) => {
  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const startMinutes = timeToMinutes(event.startTime);
  const endMinutes = timeToMinutes(event.endTime);
  const startRow = Math.floor((startMinutes - 480) / 60) + 2;
  const span = Math.ceil((endMinutes - startMinutes) / 60);

  return (
    <div
      style={{
        gridRow: `${startRow} / span ${span}`,
        background: event.color,
        borderRadius: "12px",
        padding: "14px",
        color: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        cursor: "pointer",
        transition: "all 0.3s",
        margin: "2px 4px",
        minHeight: "60px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      }}
    >
      <div>
        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>
          {event.title}
        </h4>
        <span style={{ fontSize: "12px", opacity: 0.9 }}>{event.type}</span>
      </div>
      <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "4px" }}>
        {event.startTime} - {event.endTime}
      </div>
    </div>
  );
};

const Schedule = () => {
  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "32px", background: "#F9FAFB", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#1F2937", marginBottom: "4px" }}>
        Schedule
      </h1>
      <p style={{ fontSize: "15px", color: "#6B7280", marginBottom: "24px" }}>
        Manage your teaching schedule
      </p>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px", 
        marginBottom: "24px",
        flexWrap: "wrap"
      }}>
        <button style={{
          padding: "8px 12px",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center"
        }}>
          <ChevronLeft size={18} />
        </button>

        <span style={{ fontSize: "16px", fontWeight: "600", color: "#1F2937" }}>
          Nov 18–24, 2024
        </span>

        <button style={{
          padding: "8px 12px",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center"
        }}>
          <ChevronRight size={18} />
        </button>

        <button style={{
          padding: "8px 16px",
          background: "#6366F1",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "500"
        }}>
          Today
        </button>

        <button style={{
          padding: "8px 16px",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginLeft: "auto"
        }}>
          <Filter size={18} />
          Filter
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 300px", gap: "0", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        
        {/* Time Column */}
        <div style={{ borderRight: "1px solid #E5E7EB" }}>
          <div style={{ height: "60px", borderBottom: "1px solid #E5E7EB" }}></div>
          {hours.map((time) => (
            <div
              key={time}
              style={{
                height: "80px",
                padding: "8px",
                borderBottom: "1px solid #E5E7EB",
                fontSize: "13px",
                color: "#6B7280",
                textAlign: "right"
              }}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(5, 1fr)`, borderRight: "1px solid #E5E7EB" }}>
          {days.map((day, idx) => (
            <div key={day} style={{ borderRight: idx < 4 ? "1px solid #E5E7EB" : "none" }}>
              <div style={{
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "14px",
                color: "#1F2937",
                borderBottom: "1px solid #E5E7EB"
              }}>
                {day}
              </div>

              <div style={{
                display: "grid",
                gridTemplateRows: `repeat(${hours.length}, 80px)`,
                position: "relative"
              }}>
                {hours.map((_, hourIdx) => (
                  <div
                    key={hourIdx}
                    style={{
                      borderBottom: hourIdx < hours.length - 1 ? "1px solid #E5E7EB" : "none",
                      background: "#FAFBFC"
                    }}
                  />
                ))}

                {events
                  .filter((e) => e.day === day)
                  .map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ padding: "24px", background: "#F9FAFB" }}>
          <div style={{ 
            background: "white", 
            padding: "20px", 
            borderRadius: "12px", 
            marginBottom: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Subjects</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "Machine Learning", color: "#5A54F1" },
                { name: "Data Science", color: "#9B5CF6" },
                { name: "AI Ethics", color: "#18A57E" },
                { name: "Web Development", color: "#4A8BFF" }
              ].map((subject) => (
                <div key={subject.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                  <span style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: subject.color
                  }}></span>
                  {subject.name}
                </div>
              ))}
            </div>
          </div>

          <div style={{ 
            background: "white", 
            padding: "20px", 
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>This Week</h3>
            <div style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.8" }}>
              <p style={{ margin: "8px 0" }}>Total Classes: <b style={{ color: "#1F2937" }}>6</b></p>
              <p style={{ margin: "8px 0" }}>Teaching Hours: <b style={{ color: "#1F2937" }}>10.5h</b></p>
              <p style={{ margin: "8px 0" }}>Busiest Day: <b style={{ color: "#1F2937" }}>Monday</b></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;