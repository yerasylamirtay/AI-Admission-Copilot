"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Profile, DiagnoseResult, RecommendResult, RoadmapResult, EssayAnswers, OnboardingState } from '@/lib/types';
import { ProgressBar } from '@/components/ProgressBar';
import Step1Landing from './steps/Step1Landing';
import Step2Profile from './steps/Step2Profile';
import Step3Diagnose from './steps/Step3Diagnose';
import Step4Recommendations from './steps/Step4Recommendations';
import Step5Compare from './steps/Step5Compare';
import Step6Roadmap from './steps/Step6Roadmap';
import Step7NextStep from './steps/Step7NextStep';

const STEPS = [
  { label: 'Старт' },
  { label: 'Профиль' },
  { label: 'Диагностика' },
  { label: 'Рекомендации' },
  { label: 'Сравнение' },
  { label: 'Roadmap' },
  { label: 'Финиш' },
];

const INITIAL_STATE: OnboardingState = {
  currentStep: 0,
  profile: {},
  diagnoseResult: null,
  recommendations: null,
  selectedForComparison: [],
  roadmap: null,
  roadmapProgress: {},
  essayAnswers: { hook: '', journey: '', whyUs: '', futureImpact: '' },
};

export default function OnboardingWizard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [isLoadingDiagnose, setIsLoadingDiagnose] = useState(false);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(false);

  // ── Restore from localStorage on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admitpath_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
      }
    } catch (e) {
      console.error('Failed to restore state:', e);
    }
    setIsLoaded(true);
  }, []);

  // ── Persist to localStorage (debounced) ──
  useEffect(() => {
    if (!isLoaded) return;
    const timeout = setTimeout(() => {
      localStorage.setItem('admitpath_state', JSON.stringify(state));
    }, 300);
    return () => clearTimeout(timeout);
  }, [state, isLoaded]);

  // ── API: Diagnose ──
  const runDiagnose = useCallback(async (profile: Partial<Profile>) => {
    setIsLoadingDiagnose(true);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Diagnose failed');
      const data = await res.json();
      return data.diagnosis ?? data;
    } catch (err) {
      console.error('Diagnose error:', err);
      return null;
    } finally {
      setIsLoadingDiagnose(false);
    }
  }, []);

  // ── API: Recommend ──
  const runRecommend = useCallback(async (profile: Partial<Profile>, diagnosis: DiagnoseResult) => {
    setIsLoadingRecommend(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, diagnosis }),
      });
      if (!res.ok) throw new Error('Recommend failed');
      const data = await res.json();
      return data.recommendations ?? data;
    } catch (err) {
      console.error('Recommend error:', err);
      return null;
    } finally {
      setIsLoadingRecommend(false);
    }
  }, []);

  // ── State updaters ──
  const handleUpdateProfile = (updates: Partial<Profile>) => {
    setState(prev => ({ ...prev, profile: { ...prev.profile, ...updates } }));
  };

  const handleNext = async () => {
    const nextStep = Math.min(state.currentStep + 1, STEPS.length - 1);

    // When leaving Step 2 (Profile) → run diagnose + recommend chain
    if (state.currentStep === 1) {
      const diagnosis = await runDiagnose(state.profile);
      if (diagnosis) {
        const recommendations = await runRecommend(state.profile, diagnosis);
        setState(prev => ({
          ...prev,
          currentStep: nextStep,
          diagnoseResult: diagnosis,
          recommendations: recommendations ?? prev.recommendations,
        }));
        return;
      }
    }

    setState(prev => ({ ...prev, currentStep: nextStep }));
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 0) }));
  };

  const handlePresetAndSkip = async (presetProfile: Profile) => {
    setState(prev => ({ ...prev, profile: presetProfile, currentStep: 2 }));

    // Auto-run diagnose + recommend for preset
    const diagnosis = await runDiagnose(presetProfile);
    if (diagnosis) {
      const recommendations = await runRecommend(presetProfile, diagnosis);
      setState(prev => ({
        ...prev,
        diagnoseResult: diagnosis,
        recommendations: recommendations ?? prev.recommendations,
      }));
    }
  };

  const handleToggleComparison = (id: string) => {
    setState(prev => {
      const selected = prev.selectedForComparison.includes(id)
        ? prev.selectedForComparison.filter(x => x !== id)
        : prev.selectedForComparison.length < 4
          ? [...prev.selectedForComparison, id]
          : prev.selectedForComparison;
      return { ...prev, selectedForComparison: selected };
    });
  };

  const handleToggleRoadmapItem = (id: string) => {
    setState(prev => ({
      ...prev,
      roadmapProgress: { ...prev.roadmapProgress, [id]: !prev.roadmapProgress[id] },
    }));
  };

  const handleSetRoadmap = (roadmap: RoadmapResult) => {
    setState(prev => ({ ...prev, roadmap }));
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stepProps = {
    profile: state.profile,
    onUpdateProfile: handleUpdateProfile,
    onNext: handleNext,
    onBack: handleBack,
    diagnoseResult: state.diagnoseResult,
    recommendations: state.recommendations,
    selectedForComparison: state.selectedForComparison,
    onToggleComparison: handleToggleComparison,
    roadmap: state.roadmap,
    roadmapProgress: state.roadmapProgress,
    onToggleRoadmapItem: handleToggleRoadmapItem,
    isLoadingDiagnose,
    isLoadingRecommend,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ProgressBar steps={STEPS} currentStep={state.currentStep} />
      <div className="mt-8 animate-fade-in" key={state.currentStep}>
        {state.currentStep === 0 && (
          <Step1Landing
            {...stepProps}
            onNext={() => handleNext()}
            onPresetSelect={handlePresetAndSkip}
          />
        )}
        {state.currentStep === 1 && <Step2Profile {...stepProps} />}
        {state.currentStep === 2 && <Step3Diagnose {...stepProps} />}
        {state.currentStep === 3 && <Step4Recommendations {...stepProps} />}
        {state.currentStep === 4 && <Step5Compare {...stepProps} />}
        {state.currentStep === 5 && (
          <Step6Roadmap {...stepProps} onSetRoadmap={handleSetRoadmap} />
        )}
        {state.currentStep === 6 && <Step7NextStep {...stepProps} />}
      </div>
    </div>
  );
}
