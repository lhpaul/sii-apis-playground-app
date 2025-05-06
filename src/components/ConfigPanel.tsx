import React, { useContext } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';

const ConfigPanel: React.FC = () => {
  const { generalConfig, apiConfig, updateGeneralConfig, updateApiConfig } = useContext(ConfigContext);

  return (
    <div className="config-panel">
      <div className="config-section">
        <h3 className="config-section-title">Configuración General</h3>
        <div className="form-group">
          <label htmlFor="userRut">RUT Usuario</label>
          <input
            type="text"
            id="userRut"
            value={generalConfig.userRut}
            onChange={(e) => updateGeneralConfig({ userRut: e.target.value })}
            placeholder="Ej: 12345678-9"
          />
        </div>
        <div className="form-group">
          <label htmlFor="userPassword">Contraseña Usuario</label>
          <input
            type="password"
            id="userPassword"
            value={generalConfig.userPassword}
            onChange={(e) => updateGeneralConfig({ userPassword: e.target.value })}
            placeholder="Contraseña"
          />
        </div>
        <div className="form-group">
          <label htmlFor="companyRut">RUT Compañía</label>
          <input
            type="text"
            id="companyRut"
            value={generalConfig.companyRut}
            onChange={(e) => updateGeneralConfig({ companyRut: e.target.value })}
            placeholder="Ej: 98765432-1"
          />
        </div>
      </div>

      <div className="config-section">
        <h3 className="config-section-title">Configuración Simple API</h3>
        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <input
            type="password"
            id="apiKey"
            value={apiConfig.apiKey}
            onChange={(e) => updateApiConfig({ apiKey: e.target.value })}
            placeholder="API Key"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;