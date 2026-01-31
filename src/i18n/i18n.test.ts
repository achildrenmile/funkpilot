import { describe, it, expect } from 'vitest';
import de from './locales/de';
import en from './locales/en';
import sl from './locales/sl';
import { SUPPORTED_LANGUAGES, getCurrentLanguage } from './index';

// Helper to get all translation keys recursively
function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getKeys(obj[key] as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('i18n', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should have German as first language', () => {
      expect(SUPPORTED_LANGUAGES[0].code).toBe('de');
    });

    it('should have English as second language', () => {
      expect(SUPPORTED_LANGUAGES[1].code).toBe('en');
    });

    it('should have Slovenian as third language', () => {
      expect(SUPPORTED_LANGUAGES[2].code).toBe('sl');
    });

    it('should have flags for all languages', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(lang.flag).toBeDefined();
        expect(lang.flag.length).toBeGreaterThan(0);
      }
    });

    it('should have names for all languages', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(lang.name).toBeDefined();
        expect(lang.name.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Translation completeness', () => {
    const deKeys = getKeys(de);
    const enKeys = getKeys(en);
    const slKeys = getKeys(sl);

    it('should have German translations', () => {
      expect(deKeys.length).toBeGreaterThan(0);
    });

    it('should have English translations', () => {
      expect(enKeys.length).toBeGreaterThan(0);
    });

    it('should have Slovenian translations', () => {
      expect(slKeys.length).toBeGreaterThan(0);
    });

    it('English should have all keys from German', () => {
      const missingInEn = deKeys.filter(key => !enKeys.includes(key));
      if (missingInEn.length > 0) {
        console.warn('Keys missing in English:', missingInEn);
      }
      expect(missingInEn).toEqual([]);
    });

    it('Slovenian should have all keys from German', () => {
      const missingInSl = deKeys.filter(key => !slKeys.includes(key));
      if (missingInSl.length > 0) {
        console.warn('Keys missing in Slovenian:', missingInSl);
      }
      expect(missingInSl).toEqual([]);
    });

    it('German should have all keys from English', () => {
      const missingInDe = enKeys.filter(key => !deKeys.includes(key));
      if (missingInDe.length > 0) {
        console.warn('Keys missing in German:', missingInDe);
      }
      expect(missingInDe).toEqual([]);
    });

    it('all languages should have same number of keys', () => {
      expect(enKeys.length).toBe(deKeys.length);
      expect(slKeys.length).toBe(deKeys.length);
    });
  });

  describe('Translation sections', () => {
    it('should have common section', () => {
      expect(de.common).toBeDefined();
      expect(en.common).toBeDefined();
      expect(sl.common).toBeDefined();
    });

    it('should have voiceCQ section', () => {
      expect(de.voiceCQ).toBeDefined();
      expect(en.voiceCQ).toBeDefined();
      expect(sl.voiceCQ).toBeDefined();
    });

    it('should have chat section', () => {
      expect(de.chat).toBeDefined();
      expect(en.chat).toBeDefined();
      expect(sl.chat).toBeDefined();
    });

    it('should have nav section with tabs', () => {
      expect(de.nav).toBeDefined();
      expect(en.nav).toBeDefined();
      expect(sl.nav).toBeDefined();
      expect(de.nav.logAnalysis).toBeDefined();
      expect(en.nav.logAnalysis).toBeDefined();
      expect(sl.nav.logAnalysis).toBeDefined();
    });

    it('should have propagation section', () => {
      expect(de.propagation).toBeDefined();
      expect(en.propagation).toBeDefined();
      expect(sl.propagation).toBeDefined();
    });

    it('should have callsignFinder section', () => {
      expect(de.callsignFinder).toBeDefined();
      expect(en.callsignFinder).toBeDefined();
      expect(sl.callsignFinder).toBeDefined();
    });

    it('should have projects section', () => {
      expect(de.projects).toBeDefined();
      expect(en.projects).toBeDefined();
      expect(sl.projects).toBeDefined();
    });

    it('should have settings section', () => {
      expect(de.settings).toBeDefined();
      expect(en.settings).toBeDefined();
      expect(sl.settings).toBeDefined();
    });

    it('should have help section', () => {
      expect(de.help).toBeDefined();
      expect(en.help).toBeDefined();
      expect(sl.help).toBeDefined();
    });
  });

  describe('Key translations', () => {
    it('should have correct app name', () => {
      expect(de.common.appName).toBe('FunkPilot');
      expect(en.common.appName).toBe('FunkPilot');
      expect(sl.common.appName).toBe('FunkPilot');
    });

    it('should have tab names in all languages', () => {
      expect(de.nav.voiceCQ).toBeDefined();
      expect(en.nav.voiceCQ).toBeDefined();
      expect(sl.nav.voiceCQ).toBeDefined();

      expect(de.nav.qsoChat).toBeDefined();
      expect(en.nav.qsoChat).toBeDefined();
      expect(sl.nav.qsoChat).toBeDefined();
    });

    it('should have different translations for German and English', () => {
      // Test keys that ARE different between languages
      expect(de.settings.title).not.toBe(en.settings.title);
      expect(de.help.title).not.toBe(en.help.title);
      expect(de.common.loading).not.toBe(en.common.loading);
    });
  });

  describe('Translation quality', () => {
    it('should not have empty string translations in German', () => {
      const deValues = getKeys(de).map(key => {
        const parts = key.split('.');
        let value: unknown = de;
        for (const part of parts) {
          value = (value as Record<string, unknown>)[part];
        }
        return { key, value };
      });

      const emptyValues = deValues.filter(({ value }) => value === '');
      if (emptyValues.length > 0) {
        console.warn('Empty German translations:', emptyValues.map(v => v.key));
      }
      expect(emptyValues).toEqual([]);
    });

    it('should not have empty string translations in English', () => {
      const enValues = getKeys(en).map(key => {
        const parts = key.split('.');
        let value: unknown = en;
        for (const part of parts) {
          value = (value as Record<string, unknown>)[part];
        }
        return { key, value };
      });

      const emptyValues = enValues.filter(({ value }) => value === '');
      if (emptyValues.length > 0) {
        console.warn('Empty English translations:', emptyValues.map(v => v.key));
      }
      expect(emptyValues).toEqual([]);
    });

    it('should not have empty string translations in Slovenian', () => {
      const slValues = getKeys(sl).map(key => {
        const parts = key.split('.');
        let value: unknown = sl;
        for (const part of parts) {
          value = (value as Record<string, unknown>)[part];
        }
        return { key, value };
      });

      const emptyValues = slValues.filter(({ value }) => value === '');
      if (emptyValues.length > 0) {
        console.warn('Empty Slovenian translations:', emptyValues.map(v => v.key));
      }
      expect(emptyValues).toEqual([]);
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return a valid supported language', () => {
      const lang = getCurrentLanguage();
      const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      expect(supportedCodes).toContain(lang);
    });
  });
});
