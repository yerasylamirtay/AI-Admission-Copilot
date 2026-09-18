import OnboardingWizard from '@/components/OnboardingWizard';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0E14] text-[#F1F5F9]">
      <OnboardingWizard />
    </main>
  );
}

/*
  === ПРОВЕРКА (integration fix checklist) ===
  (а) При старте (npm run dev → localhost:3000) показывается Welcome
      (компонент components/onboarding/Welcome), а НЕ старый Step1Landing.
      OnboardingWizard проверяет onboarded === false и рендерит <Welcome />.
  (б) После полного прохождения онбординга (Welcome → ProfileSetup →
      AcademicsAndTests → Preferences → Diagnose → Recommendations)
      на экране рекомендаций при широких фильтрах видно до 30 вузов
      (по 10 на каждый тир dream/target/safety вместо прежних 4).
      Изменено в lib/recommend-engine.ts: .slice(0, 10) на всех трёх строках.
  (в) Step1Landing.tsx и Step2Profile.tsx удалены из components/steps/
      и нигде в проекте не импортируются — весь мёртвый код убран.
*/
