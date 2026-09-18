import { Profile, DiagnoseResult, Factor, ReadinessTier } from './types';

/**
 * Pure rule-engine diagnosis — NO AI involved.
 * Calculates readiness index as weighted average of 4 factors.
 *
 * WEIGHTS (must sum to 1.0):
 *   - academics:    0.30  (GPA normalized to 4.0 scale)
 *   - languages:    0.25  (IELTS score)
 *   - exams:        0.25  (best of SAT or ENT, normalized)
 *   - achievements: 0.20  (olympiads count & level)
 *
 * SCORING THRESHOLDS documented inline for each factor.
 */
export function diagnoseProfile(profile: Partial<Profile>): DiagnoseResult {
  const WEIGHT_ACADEMICS    = 0.30;
  const WEIGHT_LANGUAGES    = 0.25;
  const WEIGHT_EXAMS        = 0.25;
  const WEIGHT_ACHIEVEMENTS = 0.20;

  // ── 1. Academics (Weight: 0.30) ──
  // Normalize GPA to 4.0 scale, then map:
  //   4.0 → 100, 3.5 → 75, 3.0 → 50, <2.5 → 25
  let academicsScore = 0;
  let academicsDetail = '';
  const gpa = profile.gpa ?? 0;
  const gpaMax = profile.gpaScale === '5.0' ? 5.0 : 4.0;
  const normalizedGpa = (gpa / gpaMax) * 4.0;

  if (normalizedGpa >= 3.9)      { academicsScore = 100; academicsDetail = 'Отличный GPA — максимальный балл.'; }
  else if (normalizedGpa >= 3.5) { academicsScore = 75;  academicsDetail = 'Сильный GPA, подходит для большинства топ-вузов.'; }
  else if (normalizedGpa >= 3.0) { academicsScore = 50;  academicsDetail = 'Средний GPA, соответствует минимуму многих вузов.'; }
  else if (normalizedGpa >= 2.5) { academicsScore = 35;  academicsDetail = 'GPA ниже среднего, ограничивает выбор.'; }
  else                           { academicsScore = 25;  academicsDetail = 'Низкий GPA — рекомендуем рассмотреть подготовительные программы.'; }

  // ── 2. Languages (Weight: 0.25) ──
  // IELTS scoring: 8.0+ → 100, 7.0 → 80, 6.5 → 65, 6.0 → 50, null → 30
  let languagesScore = 30;
  let languagesDetail = 'IELTS не сдан — балл снижен. Рекомендуем подготовиться к экзамену.';
  const ielts = profile.exams?.ielts?.score ?? profile.ielts ?? null;

  if (ielts !== null && ielts !== undefined) {
    if (ielts >= 8.0)      { languagesScore = 100; languagesDetail = 'Превосходный уровень английского.'; }
    else if (ielts >= 7.0) { languagesScore = 80;  languagesDetail = 'Сильный английский — подходит для большинства программ.'; }
    else if (ielts >= 6.5) { languagesScore = 65;  languagesDetail = 'Хороший английский, достаточен для многих программ.'; }
    else if (ielts >= 6.0) { languagesScore = 50;  languagesDetail = 'Базовый уровень — некоторые конкурентные программы могут быть недоступны.'; }
    else                   { languagesScore = 30;  languagesDetail = 'Уровень ниже требуемого для большинства зарубежных вузов.'; }
  } else if (profile.languages && profile.languages.some(l => l.toLowerCase().includes('англ') || l.toLowerCase().includes('eng'))) {
    languagesScore = 50;
    languagesDetail = 'Есть знание английского языка, но требуется подтверждение сертификатом.';
  }

  // ── 3. Exams (Weight: 0.25) ──
  // SAT: 1500+ → 100, 1400 → 85, 1200 → 65, 1000 → 45
  // ENT: 135+ → 100, 120 → 80, 100 → 60
  // Both null → 20
  let examsScore = 20;
  let examsDetail = 'Стандартные экзамены не сданы — рекомендуем запланировать SAT или ЕНТ.';

  let satScoreCalc = 0;
  const sat = profile.exams?.sat?.score ?? profile.sat ?? null;
  if (sat !== null && sat !== undefined) {
    if (sat >= 1500)      satScoreCalc = 100;
    else if (sat >= 1400) satScoreCalc = 85;
    else if (sat >= 1200) satScoreCalc = 65;
    else if (sat >= 1000) satScoreCalc = 45;
    else                  satScoreCalc = 30;
  }

  let entScoreCalc = 0;
  const ent = profile.exams?.ent?.score ?? profile.ent ?? null;
  if (ent !== null && ent !== undefined) {
    if (ent >= 135)      entScoreCalc = 100;
    else if (ent >= 120) entScoreCalc = 80;
    else if (ent >= 100) entScoreCalc = 60;
    else                 entScoreCalc = 40;
  }

  if (satScoreCalc > 0 || entScoreCalc > 0) {
    if (satScoreCalc >= entScoreCalc) {
      examsScore = satScoreCalc;
      examsDetail = `SAT ${sat} — ${satScoreCalc >= 85 ? 'отличный' : satScoreCalc >= 65 ? 'хороший' : 'средний'} результат.`;
    } else {
      examsScore = entScoreCalc;
      examsDetail = `ЕНТ ${ent} — ${entScoreCalc >= 80 ? 'сильный' : 'средний'} результат.`;
    }
  }

  // ── 4. Achievements (Weight: 0.20) ──
  // Per olympiad: international → 30, national → 20, regional → 10, city → 5, school → 2
  // Capped at 100
  let achievementsScore = 0;
  const olympiads = profile.olympiads ?? [];

  for (const oly of olympiads) {
    switch (oly.level) {
      case 'international': achievementsScore += 30; break;
      case 'national':      achievementsScore += 20; break;
      case 'region':        achievementsScore += 10; break;
      case 'city':          achievementsScore += 5;  break;
      case 'school':        achievementsScore += 2;  break;
    }
  }
  achievementsScore = Math.min(achievementsScore, 100);

  let achievementsDetail = 'Олимпиады и достижения не указаны.';
  if (achievementsScore >= 80)     achievementsDetail = 'Выдающиеся достижения — серьёзное преимущество при поступлении.';
  else if (achievementsScore >= 50) achievementsDetail = 'Хороший набор достижений — усиливает профиль.';
  else if (achievementsScore > 0)   achievementsDetail = 'Есть начальные достижения — рекомендуем участвовать в дополнительных олимпиадах.';

  // ── Build factors array ──
  const factors: Factor[] = [
    { name: 'academics',    label: 'Академика',        score: academicsScore,    weight: WEIGHT_ACADEMICS,    detail: academicsDetail },
    { name: 'languages',    label: 'Языки',             score: languagesScore,    weight: WEIGHT_LANGUAGES,    detail: languagesDetail },
    { name: 'exams',        label: 'Экзамены',          score: examsScore,        weight: WEIGHT_EXAMS,        detail: examsDetail },
    { name: 'achievements', label: 'Достижения',        score: achievementsScore, weight: WEIGHT_ACHIEVEMENTS, detail: achievementsDetail },
  ];

  // ── Calculate weighted readiness index ──
  const readinessIndex = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  );

  // ── Assign tier ──
  let tier: ReadinessTier = 'low';
  if (readinessIndex >= 75) tier = 'high';
  else if (readinessIndex >= 50) tier = 'medium';

  return { readinessIndex, factors, tier };
}
