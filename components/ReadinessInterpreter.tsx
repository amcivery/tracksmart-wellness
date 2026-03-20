"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Activity,
  BedDouble,
  BriefcaseBusiness,
  ClipboardCheck,
  ClipboardCopy,
  Flame,
  Loader2,
  MoonStar,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Wine,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import WearableChartWrapper from "@/components/WearableChartWrapper";

const TOOL_DISCLAIMER =
  "This is an educational tool only. Not medical advice. Consult your doctor.";
const STORAGE_KEY = "tracksmart-readiness-sessions";

const deviceKeys = [
  "ouraReadiness",
  "whoopRecovery",
  "whoopStrain",
  "garminBodyBattery",
] as const;

type DeviceKey = (typeof deviceKeys)[number];
type ToggleKey =
  | "deskJob"
  | "highTrainingLoad"
  | "alcoholLastNight"
  | "poorSleep";

interface TipDefinition {
  text: string;
  href?: string;
  linkLabel?: string;
}

interface RangeDefinition {
  min: number;
  max: number;
  label: string;
  summary: string;
  explanation: string;
  tips: TipDefinition[];
}

interface DeviceDefinition {
  label: string;
  shortLabel: string;
  scoreLabel: string;
  unitHint: string;
  higherIsBetter: boolean;
  min: number;
  max: number;
  ranges: RangeDefinition[];
  adjustments: {
    sleepPer30: number;
    alcoholReduction: number;
    walkPer10: number;
  };
}

interface WhatIfState {
  extraSleepMinutes: number;
  alcoholReduction: number;
  walkMinutes: number;
}

interface SavedSession {
  id: string;
  timestamp: string;
  values: FormValues;
}

interface ComputedAnalysis {
  device: DeviceDefinition;
  currentScore: number;
  projectedScore: number;
  delta: number;
  currentRange: RangeDefinition;
  projectedRange: RangeDefinition;
  explanation: string;
  likelyDrivers: string[];
  coreTips: TipDefinition[];
  contextTips: TipDefinition[];
  deltaLabel: string;
  deltaTone: "positive" | "negative" | "neutral";
  chartData: ChartData<"doughnut">;
  chartOptions: ChartOptions<"doughnut">;
}

const deviceDefinitions: Record<DeviceKey, DeviceDefinition> = {
  ouraReadiness: {
    label: "Oura Readiness",
    shortLabel: "Oura",
    scoreLabel: "Readiness score",
    unitHint: "0-100",
    higherIsBetter: true,
    min: 0,
    max: 100,
    adjustments: {
      sleepPer30: 2,
      alcoholReduction: 6,
      walkPer10: 1,
    },
    ranges: [
      {
        min: 0,
        max: 59,
        label: "Recovery debt",
        summary: "Nervous system fatigue is likely driving this score.",
        explanation:
          "Your Oura readiness is in the red zone. This usually points to accumulated stress, poor sleep efficiency, autonomic strain, or a mismatch between yesterday's load and your overnight recovery.",
        tips: [
          { text: "Swap intense training for mobility, walking, or Zone 2 only." },
          { text: "Push bedtime earlier and aim for a cooler, darker room tonight." },
          {
            text: "Try magnesium glycinate to support wind-down.",
            href: "#",
            linkLabel: "see Amazon",
          },
        ],
      },
      {
        min: 60,
        max: 69,
        label: "Below baseline",
        summary: "Your recovery is workable, but your body is asking for restraint.",
        explanation:
          "This range often means you are functional but not fully recovered. Sleep quality, late stress, alcohol, or recent workouts may still be suppressing HRV and elevating resting heart rate.",
        tips: [
          { text: "Keep caffeine earlier in the day and hydrate aggressively." },
          { text: "Bias your calendar toward focus blocks instead of extra intensity." },
          {
            text: "Use a simple electrolyte mix before noon.",
            href: "#",
            linkLabel: "see Amazon",
          },
        ],
      },
      {
        min: 70,
        max: 79,
        label: "Stable",
        summary: "You have enough capacity for a solid, controlled day.",
        explanation:
          "This score suggests decent recovery without peak freshness. You can usually train or work hard, but performance improves if you avoid stacking too many stressors at once.",
        tips: [
          { text: "Choose one high-priority stressor today, not three." },
          { text: "Eat protein early to stabilize recovery and appetite." },
          { text: "Take a 10-20 minute walk after lunch to boost energy." },
        ],
      },
      {
        min: 80,
        max: 89,
        label: "Strong",
        summary: "Your system looks resilient and ready for meaningful output.",
        explanation:
          "This is a healthy readiness zone. HRV, resting heart rate, and sleep timing are usually aligned well enough for harder training or cognitively demanding work.",
        tips: [
          { text: "Use the green light for your most valuable training or focus block." },
          { text: "Keep recovery basics in place so tomorrow stays strong." },
          { text: "Get bright outdoor light in the first hour after waking." },
        ],
      },
      {
        min: 90,
        max: 100,
        label: "Peak readiness",
        summary: "Your body is showing unusually strong recovery capacity today.",
        explanation:
          "Scores this high often mean your sleep, autonomic recovery, and recent load are lining up well. It is a good day to press performance, provided you still fuel and recover well afterward.",
        tips: [
          { text: "Schedule your hardest session or deepest work block early." },
          { text: "Fuel before and after training so the next night stays productive." },
          { text: "Avoid wasting a great readiness day on random low-value stress." },
        ],
      },
    ],
  },
  whoopRecovery: {
    label: "Whoop Recovery",
    shortLabel: "Whoop Recovery",
    scoreLabel: "Recovery score",
    unitHint: "0-100",
    higherIsBetter: true,
    min: 0,
    max: 100,
    adjustments: {
      sleepPer30: 3,
      alcoholReduction: 8,
      walkPer10: 1,
    },
    ranges: [
      {
        min: 0,
        max: 33,
        label: "Red recovery",
        summary: "Your physiology is signaling heavy recovery pressure.",
        explanation:
          "A low Whoop recovery score usually reflects suppressed HRV, elevated resting heart rate, and insufficient sleep relative to your recent strain. Today is better for reducing load than forcing output.",
        tips: [
          { text: "Skip max-effort training and use movement purely for circulation." },
          { text: "Increase water, sodium, and easy carbohydrates if you trained hard." },
          {
            text: "A cooling sleep mask can help improve tonight's setup.",
            href: "#",
            linkLabel: "see Amazon",
          },
        ],
      },
      {
        min: 34,
        max: 49,
        label: "Caution",
        summary: "Recovery is compromised enough that pacing matters.",
        explanation:
          "This score often means you are not fully reset from recent load, travel, or lifestyle stress. You may still perform, but the cost of overreaching is higher than usual.",
        tips: [
          { text: "Train technique, not ego. Keep intensity submaximal." },
          { text: "Front-load protein and a real breakfast if you feel flat." },
          {
            text: "Cut late alcohol for the next 24 hours.",
            href: "#",
            linkLabel: "see Amazon",
          },
        ],
      },
      {
        min: 50,
        max: 66,
        label: "Moderate",
        summary: "You have usable capacity, but not unlimited reserve.",
        explanation:
          "A mid-range recovery score usually means you can handle normal training or work demands if you stay disciplined about sleep, nutrition, and total strain.",
        tips: [
          { text: "Keep today's hardest effort brief and intentional." },
          { text: "Protect your next sleep window instead of chasing more volume." },
          { text: "Pair deep work blocks with short walking resets." },
        ],
      },
      {
        min: 67,
        max: 83,
        label: "Good recovery",
        summary: "Your system looks ready for productive output.",
        explanation:
          "This is a solid green zone for most people. Your overnight signals suggest you recovered well enough to absorb meaningful strain or focus work without excessive risk of digging a deeper hole.",
        tips: [
          { text: "Use the day for quality work or your main training session." },
          { text: "Stay consistent with hydration so the next score holds." },
          { text: "Take outdoor light and movement breaks to maintain momentum." },
        ],
      },
      {
        min: 84,
        max: 100,
        label: "Exceptional recovery",
        summary: "Your recovery profile is unusually favorable right now.",
        explanation:
          "Scores in this range often show strong HRV relative to baseline, stable resting heart rate, and sufficient sleep. It is a prime time to take on high-value strain if the rest of your context matches.",
        tips: [
          { text: "Prioritize your highest upside workout or performance task." },
          { text: "Eat enough afterward so the green score does not boomerang tomorrow." },
          { text: "Use the surplus energy for one big win, not scattered busyness." },
        ],
      },
    ],
  },
  whoopStrain: {
    label: "Whoop Strain",
    shortLabel: "Whoop Strain",
    scoreLabel: "Strain score",
    unitHint: "0-21",
    higherIsBetter: false,
    min: 0,
    max: 21,
    adjustments: {
      sleepPer30: 1,
      alcoholReduction: 1,
      walkPer10: -1,
    },
    ranges: [
      {
        min: 0,
        max: 5,
        label: "Very light day",
        summary: "Your total strain is low and likely restorative.",
        explanation:
          "A Whoop strain score in this range usually means the day has been physically easy. That can be a smart choice on a low-recovery day, but it can also mean you have room for more work if recovery is good.",
        tips: [
          { text: "If recovery is green, add purposeful training instead of random activity." },
          { text: "Use walking meetings to build strain without extra fatigue." },
          { text: "Do not confuse undertraining with recovery if this becomes a pattern." },
        ],
      },
      {
        min: 6,
        max: 9,
        label: "Light load",
        summary: "You created a light stimulus without much systemic cost.",
        explanation:
          "This is a low to moderate activity day. It works well for maintenance, active recovery, or busy workdays when training cannot be the priority.",
        tips: [
          { text: "Layer mobility or a short walk if you want more movement." },
          { text: "Keep protein intake high so recovery stays easy." },
          { text: "Use this level when sleep or readiness is trending down." },
        ],
      },
      {
        min: 10,
        max: 14,
        label: "Moderate strain",
        summary: "You put in useful work without pushing into the red.",
        explanation:
          "This is often the sweet spot for sustainable training. It gives your body enough signal to adapt while keeping tomorrow's recovery manageable for many people.",
        tips: [
          { text: "Maintain hydration and carbs if you want tomorrow to stay stable." },
          { text: "A short post-workout walk can smooth recovery." },
          {
            text: "Compression socks can help if you are sitting for long stretches.",
            href: "#",
            linkLabel: "see Amazon",
          },
        ],
      },
      {
        min: 15,
        max: 18,
        label: "Demanding",
        summary: "Your body experienced a substantial training or lifestyle load.",
        explanation:
          "This range can be productive, but it requires enough sleep and recovery inputs afterward. If it stacks on top of low recovery, travel, or alcohol, tomorrow often pays the price.",
        tips: [
          { text: "Prioritize recovery nutrition immediately after hard work." },
          { text: "Lower evening stimulation so sleep quality does the heavy lifting." },
          { text: "Keep tomorrow flexible if your recovery score trends down." },
        ],
      },
      {
        min: 19,
        max: 21,
        label: "Maxed out",
        summary: "This is a near-cap day that demands recovery respect afterward.",
        explanation:
          "Very high strain can be appropriate occasionally, but it usually needs a deliberate recovery response. Without it, your next readiness or recovery score often tanks.",
        tips: [
          { text: "Assume tomorrow needs extra sleep, hydration, and lower intensity." },
          { text: "Eat enough carbohydrate to refill what you spent." },
          {
            text: "A foam roller or massage gun can help bring down stiffness.",
            href: "#",
            linkLabel: "see Amazon",
          },
        ],
      },
    ],
  },
  garminBodyBattery: {
    label: "Garmin Body Battery",
    shortLabel: "Garmin",
    scoreLabel: "Body Battery",
    unitHint: "0-100",
    higherIsBetter: true,
    min: 0,
    max: 100,
    adjustments: {
      sleepPer30: 3,
      alcoholReduction: 7,
      walkPer10: 1,
    },
    ranges: [
      {
        min: 0,
        max: 20,
        label: "Depleted",
        summary: "Your energy reserves are running critically low.",
        explanation:
          "A very low Body Battery usually means stress has been high and restoration has not caught up. Think low reserve, low flexibility, and a higher chance of feeling worse if you force intensity.",
        tips: [
          { text: "Move gently, eat consistently, and protect your bedtime tonight." },
          { text: "Reduce unnecessary decisions and meetings if you can." },
          {
            text: "Blue-light blocking glasses may help your evening wind-down.",
            href: "#",
            linkLabel: "see Amazon",
          },
        ],
      },
      {
        min: 21,
        max: 40,
        label: "Low reserves",
        summary: "You have some capacity, but not much margin for sloppiness.",
        explanation:
          "This range often shows that stress and recovery are still mismatched. You can get through the day, but your body benefits from conservative pacing and better sleep hygiene.",
        tips: [
          { text: "Break big tasks into shorter bursts with walking resets." },
          { text: "Avoid stacking caffeine late with alcohol later." },
          { text: "Get off screens earlier than usual tonight." },
        ],
      },
      {
        min: 41,
        max: 60,
        label: "Rebuilding",
        summary: "Your reserves are recovering, but not fully topped up.",
        explanation:
          "This is a workable middle zone. You can handle normal responsibilities, yet the day still rewards smart recovery decisions instead of treating yourself like you are at 100%.",
        tips: [
          { text: "Focus on steady energy, meals, and hydration." },
          { text: "Use a 10-minute walk to raise alertness instead of extra coffee." },
          { text: "Keep your workout controlled if work stress is also high." },
        ],
      },
      {
        min: 61,
        max: 80,
        label: "Solid reserves",
        summary: "You have enough energy to do meaningful work well.",
        explanation:
          "A Body Battery in this range usually means your recovery is supporting a productive day. It is a good time to do focused work or a well-structured training session.",
        tips: [
          { text: "Front-load the tasks that require the most attention." },
          { text: "Use the higher reserve for training with intention, not random volume." },
          { text: "Keep the evening routine clean so reserves stay elevated." },
        ],
      },
      {
        min: 81,
        max: 100,
        label: "High reserve",
        summary: "Your energy tank is close to full.",
        explanation:
          "This is one of the better zones to capitalize on. High reserves often reflect strong sleep and manageable stress, giving you room to perform before the battery drains later in the day.",
        tips: [
          { text: "Tackle your biggest cognitive or training priority first." },
          { text: "Keep momentum with hydration, daylight, and structured breaks." },
          { text: "Avoid turning high reserve into late-night overextension." },
        ],
      },
    ],
  },
};

const toggleMeta: Array<{
  key: ToggleKey;
  label: string;
  icon: typeof BriefcaseBusiness;
}> = [
  { key: "deskJob", label: "Desk job", icon: BriefcaseBusiness },
  { key: "highTrainingLoad", label: "High training load", icon: Flame },
  { key: "alcoholLastNight", label: "Alcohol last night", icon: Wine },
  { key: "poorSleep", label: "Poor sleep", icon: BedDouble },
];

const baseSchema = z.object({
  device: z.enum(deviceKeys),
  score: z.number().finite("Enter a valid score."),
  deskJob: z.boolean(),
  highTrainingLoad: z.boolean(),
  alcoholLastNight: z.boolean(),
  poorSleep: z.boolean(),
});

const formSchema = baseSchema.superRefine(({ device, score }, ctx) => {
  const config = deviceDefinitions[device];

  if (score < config.min || score > config.max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["score"],
      message: `For ${config.label}, enter a score between ${config.min} and ${config.max}.`,
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  device: "ouraReadiness",
  score: 72,
  deskJob: true,
  highTrainingLoad: false,
  alcoholLastNight: false,
  poorSleep: false,
};

const defaultWhatIf: WhatIfState = {
  extraSleepMinutes: 0,
  alcoholReduction: 0,
  walkMinutes: 0,
};

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function findRange(device: DeviceDefinition, score: number) {
  return (
    device.ranges.find((range) => score >= range.min && score <= range.max) ??
    device.ranges[device.ranges.length - 1]
  );
}

function getGaugeColor(deviceKey: DeviceKey, score: number) {
  if (deviceKey === "whoopStrain") {
    if (score >= 15) {
      return "#f87171";
    }

    if (score >= 8) {
      return "#fbbf24";
    }

    return "#34d399";
  }

  if (score < 40) {
    return "#f87171";
  }

  if (score < 70) {
    return "#fbbf24";
  }

  return "#34d399";
}

function getLikelyDrivers(
  values: FormValues,
  device: DeviceDefinition,
  range: RangeDefinition,
) {
  const drivers: string[] = [];

  if (values.poorSleep) {
    drivers.push(
      "Poor sleep is likely a primary driver of today's weaker recovery signal.",
    );
  }

  if (values.alcoholLastNight) {
    drivers.push(
      "Alcohol is likely suppressing overnight recovery and making the score look worse than usual.",
    );
  }

  if (values.highTrainingLoad) {
    drivers.push(
      "Recent training load may be outpacing your current recovery capacity.",
    );
  }

  if (values.deskJob) {
    drivers.push(
      "Long sitting blocks can flatten energy and slow the rebound you want from the day.",
    );
  }

  if (drivers.length === 0) {
    if (!device.higherIsBetter && range.min >= 15) {
      drivers.push(
        "Your accumulated strain is already high enough that adding more intensity may create tomorrow's problem.",
      );
    } else if (device.higherIsBetter && range.max <= 69) {
      drivers.push(
        "Accumulated autonomic stress and incomplete overnight recovery are the most likely drivers here.",
      );
    } else if (device.higherIsBetter && range.min >= 70) {
      drivers.push(
        "Your recent sleep, stress load, and recovery inputs appear to be lining up fairly well.",
      );
    } else {
      drivers.push(
        "This score usually reflects a normal blend of recent load, sleep quality, and day-to-day stress.",
      );
    }
  }

  return drivers.slice(0, 4);
}

function buildTipSections(values: FormValues, range: RangeDefinition) {
  const coreTips = range.tips.slice(0, 3);
  const contextTips: TipDefinition[] = [];

  if (values.poorSleep) {
    contextTips.push({
      text: "Add a stricter wind-down tonight: dim lights, cut screens, and guard the last hour before bed.",
    });
  }

  if (values.alcoholLastNight) {
    contextTips.push({
      text: "Treat hydration, electrolytes, and an earlier bedtime as non-negotiable today.",
    });
  }

  if (values.deskJob) {
    contextTips.push({
      text: "Use 5-minute walking breaks every 60-90 minutes to keep energy from flattening out.",
    });
  }

  if (values.highTrainingLoad) {
    contextTips.push({
      text: "Keep any workout quality-focused and cap the total volume before it snowballs.",
    });
  }

  const uniqueContextTips = contextTips.filter(
    (tip, index, array) =>
      array.findIndex((item) => item.text === tip.text) === index,
  );

  return {
    coreTips,
    contextTips: uniqueContextTips,
  };
}

function getScenarioSummary(device: DeviceDefinition, delta: number) {
  if (delta === 0) {
    return "With the current what-if settings, your projected score stays roughly the same.";
  }

  if (device.higherIsBetter) {
    return delta > 0
      ? `With the changes you modeled, your projected score moves up by ${delta} point${delta === 1 ? "" : "s"}.`
      : `With the current what-if settings, your projected score falls by ${Math.abs(delta)} point${Math.abs(delta) === 1 ? "" : "s"}.`;
  }

  return delta < 0
    ? `With the changes you modeled, your recommended strain target comes down by ${Math.abs(delta)} point${Math.abs(delta) === 1 ? "" : "s"}.`
    : `With the current what-if settings, your strain target rises by ${delta} point${delta === 1 ? "" : "s"}, which means the day may cost more recovery.`;
}

function getDeltaPresentation(device: DeviceDefinition, delta: number) {
  if (delta === 0) {
    return {
      label: "No projected change",
      tone: "neutral" as const,
    };
  }

  const isImprovement = device.higherIsBetter ? delta > 0 : delta < 0;
  const label = device.higherIsBetter
    ? delta > 0
      ? `+${delta} projected`
      : `${delta} projected`
    : `${delta > 0 ? `+${delta}` : delta} target`;

  return {
    label,
    tone: isImprovement ? ("positive" as const) : ("negative" as const),
  };
}

function computeProjectedScore(values: FormValues, whatIf: WhatIfState) {
  const device = deviceDefinitions[values.device];
  const sleepBoost =
    (whatIf.extraSleepMinutes / 30) * device.adjustments.sleepPer30;
  const alcoholBoost =
    values.alcoholLastNight
      ? (whatIf.alcoholReduction / 100) *
        (device.adjustments.alcoholReduction + 1)
      : 0;
  const rawWalkBoost =
    (whatIf.walkMinutes / 10) * device.adjustments.walkPer10;
  const walkBoost =
    values.device === "whoopStrain"
      ? Math.max(rawWalkBoost, -4)
      : rawWalkBoost;
  const direction = device.higherIsBetter ? 1 : -1;
  const projectedRaw =
    values.score + direction * (sleepBoost + alcoholBoost + walkBoost);

  return clampValue(
    Math.round(projectedRaw),
    device.min,
    device.max,
  );
}

function createGauge(
  values: FormValues,
  projectedScore: number,
): Pick<ComputedAnalysis, "chartData" | "chartOptions"> {
  const device = deviceDefinitions[values.device];
  const color = getGaugeColor(values.device, projectedScore);

  return {
    chartData: {
      labels: ["Projected score", "Remaining range"],
      datasets: [
        {
          data: [projectedScore, Math.max(device.max - projectedScore, 0)],
          backgroundColor: [color, "rgba(51, 65, 85, 0.35)"],
          borderWidth: 0,
          hoverOffset: 0,
          spacing: 3,
        },
      ],
    },
    chartOptions: {
      rotation: 270,
      circumference: 180,
      cutout: "80%",
      layout: {
        padding: {
          top: 8,
          right: 10,
          bottom: 0,
          left: 10,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.dataIndex !== 0) {
                return "Remaining range";
              }

              return `${device.scoreLabel}: ${projectedScore}/${device.max}`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        duration: 700,
      },
    },
  };
}

function computeAnalysis(values: FormValues, whatIf: WhatIfState) {
  const device = deviceDefinitions[values.device];
  const projectedScore = computeProjectedScore(values, whatIf);
  const currentRange = findRange(device, values.score);
  const projectedRange = findRange(device, projectedScore);
  const delta = projectedScore - values.score;
  const likelyDrivers = getLikelyDrivers(values, device, currentRange);
  const scenarioSummary = getScenarioSummary(device, delta);
  const explanation = `${currentRange.explanation} ${scenarioSummary} ${projectedRange.summary}`;
  const { coreTips, contextTips } = buildTipSections(values, projectedRange);
  const deltaPresentation = getDeltaPresentation(device, delta);
  const gauge = createGauge(values, projectedScore);

  return {
    device,
    currentScore: values.score,
    projectedScore,
    delta,
    currentRange,
    projectedRange,
    explanation,
    likelyDrivers,
    coreTips,
    contextTips,
    deltaLabel: deltaPresentation.label,
    deltaTone: deltaPresentation.tone,
    chartData: gauge.chartData,
    chartOptions: gauge.chartOptions,
  } satisfies ComputedAnalysis;
}

function formatSessionTime(timestamp: string) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildShareText(values: FormValues, analysis: ComputedAnalysis) {
  const activeFlags = toggleMeta
    .filter((toggle) => values[toggle.key])
    .map((toggle) => toggle.label);
  const allTips = [...analysis.coreTips, ...analysis.contextTips];

  return [
    `TrackSmart Wellness Readiness Interpreter`,
    `Device: ${analysis.device.label}`,
    `Current score: ${analysis.currentScore}/${analysis.device.max}`,
    `Projected score: ${analysis.projectedScore}/${analysis.device.max}`,
    `Current interpretation: ${analysis.currentRange.label}`,
    `Projected interpretation: ${analysis.projectedRange.label}`,
    `Likely drivers: ${analysis.likelyDrivers.join(" | ")}`,
    `Explanation: ${analysis.explanation}`,
    `Context: ${activeFlags.length > 0 ? activeFlags.join(", ") : "None selected"}`,
    `Tips: ${allTips.map((tip) => tip.text).join(" | ")}`,
  ].join("\n");
}

function hasLiveWhatIfChanges(whatIf: WhatIfState) {
  return (
    whatIf.extraSleepMinutes !== defaultWhatIf.extraSleepMinutes ||
    whatIf.alcoholReduction !== defaultWhatIf.alcoholReduction ||
    whatIf.walkMinutes !== defaultWhatIf.walkMinutes
  );
}

export default function ReadinessInterpreter() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const selectedDeviceKey = useWatch({
    control: form.control,
    name: "device",
  });
  const currentScoreValue = useWatch({
    control: form.control,
    name: "score",
  });
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(
    null,
  );
  const [whatIf, setWhatIf] = useState<WhatIfState>(defaultWhatIf);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const selectedDevice = deviceDefinitions[selectedDeviceKey];
  const analysis = submittedValues
    ? computeAnalysis(submittedValues, whatIf)
    : null;
  const alcoholScenarioEnabled = submittedValues?.alcoholLastNight ?? false;
  const hasUnsavedSliderChanges =
    submittedValues !== null && hasLiveWhatIfChanges(whatIf);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as SavedSession[];
      setSavedSessions(parsed.slice(0, 3));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const max = deviceDefinitions[selectedDeviceKey].max;
    const min = deviceDefinitions[selectedDeviceKey].min;

    if (typeof currentScoreValue !== "number" || Number.isNaN(currentScoreValue)) {
      return;
    }

    if (currentScoreValue > max) {
      form.setValue("score", max, { shouldValidate: true });
    }

    if (currentScoreValue < min) {
      form.setValue("score", min, { shouldValidate: true });
    }
  }, [currentScoreValue, form, selectedDeviceKey]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function persistSession(values: FormValues) {
    const nextSession: SavedSession = {
      id: `${Date.now()}`,
      timestamp: new Date().toISOString(),
      values,
    };
    const nextSessions = [nextSession, ...savedSessions].slice(0, 3);
    setSavedSessions(nextSessions);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
  }

  function onSubmit(values: FormValues) {
    setCopied(false);
    setIsInterpreting(true);
    setWhatIf(defaultWhatIf);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setSubmittedValues(values);
      persistSession(values);
      setIsInterpreting(false);
    }, 450);
  }

  async function copyShareCard() {
    if (!submittedValues || !analysis) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        buildShareText(submittedValues, analysis),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function loadSession(session: SavedSession) {
    form.reset(session.values);
    setSubmittedValues(session.values);
    setWhatIf(defaultWhatIf);
    setCopied(false);
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
          <div className="bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_40%),linear-gradient(180deg,_rgba(15,23,42,0.2),_rgba(2,6,23,0.85))] px-5 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  <MoonStar className="h-3.5 w-3.5" />
                  Readiness score calculator
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Decode low readiness scores without guessing
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Compare Oura readiness, Whoop recovery, Whoop strain, and
                  Garmin Body Battery with plain-English explanations, what-if
                  adjustments, and fast actions for low readiness score what to
                  do today.
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
                      Explanation + action plan
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Saved locally
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      Last 3 sessions
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      Readiness Interpreter
                    </p>
                    <p className="text-sm text-slate-400">
                      Enter a wearable score and let the tool translate it.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-6 space-y-5"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="device"
                      className="text-sm font-medium text-slate-200"
                    >
                      Device and score type
                    </label>
                    <select
                      id="device"
                      {...form.register("device")}
                      className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-base text-white outline-none transition focus:border-cyan-400"
                    >
                      {deviceKeys.map((deviceKey) => (
                        <option key={deviceKey} value={deviceKey}>
                          {deviceDefinitions[deviceKey].label} (
                          {deviceDefinitions[deviceKey].unitHint})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="score"
                        className="text-sm font-medium text-slate-200"
                      >
                        Current score
                      </label>
                      <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        {selectedDevice.unitHint}
                      </span>
                    </div>
                    <input
                      id="score"
                      type="number"
                      inputMode="numeric"
                      min={selectedDevice.min}
                      max={selectedDevice.max}
                      {...form.register("score", { valueAsNumber: true })}
                      className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-lg font-semibold text-white outline-none transition focus:border-cyan-400"
                    />
                    {form.formState.errors.score && (
                      <p className="text-sm text-red-300">
                        {form.formState.errors.score.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-200">
                      Quick context toggles
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {toggleMeta.map((toggle) => {
                        const Icon = toggle.icon;
                        const active = form.watch(toggle.key);

                        return (
                          <button
                            key={toggle.key}
                            type="button"
                            onClick={() =>
                              form.setValue(toggle.key, !active, {
                                shouldDirty: true,
                              })
                            }
                            className={[
                              "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                              active
                                ? "border-cyan-400/50 bg-cyan-400/10 text-white"
                                : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "flex h-10 w-10 items-center justify-center rounded-xl",
                                active
                                  ? "bg-cyan-400/20 text-cyan-200"
                                  : "bg-slate-950 text-slate-400",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">
                              {toggle.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isInterpreting}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
                  >
                    {isInterpreting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Interpreting score...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5" />
                        Interpret Score
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {(isInterpreting || analysis) && (
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-400/10 to-transparent" />
                <div className="relative">
                  <WearableChartWrapper
                    type="doughnut"
                    title="Projected score gauge"
                    description="A clean visual of where the projected score lands in the device range."
                    loading={isInterpreting}
                    data={analysis?.chartData ?? { datasets: [] }}
                    options={analysis?.chartOptions}
                    height={240}
                    className="border-transparent bg-transparent p-0 shadow-none"
                  />
                </div>

                {!isInterpreting && analysis && (
                  <div className="mt-2 space-y-4">
                    <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/20">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            {analysis.device.shortLabel} projected score
                          </p>
                          <div className="mt-2 flex items-end gap-3">
                            <p className="text-5xl font-black tracking-tight text-white">
                              {analysis.projectedScore}
                            </p>
                            <p className="pb-2 text-sm font-medium text-slate-400">
                              out of {analysis.device.max}
                            </p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            Current {analysis.currentScore} with a projected band of{" "}
                            <span className="font-semibold text-white">
                              {analysis.projectedRange.label}
                            </span>
                            .
                          </p>
                        </div>
                        <p
                          className={[
                            "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold",
                            analysis.deltaTone === "positive"
                              ? "bg-emerald-400/15 text-emerald-200"
                              : analysis.deltaTone === "negative"
                                ? "bg-red-400/15 text-red-200"
                                : "bg-slate-800 text-slate-300",
                          ].join(" ")}
                        >
                          {analysis.deltaLabel}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          Current band
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {analysis.currentRange.label}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          Projected band
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {analysis.projectedRange.label}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          Device range
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {analysis.device.min}-{analysis.device.max}
                        </p>
                      </div>
                    </div>

                    {hasUnsavedSliderChanges && (
                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
                        Sliders update live — click Interpret again to save this
                        exact session.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Plain-English interpretation
                    </h2>
                    <p className="text-sm text-slate-400">
                      Built from a device-specific lookup table that is easy to
                      edit later.
                    </p>
                  </div>
                </div>

                {isInterpreting ? (
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-400">
                    Generating your explanation and action plan...
                  </div>
                ) : (
                  analysis && (
                    <>
                      <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                        <p className="text-sm font-semibold text-amber-100">
                          Likely drivers right now
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50/85">
                          {analysis.likelyDrivers.map((driver) => (
                            <li key={driver}>• {driver}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="mt-6 text-base leading-8 text-slate-300">
                        {analysis.explanation}
                      </p>

                      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                        <h3 className="text-base font-semibold text-white">
                          Action plan for today
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                          {analysis.coreTips.map((tip) => (
                            <li key={tip.text} className="flex gap-3">
                              <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                              <span>
                                {tip.text}{" "}
                                {tip.href && tip.linkLabel ? (
                                  <a
                                    href={tip.href}
                                    className="font-semibold text-cyan-300 hover:text-cyan-200"
                                  >
                                    {tip.linkLabel}
                                  </a>
                                ) : null}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {analysis.contextTips.length > 0 && (
                          <>
                            <h4 className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                              Based on your context
                            </h4>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                              {analysis.contextTips.map((tip) => (
                                <li key={tip.text} className="flex gap-3">
                                  <span className="mt-2 h-2 w-2 rounded-full bg-amber-300" />
                                  <span>{tip.text}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </>
                  )
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      What-if sliders
                    </h2>
                    <p className="text-sm text-slate-400">
                      Adjust recovery levers and watch the projected score move.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <label className="block">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-200">
                        +30 min sleep blocks
                      </span>
                      <span className="text-sm text-cyan-300">
                        +{whatIf.extraSleepMinutes} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      step={30}
                      value={whatIf.extraSleepMinutes}
                      onChange={(event) =>
                        setWhatIf((current) => ({
                          ...current,
                          extraSleepMinutes: Number(event.target.value),
                        }))
                      }
                      className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400"
                    />
                  </label>

                  <label className="block">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-200">
                        Reduce alcohol impact
                      </span>
                      <span className="text-sm text-cyan-300">
                        {whatIf.alcoholReduction}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={10}
                      value={whatIf.alcoholReduction}
                      disabled={!alcoholScenarioEnabled}
                      onChange={(event) =>
                        setWhatIf((current) => ({
                          ...current,
                          alcoholReduction: Number(event.target.value),
                        }))
                      }
                      className={[
                        "mt-3 h-2 w-full appearance-none rounded-full bg-slate-800 accent-cyan-400",
                        alcoholScenarioEnabled
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-40",
                      ].join(" ")}
                    />
                    {!alcoholScenarioEnabled && (
                      <p className="mt-2 text-xs text-slate-500">
                        Turn on <span className="font-medium text-slate-400">Alcohol last night</span> above to model how much recovery you could get back.
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-200">
                        Add recovery walk
                      </span>
                      <span className="text-sm text-cyan-300">
                        +{whatIf.walkMinutes} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={10}
                      value={whatIf.walkMinutes}
                      onChange={(event) =>
                        setWhatIf((current) => ({
                          ...current,
                          walkMinutes: Number(event.target.value),
                        }))
                      }
                      className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400"
                    />
                  </label>
                </div>

                {!isInterpreting && analysis && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Sleep effect
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {whatIf.extraSleepMinutes === 0
                          ? "No change"
                          : analysis.device.higherIsBetter
                            ? "Recovery boost modeled"
                            : "Lower strain target modeled"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Alcohol effect
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {!alcoholScenarioEnabled
                          ? "Toggle off"
                          : whatIf.alcoholReduction === 0
                          ? "No reduction"
                          : analysis.device.higherIsBetter
                            ? "Suppression reduced"
                            : "Recovery drag reduced"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Walk effect
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {whatIf.walkMinutes === 0
                          ? "No walk added"
                          : analysis.device.higherIsBetter
                            ? "Circulation improved"
                            : "Adds light strain"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Shareable result card
                    </h2>
                    <p className="text-sm text-slate-400">
                      Copy the current inputs and explanation for a coach, doctor,
                      or training note.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyShareCard}
                    disabled={!analysis}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm font-semibold text-slate-100 transition hover:border-slate-600 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copied ? (
                      <>
                        <ClipboardCheck className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-4 w-4" />
                        Copy result
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-slate-800 bg-slate-950/80 p-5">
                  {analysis && submittedValues ? (
                    <div className="space-y-3 text-sm leading-6 text-slate-300">
                      <p className="text-base font-semibold text-white">
                        {analysis.device.label}: {analysis.currentScore} →{" "}
                        {analysis.projectedScore}
                      </p>
                      <p>{analysis.explanation}</p>
                      <p className="text-slate-400">
                        Context:{" "}
                        {toggleMeta
                          .filter((toggle) => submittedValues[toggle.key])
                          .map((toggle) => toggle.label)
                          .join(", ") || "None selected"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Interpret a score to generate a copy-ready summary.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                <h2 className="text-xl font-bold text-white">
                  Last 3 local sessions
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Saved only in this browser with localStorage.
                </p>

                <div className="mt-5 space-y-3">
                  {savedSessions.length > 0 ? (
                    savedSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/75 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {deviceDefinitions[session.values.device].label} ·{" "}
                            {session.values.score}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                            {formatSessionTime(session.timestamp)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => loadSession(session)}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-100 transition hover:border-slate-600"
                        >
                          Load session
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-500">
                      No saved sessions yet. Your last three interpretations will
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
