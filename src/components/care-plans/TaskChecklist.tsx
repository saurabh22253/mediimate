import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Droplets, Pill, Utensils, Footprints, Dumbbell, Send, Loader2, Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

type TodayTasks = {
  fasting_sugar_logged: boolean;
  postmeal_sugar_logged: boolean;
  medicine_confirmed: boolean;
  meal_logged: boolean;
  foot_check_done: boolean;
  workout_logged: boolean;
};

type TaskItem = {
  key: string;
  action: string;
  label: string;
  icon: React.ElementType;
  done: boolean;
  needsValue: boolean;
  placeholder?: string;
};

function fireConfetti() {
  confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: ["#15803d", "#d97706", "#3b82f6"] });
}

export function TaskChecklist({
  assignmentId,
  tasks,
  currentDay,
}: {
  assignmentId: string;
  tasks: TodayTasks;
  currentDay: number;
}) {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const logMut = useMutation({
    mutationFn: (body: { action: string; value?: number; timing?: string }) =>
      api.post(`me/careplan/${assignmentId}/log-action`, body),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["me", "careplan"] });
      qc.invalidateQueries({ queryKey: ["me", "gamification"] });
      if (data?.new_tier) fireConfetti();
      else fireConfetti();
    },
  });

  const taskList: TaskItem[] = [
    { key: "fasting_sugar_logged", action: "fasting_sugar_log", label: "Log Fasting Sugar", icon: Droplets, done: tasks.fasting_sugar_logged, needsValue: true, placeholder: "mg/dL" },
    { key: "postmeal_sugar_logged", action: "postmeal_sugar_log", label: "Log Post-Meal Sugar", icon: Droplets, done: tasks.postmeal_sugar_logged, needsValue: true, placeholder: "mg/dL" },
    { key: "medicine_confirmed", action: "medicine_confirm", label: "Confirm Medicine Taken", icon: Pill, done: tasks.medicine_confirmed, needsValue: false },
    { key: "meal_logged", action: "meal_log", label: "Log a Meal", icon: Utensils, done: tasks.meal_logged, needsValue: false },
    { key: "foot_check_done", action: "foot_check", label: "Foot Self-Check", icon: Footprints, done: tasks.foot_check_done, needsValue: false },
    { key: "workout_logged", action: "workout_log", label: "Log Workout", icon: Dumbbell, done: tasks.workout_logged, needsValue: false },
  ];

  const completedCount = taskList.filter((t) => t.done).length;
  const allDone = completedCount === taskList.length;

  const handleLog = (task: TaskItem) => {
    const val = task.needsValue ? Number(values[task.action]) : undefined;
    if (task.needsValue && (!val || val < 30 || val > 600)) return;
    logMut.mutate({ action: task.action, value: val });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Day {currentDay} Tasks
        </p>
        <span className="text-xs font-semibold text-green-600">
          {completedCount}/{taskList.length}
        </span>
      </div>

      {allDone && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
          <p className="text-sm font-semibold text-green-700 flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4" /> All tasks done for today!
          </p>
        </div>
      )}

      <div className="space-y-2">
        {taskList.map((task) => {
          const Icon = task.icon;
          const isLoading = logMut.isPending && logMut.variables?.action === task.action;
          return (
            <div
              key={task.key}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${task.done ? "bg-green-50/50 border-green-200" : "bg-white border-slate-200 hover:border-green-300"}`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${task.done ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                {task.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.done ? "text-green-700 line-through" : "text-foreground"}`}>
                  {task.label}
                </p>
              </div>
              {!task.done && task.needsValue && (
                <Input
                  type="number"
                  placeholder={task.placeholder}
                  className="w-20 h-8 text-sm"
                  value={values[task.action] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [task.action]: e.target.value }))}
                  min={30}
                  max={600}
                />
              )}
              {!task.done && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  disabled={isLoading || (task.needsValue && (!values[task.action] || Number(values[task.action]) < 30))}
                  onClick={() => handleLog(task)}
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
