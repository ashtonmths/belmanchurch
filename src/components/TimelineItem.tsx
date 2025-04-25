/* eslint-disable @next/next/no-img-element */
import React from "react";

interface TimelineItemProps {
  year: string;
  title: string;
  content: string;
  position: "left" | "right";
  image?: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ year, title, content, position, image }) => {
  return (
    <div className={`timeline-item ${position} transition-all duration-300 hover:transform hover:scale-105`}>
      <div className="bg-primary rounded-lg shadow-md p-6 md:p-8 hover:shadow-lg transition-shadow">
        <div className="flex flex-col gap-2">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary text-textcolor text-sm font-medium">
            {year}
          </span>
          <h4 className="text-xl md:text-2xl font-semibold mb-2 text-textcolor">{title}</h4>
          {image && (
            <div className="mb-4">
              <img src={image} alt={title} className="rounded-md w-full h-48 object-cover" />
            </div>
          )}
          <p className="text-textcolor/85 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;