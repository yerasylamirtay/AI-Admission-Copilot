'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, DiagnoseResult, RecommendResult, RoadmapResult, UserStreak } from '@/lib/types';
import Header from '@/components/Header';
import ProgressBar from '@/components/ProgressBar';

import Step1Landing from '@/components/steps/Step1Landing';
import Step2ProfileChat from '@/components/steps/Step2ProfileChat';
import Step3Diagnose from '@/components/steps/Step3Diagnose';
import Step4Recommendations from '@/components/steps/Step4Recommendations';
import Step5Compare from '@/components/steps/Step5Compare';
import Step6Roadmap from '@/components/steps/Step6Roadmap';
import Step7Home from '@/components/steps/Step7Home';
import universitiesData from '@/data/universities.json';

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [user, setUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [isHomeView, setIsHomeView] = useState(false);

  // Application Data States
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [diagnosis, setDiagnosis] = useState<DiagnoseResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendResult | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState<UserStreak>({
    currentStreak: 1,
    lastVisitDate: new Date().toISOString().split('T')[0],
  });

  const [loadingAction, setLoadingAction] = useState(false);

  // 1. Initial Load & Auth Listeners
  useEffect(() => {
    // Check active supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserDataFromSupabase(session.user.id);
      } else {
        // Local storage fallback for guests
        try {
          const saved = localStorage.getItem('admitpath_state_v2');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.profile) setProfile(parsed.profile);
            if (parsed.diagnosis) setDiagnosis(parsed.diagnosis);
            if (parsed.recommendations) setRecommendations(parsed.recommendations);
            if (parsed.selectedForComparison) setSelectedForComparison(parsed.selectedForComparison);
            if (parsed.roadmap) setRoadmap(parsed.roadmap);
            if (parsed.roadmapProgress) setRoadmapProgress(parsed.roadmapProgress);
            if (parsed.currentStep) setCurrentStep(parsed.currentStep);
            if (parsed.isHomeView) setIsHomeView(parsed.isHomeView);
            if (parsed.streak) setStreak(parsed.streak);
          }
        } catch (e) {
          console.warn('Local storage error:', e);
        }
        setLoaded(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserDataFromSupabase(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save to LocalStorage as secondary cache
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(
        'admitpath_state_v2',
        JSON.stringify({
          profile,
          diagnosis,
          recommendations,
          selectedForComparison,
          roadmap,
          roadmapProgress,
          currentStep,
          isHomeView,
          streak,
        })
      );
    }
  }, [profile, diagnosis, recommendations, selectedForComparison, roadmap, roadmapProgress, currentStep, isHomeView, streak, loaded]);

  // Load from Supabase for logged in user
  const loadUserDataFromSupabase = async (uid: string) => {
    try {
      // 1. Load profile
      const { data: profData } = await supabase.from('profiles').select('*').eq('uid', uid).maybeSingle();
      if (profData) {
        const mappedProf: Profile = {
          grade: profData.grade,
          interests: profData.interests,
          gpa: Number(profData.gpa),
          languages: profData.languages,
          exams: profData.exams || {},
          countries: profData.countries,
          budget: profData.budget,
          timeline: profData.timeline,
          constraints: profData.constraints,
        };
        setProfile(mappedProf);
      }

      // 2. Load diagnosis
      const { data: diagData } = await supabase.from('diagnoses').select('*').eq('uid', uid).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (diagData) {
        setDiagnosis({
          readinessIndex: diagData.readiness_index,
          tier: diagData.readiness_index >= 75 ? 'high' : diagData.readiness_index >= 50 ? 'medium' : 'low',
          factors: [],
          summary: diagData.summary,
          strengths: diagData.strengths,
          constraints: diagData.constraints,
          goal: diagData.goal,
        });
      }

      // 3. Load recommendations
      const { data: recData } = await supabase.from('recommendations').select('*').eq('uid', uid);
      if (recData && recData.length > 0) {
        const uniMap = new Map((universitiesData as any[]).map((u) => [u.id, u]));
        const dream: any[] = [];
        const target: any[] = [];
        const safety: any[] = [];

        recData.forEach((r) => {
          const baseUni = uniMap.get(r.university_id);
          if (baseUni) {
            const item = { ...baseUni, tier: r.tier, matchScore: r.match_score, explanation: r.explanation };
            if (r.tier === 'dream') dream.push(item);
            else if (r.tier === 'target') target.push(item);
            else safety.push(item);
          }
        });
        if (dream.length + target.length + safety.length > 0) {
          setRecommendations({ dream, target, safety });
        }
      }

      // 4. Load roadmap items
      const { data: roadData } = await supabase.from('roadmap_items').select('*').eq('uid', uid);
      if (roadData && roadData.length > 0) {
        const items = roadData.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category as any,
          resources: Array.isArray(item.resources) ? item.resources : [],
          deadline: item.deadline,
          completed: item.completed,
          priority: item.priority as any,
        }));
        setRoadmap({ items });

        const progressMap: Record<string, boolean> = {};
        items.forEach((it) => {
          if (it.completed) progressMap[it.id] = true;
        });
        setRoadmapProgress(progressMap);
      }

      // 5. Update streak
      const today = new Date().toISOString().split('T')[0];
      const { data: streakData } = await supabase.from('streaks').select('*').eq('uid', uid).maybeSingle();
      if (streakData) {
        const lastDate = streakData.last_visit_date;
        let newStreak = streakData.current_streak;
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          newStreak = lastDate === yesterday ? newStreak + 1 : 1;
          await supabase.from('streaks').update({ current_streak: newStreak, last_visit_date: today }).eq('uid', uid);
        }
        setStreak({ currentStreak: newStreak, lastVisitDate: today, targetUniversityName: streakData.target_university_name });
      } else {
        await supabase.from('streaks').insert({ uid, current_streak: 1, last_visit_date: today });
        setStreak({ currentStreak: 1, lastVisitDate: today });
      }

      // If user has roadmap items or completed steps before, direct to Home or step 2
      if (roadData && roadData.length > 0) {
        setIsHomeView(true);
        setCurrentStep(7);
      } else if (profData) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } catch (e) {
      console.warn('Error loading from supabase:', e);
    } finally {
      setLoaded(true);
    }
  };

  // Run Diagnosis Calculation & AI Synthesis
  const runDiagnosis = useCallback(async (currentProf: Partial<Profile>) => {
    setLoadingAction(true);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProf),
      });
      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);

        // Save diagnosis to Supabase
        if (user) {
          await supabase.from('diagnoses').insert({
            uid: user.id,
            readiness_index: data.diagnosis.readinessIndex,
            summary: data.diagnosis.summary,
            strengths: data.diagnosis.strengths,
            constraints: data.diagnosis.constraints,
            goal: data.diagnosis.goal,
          });
        }
        return data.diagnosis;
      }
    } catch (err) {
      console.error('Diagnosis failed:', err);
    } finally {
      setLoadingAction(false);
    }
  }, [user]);

  // Run University Recommendations
  const runRecommendations = useCallback(async (currentProf: Partial<Profile>, currentDiag: DiagnoseResult) => {
    setLoadingAction(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: currentProf, diagnosis: currentDiag }),
      });
      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);

        // Pre-select top 2-3 target universities for comparison
        const initialSelected = [
          ...(data.recommendations.target || []).slice(0, 2),
          ...(data.recommendations.dream || []).slice(0, 1),
        ].map((u: any) => u.id);
        setSelectedForComparison(initialSelected);

        // Save recommendations to Supabase
        if (user) {
          await supabase.from('recommendations').delete().eq('uid', user.id);
          const allToSave = [
            ...(data.recommendations.dream || []),
            ...(data.recommendations.target || []),
            ...(data.recommendations.safety || []),
          ];
          for (const u of allToSave) {
            await supabase.from('recommendations').insert({
              uid: user.id,
              university_id: u.id,
              tier: u.tier,
              match_score: u.matchScore,
              explanation: u.explanation,
            });
          }
        }
        return data.recommendations;
      }
    } catch (err) {
      console.error('Recommendations failed:', err);
    } finally {
      setLoadingAction(false);
    }
  }, [user]);

  // Run Adaptive Roadmap
  const runRoadmap = useCallback(async (currentProf: Partial<Profile>, selectedIds: string[]) => {
    setLoadingAction(true);
    try {
      const allUnis = [
        ...(recommendations?.dream || []),
        ...(recommendations?.target || []),
        ...(recommendations?.safety || []),
      ];
      const targetUnis = allUnis.filter((u) => selectedIds.includes(u.id));

      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: currentProf,
          universities: targetUnis.length > 0 ? targetUnis : allUnis.slice(0, 2),
        }),
      });

      const data = await res.json();
      if (data.roadmap) {
        setRoadmap(data.roadmap);

        // Save to Supabase
        if (user && data.roadmap.items) {
          await supabase.from('roadmap_items').delete().eq('uid', user.id);
          for (const item of data.roadmap.items) {
            await supabase.from('roadmap_items').insert({
              id: item.id,
              uid: user.id,
              title: item.title,
              description: item.description,
              category: item.category,
              resources: item.resources || [],
              deadline: item.deadline,
              completed: false,
              priority: item.priority,
            });
          }
        }
      }
    } catch (err) {
      console.error('Roadmap failed:', err);
    } finally {
      setLoadingAction(false);
    }
  }, [recommendations, user]);

  // Toggle university comparison selection (up to 8)
  const handleToggleComparison = (id: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 8) return prev;
      return [...prev, id];
    });
  };

  // Toggle roadmap item checkbox
  const handleToggleRoadmapItem = async (id: string) => {
    const newVal = !roadmapProgress[id];
    setRoadmapProgress((prev) => ({ ...prev, [id]: newVal }));

    if (user) {
      await supabase.from('roadmap_items').update({ completed: newVal }).eq('id', id).eq('uid', user.id);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admitpath_state_v2');
    setUser(null);
    setProfile({});
    setDiagnosis(null);
    setRecommendations(null);
    setRoadmap(null);
    setRoadmapProgress({});
    setIsHomeView(false);
    setCurrentStep(1);
  };

  // Loading state
  if (!loaded) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Header */}
      <Header
        currentStep={currentStep}
        userEmail={user?.email}
        onNavigate={(step) => {
          setIsHomeView(false);
          setCurrentStep(step);
        }}
        onLogout={handleLogout}
        onGoHome={() => setIsHomeView(true)}
        isHomeView={isHomeView}
      />

      {/* 7-Step Progress Bar (when in step-by-step flow) */}
      {!isHomeView && (
        <ProgressBar
          currentStep={currentStep}
          totalSteps={7}
          onStepClick={(step) => setCurrentStep(step)}
        />
      )}

      {/* Main Step Render */}
      <main className="flex-1">
        {isHomeView ? (
          <Step7Home
            roadmap={roadmap}
            roadmapProgress={roadmapProgress}
            onToggleRoadmapItem={handleToggleRoadmapItem}
            streak={streak}
            targetGoalName={diagnosis?.goal}
            onGoToRoadmap={() => {
              setIsHomeView(false);
              setCurrentStep(6);
            }}
            onGoToProfile={() => {
              setIsHomeView(false);
              setCurrentStep(2);
            }}
            onGoToUniversities={() => {
              setIsHomeView(false);
              setCurrentStep(4);
            }}
          />
        ) : (
          <>
            {/* Step 1: Landing */}
            {currentStep === 1 && (
              <Step1Landing
                onStart={() => setCurrentStep(2)}
                onLoginSuccess={(loggedInUser) => {
                  setUser(loggedInUser);
                  setCurrentStep(2);
                }}
              />
            )}

            {/* Step 2: Profile Chat */}
            {currentStep === 2 && (
              <Step2ProfileChat
                profile={profile}
                onBack={() => setCurrentStep(1)}
                onProfileComplete={async (newProf) => {
                  setProfile(newProf);
                  // Save profile to Supabase
                  if (user) {
                    await supabase.from('profiles').upsert({
                      uid: user.id,
                      grade: newProf.grade,
                      interests: newProf.interests,
                      gpa: newProf.gpa,
                      languages: newProf.languages,
                      exams: newProf.exams || {},
                      countries: newProf.countries,
                      budget: newProf.budget,
                      timeline: newProf.timeline,
                      constraints: newProf.constraints,
                    });
                  }
                  const diag = await runDiagnosis(newProf);
                  if (diag) {
                    setCurrentStep(3);
                  }
                }}
              />
            )}

            {/* Step 3: Diagnosis */}
            {currentStep === 3 && (
              <Step3Diagnose
                diagnosis={diagnosis}
                profile={profile}
                isLoadingDiagnose={loadingAction}
                onBack={() => setCurrentStep(2)}
                onNext={async () => {
                  if (diagnosis) {
                    await runRecommendations(profile, diagnosis);
                  }
                  setCurrentStep(4);
                }}
              />
            )}

            {/* Step 4: Recommendations */}
            {currentStep === 4 && (
              <Step4Recommendations
                profile={profile}
                recommendations={recommendations}
                selectedForComparison={selectedForComparison}
                onToggleComparison={handleToggleComparison}
                isLoadingRecommend={loadingAction}
                onBack={() => setCurrentStep(3)}
                onNext={() => setCurrentStep(5)}
              />
            )}

            {/* Step 5: Comparison */}
            {currentStep === 5 && (
              <Step5Compare
                selectedForComparison={selectedForComparison}
                recommendations={recommendations}
                onToggleComparison={handleToggleComparison}
                onBack={() => setCurrentStep(4)}
                onNext={async () => {
                  await runRoadmap(profile, selectedForComparison);
                  setCurrentStep(6);
                }}
              />
            )}

            {/* Step 6: Roadmap */}
            {currentStep === 6 && (
              <Step6Roadmap
                roadmap={roadmap}
                roadmapProgress={roadmapProgress}
                onToggleRoadmapItem={handleToggleRoadmapItem}
                isLoadingRoadmap={loadingAction}
                onBack={() => setCurrentStep(5)}
                onNext={() => {
                  setIsHomeView(true);
                  setCurrentStep(7);
                }}
              />
            )}

            {/* Step 7: Home View */}
            {currentStep === 7 && (
              <Step7Home
                roadmap={roadmap}
                roadmapProgress={roadmapProgress}
                onToggleRoadmapItem={handleToggleRoadmapItem}
                streak={streak}
                targetGoalName={diagnosis?.goal}
                onGoToRoadmap={() => {
                  setIsHomeView(false);
                  setCurrentStep(6);
                }}
                onGoToProfile={() => {
                  setIsHomeView(false);
                  setCurrentStep(2);
                }}
                onGoToUniversities={() => {
                  setIsHomeView(false);
                  setCurrentStep(4);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
