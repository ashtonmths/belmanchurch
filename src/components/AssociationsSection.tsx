/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useRef } from "react";
import AssociationItem from "~/components/AssociationItem";
import { X } from "lucide-react";

interface Association {
  id: number;
  name: string;
  image: string;
  description: string;
}

const associations: Association[] = [
  { 
    id: 1, 
    name: "ICYM/YCS", 
    image: "/placeholder.svg",
    description: "The Indian Catholic Youth Movement (ICYM) and Young Christian Students (YCS) association at Belman Parish focuses on nurturing young Catholic leadership through spiritual formation, community service, and cultural activities."
  },
  { 
    id: 2, 
    name: "Altar Boys", 
    image: "/placeholder.svg",
    description: "The Altar Boys association at Belman Parish serves during liturgical ceremonies and helps maintain the sacred space of the church while learning the rich traditions of Catholic worship."
  },
  { 
    id: 3, 
    name: "Marian Sodality", 
    image: "/placeholder.svg",
    description: "The Marian Sodality promotes devotion to the Blessed Virgin Mary through prayer, rosary recitation, and various spiritual activities in Belman Parish."
  },
  { 
    id: 4, 
    name: "Missionary Childhood Association", 
    image: "/placeholder.svg",
    description: "This association fosters missionary spirit among children through prayer, sacrifice, and awareness about the global mission of the Church."
  },
  { 
    id: 5, 
    name: "Catholic Sabha", 
    image: "/placeholder.svg",
    description: "Catholic Sabha works as an advocacy group for Catholics in Belman, addressing social issues and representing the Catholic community in public forums."
  },
  { 
    id: 6, 
    name: "Secular Francesian Order", 
    image: "/placeholder.svg",
    description: "Following the spirituality of St. Francis of Assisi, this order commits its members to living the Gospel in their daily lives through simplicity, peace, and care for creation."
  },
  { 
    id: 7, 
    name: "St. Vincent de Paul Society", 
    image: "/placeholder.svg",
    description: "This charitable organization serves the poor and marginalized in Belman Parish through material assistance, counseling, and spiritual support."
  },
  { 
    id: 8, 
    name: "Women's Association", 
    image: "/placeholder.svg",
    description: "The Women's Association (Stree Sangathan) empowers Catholic women through spiritual formation, social initiatives, and leadership development."
  },
  { 
    id: 9, 
    name: "Bethkati UAE & Kuwait", 
    image: "/placeholder.svg",
    description: "This association connects Belman parishioners living in the UAE and Kuwait, fostering community spirit and supporting initiatives in their home parish."
  },
];

const AssociationsSection: React.FC = () => {
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleSelect = (association: Association) => {
    setSelectedAssociation(association);
  };
  
  const closeModal = () => {
    setSelectedAssociation(null);
  };

  return (
    <section className="py-12 px-4">
      <h2 className="text-4xl font-bold text-center mb-4 text-primary">Parish Associations</h2>
      
      <div ref={containerRef} className="association-container">
        {associations.map(association => (
          <div 
            key={association.id}
          >
            <AssociationItem
              name={association.name}
              image={association.image}
              onClick={() => handleSelect(association)}
              isActive={selectedAssociation?.id === association.id}
            />
          </div>
        ))}
      </div>
      
      <div className={`association-modal ${selectedAssociation ? 'active' : ''}`}>
        {selectedAssociation && (
          <div className="modal-content bg-primary">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-red-500 hover:text-red-800"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="bg-accent rounded-lg p-6 flex items-center justify-center h-full">
                  <img 
                    src={selectedAssociation.image} 
                    alt={selectedAssociation.name}
                    className="max-w-full max-h-64 object-contain" 
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 text-textcolor">
                  {selectedAssociation.name}
                </h3>
                <p className="text-accent mb-4">
                  {selectedAssociation.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AssociationsSection;
