/* eslint-disable @next/next/no-img-element */
import React from "react";

interface AssociationItemProps {
  name: string;
  image: string;
  onClick: () => void;
  isActive: boolean;
}

const AssociationItem: React.FC<AssociationItemProps> = ({ name, image, onClick, isActive }) => {
  return (
    <div 
      className={`w-full h-48 bg-primary rounded-xl flex items-center justify-start gap-4 p-4 cursor-pointer transition-transform duration-200 hover:scale-105 
        ${isActive ? 'ring-2 ring-accent' : ''}`}
      onClick={onClick}
    >
      <div className="w-32 h-32 flex items-center justify-center bg-accent rounded-full overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-contain" />
      </div>
      <h3 className="text-textcolor font-semibold text-lg">{name}</h3>
    </div>
  );
};

export default AssociationItem;
