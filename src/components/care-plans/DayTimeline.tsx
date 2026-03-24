import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type DayLog = {
  day: number;
  fasting_sugar?: number | null;
  postmeal_sugar?: number | null;
  meds_taken?: boolean;
  meals_logged?: number;
  mhp_earned_today?: number;
};

export function DayTimeline({
  totalDays,
  currentDay,
  dayLogs,
}: {
  totalDays: number;
  currentDay: number;
  dayLogs: DayLog[];
}) {
  const logMap = new Map(dayLogs.map((d) => [d.day, d]));

  const getDayStatus = (day: number) => {
    if (day > currentDay) return "future";
    const log = logMap.get(day);
    if (!log) return day < currentDay ? "missed" : "today";
    const hasActivity = log.fasting_sugar != null || log.postmeal_sugar != null || log.meds_taken || (log.meals_logged || 0) > 0;
    if (day === currentDay) return hasActivity ? "today-active" : "today";
    return hasActivity ? "logged" : "missed";
  };

  const statusStyles: Record<string, string> = {
    logged: "bg-green-500 text-white ring-green-500/30",
    missed: "bg-rose-100 text-rose-400 ring-rose-200",
    today: "bg-amber-100 text-amber-700 ring-amber-400 ring-2 animate-pulse",
    "today-active": "bg-green-500 text-white ring-amber-400 ring-2",
    future: "bg-slate-100 text-slate-300",
  };

  // Week labels
  const weeks = [1, 2, 3, 4];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">30-Day Progress</p>
        <p className="text-xs text-muted-foreground">
          Day <span className="font-semibold text-foreground">{currentDay}</span> / {totalDays}
        </p>
      </div>
      <TooltipProvider delayDuration={200}>
        <div className="space-y-2">
          {weeks.map((week) => (
            <div key={week} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-8 shrink-0">W{week}</span>
              <div className="flex gap-1.5 flex-1">
                {Array.from({ length: week < 4 ? 7 : totalDays - 21 }, (_, i) => {
                  const day = (week - 1) * 7 + i + 1;
                  const status = getDayStatus(day);
                  const log = logMap.get(day);
                  return (
                    <Tooltip key={day}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold cursor-default ring-1 ring-transparent transition-all hover:scale-110 ${statusStyles[status]}`}
                        >
                          {day}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">Day {day}</p>
                        {log && (
                          <>
                            {log.fasting_sugar != null && <p>Fasting: {log.fasting_sugar} mg/dL</p>}
                            {log.postmeal_sugar != null && <p>Post-meal: {log.postmeal_sugar} mg/dL</p>}
                            {log.meds_taken && <p>Medicine: ✓</p>}
                            {(log.meals_logged || 0) > 0 && <p>Meals logged: {log.meals_logged}</p>}
                            {(log.mhp_earned_today || 0) > 0 && <p>MHP earned: +{log.mhp_earned_today}</p>}
                          </>
                        )}
                        {!log && day < currentDay && <p className="text-rose-400">No logs</p>}
                        {day === currentDay && <p className="text-amber-500">Today</p>}
                        {day > currentDay && <p className="text-muted-foreground">Upcoming</p>}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Logged</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-100 border border-rose-200" /> Missed</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-100 border-2 border-amber-400" /> Today</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-100" /> Upcoming</span>
      </div>
    </div>
  );
}
