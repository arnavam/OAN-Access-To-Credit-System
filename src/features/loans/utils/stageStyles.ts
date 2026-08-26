import type { LoanStage, StageFilterOption, StageStyle } from '../types/loanStages.types';

const ARCHETYPE_STYLES: Record<string, StageStyle> = {
  Completed: {
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
    color: 'bg-emerald-500',
    tone: 'success',
  },
  Rejected: {
    badge: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    color: 'bg-red-500',
    tone: 'danger',
  },
  Cancelled: {
    badge: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    color: 'bg-red-500',
    tone: 'danger',
  },
  Draft: {
    badge: 'bg-gray-50 text-gray-600 border border-gray-200',
    dot: 'bg-gray-400',
    color: 'bg-gray-400',
    tone: 'neutral',
  },
};

const DEFAULT_STYLE: StageStyle = {
  badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  dot: 'bg-cyan-500',
  color: 'bg-cyan-500',
  tone: 'info',
};

/**
 * Returns a consistent visual style for any stage or status.
 * Intelligently checks against dynamic stages first (matching stage_id, label, name, or external_code),
 * then falls back to archetype_state or keyword matching.
 */
export function getStageStyle(
  statusOrStage: string | LoanStage,
  stages?: readonly LoanStage[]
): StageStyle & { label: string } {
  if (typeof statusOrStage === 'object' && statusOrStage !== null) {
    const stage = statusOrStage;
    return {
      ...getStyleForStage(stage),
      label: stage.label,
    };
  }

  const rawStatus = statusOrStage || '';

  // Look up in provided dynamic stages if available
  if (stages && stages.length > 0) {
    const matched = stages.find(
      (s) =>
        s.label.toLowerCase() === rawStatus.toLowerCase() ||
        s.stage_id.toLowerCase() === rawStatus.toLowerCase() ||
        s.name?.toLowerCase() === rawStatus.toLowerCase() ||
        (s.external_code && s.external_code.toLowerCase() === rawStatus.toLowerCase())
    );

    if (matched) {
      return {
        ...getStyleForStage(matched),
        label: matched.label,
      };
    }
  }

  // Fallback keyword-based matching
  const lower = rawStatus.toLowerCase();
  if (lower.includes('disburs') || lower.includes('complet') || lower.includes('approv') || lower.includes('grant')) {
    return { ...ARCHETYPE_STYLES.Completed!, label: rawStatus };
  }
  if (lower.includes('reject') || lower.includes('declin') || lower.includes('cancel')) {
    return { ...ARCHETYPE_STYLES.Rejected!, label: rawStatus };
  }
  if (lower.includes('draft') || lower.includes('pending')) {
    return { ...ARCHETYPE_STYLES.Draft!, label: rawStatus };
  }
  if (lower.includes('submit')) {
    return {
      badge: 'bg-blue-50 text-blue-700 border border-blue-200',
      dot: 'bg-blue-500',
      color: 'bg-blue-500',
      tone: 'info',
      label: rawStatus,
    };
  }
  if (lower.includes('verif') || lower.includes('doc')) {
    return {
      badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      dot: 'bg-indigo-500',
      color: 'bg-indigo-500',
      tone: 'info',
      label: rawStatus,
    };
  }

  return { ...DEFAULT_STYLE, label: rawStatus || 'Unknown' };
}

function getStyleForStage(stage: LoanStage): StageStyle {
  // Check archetype state
  const archetype = stage.archetype_state;
  if (archetype && ARCHETYPE_STYLES[archetype]) {
    return ARCHETYPE_STYLES[archetype]!;
  }

  // Specific transition nuances based on sequence or label
  const labelLower = stage.label.toLowerCase();
  if (labelLower.includes('submit')) {
    return {
      badge: 'bg-blue-50 text-blue-700 border border-blue-200',
      dot: 'bg-blue-500',
      color: 'bg-blue-500',
      tone: 'info',
    };
  }
  if (labelLower.includes('verif') || labelLower.includes('kyc')) {
    return {
      badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      dot: 'bg-indigo-500',
      color: 'bg-indigo-500',
      tone: 'info',
    };
  }
  if (labelLower.includes('approv') || labelLower.includes('sanction')) {
    return {
      badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      dot: 'bg-emerald-500',
      color: 'bg-emerald-500',
      tone: 'success',
    };
  }
  if (labelLower.includes('reject')) {
    return {
      badge: 'bg-red-50 text-red-700 border border-red-200',
      dot: 'bg-red-500',
      color: 'bg-red-500',
      tone: 'danger',
    };
  }

  return DEFAULT_STYLE;
}

/**
 * Maps an array of LoanStage items returned from the backend into options
 * formatted for Advanced Filters and Table Status dropdowns.
 */
export function toStageFilterOptions(stages: readonly LoanStage[]): StageFilterOption[] {
  return stages.map((stage) => {
    const style = getStageStyle(stage);
    return {
      value: stage.label,
      label: stage.label,
      color: style.color,
      dot: style.dot,
      archetype_state: stage.archetype_state,
      sequence: stage.sequence,
      stage_id: stage.stage_id,
      application_count: stage.application_count,
    };
  });
}
