// chart-gen.jsx
import React from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const chartComponents = {
  pie: Pie,
  bar: Bar,
  line: Line,
};

export const ChartComponent = ({ type, data, options }) => {
  const Chart = chartComponents[type];
  return <Chart data={data} options={options} />;
};

export function parseChartMarkdown(content) {
  const chartRegex = /```chart\n([\s\S]+?)\n```/;
  const match = content.match(chartRegex);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error('Failed to parse chart JSON:', error);
      return null;
    }
  }
  return null;
}
