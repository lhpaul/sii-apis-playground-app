import React from 'react';

interface SidebarProps {
  activeFeature: string;
  setActiveFeature: (feature: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeFeature, setActiveFeature }) => {
  const features = [
    { id: 'sales', name: 'Ventas' },
    { id: 'purchases', name: 'Compras' },
    // Add more features here in the future
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">SII</div>
      <ul className="sidebar-nav">
        {features.map((feature) => (
          <li
            key={feature.id}
            className={`sidebar-nav-item ${activeFeature === feature.id ? 'active' : ''}`}
            onClick={() => setActiveFeature(feature.id)}
          >
            {feature.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;