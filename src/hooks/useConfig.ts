import { useState, useEffect } from 'react';

export interface AppConfig {
  parentSiteUrl: string;
  parentSiteLogo: string;
  parentSiteName: string;
}

const defaultConfig: AppConfig = {
  parentSiteUrl: '',
  parentSiteLogo: '',
  parentSiteName: '',
};

let cachedConfig: AppConfig | null = null;
let loadPromise: Promise<AppConfig> | null = null;

/**
 * Load configuration from config.json
 */
async function loadConfig(): Promise<AppConfig> {
  if (cachedConfig) return cachedConfig;

  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const response = await fetch('/config.json');
      if (response.ok) {
        const data = await response.json();
        cachedConfig = {
          parentSiteUrl: data.parentSiteUrl || '',
          parentSiteLogo: data.parentSiteLogo || '',
          parentSiteName: data.parentSiteName || '',
        };
        return cachedConfig;
      }
    } catch (error) {
      console.warn('Could not load config.json:', error);
    }

    cachedConfig = defaultConfig;
    return cachedConfig;
  })();

  return loadPromise;
}

/**
 * React hook for runtime configuration
 */
export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(cachedConfig || defaultConfig);
  const [isLoaded, setIsLoaded] = useState(!!cachedConfig);

  useEffect(() => {
    if (!cachedConfig) {
      loadConfig().then((cfg) => {
        setConfig(cfg);
        setIsLoaded(true);
      });
    }
  }, []);

  return { config, isLoaded };
}
