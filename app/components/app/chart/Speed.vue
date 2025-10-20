<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";
import { useTheme } from "vuetify";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface Props {
  value: number;
  min?: number;
  max?: number;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  label: "Nivel",
});

const theme = useTheme();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);

const normalizedValue = computed(() => {
  const val = Math.max(props.min, Math.min(props.max, props.value));
  return ((val - props.min) / (props.max - props.min)) * 100;
});

const getColor = (value: number): string => {
  if (value < 33) return theme.current.value.colors.error;
  if (value < 66) return theme.current.value.colors.warning;
  return theme.current.value.colors.primary;
};

const getNeedleColor = (): string => {
  return theme.current.value.colors.contrast?.toString() || "#000000";
};

const getBackgroundColor = (): string => {
  return theme.current.value.colors.background?.toString() || "#000000";
};

const getTextColor = (): string => {
  return theme.current.value.colors["on-background"]?.toString() || "#000000";
};

const createGauge = () => {
  if (!canvasRef.value) return;

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  const value = normalizedValue.value;
  const color = getColor(value);

  const config: ChartConfiguration<"doughnut"> = {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [value, 100 - value],
          backgroundColor: [color, getBackgroundColor()],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "75%",
      layout: {
        padding: {
          top: 0,
          bottom: 0,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    },
    plugins: [
      {
        id: "gaugeNeedle",
        afterDatasetDraw(chart) {
          const { ctx, chartArea } = chart;
          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = chartArea.bottom - 60;
          const radius =
            Math.min(
              chartArea.right - chartArea.left,
              (chartArea.bottom - chartArea.top) * 3
            ) / 2;

          const angle = (normalizedValue.value / 100) * Math.PI - Math.PI;
          const needleLength = radius * 0.8;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, -3);
          ctx.lineTo(needleLength, 0);
          ctx.lineTo(0, 3);
          ctx.fillStyle = getNeedleColor();
          ctx.fill();
          ctx.restore();

          ctx.beginPath();
          ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = getNeedleColor();
          ctx.fill();
        },
      },
      {
        id: "gaugeText",
        afterDatasetDraw(chart) {
          const { ctx, chartArea } = chart;
          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = chartArea.bottom -30;

          ctx.save();
          ctx.font = "bold 18px Outfit";
          ctx.fillStyle = getTextColor();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            Math.round(props.value).toString() + "%",
            centerX,
            centerY
          );
          ctx.restore();

          ctx.save();
          ctx.font = "14px Roboto";
          ctx.fillStyle = getTextColor();
          ctx.textAlign = "center";
          ctx.fillText(props.label, centerX, centerY + 25);
          ctx.restore();
        },
      },
    ],
  };

  chartInstance.value = new Chart(ctx, config);
};

watch(
  () => [props.value, props.min, props.max, theme.current.value.dark],
  () => {
    createGauge();
  },
  { deep: true }
);

onMounted(() => {
  createGauge();
});
</script>

<template>
  <div class="gauge-container">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped lang="scss">
.gauge-container {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  height: 220px;
  margin: 0 auto;

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
