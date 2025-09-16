export const performanceConfig = {
  // 标签页配置
  tabs: [
    { label: 'Current Task', value: 0 },
    { label: 'All Instance(142)', value: 1 }
  ],

  // 指标卡片配置
  metrics: [
    {
      title: 'Duration',
      value: '2h 44m',
      description: '16min Faster Than Average'
    },
    {
      title: 'Labor Cost',
      value: '$ 82.50',
      description: '$12.30 Less Than Average'
    },
    {
      title: 'Material Cost',
      value: '$ 45.00',
      description: '$5.00 More Premium Filters'
    }
  ],
  metric: {
    before: '950',
    after: '640',
    label: 'CO₂ Level (ppm)',
    percentage: '33%'
  },
  // 表格配置
  tableColumns: [
    {
      prop: 'completion',
      label: 'Completion Date',
      minWidth: '18%'
    },
    {
      prop: 'assignee',
      label: 'Assignee',
      minWidth: '15%',
      slot: true
    },
    {
      prop: 'duration',
      label: 'Duration',
      minWidth: '12%'
    },
    {
      prop: 'quality',
      label: 'Quality Score',
      minWidth: '20%',
      slot: true
    },
    {
      prop: 'efficiency',
      label: 'Efficiency Score',
      minWidth: '15%',
      slot: true
    }
  ],

  // 筛选器配置
  filters: {
    co2Level: {
      placeholder: 'CO2 Level (ppm)',
      options: [{ label: 'CO2 Level (ppm)', value: 'co2' }]
    },
    effectiveness: {
      placeholder: 'Effectiveness',
      options: [{ label: 'Effectiveness', value: 'effectiveness' }]
    }
  },

  // 材料配置
  materials: {
    select: {
      placeholder: 'Material Name',
      options: [{ label: 'Material Name', value: 'material' }]
    },
    quantity: {
      placeholder: '100'
    }
  },

  // 样式配置
  styles: {
    dialog: {
      width: '680px'
    },
    metrics: {
      card: {
        padding: '16px 24px',
        borderRadius: '8px'
      }
    },
    effectiveness: {
      high: {
        class: 'clean-critical'
      },
      medium: {
        class: 'clean-warning'
      },
      low: {
        class: 'clean-normal'
      }
    }
  }
};

// 工具函数
export const convertDataToSVGPath = (arr, width = 100, height = 30) => {
  if (!arr || arr.length === 0) return '';
  const n = arr.length;
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  // 归一化到SVG高度（反向，因为SVG y轴向下）
  const norm = arr.map((v) => height - ((v - min) / (max - min || 1)) * height);
  const step = width / (n - 1);

  let d = `M0,${norm[0]}`;
  for (let i = 1; i < n; i++) {
    // 贝塞尔平滑
    const x1 = (i - 1) * step;
    const y1 = norm[i - 1];
    const x2 = i * step;
    const y2 = norm[i];
    const cx = x1 + step / 2;
    d += ` Q${cx},${y1} ${x2},${y2}`;
  }
  return d;
};

// 模拟数据生成函数
export const generateMockTableData = () => [
  {
    completion: 'May 12, 2023',
    assignee: { name: 'John Doe', role: '@janitor' },
    duration: '2h 44m',
    airQuality: {
      trendData: [20, 8, 12, 40, 35, 28, 25, 38, 36, 28],
      trend: [20, 8, 12, 40, 35, 28, 25, 38, 36, 28],
      percentage: 85
    },
    co2Level: {
      trend: 'M0,20 C30,10 50,25 70,5 C85,15 100,10',
      trendData: [15, 18, 12, 20, 17, 22, 19, 21, 20, 18]
    },
    effectiveness: 'High'
  },
  {
    completion: 'April 12, 2023',
    assignee: { name: 'Jane Smith', role: '' },
    duration: '3h 10m',
    airQuality: {
      trendData: [20, 8, 12, 40, 35, 28, 25, 38, 36, 28],
      trend: 'M0,15 C20,20 40,10 60,15 C80,5 100,15',
      percentage: 68
    },
    co2Level: {
      trend: 'M0,15 C30,20 50,10 70,15 C85,5 100,15',
      trendData: [15, 18, 12, 20, 17, 22, 19, 21, 20, 18]
    },
    effectiveness: 'Medium'
  },
  {
    completion: 'March 15, 2023',
    assignee: { name: 'John Doe', role: '@janitor' },
    duration: '2h 50m',
    airQuality: {
      trendData: [20, 8, 12, 40, 35, 28, 25, 38, 36, 28],
      trend: 'M0,20 C20,25 40,15 60,20 C80,25 100,15',
      percentage: 62
    },
    co2Level: {
      trend: 'M0,20 C30,25 50,15 70,20 C85,25 100,15',
      trendData: [15, 18, 12, 20, 17, 22, 19, 21, 20, 18]
    },
    effectiveness: 'Low'
  }
];
