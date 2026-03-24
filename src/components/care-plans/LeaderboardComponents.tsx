import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award, TrendingUp, Flame } from "lucide-react";

type RankEntry = {
  rank: number;
  name: string;
  mhp_balance: number;
  mhp_tier?: string;
  streak_days: number;
  is_current_user: boolean;
  badge?: string | null;
};

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Award className="h-4 w-4 text-orange-400" />;
  return <span className="text-xs font-bold text-slate-400 w-4 text-center">{rank}</span>;
};

const tierBadge = (tier?: string) => {
  if (!tier) return null;
  const map: Record<string, string> = {
    Gold: "bg-amber-100 text-amber-700 border-amber-300",
    Silver: "bg-slate-100 text-slate-600 border-slate-300",
    Bronze: "bg-orange-100 text-orange-700 border-orange-300",
  };
  return (
    <Badge variant="outline" className={`text-[9px] px-1 py-0 ${map[tier] || ""}`}>
      {tier}
    </Badge>
  );
};

export function LeaderboardCard({ rankings }: { rankings: RankEntry[] }) {
  return (
    <div className="space-y-1">
      {rankings.map((r) => (
        <div
          key={r.rank}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
            r.is_current_user
              ? "bg-green-50 border border-green-200 ring-1 ring-green-300"
              : r.rank <= 3
              ? "bg-slate-800/[0.02]"
              : ""
          }`}
        >
          <div className="w-6 flex items-center justify-center shrink-0">
            {rankIcon(r.rank)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-medium truncate ${r.is_current_user ? "text-green-700 font-semibold" : "text-foreground"}`}>
                {r.name}
                {r.is_current_user && <span className="text-[10px] ml-1 opacity-70">(You)</span>}
              </span>
              {tierBadge(r.mhp_tier)}
              {r.badge && (
                <Badge className="text-[9px] px-1 py-0 bg-purple-100 text-purple-700 border-purple-300" variant="outline">
                  {r.badge}
                </Badge>
              )}
            </div>
            {r.streak_days >= 3 && (
              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                <Flame className="h-2.5 w-2.5" /> {r.streak_days}d streak
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold tabular-nums text-foreground">{r.mhp_balance}</p>
            <p className="text-[10px] text-muted-foreground">MHP</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeeklyPodium({ top }: { top: { name: string; weekly_mhp: number; is_current_user: boolean }[] }) {
  if (top.length < 3) return null;

  const podiumOrder = [top[1], top[0], top[2]]; // 2nd, 1st, 3rd
  const heights = ["h-16", "h-24", "h-12"];
  const labels = ["2nd", "1st", "3rd"];
  const colors = ["bg-slate-200", "bg-amber-400", "bg-orange-200"];

  return (
    <div className="flex items-end justify-center gap-2 py-4">
      {podiumOrder.map((p, i) => (
        <div key={i} className="flex flex-col items-center gap-1 w-20">
          <p className={`text-[10px] font-medium truncate max-w-full ${p.is_current_user ? "text-green-600" : "text-muted-foreground"}`}>
            {p.name}
          </p>
          <p className="text-xs font-bold tabular-nums">{p.weekly_mhp}</p>
          <div className={`${heights[i]} w-full rounded-t-lg ${colors[i]} flex items-end justify-center pb-1`}>
            <span className="text-[10px] font-bold text-white/80">{labels[i]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed({ feed }: { feed: { action: string; points: number; patient_name: string; date: string }[] }) {
  const actionEmoji: Record<string, string> = {
    fasting_sugar_log: "🩸",
    postmeal_sugar_log: "🩸",
    medicine_confirm: "💊",
    meal_log: "🍽️",
    foot_check: "🦶",
    workout_log: "🏋️",
    streak_3day: "🔥",
    streak_7day: "🔥",
  };

  const actionShort: Record<string, string> = {
    fasting_sugar_log: "logged fasting sugar",
    postmeal_sugar_log: "logged post-meal sugar",
    medicine_confirm: "confirmed medicine",
    meal_log: "logged a meal",
    foot_check: "did foot check",
    workout_log: "logged workout",
    streak_3day: "hit 3-day streak!",
    streak_7day: "hit 7-day streak!",
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Live Activity</p>
      {feed.map((f, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-slate-100 last:border-0">
          <span>{actionEmoji[f.action] || "✅"}</span>
          <span className="flex-1 text-muted-foreground">
            <span className="font-medium text-foreground">{f.patient_name}</span>{" "}
            {actionShort[f.action] || f.action}
          </span>
          <span className="text-green-600 font-semibold">+{f.points}</span>
        </div>
      ))}
      {feed.length === 0 && <p className="text-xs text-muted-foreground py-2">No recent activity</p>}
    </div>
  );
}

export function MyPositionBanner({
  myRank,
  myMhp,
  totalMembers,
  nextAbove,
}: {
  myRank: number;
  myMhp: number;
  totalMembers: number;
  nextAbove?: { name: string; mhp: number; gap: number } | null;
}) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-lg font-bold">
          #{myRank}
        </div>
        <div>
          <p className="text-sm font-semibold">{myMhp} MHP</p>
          <p className="text-[10px] text-white/60">of {totalMembers} members</p>
        </div>
      </div>
      {nextAbove && (
        <div className="text-right">
          <p className="text-[10px] text-white/50">Next: {nextAbove.name}</p>
          <p className="text-xs font-semibold flex items-center gap-1 text-amber-400">
            <TrendingUp className="h-3 w-3" /> {nextAbove.gap} MHP to go
          </p>
        </div>
      )}
    </div>
  );
}

export function BatchMomentum({ loggedToday, totalMembers, momentumPct }: { loggedToday: number; totalMembers: number; momentumPct: number }) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
      <p className="text-xs text-green-600 font-medium mb-1">Today's Batch Energy</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-green-700">{momentumPct}%</p>
        <p className="text-xs text-green-600/70 pb-1">{loggedToday}/{totalMembers} members logged today</p>
      </div>
      <div className="w-full bg-green-100 rounded-full h-2 mt-2">
        <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${momentumPct}%` }} />
      </div>
    </div>
  );
}
