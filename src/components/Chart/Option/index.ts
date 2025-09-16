import * as echarts from 'echarts';
import * as useUtils from '@/utils/index';

export type MakePoinRequestType = {
  xAxis: string;
  yAxis: number;
};
export type SeriesRequestType = {
  lineStyle?: string;
  name?: string;
  chartType?: string;
  isAreaStyle?: boolean;
  markPoint?: Array<MakePoinRequestType>;
  color?: string;
  data: Array<number | string>;
  barMaxWidth?: number;
  barCategoryGap?: string;
};
export type AxisRequestType = {
  unit?: string;
  type?: string;
  data?: Array<string | number>;
  max?: string;
  hideSplitLine?: string;
};
export type ChartTitleType = {
  text: string;
  subtext?: string;
};
export type FoldingLineRequestType = {
  title: ChartTitleType;
  xAxis: AxisRequestType;
  yAxis: AxisRequestType;
  showAlarm?: boolean;
  series: Array<SeriesRequestType>;
};

const makePoinConfig = (data: Array<MakePoinRequestType>) => {
  if (!Array.isArray(data)) {
    return {};
  }
  // 创建一个新的数组来存储格式化后的数据
  const formattedData = data.map((item) => {
    // 使用解构赋值来复制对象，避免直接修改原始数据
    const newItem = { ...item };
    const formattedDate = useUtils.formatDate(newItem.xAxis);
    newItem.xAxis = formattedDate !== '' ? formattedDate.slice(0, -3) : newItem.xAxis;
    return newItem;
  });
  return {
    symbol: 'circle',
    itemStyle: { color: '#FF384C', opacity: 0.9, borderWidth: 2 },
    symbolSize: 8,
    label: { show: true },
    data: formattedData
  };
};

const areaStyleConfig = (color: string) => ({
  opacity: 0.2,
  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    {
      offset: 0,
      color
    },
    {
      offset: 1,
      color: '#ffffff'
    }
  ])
});

const dateFormat = (date: Array<number | string>, useString: boolean = false) => {
  if (!date || useString) {
    return date;
  }
  const result: (number | string)[] = [];
  for (const item of date) {
    let dateStr;
    if (typeof item === 'string') {
      const formattedDate = useUtils.formatDate(item);
      dateStr = formattedDate !== '' ? formattedDate.slice(0, -3) : item;
    } else {
      dateStr = item;
    }

    if(useString) {
      dateStr = dateStr.split(' ')[0];
    }
    result.push(dateStr);
  }
  return result;
};
const seriesConfig = (series: Array<SeriesRequestType>) => {
  // 线条默认颜色
  const color = ['#0099FF', '#0099FF', '#0099FF', '#0099FF', '#0099FF', '#0099FF', '#0099FF', '#0099FF', '#0099FF', '#0099FF', '#0099FF'];
  let count = 0;
  const config = series.map((item, index) => {
    const format: any = {
      type: item.chartType ?? 'line',
      name: item.name ?? 'Actual',
      smooth: true,
      showSymbol: false,
      lineStyle: {
        type: item.lineStyle ?? 'solid'
      },
      data: item.data,
      areaStyle: undefined,
      markPoint: undefined
    };
    
    // 如果是bar类型，添加bar特有的配置
    if (item.chartType === 'bar') {
      if (item.barMaxWidth !== undefined) {
        format.barMaxWidth = item.barMaxWidth;
      }
      if (item.barCategoryGap !== undefined) {
        format.barCategoryGap = item.barCategoryGap;
      }
    }
    if (item.data?.length > count) {
      count = item.data?.length;
    }
    if (item.color) {
      color[index] = item.color;
    }
    if (item.isAreaStyle) {
      format.areaStyle = areaStyleConfig(color[index]);
    } else {
      delete format.areaStyle;
    }
    if (item.markPoint) {
      format.markPoint = makePoinConfig(item.markPoint);
    } else {
      format.markPoint = makePoinConfig([]);
    }
    return format;
  });
  const result = {
    color,
    series: config,
    dataZoom: []
  };

  if (count > 50) {
    // 数据区域缩放
    result.dataZoom = [
      {
        type: 'inside'
      },
      {
        type: 'slider'
      }
    ];
  }

  return result;
};

const xAxisConfig = (request) => {
  request.type = request.xAxis.type ?? 'category';
  return axisConfigX(request);
};
const tooltipConfig = (unit: string | undefined, series: Array<any>, showAlarm: boolean) => {
  const config = {
    trigger: 'axis',
    formatter: undefined
  };
  config.formatter = (params) => {
    let result = params[0].axisValue + '<br/>';
    params.forEach(function (item) {
      if (item.value === 'null') {
        return '';
      }
      result +=
        '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:' +
        item.color +
        ';"></span>' +
        item.seriesName +
        ': ' +
        item.value +
        `${unit}` +
        '<br/>';
      let isMarkPoint = false;
      if (item.seriesName === 'Actual') {
        if (series[0].markPoint) {
          isMarkPoint = series[0].markPoint.data.some(function (markPoint) {
            return markPoint.xAxis === item.axisValue;
          });
          if (showAlarm) {
            result +=
              '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:#FF384C;"></span>';
            if (isMarkPoint) {
              result += 'Alert Status: Active<br/>';
            } else {
              result += 'Alert Status: Inactive<br/>';
            }
          }
        }
      }
    });
    return result;
  };
  return config;
};
const yAxisConfig = (request: AxisRequestType) => {
  request.type = request.type ?? 'value';
  return axisConfig(request);
};
const axisConfigX = (configs) => {
  const request = configs.xAxis;
  let result: (number | string)[] = [];
  result = dateFormat(request.data, configs.useString);
  const config = {
    type: request.type,
    data: result,
    max: request.max,
    axisLabel: undefined,
    splitLine: undefined,
    position: 'top'
  };
  if (!request.max) {
    delete config.max;
  }
  const today = useUtils.formatDateToDay(new Date());
  config.axisLabel = {
    formatter: (value, index) => {
      const date = value.split(' ')[0]; // 提取日期部分
      if (date === today) {
        return 'Today'; // 如果是今天，显示 "Today"
      }
      return `${date}`;
    }
  };
  if (request.hideSplitLine) {
    config.splitLine = { show: false };
  } else {
    config.splitLine = { show: true };
  }
  return config;
};
const axisConfig = (request: AxisRequestType) => {
  const config = {
    type: request.type,
    data: dateFormat(request.data),
    max: request.max,
    axisLabel: undefined,
    splitLine: undefined
  };
  if (!request.max) {
    delete config.max;
  }
  if (request.unit) {
    config.axisLabel = {
      formatter: `{value}${request.unit}`
    };
  } else {
    delete config.axisLabel;
  }
  if (request.hideSplitLine) {
    config.splitLine = { show: false };
  } else {
    delete config.splitLine;
  }
  return config;
};
const headerConfig = (request: ChartTitleType, color: Array<string>, hasDataZoom: boolean) => {
  const title = {
    left: '3%',
    textStyle: {
      color: '#11191e',
      fontSize: useUtils.isMobileDevice() ? 16 : 22
    },
    subtextStyle: {
      color: '#0099FF',
      fontSize: 18
    },
    padding: 0,
    ...request
  };
  const grid = {
    top: request.subtext ? '70' : '50',
    left: '3%',
    right: '3%',
    bottom: hasDataZoom ? '50' : '5%',
    containLabel: true
  };

  return {
    title,
    grid
  };
};

export const formatFoldingLineCartOptions = (request: FoldingLineRequestType) => {
  const { color, series, dataZoom } = seriesConfig(request.series);
  const { title, grid } = headerConfig(request.title, color, dataZoom.length > 0);
  series.forEach((item) => { 
    if(item.data.length === 1) {
      item.showSymbol = series[0]?.data?.length === 1
    }
  });
  const config = {
    title,
    grid,
    dataZoom,
    tooltip: tooltipConfig(request.xAxis.unit || request.yAxis.unit, series, request.showAlarm ?? true),
    xAxis: xAxisConfig(request),
    yAxis: yAxisConfig(request.yAxis),
    series,
    color
  };
  return config;
};
