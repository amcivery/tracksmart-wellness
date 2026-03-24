"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChartData, ChartOptions } from "chart.js";
import {
  AlertTriangle,
  BedDouble,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Eye,
  History,
  Loader2,
  Moon,
  MoonStar,
  Smartphone,
  Sparkles,
  Upload,
  Wine,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import WearableChartWrapper from "@/components/WearableChartWrapper";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TOOL_DISCLAIMER =
  "This is an educational tool only. Not medical advice. Consult your doctor.";
const STORAGE_KEY = "tracksmart-sleep-sessions";
const AMAZON_TAG = "tracksmartwel-20";

const sourceDevices = [
  "oura",
  "whoop",
  "garmin",
  "apple-watch",
  "manual",
] as const;
type SourceDevice = (typeof sourceDevices)[number];

const sourceDeviceLabels: Record<SourceDevice, string> = {
  oura: "Oura Ring",
  whoop: "Whoop",
  garmin: "Garmin",
  "apple-watch": "Apple Watch",
  manual: "Manual Entry",
};

/* ------------------------------------------------------------------ */
/*  Schema & types                                                     */
/* ------------------------------------------------------------------ */

const sleepSchema = z
  .object({
    timeInBed: z
      .number()
      .min(180, "Time in bed should be at least 3 hours (180 min).")
      .max(720, "Time in bed should not exceed 12 hours (720 min)."),
    totalSleepTime: z
      .number()
      .min(60, "Total sleep time should be at least 60 minutes.")
      .max(720, "Total sleep time should not exceed 12 hours."),
    deepSleep: z
      .number()
      .min(0, "Deep sleep cannot be negative.")
      .max(360, "Deep sleep cannot exceed 6 hours."),
    remSleep: z
      .number()
      .min(0, "REM sleep cannot be negative.")
      .max(360, "REM sleep cannot exceed 6 hours."),
    awakenings: z
      .number()
      .min(0, "Awakenings cannot be negative.")
      .max(30, "Awakenings cannot exceed 30."),
    sleepOnsetLatency: z
      .number()
      .min(0, "Sleep onset latency cannot be negative.")
      .max(120, "Sleep onset latency cannot exceed 120 minutes."),
    source: z.enum(sourceDevices),
  })
  .refine((data) => data.totalSleepTime <= data.timeInBed, {
    message: "Total sleep time cannot exceed time in bed.",
    path: ["totalSleepTime"],
  })
  .refine((data) => data.deepSleep + data.remSleep <= data.totalSleepTime, {
    message: "Deep + REM sleep cannot exceed total sleep time.",
    path: ["remSleep"],
  });

type FormValues = z.infer<typeof sleepSchema>;

interface HabitToggle {
  key: string;
  label: string;
  description: string;
  minDelta: number;
  maxDelta: number;
  icon: typeof Coffee;
}

interface SleepAnalysis {
  score: number;
  grade: string;
  gradeColor: string;
  efficiencyScore: number;
  efficiencyPercent: number;
  stageBalanceScore: number;
  deepPercent: number;
  remPercent: number;
  lightPercent: number;
  disturbanceScore: number;
  solScore: number;
  suggestions: string[];
  stageChartData: ChartData<"doughnut">;
  stageChartOptions: ChartOptions<"doughnut">;
  scoreChartData: ChartData<"doughnut">;
  scoreChartOptions: ChartOptions<"doughnut">;
}

interface SavedSession {
  id: string;
  timestamp: string;
  values: FormValues;
  score: number;
}

/* ------------------------------------------------------------------ */
/*  Habit toggles definition                                           */
/* ------------------------------------------------------------------ */

const habitToggles: HabitToggle[] = [
  {
    key: "caffeineCutoff",
    label: "Caffeine cutoff before 2 PM",
    description:
      "Caffeine has a half-life of 5-7 hours. Cutting it by early afternoon reduces sleep onset latency and improves deep sleep quality.",
    minDelta: 5,
    maxDelta: 5,
    icon: Coffee,
  },
  {
    key: "consistentBedtime",
    label: "Consistent bedtime (\u00b130 min)",
    description:
      "A stable sleep schedule anchors your circadian rhythm, increasing overall sleep efficiency and reducing time awake at night.",
    minDelta: 4,
    maxDelta: 4,
    icon: Clock,
  },
  {
    key: "noScreens",
    label: "No screens 1 hr before bed",
    description:
      "Blue light and mental stimulation from screens suppress melatonin and delay sleep onset. Avoiding them improves both SOL and REM latency.",
    minDelta: 3,
    maxDelta: 3,
    icon: Smartphone,
  },
  {
    key: "noAlcohol",
    label: "No alcohol near bedtime",
    description:
      "Alcohol fragments sleep architecture, reduces REM sleep, and increases nighttime awakenings\u2014even at moderate doses.",
    minDelta: 6,
    maxDelta: 6,
    icon: Wine,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function formatSavedTime(timestamp: string) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Scoring algorithm                                                  */
/* ------------------------------------------------------------------ */

function computeEfficiencyScore(totalSleepTime: number, timeInBed: number) {
  const efficiency = (totalSleepTime / timeInBed) * 100;
  if (efficiency >= 90) return { score: 100, percent: efficiency };
  if (efficiency >= 85) return { score: 85, percent: efficiency };
  if (efficiency >= 80) return { score: 70, percent: efficiency };
  if (efficiency >= 75) return { score: 55, percent: efficiency };
  return { score: Math.max(20, efficiency * 0.6), percent: efficiency };
}

function computeStageBalanceScore(
  deepSleep: number,
  remSleep: number,
  totalSleepTime: number,
) {
  if (totalSleepTime === 0) return { score: 0, deepPercent: 0, remPercent: 0, lightPercent: 0 };

  const deepPercent = (deepSleep / totalSleepTime) * 100;
  const remPercent = (remSleep / totalSleepTime) * 100;
  const lightMinutes = totalSleepTime - deepSleep - remSleep;
  const lightPercent = (lightMinutes / totalSleepTime) * 100;

  let deepScore: number;
  if (deepPercent >= 15 && deepPercent <= 25) deepScore = 100;
  else if (deepPercent >= 10 && deepPercent < 15) deepScore = 70;
  else if (deepPercent > 25 && deepPercent <= 30) deepScore = 80;
  else if (deepPercent >= 5 && deepPercent < 10) deepScore = 45;
  else deepScore = 25;

  let remScore: number;
  if (remPercent >= 20 && remPercent <= 28) remScore = 100;
  else if (remPercent >= 15 && remPercent < 20) remScore = 70;
  else if (remPercent > 28 && remPercent <= 35) remScore = 80;
  else if (remPercent >= 10 && remPercent < 15) remScore = 45;
  else remScore = 25;

  return {
    score: deepScore * 0.55 + remScore * 0.45,
    deepPercent,
    remPercent,
    lightPercent,
  };
}

function computeDisturbanceScore(awakenings: number) {
  if (awakenings <= 1) return 100;
  if (awakenings <= 3) return 85;
  if (awakenings <= 5) return 68;
  if (awakenings <= 8) return 50;
  if (awakenings <= 12) return 35;
  return 20;
}

function computeSolScore(solMinutes: number) {
  if (solMinutes <= 10) return 100;
  if (solMinutes <= 15) return 85;
  if (solMinutes <= 20) return 72;
  if (solMinutes <= 30) return 55;
  if (solMinutes <= 45) return 38;
  return 20;
}

function gradeFromScore(score: number): { grade: string; color: string } {
  if (score >= 85) return { grade: "Excellent", color: "text-emerald-300" };
  if (score >= 70) return { grade: "Good", color: "text-cyan-300" };
  if (score >= 55) return { grade: "Fair", color: "text-amber-300" };
  return { grade: "Poor", color: "text-red-300" };
}

function buildSuggestions(values: FormValues, efficiencyPercent: number, deepPercent: number, remPercent: number, score: number): string[] {
  const suggestions: string[] = [];

  if (efficiencyPercent < 85) {
    suggestions.push(
      "Your sleep efficiency is below 85%. Try going to bed only when sleepy and keeping a consistent wake time. If you regularly lie awake for more than 20 minutes, consider getting out of bed until drowsy.",
    );
  }

  if (deepPercent < 15) {
    suggestions.push(
      `Deep sleep is below the ideal 15-20% range. Prioritize consistent exercise earlier in the day, keep your bedroom cool (65-68\u00b0F / 18-20\u00b0C), and consider magnesium glycinate in the evening. <a href="https://www.amazon.com/dp/B07P5K7DQP?tag=${AMAZON_TAG}" target="_blank" rel="noopener noreferrer" class="font-semibold text-violet-300 hover:text-violet-200 underline">see Amazon</a>`,
    );
  }

  if (remPercent < 20) {
    suggestions.push(
      "REM sleep is below the ideal 20-25% range. Alcohol, cannabis, and certain medications can suppress REM. Also ensure you are getting 7+ hours of total sleep, since REM cycles concentrate in the last third of the night.",
    );
  }

  if (values.awakenings > 5) {
    suggestions.push(
      "Frequent awakenings are dragging your score down. Check for environmental disruptions (noise, light, temperature), limit fluids close to bedtime, and consider whether stress or sleep apnea could be a factor.",
    );
  }

  if (values.sleepOnsetLatency > 20) {
    suggestions.push(
      "You are taking a while to fall asleep. Build a strong wind-down routine: dim lights, avoid screens for an hour, and try breathing exercises or progressive muscle relaxation. Only get into bed when you feel genuinely sleepy.",
    );
  }

  if (values.totalSleepTime < 420) {
    suggestions.push(
      "Total sleep is under 7 hours, which limits time for restorative deep and REM stages. If your schedule allows, aim for 7.5-8.5 hours in bed to give your body enough opportunity for full sleep cycles.",
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Your sleep metrics look solid across all areas. Focus on consistency: maintain the same bedtime and wake time, keep your pre-sleep routine stable, and protect what is working.",
    );
  }

  return suggestions;
}

function buildStageChartData(
  deepPercent: number,
  remPercent: number,
  lightPercent: number,
  awakeTimePercent: number,
): { data: ChartData<"doughnut">; options: ChartOptions<"doughnut"> } {
  return {
    data: {
      labels: ["Deep Sleep", "REM Sleep", "Light Sleep", "Awake"],
      datasets: [
        {
          data: [
            Math.round(deepPercent * 10) / 10,
            Math.round(remPercent * 10) / 10,
            Math.round(lightPercent * 10) / 10,
            Math.round(awakeTimePercent * 10) / 10,
          ],
          backgroundColor: [
            "rgba(139, 92, 246, 0.85)",
            "rgba(56, 189, 248, 0.85)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(248, 113, 113, 0.5)",
          ],
          borderColor: [
            "rgba(139, 92, 246, 1)",
            "rgba(56, 189, 248, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(248, 113, 113, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { padding: 16 },
        },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.label}: ${context.parsed}%`,
          },
        },
      },
    },
  };
}

function buildScoreChartData(
  score: number,
  gradeColor: string,
): { data: ChartData<"doughnut">; options: ChartOptions<"doughnut"> } {
  const fillColor = score >= 85
    ? "rgba(16, 185, 129, 0.85)"
    : score >= 70
      ? "rgba(56, 189, 248, 0.85)"
      : score >= 55
        ? "rgba(251, 191, 36, 0.85)"
        : "rgba(248, 113, 113, 0.85)";

  return {
    data: {
      labels: ["Score", "Remaining"],
      datasets: [
        {
          data: [Math.round(score), Math.round(100 - score)],
          backgroundColor: [fillColor, "rgba(30, 41, 59, 0.5)"],
          borderColor: [fillColor, "rgba(51, 65, 85, 0.3)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      cutout: "72%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) =>
              context.dataIndex === 0
                ? ` Sleep Score: ${context.parsed}/100`
                : "",
          },
        },
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/*  CSV Parser                                                         */
/* ------------------------------------------------------------------ */

interface CsvParseResult {
  success: boolean;
  values?: Partial<FormValues>;
  error?: string;
}

const columnMappings: Record<string, keyof FormValues> = {
  "time in bed": "timeInBed",
  "total time in bed": "timeInBed",
  "time_in_bed": "timeInBed",
  "timeinbed": "timeInBed",
  "bedtime duration": "timeInBed",
  "in bed duration": "timeInBed",
  "total sleep time": "totalSleepTime",
  "total_sleep_time": "totalSleepTime",
  "total sleep duration": "totalSleepTime",
  "sleep duration": "totalSleepTime",
  "sleep_duration": "totalSleepTime",
  "asleep duration": "totalSleepTime",
  "deep sleep": "deepSleep",
  "deep_sleep": "deepSleep",
  "deep sleep duration": "deepSleep",
  "deep_sleep_duration": "deepSleep",
  "rem sleep": "remSleep",
  "rem_sleep": "remSleep",
  "rem sleep duration": "remSleep",
  "rem_sleep_duration": "remSleep",
  "awakenings": "awakenings",
  "number of awakenings": "awakenings",
  "wake ups": "awakenings",
  "disturbances": "awakenings",
  "sleep onset latency": "sleepOnsetLatency",
  "sleep_onset_latency": "sleepOnsetLatency",
  "onset latency": "sleepOnsetLatency",
  "latency": "sleepOnsetLatency",
  "time to fall asleep": "sleepOnsetLatency",
  "fell asleep in": "sleepOnsetLatency",
};

function tryParseMinutes(value: string): number | null {
  const trimmed = value.trim();

  // "7h 30m" or "7h30m"
  const hmMatch = trimmed.match(/^(\d+)\s*h\s*(\d+)\s*m?$/i);
  if (hmMatch) return parseInt(hmMatch[1]) * 60 + parseInt(hmMatch[2]);

  // "7h" only
  const hOnly = trimmed.match(/^(\d+(?:\.\d+)?)\s*h$/i);
  if (hOnly) return Math.round(parseFloat(hOnly[1]) * 60);

  // "30m" only
  const mOnly = trimmed.match(/^(\d+)\s*m$/i);
  if (mOnly) return parseInt(mOnly[1]);

  // "7:30" (h:mm)
  const colonMatch = trimmed.match(/^(\d+):(\d{2})$/);
  if (colonMatch) return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);

  // Plain number — if > 24, assume minutes, else assume hours
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    return num > 24 ? Math.round(num) : Math.round(num * 60);
  }

  return null;
}

function parseCsv(text: string): CsvParseResult {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return { success: false, error: "CSV needs at least a header row and one data row." };
  }

  const separator = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const dataRow = lines[1].split(separator).map((v) => v.trim().replace(/['"]/g, ""));

  const mapped: Partial<Record<keyof FormValues, number>> = {};

  headers.forEach((header, index) => {
    const field = columnMappings[header];
    if (field && field !== "source" && dataRow[index] !== undefined) {
      if (field === "awakenings") {
        const num = parseInt(dataRow[index]);
        if (!isNaN(num)) mapped[field] = num;
      } else {
        const minutes = tryParseMinutes(dataRow[index]);
        if (minutes !== null) mapped[field] = minutes;
      }
    }
  });

  if (Object.keys(mapped).length === 0) {
    return {
      success: false,
      error: "Could not match any columns. Expected headers like: Total Sleep Time, Deep Sleep, REM Sleep, Awakenings, Sleep Onset Latency, Time in Bed.",
    };
  }

  return {
    success: true,
    values: { ...mapped, source: "manual" as SourceDevice },
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const defaultValues: FormValues = {
  timeInBed: 480,
  totalSleepTime: 420,
  deepSleep: 70,
  remSleep: 90,
  awakenings: 3,
  sleepOnsetLatency: 12,
  source: "manual",
};

export default function SleepScoreBreakdown() {
  /* Form state */
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(sleepSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedValues = useWatch({ control });
  const previousValuesRef = useRef<FormValues | null>(null);

  /* Analysis state */
  const [analysis, setAnalysis] = useState<SleepAnalysis | null>(null);
  const [activeHabits, setActiveHabits] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  /* CSV upload state */
  const [isDragging, setIsDragging] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Load history from localStorage */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedSession[];
        setHistory(parsed.slice(0, 5));
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* Auto-calculate on form change */
  useEffect(() => {
    const values = watchedValues as FormValues;
    if (
      values.timeInBed &&
      values.totalSleepTime &&
      values.deepSleep !== undefined &&
      values.remSleep !== undefined &&
      values.awakenings !== undefined &&
      values.sleepOnsetLatency !== undefined
    ) {
      const hasChanged =
        !previousValuesRef.current ||
        JSON.stringify(values) !== JSON.stringify(previousValuesRef.current);

      if (hasChanged) {
        previousValuesRef.current = { ...values } as FormValues;
        calculateScore(values);
      }
    }
  }, [watchedValues]);

  /* Calculate score */
  const calculateScore = useCallback((values: FormValues) => {
    setIsCalculating(true);

    const efficiency = computeEfficiencyScore(values.totalSleepTime, values.timeInBed);
    const stageBalance = computeStageBalanceScore(values.deepSleep, values.remSleep, values.totalSleepTime);
    const disturbanceScore = computeDisturbanceScore(values.awakenings);
    const solScore = computeSolScore(values.sleepOnsetLatency);

    const rawScore =
      efficiency.score * 0.4 +
      stageBalance.score * 0.3 +
      disturbanceScore * 0.2 +
      solScore * 0.1;

    const score = clamp(Math.round(rawScore * 10) / 10, 0, 100);
    const { grade, color } = gradeFromScore(score);

    const awakeTime = values.timeInBed - values.totalSleepTime;
    const awakePercent = values.timeInBed > 0 ? (awakeTime / values.timeInBed) * 100 : 0;
    const sleepPortionOfBed = values.timeInBed > 0 ? (values.totalSleepTime / values.timeInBed) * 100 : 0;

    const stageChart = buildStageChartData(
      stageBalance.deepPercent,
      stageBalance.remPercent,
      stageBalance.lightPercent,
      awakePercent,
    );

    const scoreChart = buildScoreChartData(score, color);

    const suggestions = buildSuggestions(
      values,
      efficiency.percent,
      stageBalance.deepPercent,
      stageBalance.remPercent,
      score,
    );

    setAnalysis({
      score,
      grade,
      gradeColor: color,
      efficiencyScore: Math.round(efficiency.score),
      efficiencyPercent: Math.round(efficiency.percent * 10) / 10,
      stageBalanceScore: Math.round(stageBalance.score),
      deepPercent: Math.round(stageBalance.deepPercent * 10) / 10,
      remPercent: Math.round(stageBalance.remPercent * 10) / 10,
      lightPercent: Math.round(stageBalance.lightPercent * 10) / 10,
      disturbanceScore: Math.round(disturbanceScore),
      solScore: Math.round(solScore),
      suggestions,
      stageChartData: stageChart.data,
      stageChartOptions: stageChart.options,
      scoreChartData: scoreChart.data,
      scoreChartOptions: scoreChart.options,
    });

    setIsCalculating(false);
  }, []);

  /* Save session */
  const saveSession = useCallback(
    (values: FormValues) => {
      if (!analysis) return;

      const entry: SavedSession = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        values,
        score: analysis.score,
      };

      const updated = [entry, ...history].slice(0, 5);
      setHistory(updated);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
    },
    [analysis, history],
  );

  /* Habit simulator */
  const projectedScore = (() => {
    if (!analysis) return 0;
    let bonus = 0;
    for (const habit of habitToggles) {
      if (activeHabits[habit.key]) {
        bonus += (habit.minDelta + habit.maxDelta) / 2;
      }
    }
    return clamp(Math.round((analysis.score + bonus) * 10) / 10, 0, 100);
  })();

  const totalBonus = (() => {
    let bonus = 0;
    for (const habit of habitToggles) {
      if (activeHabits[habit.key]) {
        bonus += (habit.minDelta + habit.maxDelta) / 2;
      }
    }
    return Math.round(bonus * 10) / 10;
  })();

  /* CSV handlers */
  const handleFileUpload = useCallback(
    (file: File) => {
      setCsvError(null);
      setCsvSuccess(false);

      if (!file.name.endsWith(".csv") && !file.name.endsWith(".tsv") && !file.name.endsWith(".txt")) {
        setCsvError("Please upload a .csv, .tsv, or .txt file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const result = parseCsv(text);

        if (!result.success) {
          setCsvError(result.error || "Failed to parse file.");
          return;
        }

        const v = result.values!;
        if (v.timeInBed !== undefined) setValue("timeInBed", v.timeInBed as number, { shouldValidate: true });
        if (v.totalSleepTime !== undefined) setValue("totalSleepTime", v.totalSleepTime as number, { shouldValidate: true });
        if (v.deepSleep !== undefined) setValue("deepSleep", v.deepSleep as number, { shouldValidate: true });
        if (v.remSleep !== undefined) setValue("remSleep", v.remSleep as number, { shouldValidate: true });
        if (v.awakenings !== undefined) setValue("awakenings", v.awakenings as number, { shouldValidate: true });
        if (v.sleepOnsetLatency !== undefined) setValue("sleepOnsetLatency", v.sleepOnsetLatency as number, { shouldValidate: true });

        setCsvSuccess(true);
        setTimeout(() => setCsvSuccess(false), 4000);
      };

      reader.onerror = () => setCsvError("Failed to read file.");
      reader.readAsText(file);
    },
    [setValue],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  /* Component weight labels */
  const componentWeights = [
    { label: "Sleep Efficiency", weight: "40%", score: analysis?.efficiencyScore ?? 0, detail: `${analysis?.efficiencyPercent ?? 0}%` },
    { label: "Stage Balance", weight: "30%", score: analysis?.stageBalanceScore ?? 0, detail: `Deep ${analysis?.deepPercent ?? 0}% \u2022 REM ${analysis?.remPercent ?? 0}%` },
    { label: "Disturbances", weight: "20%", score: analysis?.disturbanceScore ?? 0, detail: `${watchedValues.awakenings ?? 0} awakenings` },
    { label: "Sleep Onset", weight: "10%", score: analysis?.solScore ?? 0, detail: `${watchedValues.sleepOnsetLatency ?? 0} min` },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <DisclaimerBanner
          fixed={false}
          message={TOOL_DISCLAIMER}
          className="border-red-400/50 bg-red-950"
        />

        <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/75 shadow-2xl shadow-slate-950/30">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_38%),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.14),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,0.28),_rgba(2,6,23,0.88))] px-5 py-8 sm:px-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-200">
                  <MoonStar className="h-3.5 w-3.5" />
                  Sleep Score Breakdown
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Free Sleep Score Calculator &amp; Habit Impact Simulator
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Upload your sleep data or enter metrics manually to get a detailed
                  sleep score breakdown by stage, efficiency, and disturbances. Then
                  use the habit simulator to see how small changes could improve your
                  score.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Supports
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      Oura, Whoop, Garmin
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Output
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      Score breakdown + habits
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      History
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      Saved in your browser
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
                    <BedDouble className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      Sleep Score Calculator
                    </p>
                    <p className="text-sm text-slate-400">
                      Enter your sleep data or upload a CSV export.
                    </p>
                  </div>
                </div>

                {/* CSV Upload Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`mt-5 relative rounded-2xl border-2 border-dashed p-5 text-center transition ${
                    isDragging
                      ? "border-violet-400 bg-violet-400/10"
                      : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                  }`}
                >
                  <Upload className="mx-auto h-6 w-6 text-slate-500" />
                  <p className="mt-2 text-sm font-medium text-slate-300">
                    Drag &amp; drop a CSV sleep export, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-semibold text-violet-300 underline hover:text-violet-200"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Works with Oura, Whoop, Garmin, and Apple Health CSV exports
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {csvError && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {csvError}
                    </div>
                  )}
                  {csvSuccess && (
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      CSV imported successfully! Review the values below.
                    </div>
                  )}
                </div>

                {/* Manual Entry Form */}
                <form
                  onSubmit={handleSubmit((values) => saveSession(values))}
                  className="mt-6 space-y-5"
                >
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Sleep Metrics
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Time in Bed */}
                    <div className="space-y-2">
                      <label htmlFor="timeInBed" className="text-sm font-medium text-slate-200">
                        Time in Bed (min)
                      </label>
                      <input
                        id="timeInBed"
                        type="number"
                        inputMode="numeric"
                        {...register("timeInBed", { valueAsNumber: true })}
                        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-violet-400"
                        placeholder="480"
                      />
                      {errors.timeInBed && (
                        <p className="text-sm text-red-300">{errors.timeInBed.message}</p>
                      )}
                    </div>

                    {/* Total Sleep Time */}
                    <div className="space-y-2">
                      <label htmlFor="totalSleepTime" className="text-sm font-medium text-slate-200">
                        Total Sleep Time (min)
                      </label>
                      <input
                        id="totalSleepTime"
                        type="number"
                        inputMode="numeric"
                        {...register("totalSleepTime", { valueAsNumber: true })}
                        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-violet-400"
                        placeholder="420"
                      />
                      {errors.totalSleepTime && (
                        <p className="text-sm text-red-300">{errors.totalSleepTime.message}</p>
                      )}
                    </div>

                    {/* Deep Sleep */}
                    <div className="space-y-2">
                      <label htmlFor="deepSleep" className="text-sm font-medium text-slate-200">
                        Deep Sleep (min)
                      </label>
                      <input
                        id="deepSleep"
                        type="number"
                        inputMode="numeric"
                        {...register("deepSleep", { valueAsNumber: true })}
                        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-violet-400"
                        placeholder="70"
                      />
                      {errors.deepSleep && (
                        <p className="text-sm text-red-300">{errors.deepSleep.message}</p>
                      )}
                    </div>

                    {/* REM Sleep */}
                    <div className="space-y-2">
                      <label htmlFor="remSleep" className="text-sm font-medium text-slate-200">
                        REM Sleep (min)
                      </label>
                      <input
                        id="remSleep"
                        type="number"
                        inputMode="numeric"
                        {...register("remSleep", { valueAsNumber: true })}
                        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-violet-400"
                        placeholder="90"
                      />
                      {errors.remSleep && (
                        <p className="text-sm text-red-300">{errors.remSleep.message}</p>
                      )}
                    </div>

                    {/* Awakenings */}
                    <div className="space-y-2">
                      <label htmlFor="awakenings" className="text-sm font-medium text-slate-200">
                        Awakenings
                      </label>
                      <input
                        id="awakenings"
                        type="number"
                        inputMode="numeric"
                        {...register("awakenings", { valueAsNumber: true })}
                        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-violet-400"
                        placeholder="3"
                      />
                      {errors.awakenings && (
                        <p className="text-sm text-red-300">{errors.awakenings.message}</p>
                      )}
                    </div>

                    {/* Sleep Onset Latency */}
                    <div className="space-y-2">
                      <label htmlFor="sleepOnsetLatency" className="text-sm font-medium text-slate-200">
                        Time to Fall Asleep (min)
                      </label>
                      <input
                        id="sleepOnsetLatency"
                        type="number"
                        inputMode="numeric"
                        {...register("sleepOnsetLatency", { valueAsNumber: true })}
                        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-violet-400"
                        placeholder="12"
                      />
                      {errors.sleepOnsetLatency && (
                        <p className="text-sm text-red-300">{errors.sleepOnsetLatency.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Source device */}
                  <div className="space-y-2">
                    <label htmlFor="source" className="text-sm font-medium text-slate-200">
                      Source Device
                    </label>
                    <select
                      id="source"
                      {...register("source")}
                      className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-base text-white outline-none transition focus:border-violet-400"
                    >
                      {sourceDevices.map((device) => (
                        <option key={device} value={device}>
                          {sourceDeviceLabels[device]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Light sleep display */}
                  {analysis && (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                      <Moon className="h-4 w-4 text-emerald-300" />
                      <div className="text-sm">
                        <span className="text-slate-400">Light Sleep (auto): </span>
                        <span className="font-medium text-white">
                          {formatMinutes(
                            Math.max(
                              0,
                              (watchedValues.totalSleepTime ?? 0) -
                                (watchedValues.deepSleep ?? 0) -
                                (watchedValues.remSleep ?? 0),
                            ),
                          )}{" "}
                          ({analysis.lightPercent}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                    >
                      <Sparkles className="h-4 w-4" />
                      Save Session
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        reset(defaultValues);
                        setActiveHabits({});
                      }}
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                </form>

                {/* History */}
                {history.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <button
                      type="button"
                      onClick={() => setShowHistory(!showHistory)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-semibold text-white">
                          Saved Sessions ({history.length})
                        </h3>
                      </div>
                      {showHistory ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    {showHistory && (
                      <div className="mt-4 space-y-3">
                        {history.map((session) => (
                          <button
                            key={session.id}
                            type="button"
                            onClick={() => reset(session.values)}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-left transition hover:border-slate-700"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                Score: {session.score}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatSavedTime(session.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-slate-400">
                              {formatMinutes(session.values.totalSleepTime)} sleep
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Results section */}
        {analysis ? (
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left column — Charts */}
            <div className="space-y-6">
              {/* Score gauge */}
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/25">
                <div className="grid items-center gap-6 sm:grid-cols-[200px_1fr]">
                  <div className="relative mx-auto w-[200px]">
                    <WearableChartWrapper
                      type="doughnut"
                      data={analysis.scoreChartData}
                      options={analysis.scoreChartOptions}
                      height={200}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-black ${analysis.gradeColor}`}>
                        {Math.round(analysis.score)}
                      </span>
                      <span className={`text-sm font-semibold ${analysis.gradeColor}`}>
                        {analysis.grade}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {componentWeights.map((comp) => (
                      <div key={comp.label} className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{comp.label}</span>
                            <span className="text-xs text-slate-500">{comp.weight}</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                              style={{ width: `${comp.score}%` }}
                            />
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">{comp.detail}</p>
                        </div>
                        <span className="w-10 text-right text-sm font-semibold text-white">
                          {comp.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sleep stage chart */}
              <WearableChartWrapper
                type="doughnut"
                data={analysis.stageChartData}
                options={analysis.stageChartOptions}
                title="Sleep Stage Distribution"
                description={`Deep ${analysis.deepPercent}% \u2022 REM ${analysis.remPercent}% \u2022 Light ${analysis.lightPercent}% \u2022 Efficiency ${analysis.efficiencyPercent}%`}
                height={280}
              />

              {/* Stage duration bars */}
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5">
                <h3 className="text-sm font-semibold text-white">Stage Duration Breakdown</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Deep Sleep", minutes: watchedValues.deepSleep ?? 0, color: "bg-violet-500", ideal: "15-20%" },
                    { label: "REM Sleep", minutes: watchedValues.remSleep ?? 0, color: "bg-cyan-400", ideal: "20-25%" },
                    { label: "Light Sleep", minutes: Math.max(0, (watchedValues.totalSleepTime ?? 0) - (watchedValues.deepSleep ?? 0) - (watchedValues.remSleep ?? 0)), color: "bg-emerald-500", ideal: "50-60%" },
                  ].map((stage) => (
                    <div key={stage.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{stage.label}</span>
                        <span className="text-slate-400">
                          {formatMinutes(stage.minutes)}{" "}
                          <span className="text-slate-600">ideal {stage.ideal}</span>
                        </span>
                      </div>
                      <div className="mt-1 h-3 rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                          style={{
                            width: `${
                              (watchedValues.totalSleepTime ?? 1) > 0
                                ? clamp((stage.minutes / (watchedValues.totalSleepTime ?? 1)) * 100, 0, 100)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — Habits + Suggestions */}
            <div className="space-y-6">
              {/* Habit simulator */}
              <div className="rounded-[1.75rem] border border-violet-400/20 bg-gradient-to-br from-violet-400/5 via-slate-900/70 to-slate-900/70 p-5 shadow-xl shadow-slate-950/25">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-300" />
                  <h3 className="text-lg font-semibold text-white">
                    Habit Impact Simulator
                  </h3>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Toggle habits to see how they could improve your sleep score.
                </p>

                {/* Projected score */}
                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Current</p>
                    <p className="text-2xl font-black text-white">{Math.round(analysis.score)}</p>
                  </div>
                  <div className="text-2xl text-slate-600">&rarr;</div>
                  <div className="flex-1 text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Projected</p>
                    <p className={`text-2xl font-black ${totalBonus > 0 ? "text-emerald-300" : "text-white"}`}>
                      {Math.round(projectedScore)}
                    </p>
                  </div>
                  {totalBonus > 0 && (
                    <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-300">
                      +{totalBonus}
                    </div>
                  )}
                </div>

                {/* Habit toggles */}
                <div className="mt-4 space-y-3">
                  {habitToggles.map((habit) => {
                    const Icon = habit.icon;
                    const isActive = activeHabits[habit.key] ?? false;
                    const delta = habit.minDelta === habit.maxDelta
                      ? `+${habit.minDelta}`
                      : `+${habit.minDelta} to +${habit.maxDelta}`;

                    return (
                      <button
                        key={habit.key}
                        type="button"
                        onClick={() =>
                          setActiveHabits((prev) => ({
                            ...prev,
                            [habit.key]: !prev[habit.key],
                          }))
                        }
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          isActive
                            ? "border-violet-400/40 bg-violet-400/10"
                            : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                            isActive
                              ? "bg-violet-500/20 text-violet-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-semibold ${isActive ? "text-violet-200" : "text-slate-200"}`}>
                              {habit.label}
                            </p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                                isActive
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {delta} pts
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {habit.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions */}
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/25">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-cyan-300" />
                  <h3 className="text-lg font-semibold text-white">
                    Personalized Suggestions
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3"
                    >
                      <p
                        className="text-sm leading-6 text-slate-300"
                        dangerouslySetInnerHTML={{ __html: suggestion }}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-600">
                  As an Amazon Associate I earn from qualifying purchases.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* Scoring methodology */}
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
          <h2 className="text-xl font-bold text-white">
            How Is Your Sleep Score Calculated?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Your sleep score is a weighted composite of four components, each
            reflecting a different dimension of sleep quality. Sleep efficiency
            (40%) measures the ratio of actual sleep to time in bed, penalizing
            excessive tossing and waking. Sleep stage balance (30%) evaluates
            whether your deep sleep and REM sleep fall within healthy
            proportions, since both stages are essential for physical recovery,
            memory consolidation, and emotional regulation. The disturbance
            penalty (20%) accounts for the number of nighttime awakenings, which
            fragment sleep architecture even when total sleep time looks normal.
            Finally, sleep onset latency (10%) measures how long it takes you to
            fall asleep, with longer onset times often signaling hyperarousal,
            poor sleep pressure, or suboptimal wind-down habits.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Sleep Efficiency", weight: "40%", desc: "Time asleep vs. time in bed" },
              { label: "Stage Balance", weight: "30%", desc: "Deep + REM proportions" },
              { label: "Disturbance Penalty", weight: "20%", desc: "Nighttime awakenings" },
              { label: "Sleep Onset Latency", weight: "10%", desc: "Time to fall asleep" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3"
              >
                <p className="text-lg font-bold text-violet-300">{item.weight}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO content section */}
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
          <h2 className="text-xl font-bold text-white">
            Why Use a Sleep Score Calculator in 2026?
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-400">
            <p>
              Sleep trackers from Oura, Whoop, Garmin, and Apple Watch give you
              a sleep score each morning, but most people have no idea what
              drives that number. Is it your deep sleep percentage, your sleep
              efficiency, or the three times you woke up at 2 AM? A sleep score
              breakdown tool answers that question by splitting your single
              number into its component parts so you can see exactly where to
              improve.
            </p>
            <p>
              The habit impact simulator takes it a step further. Instead of
              vague advice like &ldquo;improve your sleep hygiene,&rdquo; you
              can toggle specific habits&#x2014;caffeine cutoff before 2 PM,
              consistent bedtime, screen avoidance, or skipping alcohol&#x2014;and
              see the projected point improvement. This makes it easier to
              prioritize which change to try first based on your current
              deficiency areas.
            </p>
            <p>
              Whether you are troubleshooting a low Oura sleep score, trying to
              improve deep sleep percentage on your Whoop, or just want to
              understand what sleep onset latency means for your overall sleep
              quality, this free calculator gives you the clarity that your
              tracker app leaves out.
            </p>
          </div>
        </section>

        <DisclaimerBanner
          fixed={false}
          message={TOOL_DISCLAIMER}
          className="border-red-400/50 bg-red-950"
        />
      </div>
    </div>
  );
}
