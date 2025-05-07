import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ConfigPanel from './components/ConfigPanel';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import { ConfigProvider } from './contexts/ConfigContext';
import './App.css';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState('sales');

  // Render the active feature content
  const renderContent = () => {
    switch (activeFeature) {
      case 'sales':
        return <SalesPage />;
      case 'purchases':
        return <PurchasesPage />;
      default:
        return <div>Seleccione una función del menú</div>;
    }
  };

  return (
    <ConfigProvider>
      <div className="app-container">
        <Sidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
        <main className="main-content">
          {renderContent()}
        </main>
        <ConfigPanel />
      </div>
    </ConfigProvider>
  );
};

export default App;