const admissionTopics = [
  'поступ', 'университет', 'вуз', 'колледж', 'бакалавр', 'магистр',
  'программ', 'специальност', 'документ', 'дедлайн', 'срок', 'стипенд',
  'грант', 'экзамен', 'ielts', 'toefl', 'sat', 'ент', 'gpa', 'мотивацион',
  'заявк', 'кампус', 'общежит', 'образован', 'учёб', 'учеб', 'карьер',
];

const unrelatedTopics = [
  'анекдот', 'рецепт', 'погода', 'политик', 'новост', 'игр', 'фильм',
  'музык', 'javascript', 'python', 'код напиши', 'крипт', 'ставк',
  'диагноз', 'лекарств', 'лечение', 'спорт', 'трениров', 'отношени',
];

export function isAdmissionQuestion(message: string): boolean {
  const normalized = message.toLowerCase().trim();
  if (!normalized) return true;
  const hasAdmissionTopic = admissionTopics.some((topic) => normalized.includes(topic));
  const hasUnrelatedTopic = unrelatedTopics.some((topic) => normalized.includes(topic));
  return !hasUnrelatedTopic || hasAdmissionTopic;
}

export const ADMISSION_SCOPE_REFUSAL =
  'Я отвечаю только на вопросы о поступлении в университет: выборе программы, вузах, документах, экзаменах, дедлайнах, грантах, стипендиях и roadmap. Задай вопрос по одной из этих тем — и я помогу.';
