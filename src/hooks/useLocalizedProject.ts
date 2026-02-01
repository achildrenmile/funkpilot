import { useTranslation } from 'react-i18next';
import type {
  HamProject,
  LocalizedString,
  SupportedLanguage,
} from '../types/projects';
import { getLocalized } from '../types/projects';

// Flattened project with strings for current language
export interface FlatProject {
  id: string;
  name: string;
  category: HamProject['category'];
  difficulty: HamProject['difficulty'];
  description: string;
  hardware: HamProject['hardware'];
  projectType?: HamProject['projectType'];
  components: { name: string; quantity: number; notes?: string }[];
  estimatedCost: string;
  code: string;
  codeLanguage: HamProject['codeLanguage'];
  codeFileName: string;
  wiring?: { from: string; to: string; color?: string; notes?: string }[];
  schematicUrl?: string;
  wokwiUrl?: string;
  externalLinks?: { title: string; url: string }[];
  customizationSuggestions: string[];
  guideSections?: { id: string; title: string; icon?: string; content: string }[];
  hardwareOptions?: { name: string; image?: string; price: string; features: string[]; recommended?: boolean; buyLinks?: { store: string; url: string }[] }[];
}

export function useCurrentLanguage(): SupportedLanguage {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] as SupportedLanguage;
  return ['de', 'en', 'sl'].includes(lang) ? lang : 'de';
}

export function useLocalizedString(str: LocalizedString | string): string {
  const lang = useCurrentLanguage();
  return getLocalized(str, lang);
}

export function localizeProject(project: HamProject, lang: SupportedLanguage): FlatProject {
  const g = (s: LocalizedString | string) => getLocalized(s, lang);

  return {
    id: project.id,
    name: g(project.name),
    category: project.category,
    difficulty: project.difficulty,
    description: g(project.description),
    hardware: project.hardware,
    projectType: project.projectType,
    components: project.components.map(c => ({
      name: g(c.name),
      quantity: c.quantity,
      notes: c.notes ? g(c.notes) : undefined,
    })),
    estimatedCost: project.estimatedCost,
    code: g(project.code),
    codeLanguage: project.codeLanguage,
    codeFileName: project.codeFileName,
    wiring: project.wiring?.map(w => ({
      from: g(w.from),
      to: g(w.to),
      color: w.color,
      notes: w.notes ? g(w.notes) : undefined,
    })),
    schematicUrl: project.schematicUrl,
    wokwiUrl: project.wokwiUrl,
    externalLinks: project.externalLinks?.map(l => ({
      title: g(l.title),
      url: l.url,
    })),
    customizationSuggestions: project.customizationSuggestions.map(s => g(s)),
    guideSections: project.guideSections?.map(s => ({
      id: s.id,
      title: g(s.title),
      icon: s.icon,
      content: g(s.content),
    })),
    hardwareOptions: project.hardwareOptions?.map(h => ({
      name: g(h.name),
      image: h.image,
      price: h.price,
      features: h.features.map(f => g(f)),
      recommended: h.recommended,
      buyLinks: h.buyLinks,
    })),
  };
}

export function useLocalizedProject(project: HamProject): FlatProject {
  const lang = useCurrentLanguage();
  return localizeProject(project, lang);
}

export function useLocalizedProjects(projects: HamProject[]): FlatProject[] {
  const lang = useCurrentLanguage();
  return projects.map(p => localizeProject(p, lang));
}
