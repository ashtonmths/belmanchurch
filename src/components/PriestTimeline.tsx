/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";

interface Priest {
  id: string;
  name: string;
  period: string;
  imageUrl: string | null;
}

interface PriestTimelineProps {
  priests: Priest[];
  title: string;
}

const PriestTimeline: React.FC<PriestTimelineProps> = ({ priests, title }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="px-4 py-8">
      <h2 className="mb-8 text-center text-4xl font-bold text-primary">
        {title}
      </h2>

      <div className="relative">
        <div className="flex flex-wrap justify-center">
          {priests.map((priest, index) => (
            <div
              key={priest.id}
              className="w-full p-4 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className={`h-full rounded-xl bg-primary p-4 shadow-md transition-all duration-300 ${activeIndex === index ? "scale-105 transform shadow-xl" : ""}`}
              >
                <div className="mb-2 flex justify-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-accent bg-gray-50">
                    {priest.imageUrl ? (
                      <img
                        src={priest.imageUrl}
                        alt={priest.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-center font-semibold text-textcolor">
                  {priest.name}
                </h3>
                <p className="top-full text-center text-sm text-accent">
                  {priest.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriestTimeline;
