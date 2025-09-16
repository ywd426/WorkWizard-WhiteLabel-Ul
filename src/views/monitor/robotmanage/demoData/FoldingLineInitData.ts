export default [
  {
    title: {
      text: 'Percentage of actual cleaned over planned area',
      subtext: 'Max 96.7%, Min 92.5%, Avg 94.6%'
    },
    xAxis: {
      data: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
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
        data: [92.5, 92.6, 93.5, 94.1, 94.6, 94.6, 95, 96.7, 94.4, 96, 96.4, 96.5]
      }
    ]
  },
  {
    title: {
      text: 'Actual Cleaned Area',
      subtext: 'Total 2010m²'
    },
    xAxis: {
      data: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    yAxis: {
      unit: 'm²'
    },
    showAlarm: false,
    series: [
      {
        color: '#0099FF',
        name: 'Actual',
        isAreaStyle: true,
        data: [170, 188, 201, 130, 244, 209, 149, 199, 203, 195, 211, 202]
      }
    ]
  },
  {
    title: {
      text: 'Cleaning Task Duration',
      subtext: 'Max 60min, Min 15min, Avg 41min'
    },
    xAxis: {
      data: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    yAxis: {
      unit: 'min'
    },
    showAlarm: false,
    series: [
      {
        color: '#0099FF',
        name: 'Actual',
        isAreaStyle: true,
        data: [45, 15, 35, 28, 19, 40, 24, 60, 17, 55, 47, 23]
      }
    ]
  },
  {
    title: {
      text: 'Cleaning Task Count',
      subtext: 'Max 6, Min 0, Avg 3'
    },
    xAxis: {
      data: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    yAxis: {
      unit: ''
    },
    showAlarm: false,
    series: [
      {
        color: '#0099FF',
        name: 'Actual',
        isAreaStyle: true,
        data: [1, 6, 6, 5, 2, 3, 3, 2, 1, 0, 4, 4]
      }
    ]
  }
];
