import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { HeartPulse, Trophy, Info, Flame, ChevronRight, Calendar, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { MHPCounter } from "@/components/care-plans/MHPCounter";
import { TierProgressBar } from "@/components/care-plans/TierProgressBar";
import { DayTimeline } from "@/components/care-plans/DayTimeline";
import { SugarChart } from "@/components/care-plans/SugarChart";
import { TaskChecklist } from "@/components/care-plans/TaskChecklist";
import { ComplicationTiles } from "@/components/care-plans/ComplicationTiles";
import { StatsRow } from "@/components/care-plans/StatsRow";
import { MHPRewardPanel } from "@/components/care-plans/MHPRewardPanel";

type PlanSummary = {
  assignment_id: string;
  careplan_id: string;
  name: string;
  description: string;
  cover_color: string;
  duration_days: number;
  current_day: number;
  mhp_balance: number;
  mhp_tier: string;
  streak_days: number;
  days_logged: number;
  status: string;
};

type CarePlanData = {
  assignment: any;
  careplan: any;
  today_tasks: any;
  current_week: number;
  week_theme: any;
};

function TierBadge({ tier }: { tier: string }) {
  const colours: Record<string, string> = {
    Gold: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Silver: "bg-slate-100 text-slate-600 border-slate-300",
    Bronze: "bg-orange-100 text-orange-700 border-orange-300",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colours[tier] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {tier}
    </span>
  );
}

function PlanSelectionGrid({ plans, onSelect }: { plans: PlanSummary[]; onSelect: (id: string) => void }) {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <HeartPulse className="h-6 w-6 text-green-600" />
        <h1 className="text-xl font-heading font-semibold">My Care Plans</h1>
      </div>
      <p className="text-sm text-muted-foreground">You're enrolled in {plans.length} care plans. Select one to view details.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => {
          const progress = Math.round((plan.current_day / plan.duration_days) * 100);
          return (
            <button
              key={plan.assignment_id}
              onClick={() => onSelect(plan.assignment_id)}
              className="text-left rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              {/* Colour strip */}
              <div className="h-2 w-full" style={{ background: plan.cover_color }} />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold leading-snug">{plan.name}</h2>
                  <TierBadge tier={plan.mhp_tier} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Day {plan.current_day} / {plan.duration_days}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: plan.cover_color }} />
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-500" />
                    {plan.mhp_balance} MHP
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {plan.streak_days}d streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500" />
                    {plan.days_logged} logged
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium" style={{ color: plan.cover_color }}>View Plan</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PatientCarePlan() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch list of all enrolled plans
  const { data: plans, isLoading: listLoading } = useQuery<PlanSummary[]>({
    queryKey: ["me", "careplans"],
    queryFn: () => api.get<PlanSummary[]>("me/careplans"),
  });

  // Auto-select if only one plan
  const effectiveId = selectedId ?? (plans?.length === 1 ? plans[0].assignment_id : null);

  // Fetch full detail for selected plan
  const { data, isLoading: detailLoading, error } = useQuery<CarePlanData>({
    queryKey: ["me", "careplan", effectiveId],
    queryFn: () => api.get<CarePlanData>(`me/careplan${effectiveId ? `?assignmentId=${effectiveId}` : ""}`),
    enabled: !!effectiveId,
  });

  const isLoading = listLoading || (!!effectiveId && detailLoading);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-destructive">Failed to load care plan. Please try again.</p>
      </div>
    );
  }

  // No plans enrolled at all
  if (!listLoading && plans && plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-6 text-center">
        <HeartPulse className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">No Active Care Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You're not enrolled in any care plan yet. Ask your doctor to enroll you in a program.
          </p>
        </div>
      </div>
    );
  }

  // Multiple plans — show tile selection until one is chosen
  if (plans && plans.length > 1 && !effectiveId) {
    return <PlanSelectionGrid plans={plans} onSelect={setSelectedId} />;
  }

  if (!data?.assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-6 text-center">
        <HeartPulse className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">No Active Care Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You're not enrolled in any care plan yet. Ask your doctor to enroll you in a program.
          </p>
        </div>
      </div>
    );
  }

  const { assignment: a, careplan: cp, today_tasks: tasks, current_week, week_theme } = data;

  const daysLogged = (a.day_logs || []).filter(
    (d: any) => d.fasting_sugar != null || d.postmeal_sugar != null || d.meds_taken
  ).length;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {plans && plans.length > 1 && (
            <button
              onClick={() => setSelectedId(null)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mr-1"
            >
              ← All Plans
            </button>
          )}
          <HeartPulse className="h-6 w-6 text-green-600" />
          <div>
            <h1 className="text-xl font-heading font-semibold">{cp.name}</h1>
            <p className="text-xs text-muted-foreground">{cp.description}</p>
          </div>
        </div>
        <Link to="/patient/care-plan/leaderboard">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Leaderboard
          </Button>
        </Link>
      </div>

      {/* Week Theme Banner */}
      {week_theme && (
        <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-green-700 border-green-300 text-[10px]">
              Week {current_week}
            </Badge>
            <h3 className="text-sm font-semibold text-green-800">{week_theme.theme}</h3>
          </div>
          <p className="text-xs text-green-700/80">{week_theme.focus}</p>
        </div>
      )}

      {/* MHP Counter */}
      <MHPCounter value={a.mhp_balance || 0} tier={a.mhp_tier} />

      {/* Tier Progress */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <TierProgressBar balance={a.mhp_balance || 0} tier={a.mhp_tier} />
        </CardContent>
      </Card>

      {/* Stats Row */}
      <StatsRow
        currentDay={a.current_day}
        totalDays={cp.duration_days}
        streakDays={a.streak_days || 0}
        mhpBalance={a.mhp_balance || 0}
        daysLogged={daysLogged}
      />

      {/* Streak Banner */}
      {(a.streak_days || 0) >= 3 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
          <Flame className="h-5 w-5 text-amber-500" />
          <p className="text-sm font-medium text-amber-700">
            {a.streak_days}-day streak! Keep it going for bonus MHP!
          </p>
        </div>
      )}

      {/* Task Checklist */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <TaskChecklist assignmentId={a.id} tasks={tasks} currentDay={a.current_day} />
        </CardContent>
      </Card>

      {/* Sugar Chart */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <SugarChart dayLogs={a.day_logs || []} currentDay={a.current_day} />
        </CardContent>
      </Card>

      {/* Day Timeline */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <DayTimeline totalDays={cp.duration_days} currentDay={a.current_day} dayLogs={a.day_logs || []} />
        </CardContent>
      </Card>

      {/* Complication Screening */}
      {a.current_day >= 5 && (
        <Card>
          <CardContent className="pt-5 pb-4">
            <ComplicationTiles assignmentId={a.id} screened={a.complications_screened || {}} />
          </CardContent>
        </Card>
      )}

      {/* MHP Rewards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Rewards & MHP History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MHPRewardPanel
            balance={a.mhp_balance || 0}
            tier={a.mhp_tier}
            history={a.mhp_history || []}
            rewardTiers={cp.reward_tiers || []}
            rewardsClaimed={a.rewards_claimed}
          />
        </CardContent>
      </Card>

      {/* Onboarding hint */}
      {!a.onboarding_complete && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Complete Your Onboarding</p>
                <p className="text-xs text-blue-600 mt-1">
                  Share your diabetes type, current medications, and baseline sugar readings to personalize your care plan experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
