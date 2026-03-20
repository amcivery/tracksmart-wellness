"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  BrainCircuit,
  CircleHelp,
  Gauge,
  History,
  LineChart,
  Loader2,
  MoonStar,
  Pill,
  Sparkles,
  Wine,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import WearableChartWrapper from "@/components/WearableChartWrapper";

const TOOL_DISCLAIMER =
  "This is an educational tool only. Not medical advice. Consult your doctor.";
const STORAGE_KEY = "tracksmart-hrv-simulations";
const AMAZON_TAG = "tracksmartwel-20";
const AMAZON_DISCLAIMER =
  "As an Amazon Associate I earn from qualifying purchases.";

const trainingLoads = ["low", "medium", "high"] as const;
type TrainingLoad = (typeof trainingLoads)[number];
interface AgeRangeDefinition {
  min: number;
  max: number;
  note?: string;
}

interface SimulationResult {
  projectedLowPercent: number;
  projectedHighPercent: number;
  projectedLowHrv: number;
  projectedHighHrv: number;
  projectedMidHrv: number;
  projectedRangeLow: number;
  projectedRangeHigh: number;
  ageRangeLow?: number;
  ageRangeHigh?: number;
  ageRangeNote?: string;
  ageDisplayLabel?: string;
  ageBracketUsed?: number;
  upsideHeadline: string;
  chartData: ChartData<"line">;
  chartOptions: ChartOptions<"line">;
  suggestions: string[];
  risks: string[];
  rangeNote: string;
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  values: FormValues;
  projectedLowPercent: number;
  projectedHighPercent: number;
  projectedLowHrv: number;
  projectedHighHrv: number;
  projectedMidHrv: number;
}

const simulationSchema = z.object({
  baselineHrv: z
    .number()
    .min(10, "Baseline HRV should be at least 10 ms.")
    .max(120, "Baseline HRV should stay under 120 ms for this simulator."),
  age: z
    .number()
    .min(18, "Age must be at least 18.")
    .max(85, "Age must be 85 or younger.")
    .optional(),
  todayHrv: z
    .number()
    .min(10, "Today's HRV should be at least 10 ms.")
    .max(140, "Today's HRV should stay under 140 ms for this simulator."),
  sleepHours: z.number().min(4).max(10),
  alcohol: z.boolean(),
  magnesium: z.boolean(),
  trainingLoad: z.enum(trainingLoads),
  stressLevel: z.number().min(1).max(10),
});

type FormValues = z.infer<typeof simulationSchema>;

const defaultValues: FormValues = {
  baselineHrv: 45,
  age: 35,
  todayHrv: 39,
  sleepHours: 6.5,
  alcohol: false,
  magnesium: false,
  trainingLoad: "medium",
  stressLevel: 6,
};

const ageRanges: Record<number, AgeRangeDefinition> = {
  18: { min: 55, max: 105, note: "Peak autonomic capacity" },
  25: { min: 48, max: 95, note: "Excellent for your age" },
  30: { min: 40, max: 85 },
  35: { min: 38, max: 75 },
  40: { min: 32, max: 68 },
  45: { min: 30, max: 60 },
  50: { min: 28, max: 55 },
  55: { min: 25, max: 50 },
  60: { min: 22, max: 45 },
  65: { min: 20, max: 40 },
  70: { min: 18, max: 35, note: "Healthy range for 70+" },
  999: { min: 18, max: 35, note: "Healthy range for 70+" },
};

const trainingLoadMeta: Record<
  TrainingLoad,
  { label: string; recoveryPenalty: number }
> = {
  low: {
    label: "Low",
    recoveryPenalty: 1,
  },
  medium: {
    label: "Medium",
    recoveryPenalty: 4,
  },
  high: {
    label: "High",
    recoveryPenalty: 8,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatSavedTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildProjectedSeries(todayHrv: number, projectedMidHrv: number) {
  return Array.from({ length: 30 }, (_, index) => {
    const progress = index / 29;
    const easedProgress = 1 - Math.pow(1 - progress, 1.8);
    return Math.round(
      (todayHrv + (projectedMidHrv - todayHrv) * easedProgress) * 10,
    ) / 10;
  });
}

function hasMeaningfulInputChanges(
  previous: FormValues | null,
  current: FormValues,
) {
  if (!previous) {
    return false;
  }

  return (
    previous.baselineHrv !== current.baselineHrv ||
    previous.age !== current.age ||
    previous.todayHrv !== current.todayHrv ||
    previous.sleepHours !== current.sleepHours ||
    previous.alcohol !== current.alcohol ||
    previous.magnesium !== current.magnesium ||
    previous.trainingLoad !== current.trainingLoad ||
    previous.stressLevel !== current.stressLevel
  );
}

function resolveAgeBracket(age?: number) {
  if (age === undefined) {
    return null;
  }

  if (age > 70) {
    return 999;
  }

  const brackets = Object.keys(ageRanges)
    .map(Number)
    .filter((value) => value !== 999);

  return brackets.reduce((closest, current) => {
    if (Math.abs(current - age) < Math.abs(closest - age)) {
      return current;
    }

    return closest;
  });
}

function buildSuggestions(
  values: FormValues,
  result: Omit<
    SimulationResult,
    "suggestions" | "risks" | "chartData" | "chartOptions" | "rangeNote"
  >,
) {
  const suggestions: string[] = [];

  if (values.sleepHours < 7) {
    suggestions.push(
      "Push sleep toward 7.5-8.5 hours. Extending sleep is one of the fastest ways to raise nighttime HRV and stabilize readiness the next morning.",
    );
  }

  if (values.alcohol) {
    suggestions.push(
      "Drop alcohol for 2-3 nights in a row. Even moderate intake often suppresses HRV the following night and can keep recovery scores artificially low.",
    );
  }

  if (!values.magnesium) {
    suggestions.push(
      `Consider magnesium glycinate in the evening. Small human studies suggest magnesium status can improve HRV or vagal tone, often in the 10-15% range when stress or deficiency is a factor. <a href="https://www.amazon.com/dp/B07P5K7DQP?tag=${AMAZON_TAG}" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-300 hover:text-emerald-200 underline">see Amazon</a>`,
    );
  }

  if (values.trainingLoad === "high") {
    suggestions.push(
      "Run a 48-hour deload and trim intervals or volume. High acute load can suppress HRV even when overall fitness is improving.",
    );
  }

  if (values.stressLevel >= 7) {
    suggestions.push(
      "Use 5-10 minutes of slow breathing, NSDR, or a walk after hard meetings. Stress management is often the hidden lever behind HRV recovery.",
    );
  }

  if (values.todayHrv < values.baselineHrv * 0.85) {
    suggestions.push(
      "Treat today's reading as a recovery signal: hydrate earlier, eat enough carbohydrate, and avoid turning a low-HRV day into a second consecutive stress spike.",
    );
  }

  if (suggestions.length < 3) {
    suggestions.push(
      "Measure HRV at the same time and under the same conditions each morning so your trendline stays interpretable.",
    );
  }

  if (suggestions.length < 4) {
    suggestions.push(
      `A sustainable 30-day target is moving from ${values.todayHrv} ms toward roughly ${result.projectedMidHrv} ms without sacrificing sleep or overreaching.`,
    );
  }

  return suggestions.slice(0, 5);
}

function buildRisks(values: FormValues, projectedMidHrv: number) {
  const risks: string[] = [];

  if (values.todayHrv < 30) {
    risks.push(
      "Low HRV warning: readings below 30 ms can reflect significant fatigue, illness, or accumulated stress. Be conservative with training and consider medical input if this is persistent.",
    );
  }

  if (values.alcohol && values.sleepHours <= 6) {
    risks.push(
      "Alcohol combined with short sleep is one of the strongest ways to suppress overnight HRV and distort your next-day readiness score.",
    );
  }

  if (values.trainingLoad === "high" && values.stressLevel >= 8) {
    risks.push(
      "High training load stacked on high life stress raises the odds that your recovery hole gets deeper before it gets better.",
    );
  }

  if (projectedMidHrv < values.baselineHrv * 0.9) {
    risks.push(
      "Your projected path still sits below your usual baseline, which suggests recovery basics may need more than one or two nights to normalize.",
    );
  }

  return risks;
}

function computeSimulation(values: FormValues): SimulationResult {
  // Remaining-upside math is intentionally centralized here so the score
  // ranges can be tuned later without touching the UI. These inputs model
  // how much recovery opportunity is still left in the user's current routine.
  const sleepPotential = Math.max(0, 8 - values.sleepHours) * 1.9;
  const alcoholPotential = values.alcohol ? 1.5 : 0;
  const magnesiumPotential = values.magnesium ? 0 : 2.5;
  const loadPotential = trainingLoadMeta[values.trainingLoad].recoveryPenalty;
  const stressPotential = Math.max(0, values.stressLevel - 3) * 1.3;
  const baselineGapPotential = Math.max(
    0,
    (values.baselineHrv - values.todayHrv) * 0.8,
  );

  const totalPotential = clamp(
    sleepPotential +
      alcoholPotential +
      magnesiumPotential +
      baselineGapPotential +
      loadPotential +
      stressPotential,
    0,
    28,
  );

  const projectedLowPercent =
    totalPotential <= 2 ? 0 : Math.round(Math.max(1, totalPotential * 0.6));
  const projectedHighPercent =
    totalPotential <= 2
      ? 2
      : Math.round(Math.max(projectedLowPercent + 2, totalPotential * 0.92));

  const projectedLowHrv = Math.round(
    values.todayHrv * (1 + projectedLowPercent / 100),
  );
  const projectedHighHrv = Math.round(
    values.todayHrv * (1 + projectedHighPercent / 100),
  );
  const projectedMidHrv = clamp(
    Math.round((projectedLowHrv + projectedHighHrv) / 2),
    values.todayHrv + 1,
    Math.max(values.baselineHrv + 18, values.todayHrv + 4),
  );
  const projectedRangeLow = Math.min(projectedLowHrv, projectedMidHrv);
  const projectedRangeHigh = Math.max(projectedMidHrv, projectedHighHrv);
  const ageBracket = resolveAgeBracket(values.age);
  const ageRange = ageBracket ? ageRanges[ageBracket] : null;
  const ageDisplayLabel =
    values.age === undefined ? undefined : values.age > 70 ? "85+" : `${values.age}`;

  const labels = Array.from({ length: 30 }, (_, index) => `Day ${index + 1}`);
  const projectedSeries = buildProjectedSeries(values.todayHrv, projectedMidHrv);
  const baselineSeries = Array.from({ length: 30 }, () => values.baselineHrv);

  const minAxis = Math.max(
    10,
    Math.floor(
      Math.min(values.todayHrv, projectedLowHrv, values.baselineHrv) - 8,
    ),
  );
  const maxAxis = Math.ceil(
    Math.max(values.baselineHrv, projectedHighHrv, projectedMidHrv) + 8,
  );

  const rangeNote = ageRange
    ? `For your age (${ageDisplayLabel}), typical healthy RMSSD range is ${ageRange.min}-${ageRange.max} ms (your projected range after tweaks: ${projectedRangeLow}-${projectedRangeHigh} ms)${
        ageRange.note ? ` - ${ageRange.note}.` : "."
      }`
    : `Based on your personal baseline, we project a practical HRV range of ${projectedRangeLow}-${projectedRangeHigh} ms over the next month if you follow the recovery tweaks modeled here.`;
  const upsideHeadline =
    totalPotential <= 2
      ? "You're already near-optimal — great work! (0–2% remaining upside)"
      : `Estimated remaining 30-day upside: ${projectedLowPercent}-${projectedHighPercent}%`;

  const baseResult = {
    projectedLowPercent,
    projectedHighPercent,
    projectedLowHrv,
    projectedHighHrv,
    projectedMidHrv,
    projectedRangeLow,
    projectedRangeHigh,
    ageRangeLow: ageRange?.min,
    ageRangeHigh: ageRange?.max,
    ageRangeNote: ageRange?.note,
    ageDisplayLabel,
    ageBracketUsed: ageBracket ?? undefined,
    upsideHeadline,
  };

  return {
    ...baseResult,
    chartData: {
      labels,
      datasets: [
        {
          label: "Baseline HRV",
          data: baselineSeries,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          borderDash: [6, 6],
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
        },
        {
          label: "Projected 30-day HRV",
          data: projectedSeries,
          borderColor: "#34d399",
          backgroundColor: "rgba(52, 211, 153, 0.18)",
          pointBackgroundColor: "#a7f3d0",
          pointBorderColor: "#022c22",
          fill: true,
        },
      ],
    },
    chartOptions: {
      animation: {
        duration: 900,
        easing: "easeOutQuart",
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          grid: {
            color: "rgba(51, 65, 85, 0.22)",
          },
          ticks: {
            maxTicksLimit: 6,
          },
        },
        y: {
          beginAtZero: false,
          suggestedMin: minAxis,
          suggestedMax: maxAxis,
          ticks: {
            callback: (value) => `${value} ms`,
          },
        },
      },
    },
    suggestions: buildSuggestions(values, baseResult),
    risks: buildRisks(values, projectedMidHrv),
    rangeNote,
  };
}

export default function HRVOptimizer() {
  const form = useForm<FormValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues,
  });
  const values = useWatch({
    control: form.control,
  }) as FormValues;
  const [simulationActive, setSimulationActive] = useState(false);
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [useAgeAdjustedRange, setUseAgeAdjustedRange] = useState(
    defaultValues.age !== undefined,
  );
  const [showAgeInfo, setShowAgeInfo] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastAgeValueRef = useRef<number>(defaultValues.age ?? 35);

  const result = simulationActive ? computeSimulation(values) : null;
  const submittedResult = submittedValues
    ? computeSimulation(submittedValues)
    : null;
  const liveInputsChanged = hasMeaningfulInputChanges(submittedValues, values);
  const remainingUpsideComparison =
    result && submittedResult && liveInputsChanged
      ? result.projectedHighPercent < submittedResult.projectedHighPercent
        ? "smaller"
        : result.projectedHighPercent > submittedResult.projectedHighPercent
          ? "larger"
          : "same"
      : null;

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as HistoryEntry[];
      setHistory(parsed.slice(0, 5));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (values.age !== undefined) {
      lastAgeValueRef.current = values.age;
    }
  }, [values.age]);

  function saveHistoryEntry(nextValues: FormValues) {
    const nextResult = computeSimulation(nextValues);
    const nextEntry: HistoryEntry = {
      id: `${Date.now()}`,
      timestamp: new Date().toISOString(),
      values: nextValues,
      projectedLowPercent: nextResult.projectedLowPercent,
      projectedHighPercent: nextResult.projectedHighPercent,
      projectedLowHrv: nextResult.projectedLowHrv,
      projectedHighHrv: nextResult.projectedHighHrv,
      projectedMidHrv: nextResult.projectedMidHrv,
    };
    const nextHistory = [nextEntry, ...history].slice(0, 5);
    setHistory(nextHistory);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  }

  function onSubmit(nextValues: FormValues) {
    setIsRunning(true);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setSubmittedValues(nextValues);
      setSimulationActive(true);
      saveHistoryEntry(nextValues);
      setIsRunning(false);
    }, 450);
  }

  function loadHistoryEntry(entry: HistoryEntry) {
    form.reset(entry.values);
    setUseAgeAdjustedRange(entry.values.age !== undefined);
    setSubmittedValues(entry.values);
    setSimulationActive(true);
  }

  function handleAgeToggle() {
    if (useAgeAdjustedRange) {
      if (values.age !== undefined) {
        lastAgeValueRef.current = values.age;
      }

      form.setValue("age", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setUseAgeAdjustedRange(false);
      return;
    }

    form.setValue("age", values.age ?? lastAgeValueRef.current ?? 35, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setUseAgeAdjustedRange(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <DisclaimerBanner
          fixed={false}
          message={TOOL_DISCLAIMER}
          className="border-red-400/50 bg-red-950"
        />

        <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/75 shadow-2xl shadow-slate-950/30">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_38%),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.14),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,0.28),_rgba(2,6,23,0.88))] px-5 py-8 sm:px-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                  <MoonStar className="h-3.5 w-3.5" />
                  HRV calculator wearable
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Simulate how to boost HRV over the next 30 days
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Use your wearable baseline and today's reading to model a
                  smoother recovery path for Oura and Whoop. The simulator turns
                  HRV readiness score inputs into a clearer plan for how to
                  improve HRV with better sleep, less alcohol, smarter training,
                  and lower stress.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Simulation
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      30-day trendline
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Output
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      Percent improvement band
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      HRV Optimizer
                    </p>
                    <p className="text-sm text-slate-400">
                      Enter your recovery inputs and simulate the next month.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-6 space-y-5"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <label
                        htmlFor="baselineHrv"
                        className="text-sm font-medium text-slate-200"
                      >
                        Baseline HRV (ms)
                      </label>
                      <input
                        id="baselineHrv"
                        type="number"
                        inputMode="numeric"
                        {...form.register("baselineHrv", { valueAsNumber: true })}
                        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-emerald-400"
                      />
                      {form.formState.errors.baselineHrv && (
                        <p className="text-sm text-red-300">
                          {form.formState.errors.baselineHrv.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="age"
                        className="text-sm font-medium text-slate-200"
                      >
                        Your age (optional)
                      </label>
                      <Controller
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <input
                            id="age"
                            type="number"
                            inputMode="numeric"
                            min={18}
                            max={85}
                            placeholder="35"
                            disabled={!useAgeAdjustedRange}
                            value={useAgeAdjustedRange ? field.value ?? "" : ""}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              field.onChange(
                                nextValue === "" ? undefined : Number(nextValue),
                              );
                            }}
                            onBlur={(event) => {
                              field.onBlur();

                              if (
                                useAgeAdjustedRange &&
                                event.target.value.trim() === ""
                              ) {
                                form.setValue("age", undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                setUseAgeAdjustedRange(false);
                              }
                            }}
                            name={field.name}
                            ref={field.ref}
                            className={[
                              "h-14 w-full rounded-2xl border px-4 text-lg font-semibold outline-none transition",
                              useAgeAdjustedRange
                                ? "border-slate-700 bg-slate-900 text-white focus:border-emerald-400"
                                : "border-slate-800 bg-slate-950 text-slate-500",
                            ].join(" ")}
                          />
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAgeToggle}
                          aria-pressed={useAgeAdjustedRange}
                          aria-label={
                            useAgeAdjustedRange
                              ? "Turn off age-adjusted range"
                              : "Turn on age-adjusted range"
                          }
                          className={[
                            "relative inline-flex h-10 w-16 shrink-0 rounded-full border transition",
                            useAgeAdjustedRange
                              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "absolute top-1 h-7 w-7 rounded-full bg-white transition",
                              useAgeAdjustedRange
                                ? "left-8"
                                : "left-1",
                            ].join(" ")}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAgeInfo((current) => !current)}
                          aria-label="Age range info"
                          aria-expanded={showAgeInfo}
                          className={[
                            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition",
                            showAgeInfo
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                              : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600",
                          ].join(" ")}
                        >
                          <CircleHelp className="h-4.5 w-4.5" />
                        </button>
                      </div>
                      {showAgeInfo && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2.5">
                          <p className="text-xs leading-5 text-slate-400">
                            {useAgeAdjustedRange
                              ? "Used for accurate optimal-range calculation. Turn this off to skip age and use your personal baseline only."
                              : "Age is currently skipped. Results will use your personal baseline only until you turn age-adjusted range back on."}
                          </p>
                        </div>
                      )}
                      {form.formState.errors.age && (
                        <p className="text-sm text-red-300">
                          {form.formState.errors.age.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="todayHrv"
                        className="text-sm font-medium text-slate-200"
                      >
                        Today's HRV reading
                      </label>
                      <input
                        id="todayHrv"
                        type="number"
                        inputMode="numeric"
                        {...form.register("todayHrv", { valueAsNumber: true })}
                        className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-emerald-400"
                      />
                      {form.formState.errors.todayHrv && (
                        <p className="text-sm text-red-300">
                          {form.formState.errors.todayHrv.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <label className="block">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-200">
                        Sleep hours
                      </span>
                      <span className="text-sm font-semibold text-emerald-300">
                        {values.sleepHours?.toFixed(1) ?? defaultValues.sleepHours} h
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={10}
                      step={0.5}
                      {...form.register("sleepHours", { valueAsNumber: true })}
                      className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-emerald-400"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        form.setValue("alcohol", !values.alcohol, {
                          shouldDirty: true,
                        })
                      }
                      className={[
                        "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                        values.alcohol
                          ? "border-red-400/40 bg-red-500/10 text-white"
                          : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          values.alcohol
                            ? "bg-red-500/20 text-red-200"
                            : "bg-slate-950 text-slate-400",
                        ].join(" ")}
                      >
                        <Wine className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Alcohol</p>
                        <p className="text-xs text-slate-400">
                          {values.alcohol ? "Yes, last night" : "No alcohol"}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        form.setValue("magnesium", !values.magnesium, {
                          shouldDirty: true,
                        })
                      }
                      className={[
                        "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                        values.magnesium
                          ? "border-emerald-400/40 bg-emerald-400/10 text-white"
                          : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          values.magnesium
                            ? "bg-emerald-400/20 text-emerald-200"
                            : "bg-slate-950 text-slate-400",
                        ].join(" ")}
                      >
                        <Pill className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Magnesium supplement</p>
                        <p className="text-xs text-slate-400">
                          {values.magnesium ? "Yes, included" : "Not currently"}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-200">
                      Training load
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {trainingLoads.map((load) => (
                        <button
                          key={load}
                          type="button"
                          onClick={() =>
                            form.setValue("trainingLoad", load, {
                              shouldDirty: true,
                            })
                          }
                          className={[
                            "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                            values.trainingLoad === load
                              ? "border-emerald-400/40 bg-emerald-400/10 text-white"
                              : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700",
                          ].join(" ")}
                        >
                          {trainingLoadMeta[load].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-200">
                        Stress level
                      </span>
                      <span className="text-sm font-semibold text-emerald-300">
                        {values.stressLevel ?? defaultValues.stressLevel}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      {...form.register("stressLevel", { valueAsNumber: true })}
                      className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-emerald-400"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isRunning}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <LineChart className="h-5 w-5" />
                        Run 30-Day Simulation
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {(simulationActive || isRunning) && (
          <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <WearableChartWrapper
                  type="line"
                  title="30-day HRV simulation"
                  description="Baseline stays flat while the projected trendline models what a cleaner recovery routine could do over the next month."
                  loading={isRunning}
                  data={result?.chartData ?? { datasets: [] }}
                  options={result?.chartOptions}
                  height={360}
                  className="border-transparent bg-transparent p-0 shadow-none"
                />
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Remaining upside
                    </h2>
                    <p className="text-sm text-slate-400">
                      A practical month-ahead estimate based on your current
                      inputs.
                    </p>
                  </div>
                </div>

                {isRunning ? (
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-400">
                    Running a smoother 30-day HRV projection...
                  </div>
                ) : (
                  result && (
                    <>
                      <p className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        {result.upsideHeadline}
                      </p>
                      <p className="mt-4 text-base leading-8 text-slate-300">
                        That puts your next-month path around{" "}
                        <span className="font-semibold text-white">
                          {result.projectedLowHrv}-{result.projectedHighHrv} ms
                        </span>{" "}
                        based on your current routine and recovery inputs.
                      </p>
                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        Live preview stays instant as you move sliders. Saved
                        history only updates when you click{" "}
                        <span className="font-medium text-slate-300">
                          Run 30-Day Simulation
                        </span>
                        .
                      </p>

                      {liveInputsChanged && (
                        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
                          You&apos;re viewing an unsaved live preview. Click{" "}
                          <span className="font-semibold">Run 30-Day Simulation</span>{" "}
                          to save these exact form values and result to history.
                        </div>
                      )}

                      {remainingUpsideComparison && (
                        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
                          {remainingUpsideComparison === "smaller"
                            ? "Compared with your last submitted setup, the upside band is smaller because your current inputs are already more recovery-friendly. That is usually good news, not a worse forecast."
                            : remainingUpsideComparison === "larger"
                              ? "Compared with your last submitted setup, the upside band is larger because your current inputs leave more room for recovery improvement."
                              : "Compared with your last submitted setup, the upside band is essentially unchanged."}
                        </div>
                      )}

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Baseline
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {values.baselineHrv} ms
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Age
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {values.age ?? "Skipped"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Today
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {values.todayHrv} ms
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Projected midpoint
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {result.projectedMidHrv} ms
                          </p>
                        </div>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Personalized suggestions
                    </h2>
                    <p className="text-sm text-slate-400">
                      Target the highest-payoff recovery inputs first.
                    </p>
                  </div>
                </div>

                {result ? (
                  <>
                    <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
                    {result.suggestions.map((suggestion) => (
                      <li key={suggestion} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: suggestion.replace(/className=/g, "class="),
                          }}
                        />
                      </li>
                    ))}
                    </ul>
                    <p className="mt-6 text-xs text-slate-500">
                      {AMAZON_DISCLAIMER} Links are to products I believe are
                      high-quality based on user feedback and testing.
                    </p>
                  </>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">
                    Run the simulation to generate personalized guidance.
                  </p>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Optimal range note
                    </h2>
                    <p className="text-sm text-slate-400">
                      Age-adjusted healthy range (based on large population studies)
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  {result ? (
                    <>
                      <p className="text-base leading-8 text-slate-300">
                        {result.rangeNote}
                      </p>
                      {values.age === undefined ? (
                        <>
                          <p className="mt-4 text-sm text-slate-400">
                            Age was skipped, so this estimate falls back to your
                            personal baseline instead of the age-adjusted HRV
                            range table.
                          </p>
                          <p className="mt-3 text-xs text-slate-500">
                            Age skipped — falling back to personal baseline
                            only.
                          </p>
                        </>
                      ) : (
                        <p className="mt-4 text-sm text-slate-400">
                          {result.ageBracketUsed === 999
                            ? "Using the 85+ fallback bracket."
                            : `Closest bracket used: age ${result.ageBracketUsed}.`}
                          {result.ageRangeNote
                            ? ` ${result.ageRangeNote}.`
                            : ""}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Start a simulation to see your estimated target band.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Risk indicators
                    </h2>
                    <p className="text-sm text-slate-400">
                      Watch these flags before pushing harder.
                    </p>
                  </div>
                </div>

                {result && result.risks.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {result.risks.map((risk) => (
                      <div
                        key={risk}
                        className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100"
                      >
                        {risk}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-400">
                    No major red flags from the current simulation inputs.
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Past simulations
                    </h2>
                    <p className="text-sm text-slate-400">
                      Only explicit button runs are saved locally for exact
                      comparison later.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {history.length > 0 ? (
                    history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/75 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Saved at {formatSavedTime(entry.timestamp)}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            Baseline {entry.values.baselineHrv} ms · Age{" "}
                            {entry.values.age ?? "Skipped"} · Today{" "}
                            {entry.values.todayHrv} ms
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            Saved result {entry.projectedLowHrv}-{entry.projectedHighHrv} ms · Midpoint{" "}
                            {entry.projectedMidHrv} ms · Remaining upside{" "}
                            {entry.projectedLowPercent}-{entry.projectedHighPercent}%
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => loadHistoryEntry(entry)}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-100 transition hover:border-slate-600"
                        >
                          Load exact run
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-500">
                      No HRV simulations saved yet. Your last five runs will
                      appear here automatically.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <DisclaimerBanner
          fixed={false}
          message={TOOL_DISCLAIMER}
          className="border-red-400/50 bg-red-950"
        />
      </div>
    </div>
  );
}
