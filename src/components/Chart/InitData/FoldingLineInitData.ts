export default {
  title: {
    text: 'Temperature Change in the Coming Week',
    subtext: '75%'
  },
  xAxis: {
    data: ['12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40', '12:45', '12:50', '12:55', '13:00']
  },
  yAxis: {
    unit: '%'
  },
  showAlarm: false,
  series: [
    {
      color: '#0099FF',
      name: 'Actual',
      markPoint: [
        { xAxis: '12:10', yAxis: 32 },
        { xAxis: '12:40', yAxis: 55 }
      ],
      isAreaStyle: true,
      data: [25, 32, 17, 23, 40, 60, 75, 55, 28, 24, 45, 47]
    },
    {
      color: '#944DFF',
      lineStyle: 'dotted',
      name: 'Forecast',
      isAreaStyle: false,
      data: [35, 22, 27, 33, 50, 50, 85, 65, 38, 34, 55, 57]
    }
  ]
};
