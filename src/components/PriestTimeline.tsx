/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";

interface Priest {
  name: string;
  period: string;
  image?: string;
}

interface PriestTimelineProps {
  priests: Priest[];
  title: string;
}

const PriestTimeline: React.FC<PriestTimelineProps> = ({ priests, title }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="py-8 px-4">
      <h2 className="text-4xl font-bold text-center mb-8 text-primary">{title}</h2>
      
      <div className="relative">
        <div className="flex flex-wrap justify-center">
          {priests.map((priest, index) => (
            <div 
              key={index} 
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-4"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className={`bg-primary rounded-xl shadow-md p-4 transition-all duration-300 h-full ${activeIndex === index ? 'transform scale-105 shadow-xl' : ''}`}>
                <div className="flex justify-center mb-2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent bg-gray-50">
                    {priest.image ? (
                      <img 
                        src={priest.image} 
                        alt={priest.name}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-center font-semibold text-textcolor">{priest.name}</h3>
                <p className="text-center text-sm text-accent top-full">{priest.period}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriestTimeline;