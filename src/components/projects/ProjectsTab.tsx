import { useState, useEffect } from 'react';
import { Wrench, Search, Anchor } from 'lucide-react';
import { ALL_PROJECTS, getProjectsByCategory, getProjectById } from '../../data/projects';
import { CATEGORY_INFO, type ProjectCategory, getLocalized } from '../../types/projects';
import { ProjectCard } from './ProjectCard';
import { ProjectDetail } from './ProjectDetail';
import { useCurrentLanguage } from '../../hooks/useLocalizedProject';
import type { HamProject } from '../../types/projects';

type CategoryFilter = 'all' | 'morsefleet' | ProjectCategory;

// Count MorseFleet projects
const MORSEFLEET_COUNT = ALL_PROJECTS.filter(p => p.morsefleet).length;

interface ProjectsTabProps {
  initialProjectId?: string;
  onProjectChange?: (projectId: string | undefined) => void;
}

export default function ProjectsTab({ initialProjectId, onProjectChange }: ProjectsTabProps) {
  const lang = useCurrentLanguage();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedProject, setSelectedProject] = useState<HamProject | null>(
    initialProjectId ? getProjectById(initialProjectId) || null : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with external initialProjectId changes (browser back/forward)
  useEffect(() => {
    const project = initialProjectId ? getProjectById(initialProjectId) || null : null;
    setSelectedProject(project);
  }, [initialProjectId]);

  // Handle project selection
  const handleSelectProject = (project: HamProject | null) => {
    setSelectedProject(project);
    onProjectChange?.(project?.id);
  };

  // Filter projects
  let filteredProjects = selectedCategory === 'all'
    ? ALL_PROJECTS
    : selectedCategory === 'morsefleet'
    ? ALL_PROJECTS.filter(p => p.morsefleet)
    : getProjectsByCategory(selectedCategory);

  // Search filter (search in localized content)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredProjects = filteredProjects.filter(p => {
      const name = getLocalized(p.name, lang).toLowerCase();
      const description = getLocalized(p.description, lang).toLowerCase();
      return name.includes(query) ||
        description.includes(query) ||
        p.hardware.toLowerCase().includes(query);
    });
  }

  // Show project detail if selected
  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => handleSelectProject(null)}
      />
    );
  }

  // Translations
  const texts = {
    title: { de: 'Bastelprojekte', en: 'DIY Projects', sl: 'DIY projekti' },
    subtitle: { de: 'Arduino & ESP32 Projekte für Funk-Enthusiasten', en: 'Arduino & ESP32 projects for radio enthusiasts', sl: 'Arduino & ESP32 projekti za radijske navdušence' },
    searchPlaceholder: { de: 'Projekt suchen...', en: 'Search projects...', sl: 'Išči projekte...' },
    all: { de: 'Alle', en: 'All', sl: 'Vse' },
    noResults: { de: 'Keine Projekte gefunden', en: 'No projects found', sl: 'Ni najdenih projektov' },
    tryOther: { de: 'Versuche eine andere Suche oder Kategorie', en: 'Try a different search or category', sl: 'Poskusi drugo iskanje ali kategorijo' },
    moreComingSoon: { de: 'Mehr Projekte kommen bald! Vorschläge?', en: 'More projects coming soon! Suggestions?', sl: 'Več projektov prihaja kmalu! Predlogi?' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
          {getLocalized(texts.title, lang)}
        </h2>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          {getLocalized(texts.subtitle, lang)}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex items-center flex-1 bg-slate-800 border border-slate-700 rounded-lg focus-within:border-sky-500">
          <Search className="w-4 h-4 text-slate-400 ml-3 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getLocalized(texts.searchPlaceholder, lang)}
            className="flex-1 bg-transparent px-3 py-2 focus:outline-none"
          />
        </div>

        {/* Category Filter - Horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex gap-2 pb-2 sm:pb-0 sm:flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {getLocalized(texts.all, lang)} ({ALL_PROJECTS.length})
            </button>
            {/* MorseFleet Filter */}
            {MORSEFLEET_COUNT > 0 && (
              <button
                onClick={() => setSelectedCategory('morsefleet')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === 'morsefleet'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Anchor className="w-3.5 h-3.5" />
                <span>MorseFleet</span>
                <span className="text-xs opacity-70">({MORSEFLEET_COUNT})</span>
              </button>
            )}
            {(Object.keys(CATEGORY_INFO) as ProjectCategory[]).map((cat) => {
              const count = getProjectsByCategory(cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{CATEGORY_INFO[cat].icon}</span>
                  <span className="hidden sm:inline">{getLocalized(CATEGORY_INFO[cat].name, lang)}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleSelectProject(project)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{getLocalized(texts.noResults, lang)}</p>
          <p className="text-sm mt-1">{getLocalized(texts.tryOther, lang)}</p>
        </div>
      )}

      {/* Coming Soon Note */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <p className="text-sm text-slate-400 text-center">
          {getLocalized(texts.moreComingSoon, lang)} <a href="mailto:oe8yml@rednil.at" className="text-sky-400 hover:underline">oe8yml@rednil.at</a>
        </p>
      </div>
    </div>
  );
}
