import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export function Chart({ option, height = 280 }: { option: unknown; height?: number }) {
  return <ReactECharts option={option as EChartsOption} style={{ height }} />;
}
