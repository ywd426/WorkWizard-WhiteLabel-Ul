export default [
  {
    title: {
      text: 'Power Consumption',
      subtext: 'Max 2.75kWh, Min 0.71kWh, Avg 1.53kWh'
    },
    xAxis: {
      data: [
        '2024-10-01',
        '2024-10-02',
        '2024-10-03',
        '2024-10-04',
        '2024-10-05',
        '2024-10-06',
        '2024-10-07',
        '2024-10-08',
        '2024-10-09',
        '2024-10-10',
        '2024-10-11',
        '2024-10-12'
      ]
    },
    yAxis: {
      unit: 'kWh'
    },
    showAlarm: false,
    series: [
      {
        color: '#0099FF',
        name: 'Actual',
        isAreaStyle: true,
        data: [1.2, 2.75, 1.3, 1.8, 1.65, 1.74, 1.9, 1.4, 2.63, 2.5, 0.71, 1.8]
      }
    ]
  },
  {
    title: {
      text: 'Hours Saved',
      subtext: 'Max 4h, Min 0.5h, Avg 3h'
    },
    xAxis: {
      data: [
        '2024-10-01',
        '2024-10-02',
        '2024-10-03',
        '2024-10-04',
        '2024-10-05',
        '2024-10-06',
        '2024-10-07',
        '2024-10-08',
        '2024-10-09',
        '2024-10-10',
        '2024-10-11',
        '2024-10-12'
      ]
    },
    yAxis: {
      unit: 'h'
    },
    showAlarm: false,
    series: [
      {
        color: '#0099FF',
        name: 'Actual',
        isAreaStyle: true,
        data: [3, 4, 2, 1.5, 3, 2, 4, 3, 2, 1, 0.5, 2]
      }
    ]
  },
  {
    title: {
      text: 'Total Cost',
      subtext: 'Max $201, Min $103, Avg $144'
    },
    xAxis: {
      data: [
        '2024-10-01',
        '2024-10-02',
        '2024-10-03',
        '2024-10-04',
        '2024-10-05',
        '2024-10-06',
        '2024-10-07',
        '2024-10-08',
        '2024-10-09',
        '2024-10-10',
        '2024-10-11',
        '2024-10-12'
      ]
    },
    yAxis: {
      unit: 'USD'
    },
    showAlarm: false,
    series: [
      {
        color: '#0099FF',
        name: 'Actual',
        isAreaStyle: true,
        data: [144, 201, 135, 180, 165, 174, 190, 140, 263, 250, 103, 180]
      }
    ]
  },
  {
    title: {
      text: 'ROI',
      subtext: 'Max 91.6%, Min 85.0%, Avg 90.3%'
    },
    xAxis: {
      data: [
        '2024-10-01',
        '2024-10-02',
        '2024-10-03',
        '2024-10-04',
        '2024-10-05',
        '2024-10-06',
        '2024-10-07',
        '2024-10-08',
        '2024-10-09',
        '2024-10-10',
        '2024-10-11',
        '2024-10-12'
      ]
    },
    yAxis: {
      unit: '%'
    },
    showAlarm: false,
    series: [
      {
        color: '#0099FF',
        name: 'Actual',
        isAreaStyle: true,
        data: [90.3, 91.6, 85.0, 90.1, 90.5, 90.2, 90.8, 90.3, 90.5, 90.4, 90.2, 90.1]
      }
    ]
  }
];
