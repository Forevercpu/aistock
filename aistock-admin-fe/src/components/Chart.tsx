import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

/** 统一封装管理端 ECharts 高度和 option 类型转换。 */
export function Chart({ option, height = 280 }: { option: unknown; height?: number }) {
  return <ReactECharts option={option as EChartsOption} style={{ height }} />;
}
