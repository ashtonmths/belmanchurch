/* eslint-disable @next/next/no-img-element */
import React from "react";

interface AssociationItemProps {
  name: string;
  image: string;
  description: string;
  onClick: () => void;
  isActive: boolean;
}

const AssociationItem: React.FC<AssociationItemProps> = ({ name, image, description, onClick, isActive }) => {
  return (
    <div 
      className={`association-item ${isActive ? 'active ring-accent' : ''}`}
      onClick={onClick}
    >
      <div className="w-16 h-16 mb-2 flex items-center justify-center">
        <img src={image} alt={name} className="max-w-full max-h-full object-contain bg-accent" />
      </div>
      <h3 className="text-center font-semibold text-textcolor">{name}</h3>
    </div>
  );
};

export default AssociationItem;
