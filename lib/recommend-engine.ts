import { Profile, DiagnoseResult, University, RecommendedUniversity, RecommendResult, UniversityTier } from './types';
import universitiesData from '../data/universities.json';

/**
 * Pure rule-engine recommendation — NO AI involved.
 * Filters and scores universities based on profile match.
 *
 * ALGORITHM:
 * 1. Filter by profile.regions (keep matching regions only)
 * 2. Filter by budget (convert tier to USD max)
 * 3. Calculate matchScore per university (start at 100, subtract gap penalties)
 * 4. Classify: Dream (<50), Target (50-75), Safety (>75)
 * 5. Sort each tier, limit to 4 per tier
 */
export function recommendUniversities(profile: Partial<Profile>, diagnosis: DiagnoseResult): RecommendResult {
  // The demo catalog may contain richer Kazakhstan-specific fields (directions, grants,
  // housing). Normalize those fields to the UI model while keeping every catalog entry.
  const allUniversities = (universitiesData as any[]).map((uni) => ({
    ...uni,
    scholarships: uni.scholarships ?? uni.grants ?? '',
    programs: uni.programs ?? uni.directions ?? [],
    description: uni.description ?? uni.dataNote ?? '',
    tuition: Number(uni.tuition ?? 0),
  })) as University[];

  // ── 1. Filter by region ──
  const preferredRegions = profile.regions ?? [];
  let filtered = allUniversities.filter(uni =>
    preferredRegions.length === 0 || preferredRegions.includes(uni.region)
  );

  // ── 2. Filter by budget ──
  // Budget tiers: grant → need scholarship (keep all), 5k → $5000, 15k → $15000, 25k+ → unlimited
  const budgetMap: Record<string, number> = {
    'grant': 0,
    '5k': 5000,
    '15k': 15000,
    '25k+': 999999,
  };
  const maxBudget = budgetMap[profile.budget ?? '25k+'] ?? 999999;

  filtered = filtered.filter(uni => {
    if (profile.budget === 'grant') return true; // keep all, but penalize no-scholarship ones later
    return uni.tuition <= maxBudget;
  });

  // ── 3. Normalize GPA to 4.0 scale ──
  const gpa = profile.gpa ?? 0;
  const gpaMax = profile.gpaScale === '5.0' ? 5.0 : 4.0;
  const normalizedGpa = (gpa / gpaMax) * 4.0;

  // ── 4. Score each university ──
  const scored: RecommendedUniversity[] = filtered.map(uni => {
    let matchScore = 100; // start perfect, subtract penalties

    // GPA gap penalty: each 0.1 GPA deficit → -5 points
    if (uni.gpaReq) {
      const gpaDiff = uni.gpaReq - normalizedGpa;
      if (gpaDiff > 0) {
        matchScore -= gpaDiff * 50;
      } else {
        // Bonus for exceeding requirement
        matchScore += Math.min(Math.abs(gpaDiff) * 10, 10);
      }
    }

    // IELTS gap penalty
    if (uni.ieltsReq !== null) {
      if (profile.ielts !== null && profile.ielts !== undefined) {
        const ieltsDiff = uni.ieltsReq - profile.ielts;
        if (ieltsDiff > 0) {
          matchScore -= ieltsDiff * 20; // each 0.5 band deficit → -10 points
        }
      } else {
        matchScore -= 25; // penalty for not having IELTS when required
      }
    }

    // SAT gap penalty
    if (uni.satReq !== null) {
      if (profile.sat !== null && profile.sat !== undefined) {
        const satDiff = uni.satReq - profile.sat;
        if (satDiff > 0) {
          matchScore -= (satDiff / 100) * 15; // -15 per 100 points deficit
        }
      } else {
        matchScore -= 20;
      }
    }

    // ENT gap penalty
    if (uni.entReq !== null) {
      if (profile.ent !== null && profile.ent !== undefined) {
        const entDiff = uni.entReq - profile.ent;
        if (entDiff > 0) {
          matchScore -= entDiff * 0.5;
        }
      } else {
        matchScore -= 15;
      }
    }

    // Budget penalty for grant seekers at expensive schools with limited scholarships
    if (profile.budget === 'grant' && uni.tuition > 0) {
      if (!uni.scholarships || uni.scholarships.toLowerCase().includes('limited')) {
        matchScore -= 20;
      }
    }

    // Acceptance rate impact: very selective schools are harder
    if (uni.acceptanceRate < 0.1) matchScore -= 15;
    else if (uni.acceptanceRate < 0.2) matchScore -= 5;

    // Priority bonuses: top priority gets biggest bonus
    const priorities = profile.priorities ?? [];
    priorities.forEach((p, idx) => {
      const bonus = Math.max(10 - idx * 3, 2); // 10, 7, 4, 2
      switch (p) {
        case 'prestige':
          if (uni.ranking <= 50) matchScore += bonus;
          else if (uni.ranking <= 200) matchScore += bonus * 0.5;
          break;
        case 'cost':
          if (uni.tuition === 0) matchScore += bonus;
          else if (uni.tuition <= 5000) matchScore += bonus * 0.5;
          break;
        case 'career':
          if (uni.ranking <= 100) matchScore += bonus * 0.7;
          break;
        case 'city':
          // Slight bonus for popular student cities
          if (['Singapore', 'Germany', 'Japan', 'South Korea'].includes(uni.country)) {
            matchScore += bonus * 0.5;
          }
          break;
      }
    });

    // Clamp score to 0-100
    matchScore = Math.max(0, Math.min(100, matchScore));

    // ── Classify into tier ──
    let tier: UniversityTier = 'safety';
    if (matchScore < 50) tier = 'dream';
    else if (matchScore <= 75) tier = 'target';

    // ── Rule-based fallback explanation (Russian) ──
    const tierLabels = { dream: 'Dream (мечта)', target: 'Target (цель)', safety: 'Safety (запас)' };
    const explanation = generateFallbackExplanation(uni, tier, normalizedGpa, profile);

    return {
      ...uni,
      matchScore: Math.round(matchScore),
      tier,
      explanation,
    };
  });

  // ── 5. Split into tiers and sort ──
  const dream = scored.filter(u => u.tier === 'dream').sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  const target = scored.filter(u => u.tier === 'target').sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  const safety = scored.filter(u => u.tier === 'safety').sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

  return { dream, target, safety };
}

/** Generates a human-readable fallback explanation (no AI) */
function generateFallbackExplanation(
  uni: University,
  tier: UniversityTier,
  normalizedGpa: number,
  profile: Partial<Profile>
): string {
  const tierRu = { dream: 'мечты', target: 'целевой', safety: 'запасной' };
  const parts: string[] = [];

  parts.push(`${uni.name} — вуз категории "${tierRu[tier]}".`);

  if (uni.gpaReq) {
    const diff = normalizedGpa - uni.gpaReq;
    if (diff >= 0) {
      parts.push(`Ваш GPA (${normalizedGpa.toFixed(1)}) превышает требование (${uni.gpaReq}).`);
    } else {
      parts.push(`Требуемый GPA (${uni.gpaReq}) выше вашего (${normalizedGpa.toFixed(1)}) — потребуется дополнительная подготовка.`);
    }
  }

  if (uni.tuition === 0) {
    parts.push('Обучение бесплатное при наличии гранта.');
  } else {
    parts.push(`Стоимость: $${uni.tuition.toLocaleString()}/год.`);
  }

  return parts.join(' ');
}
