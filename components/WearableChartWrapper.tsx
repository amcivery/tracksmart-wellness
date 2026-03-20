"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  registerables,
} from "chart.js";
import { Doughnut, Line, Radar } from "react-chartjs-2";

ChartJS.register(...registerables);

export type WearableChartType = "doughnut" | "line" | "radar";

interface WearableChartWrapperBaseProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  height?: number;
  className?: string;
}

interface DoughnutChartProps extends WearableChartWrapperBaseProps {
  type: "doughnut";
  data: ChartData<"doughnut">;
  options?: ChartOptions<"doughnut">;
}

interface LineChartProps extends WearableChartWrapperBaseProps {
  type: "line";
  data: ChartData<"line">;
  options?: ChartOptions<"line">;
}

interface RadarChartProps extends WearableChartWrapperBaseProps {
  type: "radar";
  data: ChartData<"radar">;
  options?: ChartOptions<"radar">;
}

export type WearableChartWrapperProps =
  | DoughnutChartProps
  | LineChartProps
  | RadarChartProps;

const chartFontFamily =
  '"Segoe UI", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';

const sharedOptions: ChartOptions<WearableChartType> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#cbd5e1",
        usePointStyle: true,
        boxWidth: 10,
        boxHeight: 10,
        padding: 18,
        font: {
          family: chartFontFamily,
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.96)",
      titleColor: "#f8fafc",
      bodyColor: "#cbd5e1",
      borderColor: "rgba(71, 85, 105, 0.8)",
      borderWidth: 1,
      titleFont: {
        family: chartFontFamily,
        size: 13,
        weight: 700,
      },
      bodyFont: {
        family: chartFontFamily,
        size: 12,
      },
      padding: 12,
      cornerRadius: 12,
    },
  },
  elements: {
    line: {
      borderWidth: 3,
      tension: 0.35,
    },
    point: {
      radius: 3,
      hoverRadius: 5,
      borderWidth: 2,
    },
    arc: {
      borderWidth: 0,
      borderRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(51, 65, 85, 0.35)",
      },
      ticks: {
        color: "#94a3b8",
        font: {
          family: chartFontFamily,
          size: 11,
        },
      },
      border: {
        color: "rgba(51, 65, 85, 0.45)",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(51, 65, 85, 0.35)",
      },
      ticks: {
        color: "#94a3b8",
        font: {
          family: chartFontFamily,
          size: 11,
        },
      },
      border: {
        color: "rgba(51, 65, 85, 0.45)",
      },
    },
    r: {
      angleLines: {
        color: "rgba(71, 85, 105, 0.5)",
      },
      grid: {
        color: "rgba(51, 65, 85, 0.35)",
      },
      pointLabels: {
        color: "#cbd5e1",
        font: {
          family: chartFontFamily,
          size: 11,
          weight: 500,
        },
      },
      ticks: {
        backdropColor: "transparent",
        color: "#64748b",
        font: {
          family: chartFontFamily,
          size: 10,
        },
      },
    },
  },
};

function mergeChartOptions<TType extends WearableChartType>(
  type: TType,
  options?: ChartOptions<TType>,
): ChartOptions<TType> {
  const mergedPlugins = {
    ...sharedOptions.plugins,
    ...options?.plugins,
    legend: {
      ...sharedOptions.plugins?.legend,
      ...options?.plugins?.legend,
      labels: {
        ...sharedOptions.plugins?.legend?.labels,
        ...options?.plugins?.legend?.labels,
      },
    },
    tooltip: {
      ...sharedOptions.plugins?.tooltip,
      ...options?.plugins?.tooltip,
    },
  };

  return {
    ...(sharedOptions as ChartOptions<TType>),
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    plugins: mergedPlugins,
    elements: {
      ...sharedOptions.elements,
      ...options?.elements,
    },
    scales:
      type === "doughnut"
        ? options?.scales
        : {
            ...sharedOptions.scales,
            ...options?.scales,
          },
  };
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/80">
      <div className="flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading chart...
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-red-500/30 bg-red-950/20 px-6 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-200">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-red-100">
          Chart unavailable
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-red-100/80">
          {message}
        </p>
      </div>
    </div>
  );
}

export default function WearableChartWrapper(
  props: WearableChartWrapperProps,
) {
  const {
    title,
    description,
    loading = false,
    error,
    height = 320,
    className,
  } = props;

  return (
    <section
      className={[
        "rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/30",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(title || description) && (
        <header className="mb-5">
          {title && (
            <h3 className="text-lg font-semibold tracking-tight text-slate-50">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {description}
            </p>
          )}
        </header>
      )}

      <div style={{ height }}>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : props.type === "doughnut" ? (
          <Doughnut
            data={props.data}
            options={mergeChartOptions("doughnut", props.options)}
          />
        ) : props.type === "line" ? (
          <Line
            data={props.data}
            options={mergeChartOptions("line", props.options)}
          />
        ) : (
          <Radar
            data={props.data}
            options={mergeChartOptions("radar", props.options)}
          />
        )}
      </div>
    </section>
  );
}
