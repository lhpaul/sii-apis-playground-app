import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ConfigContextType {
  generalConfig: {
    userRut: string;
    userPassword: string;
    companyRut: string;
  };
  apiConfig: {
    apiKey: string;
  };
  updateGeneralConfig: (config: Partial<ConfigContextType['generalConfig']>) => void;
  updateApiConfig: (config: Partial<ConfigContextType['apiConfig']>) => void;
}

const defaultConfig: ConfigContextType = {
  generalConfig: {
    userRut: '',
    userPassword: '',
    companyRut: '',
  },
  apiConfig: {
    apiKey: '',
  },
  updateGeneralConfig: () => {},
  updateApiConfig: () => {},
};

export const ConfigContext = createContext<ConfigContextType>(defaultConfig);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [generalConfig, setGeneralConfig] = useState(() => {
    const savedConfig = localStorage.getItem('generalConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig.generalConfig;
  });

  const [apiConfig, setApiConfig] = useState(() => {
    const savedConfig = localStorage.getItem('apiConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig.apiConfig;
  });

  useEffect(() => {
    localStorage.setItem('generalConfig', JSON.stringify(generalConfig));
  }, [generalConfig]);

  useEffect(() => {
    localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
  }, [apiConfig]);

  const updateGeneralConfig = (config: Partial<ConfigContextType['generalConfig']>) => {
    setGeneralConfig((prev: typeof generalConfig) => ({ ...prev, ...config }));
  };

  const updateApiConfig = (config: Partial<ConfigContextType['apiConfig']>) => {
    setApiConfig((prev: typeof apiConfig) => ({ ...prev, ...config }));
  };

  return (
    <ConfigContext.Provider
      value={{
        generalConfig,
        apiConfig,
        updateGeneralConfig,
        updateApiConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};