import { Cpu } from 'lucide-react';
import type { HamProject } from '../../types/projects';
import { CATEGORY_INFO, HARDWARE_INFO, DIFFICULTY_LABELS } from '../../types/projects';

interface ProjectCardProps {
  project: HamProject;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const category = CATEGORY_INFO[project.category];
  const hardware = HARDWARE_INFO[project.hardware];

  return (
    <button
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:border-sky-500 hover:bg-slate-750 transition-all group w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">
            {project.name}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Hardware Badge */}
        <span className={`${hardware.color} text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1`}>
          <Cpu className="w-3 h-3" />
          {hardware.name}
        </span>

        {/* Difficulty */}
        <span className="text-xs text-slate-500">
          {'⭐'.repeat(project.difficulty)} {DIFFICULTY_LABELS[project.difficulty]}
        </span>

        {/* Cost */}
        <span className="text-xs text-green-400 ml-auto">
          {project.estimatedCost}
        </span>
      </div>
    </button>
  );
}
