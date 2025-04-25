import React from "react";
import TimelineItem from "~/components/TimelineItem";

interface TimelineEvent {
  year: string;
  title: string;
  content: string;
  image?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  title: string;
}

const Timeline: React.FC<TimelineProps> = ({ events, title }) => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">{title}</h2>
        <div className="timeline-container relative">
          {events.map((event, index) => (
            <TimelineItem
              key={index}
              year={event.year}
              title={event.title}
              content={event.content}
              position={index % 2 === 0 ? "left" : "right"}
              image={event.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
