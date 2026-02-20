import type { EloDatapoint } from "./api/insights";

const QUICKCHART_URL = "https://quickchart.io/chart";
const CHART_WIDTH = 600;
const CHART_HEIGHT = 300;
const MONTHS_TO_SHOW = 6;
const MAX_DATAPOINTS = 60;

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function filterRecentMonths(points: EloDatapoint[], months: number): EloDatapoint[] {
  const cutoff = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
  return points.filter((point) => point.x >= cutoff);
}

function downsample(points: EloDatapoint[], maxPoints: number): EloDatapoint[] {
  if (points.length <= maxPoints) {
    return points;
  }

  const step = (points.length - 1) / (maxPoints - 1);
  const sampled: EloDatapoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    sampled.push(points[Math.round(i * step)]);
  }
  return sampled;
}

function formatDateLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
}

function buildChartConfig(playerName: string, modeLabel: string, points: EloDatapoint[]): object {
  const labels = points.map((point) => formatDateLabel(point.x));
  const data = points.map((point) => point.y);

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "ELO",
          data,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: {
        title: { display: true, text: `${playerName} — ${modeLabel}`, font: { size: 16 } },
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { maxTicksLimit: 8, maxRotation: 0 },
          grid: { display: false },
        },
        y: {
          ticks: { precision: 0 },
          grid: { color: "rgba(0,0,0,0.06)" },
        },
      },
    },
  };
}

export async function buildEloChart(
  playerName: string,
  modeLabel: string,
  rawPoints: EloDatapoint[],
): Promise<Uint8Array | null> {
  const recent = filterRecentMonths(rawPoints, MONTHS_TO_SHOW);
  if (recent.length < 2) {
    return null;
  }

  const points = downsample(recent, MAX_DATAPOINTS);
  const config = buildChartConfig(playerName, modeLabel, points);

  try {
    const response = await fetch(QUICKCHART_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chart: config,
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
        backgroundColor: "#ffffff",
        devicePixelRatio: 2,
        format: "png",
      }),
    });

    if (!response.ok) {
      return null;
    }

    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}
