import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  LeaderboardCard,
  WeeklyPodium,
  ActivityFeed,
  MyPositionBanner,
  BatchMomentum,
} from "@/components/care-plans/LeaderboardComponents";

type LeaderboardData = {
  careplan_name: string;
  duration_days: number;
  current_day: number;
  total_members: number;
  logged_today: number;
  momentum_pct: number;
  rankings: any[];
  weekly_top: any[];
  activity_feed: any[];
  my_rank: number;
  my_mhp: number;
  next_above: { name: string; mhp: number; gap: number } | null;
};

export default function PatientCarePlanLeaderboard() {
  // First get the assignment to get the ID
  const { data: cpData } = useQuery<{ assignment: any }>({
    queryKey: ["me", "careplan"],
    queryFn: () => api.get("me/careplan"),
  });

  const assignmentId = cpData?.assignment?.id;

  const { data, isLoading } = useQuery<LeaderboardData>({
    queryKey: ["me", "careplan", "leaderboard", assignmentId],
    queryFn: () => api.get<LeaderboardData>(`me/careplan/${assignmentId}/leaderboard`),
    enabled: !!assignmentId,
  });

  if (isLoading || !cpData) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data || !assignmentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-6 text-center">
        <Users className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No leaderboard data available.</p>
        <Link to="/patient/care-plan">
          <Button variant="outline" size="sm">Back to Care Plan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/patient/care-plan">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-heading font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Leaderboard
          </h1>
          <p className="text-xs text-muted-foreground">
            {data.careplan_name} — Day {data.current_day}/{data.duration_days}
          </p>
        </div>
      </div>

      {/* My Position */}
      <MyPositionBanner
        myRank={data.my_rank}
        myMhp={data.my_mhp}
        totalMembers={data.total_members}
        nextAbove={data.next_above}
      />

      {/* Batch Momentum */}
      <BatchMomentum
        loggedToday={data.logged_today}
        totalMembers={data.total_members}
        momentumPct={data.momentum_pct}
      />

      {/* Weekly Podium */}
      {data.weekly_top.length >= 3 && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week's Top 3</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <WeeklyPodium top={data.weekly_top} />
          </CardContent>
        </Card>
      )}

      {/* Full Rankings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            All Members ({data.total_members})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardCard rankings={data.rankings} />
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <ActivityFeed feed={data.activity_feed} />
        </CardContent>
      </Card>
    </div>
  );
}
