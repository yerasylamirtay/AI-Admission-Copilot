import { Profile, DiagnoseResult, University, RecommendedUniversity, RecommendResult, UniversityTier, Region } from './types';
import universitiesData from '../data/universities.json';

/**
 * Pure rule-engine recommendation with guaranteed fallback minimums.
 */
export function recommendUniversities(profile: Partial<Profile>, diagnosis: DiagnoseResult): RecommendResult {
  const allUniversities = (universitiesData as any[]).map((uni) => ({
    ...uni,
    scholarships: uni.scholarships ?? uni.grants ?? '',
    programs: uni.programs ?? uni.directions ?? [],
    description: uni.description ?? uni.dataNote ?? '',
    tuition: Number(uni.tuition ?? 0),
    city: uni.city ?? '',
    address: uni.address ?? '',
    housing: uni.housing ?? { available: false, costPerMonth: 0, description: '' }
  })) as University[];

  // 1. Map requested countries / regions
  const preferredRegions: Region[] = [];
  if (profile.regions && profile.regions.length > 0) {
    preferredRegions.push(...profile.regions);
  }
  if (profile.countries && profile.countries.length > 0) {
    profile.countries.forEach(c => {
      const lower = c.toLowerCase();
      if (lower.includes('казах') || lower.includes('kz')) preferredRegions.push('kazakhstan');
      if (lower.includes('сша') || lower.includes('usa') || lower.includes('америк')) preferredRegions.push('usa');
      if (lower.includes('европ') || lower.includes('герман') || lower.includes('switz') || lower.includes('польш') || lower.includes('чех') || lower.includes('эстон')) preferredRegions.push('europe');
      if (lower.includes('ази') || lower.includes('сингапур') || lower.includes('коре') || lower.includes('япон') || lower.includes('китай')) preferredRegions.push('asia');
    });
  }

  const uniqueRegions = Array.from(new Set(preferredRegions));

  // 2. Budget filter
  let budgetMax = 999999;
  const budgetStr = String(profile.budget || '').toLowerCase();
  if (budgetStr === 'grant' || budgetStr.includes('грант')) {
    budgetMax = 0;
  } else if (budgetStr.includes('5') || budgetStr === '5k') {
    budgetMax = 5000;
  } else if (budgetStr.includes('15') || budgetStr === '15k') {
    budgetMax = 15000;
  }

  // Filter attempt 1: strict
  let filtered = allUniversities.filter(uni => {
    const regionMatch = uniqueRegions.length === 0 || uniqueRegions.includes(uni.region);
    const budgetMatch = (budgetStr === 'grant' || budgetStr.includes('грант')) ? true : uni.tuition <= budgetMax;
    return regionMatch && budgetMatch;
  });

  // Guarantee at least 6 universities to choose from (relax filter if needed)
  if (filtered.length < 6) {
    filtered = allUniversities.filter(uni => {
      return uniqueRegions.length === 0 || uniqueRegions.includes(uni.region);
    });
  }
  if (filtered.length < 6) {
    filtered = allUniversities;
  }

  // 3. GPA normalization
  const gpa = profile.gpa ?? 4.0;
  const gpaMax = profile.gpaScale === '5.0' ? 5.0 : 4.0;
  const normalizedGpa = (gpa / gpaMax) * 4.0;

  const ieltsVal = profile.exams?.ielts?.score ?? profile.ielts ?? null;
  const satVal = profile.exams?.sat?.score ?? profile.sat ?? null;
  const entVal = profile.exams?.ent?.score ?? profile.ent ?? null;

  // 4. Score each university
  const scored: RecommendedUniversity[] = filtered.map(uni => {
    let matchScore = 100;

    if (uni.gpaReq) {
      const gpaDiff = uni.gpaReq - normalizedGpa;
      if (gpaDiff > 0) matchScore -= gpaDiff * 45;
      else matchScore += Math.min(Math.abs(gpaDiff) * 10, 10);
    }

    if (uni.ieltsReq !== null) {
      if (ieltsVal !== null && ieltsVal !== undefined) {
        const ieltsDiff = uni.ieltsReq - ieltsVal;
        if (ieltsDiff > 0) matchScore -= ieltsDiff * 20;
      } else {
        matchScore -= 20;
      }
    }

    if (uni.satReq !== null) {
      if (satVal !== null && satVal !== undefined) {
        const satDiff = uni.satReq - satVal;
        if (satDiff > 0) matchScore -= (satDiff / 100) * 15;
      } else {
        matchScore -= 15;
      }
    }

    if (uni.entReq !== null) {
      if (entVal !== null && entVal !== undefined) {
        const entDiff = uni.entReq - entVal;
        if (entDiff > 0) matchScore -= entDiff * 0.5;
      } else {
        matchScore -= 15;
      }
    }

    if (uni.acceptanceRate < 0.1) matchScore -= 15;
    else if (uni.acceptanceRate < 0.2) matchScore -= 5;

    matchScore = Math.max(10, Math.min(100, matchScore));

    let tier: UniversityTier = 'safety';
    if (matchScore < 55) tier = 'dream';
    else if (matchScore <= 78) tier = 'target';

    const explanation = generateFallbackExplanation(uni, tier, normalizedGpa);

    return {
      ...uni,
      matchScore: Math.round(matchScore),
      tier,
      explanation,
    };
  });

  // Sort per tier
  let dream = scored.filter(u => u.tier === 'dream').sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  let target = scored.filter(u => u.tier === 'target').sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  let safety = scored.filter(u => u.tier === 'safety').sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

  // GUARANTEE MINIMUM 3 UNIVERSITIES TOTAL IN OUTPUT
  const total = dream.length + target.length + safety.length;
  if (total < 3) {
    const sortedAll = scored.sort((a, b) => b.matchScore - a.matchScore);
    if (target.length === 0 && sortedAll.length > 0) target = sortedAll.slice(0, 3);
    if (safety.length === 0 && sortedAll.length > 3) safety = sortedAll.slice(3, 6);
  }

  return { dream, target, safety };
}

function generateFallbackExplanation(
  uni: University,
  tier: UniversityTier,
  normalizedGpa: number
): string {
  const tierRu = { dream: 'Dream (вуз мечты)', target: 'Target (оптимальная цель)', safety: 'Safety (надежный вариант)' };
  const parts: string[] = [];

  parts.push(`${uni.name} — категория "${tierRu[tier]}".`);

  if (uni.gpaReq) {
    const diff = normalizedGpa - uni.gpaReq;
    if (diff >= 0) {
      parts.push(`Ваш GPA (${normalizedGpa.toFixed(1)}) уверенно покрывает проходной балл (${uni.gpaReq}).`);
    } else {
      parts.push(`Требуемый GPA (${uni.gpaReq}) выше текущего (${normalizedGpa.toFixed(1)}) — шансы компенсируются эссе и портфолио.`);
    }
  }

  if (uni.tuition === 0 || (uni.scholarships && uni.scholarships.toLowerCase().includes('грант'))) {
    parts.push('Доступны государственные и университетские гранты.');
  }

  return parts.join(' ');
}
