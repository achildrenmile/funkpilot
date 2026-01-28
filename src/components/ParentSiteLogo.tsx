import { useConfig } from '../hooks/useConfig';

export function ParentSiteLogo() {
  const { config } = useConfig();

  if (!config.parentSiteUrl || !config.parentSiteLogo) {
    return null;
  }

  return (
    <a
      href={config.parentSiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={config.parentSiteName || 'Zur Hauptseite'}
      className="flex-shrink-0"
    >
      <img
        src={config.parentSiteLogo}
        alt={config.parentSiteName || 'Logo'}
        className="h-10 sm:h-12 w-auto object-contain"
      />
    </a>
  );
}
