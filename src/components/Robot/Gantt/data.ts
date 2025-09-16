/**
 * alike: 全部一样
 */
export default {
  data3: [
    {
      'name': 'Robot Movement',
      'type': 'normal',
      'schedule': [
        {
          'id': 1111,
          'name': 'Move forward 5 meters',
          'desc': 'Move precisely to the specified position',
          'backgroundColor': 'rgba(255, 56, 76, 1)',
          'textColor': '#fff',
          'days': ['2022-01-30', '2022-02-05'],
          'type': 'process'
        },
        {
          'id': 1112,
          'name': 'Move backward 3 meters',
          'desc': 'Move backward by the set distance',
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-06', '2022-02-07', '2022-02-08', '2022-02-09'],
          'type': 'pause'
        },
        {
          'id': 1113,
          'name': 'Rotate 90 degrees',
          'desc': 'Rotate 90 degrees clockwise',
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-18', '2022-02-19', '2022-02-20', '2022-02-21', '2022-02-22', '2022-02-23', '2022-02-24'],
          'type': 'crash'
        }
      ]
    },
    {
      'name': 'Robot Task Execution',
      'type': 'normal',
      'schedule': [
        {
          'id': 2221,
          'name': 'Grab Items',
          'desc': 'Use the robotic arm to grab the target item',
          'backgroundColor': 'rgba(237, 182, 1, 0.3)',
          'textColor': '#fff',
          'days': ['2022-01-28', '2022-01-29', '2022-01-30', '2022-01-31', '2022-02-01'],
          'type': 'charging'
        },
        {
          'id': 2222,
          'name': 'Place Items',
          'desc': 'Place items at the specified location',
          'backgroundColor': '#3A3D91',
          'textColor': '#fff',
          'days': ['2022-01-30', '2022-01-31', '2022-02-01', '2022-02-02', '202-02-03', '2022-02-04', '2022-02-05'],
          'type': 'begin'
        },
        {
          'id': 2223,
          'name': 'Environment Detection',
          'desc': 'Use sensors to detect the surrounding environment',
          'backgroundColor': 'rgba(207, 236, 255, 1)',
          'textColor': '#fff',
          'days': ['2022-02-10', '2022-02-16'],
          'type': 'process'
        }
      ]
    },
    {
      'name': 'Robot Maintenance',
      'type': 'normal',
      'schedule': [
        {
          'id': 2221,
          'name': 'Check Battery',
          'desc': 'Check the battery level',
          'backgroundColor': 'rgba(0, 153, 255, 1)',
          'textColor': '#fff',
          'days': ['2022-04-28', '2022-05-01'],
          'type': 'pause'
        },
        {
          'id': 2222,
          'name': 'Replace Parts',
          'desc': 'Replace worn parts',
          'backgroundColor': 'rgba(255, 56, 76, 1)',
          'textColor': '#fff',
          'days': ['2022-03-20', '2022-04-05'],
          'type': 'crash'
        },
        {
          'id': 2223,
          'name': 'System Update',
          'desc': "Update the robot's operating system",
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-26', '2022-03-11'],
          'type': 'charging'
        }
      ]
    },
    {
      'name': 'Robot Troubleshooting',
      'type': 'normal',
      'schedule': [
        {
          'id': 2221,
          'name': 'Check Circuit',
          'desc': 'Check if the circuit connection is normal',
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-12', '2022-02-21'],
          'type': 'begin'
        },
        {
          'id': 2222,
          'name': 'Repair Sensor',
          'desc': 'Repair damaged sensors',
          'backgroundColor': '#3A3D91',
          'textColor': '#fff',
          'days': ['2022-02-23', '2022-03-05'],
          'type': 'process'
        },
        {
          'id': 2223,
          'name': 'Calibrate Accuracy',
          'desc': "Calibrate the robot's motion accuracy",
          'backgroundColor': 'rgba(207, 236, 255, 1)',
          'textColor': '#fff',
          'days': ['2022-02-16', '2022-02-19'],
          'type': 'pause'
        }
      ]
    },
    {
      'name': 'Robot Sleep',
      'type': 'normal',
      'schedule': []
    },
    {
      'name': 'Robot Charging',
      'type': 'normal',
      'schedule': [
        {
          'id': 2223233,
          'name': 'Start Charging',
          'desc': 'Connect the charger to start charging',
          'backgroundColor': 'rgba(0, 153, 255, 1)',
          'textColor': '#fff',
          'days': ['2022-01-15', '2022-03-02'],
          'type': 'crash'
        }
      ]
    },
    {
      'name': 'Robot Communication',
      'type': 'normal',
      'schedule': [
        {
          'id': 2223233,
          'name': 'Send Data',
          'desc': 'Send data to the server',
          'backgroundColor': 'rgba(255, 56, 76, 1)',
          'textColor': '#fff',
          'days': ['2022-02-15', '2022-03-02'],
          'type': 'charging'
        }
      ]
    },
    {
      'name': 'Robot Warning',
      'type': 'normal',
      'schedule': [
        {
          'id': 2223233,
          'name': 'Issue an Alarm',
          'desc': 'Issue an alarm in case of danger',
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-05', '2022-02-13'],
          'type': 'begin'
        }
      ]
    },
    {
      'name': 'Robot Startup',
      'color': 'rgba(0, 153, 255, 1)',
      'type': 'alike'
    },
    {
      'name': 'Robot Movement',
      'type': 'normal',
      'schedule': [
        {
          'id': 1111,
          'name': 'Move forward 5 meters',
          'desc': 'Move precisely to the specified position',
          'backgroundColor': 'rgba(255, 56, 76, 1)',
          'textColor': '#fff',
          'days': ['2022-01-30', '2022-02-07'],
          'type': 'pause'
        },
        {
          'id': 1112,
          'name': 'Move backward 3 meters',
          'desc': 'Move backward by the set distance',
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-06', '2022-02-07', '2022-02-08', '2022-02-09'],
          'type': 'crash'
        },
        {
          'id': 1113,
          'name': 'Rotate 90 degrees',
          'desc': 'Rotate 90 degrees clockwise',
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-18', '2022-02-19', '2022-02-20', '2022-02-21', '2022-02-22', '2022-02-23', '2022-02-24'],
          'type': 'charging'
        }
      ]
    },
    {
      'name': 'Robot Task Execution',
      'type': 'normal',
      'schedule': [
        {
          'id': 2221,
          'name': 'Grab Items',
          'desc': 'Use the robotic arm to grab the target item',
          'backgroundColor': 'rgba(237, 182, 1, 0.3)',
          'textColor': '#fff',
          'days': ['2022-01-28', '2022-01-29', '2022-01-30', '2022-01-31', '2022-02-01'],
          'type': 'begin'
        },
        {
          'id': 2222,
          'name': 'Place Items',
          'desc': 'Place items at the specified location',
          'backgroundColor': '#3A3D91',
          'textColor': '#fff',
          'days': ['2022-01-30', '2022-01-31', '2022-02-01', '2022-02-02', '202-02-03', '2022-02-04', '2022-02-05'],
          'type': 'process'
        },
        {
          'id': 2223,
          'name': 'Environment Detection',
          'desc': 'Use sensors to detect the surrounding environment',
          'backgroundColor': 'rgba(207, 236, 255, 1)',
          'textColor': '#fff',
          'days': ['2022-02-10', '2022-02-16'],
          'type': 'pause'
        }
      ]
    },
    {
      'name': 'Robot Maintenance',
      'type': 'normal',
      'schedule': [
        {
          'id': 2221,
          'name': 'Check Battery',
          'desc': 'Check the battery level',
          'backgroundColor': 'rgba(0, 153, 255, 1)',
          'textColor': '#fff',
          'days': ['2022-04-28', '2022-05-01'],
          'type': 'crash'
        },
        {
          'id': 2222,
          'name': 'Replace Parts',
          'desc': 'Replace worn parts',
          'backgroundColor': 'rgba(255, 56, 76, 1)',
          'textColor': '#fff',
          'days': ['2022-03-20', '2022-04-05'],
          'type': 'charging'
        },
        {
          'id': 2223,
          'name': 'System Update',
          'desc': "Update the robot's operating system",
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-26', '2022-03-11'],
          'type': 'begin'
        }
      ]
    },
    {
      'name': 'Robot Troubleshooting',
      'type': 'normal',
      'schedule': [
        {
          'id': 2221,
          'name': 'Check Circuit',
          'desc': 'Check if the circuit connection is normal',
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-12', '2022-02-21'],
          'type': 'process'
        },
        {
          'id': 2222,
          'name': 'Repair Sensor',
          'desc': 'Repair damaged sensors',
          'backgroundColor': '#3A3D91',
          'textColor': '#fff',
          'days': ['2022-02-23', '2022-03-05'],
          'type': 'pause'
        },
        {
          'id': 2223,
          'name': 'Calibrate Accuracy',
          'desc': "Calibrate the robot's motion accuracy",
          'backgroundColor': 'rgba(207, 236, 255, 1)',
          'textColor': '#fff',
          'days': ['2022-02-16', '2022-02-19'],
          'type': 'crash'
        }
      ]
    },
    {
      'name': 'Robot Sleep',
      'type': 'normal',
      'schedule': []
    },
    {
      'name': 'Robot Charging',
      'type': 'normal',
      'schedule': [
        {
          'id': 2223233,
          'name': 'Start Charging',
          'desc': 'Connect the charger to start charging',
          'backgroundColor': 'rgba(0, 153, 255, 1)',
          'textColor': '#fff',
          'days': ['2022-01-15', '2022-03-02'],
          'type': 'charging'
        }
      ]
    },
    {
      'name': 'Robot Communication',
      'type': 'normal',
      'schedule': [
        {
          'id': 2223233,
          'name': 'Send Data',
          'desc': 'Send data to the server',
          'backgroundColor': 'rgba(255, 56, 76, 1)',
          'textColor': '#fff',
          'days': ['2022-02-15', '2022-03-02'],
          'type': 'begin'
        }
      ]
    },
    {
      'name': 'Robot Warning',
      'type': 'normal',
      'schedule': [
        {
          'id': 2223233,
          'name': 'Issue an Alarm',
          'desc': 'Issue an alarm in case of danger',
          'backgroundColor': 'rgba(255, 56, 76, 0.3)',
          'textColor': '#fff',
          'days': ['2022-02-05', '2022-02-13'],
          'type': 'pause'
        }
      ]
    }
  ],
  data4: [
    {
      name: 'Robot Movement',
      type: 'normal',
      schedule: [
        {
          id: 1111,
          name: 'Move forward 5 meters',
          desc: 'Move precisely to the specified position',
          backgroundColor: 'rgba(255, 56, 76, 1)',
          textColor: '#fff',
          days: ['2022-01-30', '2022-02-05']
        },
        {
          id: 1112,
          name: 'Move backward 3 meters',
          desc: 'Move backward by the set distance',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-06', '2022-02-07', '2022-02-08', '2022-02-09']
        },
        {
          id: 1113,
          name: 'Rotate 90 degrees',
          desc: 'Rotate 90 degrees clockwise',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-18', '2022-02-19', '2022-02-20', '2022-02-21', '2022-02-22', '2022-02-23', '2022-02-24']
        }
      ]
    },
    {
      name: 'Robot Task Execution',
      type: 'normal',
      schedule: [
        {
          id: 2221,
          name: 'Grab Items',
          desc: 'Use the robotic arm to grab the target item',
          backgroundColor: 'rgba(237, 182, 1, 0.3)',
          textColor: '#fff',
          days: ['2022-01-28', '2022-01-29', '2022-01-30', '2022-01-31', '2022-02-01']
        },
        {
          id: 2222,
          name: 'Place Items',
          desc: 'Place items at the specified location',
          backgroundColor: '#3A3D91',
          textColor: '#fff',
          days: ['2022-01-30', '2022-01-31', '2022-02-01', '2022-02-02', '202-02-03', '2022-02-04', '2022-02-05']
        },
        {
          id: 2223,
          name: 'Environment Detection',
          desc: 'Use sensors to detect the surrounding environment',
          backgroundColor: 'rgba(207, 236, 255, 1)',
          textColor: '#fff',
          days: ['2022-02-10', '2022-02-16']
        }
      ]
    },
    {
      name: 'Robot Maintenance',
      type: 'normal',
      schedule: [
        {
          id: 2221,
          name: 'Check Battery',
          desc: 'Check the battery level',
          backgroundColor: 'rgba(0, 153, 255, 1)',
          textColor: '#fff',
          days: ['2022-04-28', '2022-05-01']
        },
        {
          id: 2222,
          name: 'Replace Parts',
          desc: 'Replace worn parts',
          backgroundColor: 'rgba(255, 56, 76, 1)',
          textColor: '#fff',
          days: ['2022-03-20', '2022-04-05']
        },
        {
          id: 2223,
          name: 'System Update',
          desc: "Update the robot's operating system",
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-26', '2022-03-11']
        }
      ]
    },
    {
      name: 'Robot Troubleshooting',
      type: 'normal',
      schedule: [
        {
          id: 2221,
          name: 'Check Circuit',
          desc: 'Check if the circuit connection is normal',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-12', '2022-02-21']
        },
        {
          id: 2222,
          name: 'Repair Sensor',
          desc: 'Repair damaged sensors',
          backgroundColor: '#3A3D91',
          textColor: '#fff',
          days: ['2022-02-23', '2022-03-05']
        },
        {
          id: 2223,
          name: 'Calibrate Accuracy',
          desc: "Calibrate the robot's motion accuracy",
          backgroundColor: 'rgba(207, 236, 255, 1)',
          textColor: '#fff',
          days: ['2022-02-16', '2022-02-19']
        }
      ]
    },
    {
      name: 'Robot Sleep',
      type: 'normal',
      schedule: []
    },
    {
      name: 'Robot Charging',
      type: 'normal',
      schedule: [
        {
          id: 2223233,
          name: 'Start Charging',
          desc: 'Connect the charger to start charging',
          backgroundColor: 'rgba(0, 153, 255, 1)',
          textColor: '#fff',
          days: ['2022-01-15', '2022-03-02']
        }
      ]
    },
    {
      name: 'Robot Communication',
      type: 'normal',
      schedule: [
        {
          id: 2223233,
          name: 'Send Data',
          desc: 'Send data to the server',
          backgroundColor: 'rgba(255, 56, 76, 1)',
          textColor: '#fff',
          days: ['2022-02-15', '2022-03-02']
        }
      ]
    },
    {
      name: 'Robot Warning',
      type: 'normal',
      schedule: [
        {
          id: 2223233,
          name: 'Issue an Alarm',
          desc: 'Issue an alarm in case of danger',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-05', '2022-02-13']
        }
      ]
    },
    {
      name: 'Robot Startup',
      color: 'rgba(0, 153, 255, 1)',
      type: 'alike'
    },
    {
      name: 'Robot Movement',
      type: 'normal',
      schedule: [
        {
          id: 1111,
          name: 'Move forward 5 meters',
          desc: 'Move precisely to the specified position',
          backgroundColor: 'rgba(255, 56, 76, 1)',
          textColor: '#fff',
          days: ['2022-01-30', '2022-02-07']
        },
        {
          id: 1112,
          name: 'Move backward 3 meters',
          desc: 'Move backward by the set distance',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-06', '2022-02-07', '2022-02-08', '2022-02-09']
        },
        {
          id: 1113,
          name: 'Rotate 90 degrees',
          desc: 'Rotate 90 degrees clockwise',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-18', '2022-02-19', '2022-02-20', '2022-02-21', '2022-02-22', '2022-02-23', '2022-02-24']
        }
      ]
    },
    {
      name: 'Robot Task Execution',
      type: 'normal',
      schedule: [
        {
          id: 2221,
          name: 'Grab Items',
          desc: 'Use the robotic arm to grab the target item',
          backgroundColor: 'rgba(237, 182, 1, 0.3)',
          textColor: '#fff',
          days: ['2022-01-28', '2022-01-29', '2022-01-30', '2022-01-31', '2022-02-01']
        },
        {
          id: 2222,
          name: 'Place Items',
          desc: 'Place items at the specified location',
          backgroundColor: '#3A3D91',
          textColor: '#fff',
          days: ['2022-01-30', '2022-01-31', '2022-02-01', '2022-02-02', '202-02-03', '2022-02-04', '2022-02-05']
        },
        {
          id: 2223,
          name: 'Environment Detection',
          desc: 'Use sensors to detect the surrounding environment',
          backgroundColor: 'rgba(207, 236, 255, 1)',
          textColor: '#fff',
          days: ['2022-02-10', '2022-02-16']
        }
      ]
    },
    {
      name: 'Robot Maintenance',
      type: 'normal',
      schedule: [
        {
          id: 2221,
          name: 'Check Battery',
          desc: 'Check the battery level',
          backgroundColor: 'rgba(0, 153, 255, 1)',
          textColor: '#fff',
          days: ['2022-04-28', '2022-05-01']
        },
        {
          id: 2222,
          name: 'Replace Parts',
          desc: 'Replace worn parts',
          backgroundColor: 'rgba(255, 56, 76, 1)',
          textColor: '#fff',
          days: ['2022-03-20', '2022-04-05']
        },
        {
          id: 2223,
          name: 'System Update',
          desc: "Update the robot's operating system",
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-26', '2022-03-11']
        }
      ]
    },
    {
      name: 'Robot Troubleshooting',
      type: 'normal',
      schedule: [
        {
          id: 2221,
          name: 'Check Circuit',
          desc: 'Check if the circuit connection is normal',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-12', '2022-02-21']
        },
        {
          id: 2222,
          name: 'Repair Sensor',
          desc: 'Repair damaged sensors',
          backgroundColor: '#3A3D91',
          textColor: '#fff',
          days: ['2022-02-23', '2022-03-05']
        },
        {
          id: 2223,
          name: 'Calibrate Accuracy',
          desc: "Calibrate the robot's motion accuracy",
          backgroundColor: 'rgba(207, 236, 255, 1)',
          textColor: '#fff',
          days: ['2022-02-16', '2022-02-19']
        }
      ]
    },
    {
      name: 'Robot Sleep',
      type: 'normal',
      schedule: []
    },
    {
      name: 'Robot Charging',
      type: 'normal',
      schedule: [
        {
          id: 2223233,
          name: 'Start Charging',
          desc: 'Connect the charger to start charging',
          backgroundColor: 'rgba(0, 153, 255, 1)',
          textColor: '#fff',
          days: ['2022-01-15', '2022-03-02']
        }
      ]
    },
    {
      name: 'Robot Communication',
      type: 'normal',
      schedule: [
        {
          id: 2223233,
          name: 'Send Data',
          desc: 'Send data to the server',
          backgroundColor: 'rgba(255, 56, 76, 1)',
          textColor: '#fff',
          days: ['2022-02-15', '2022-03-02']
        }
      ]
    },
    {
      name: 'Robot Warning',
      type: 'normal',
      schedule: [
        {
          id: 2223233,
          name: 'Issue an Alarm',
          desc: 'Issue an alarm in case of danger',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-02-05', '2022-02-13']
        }
      ]
    }
  ],
  data5: [
    {
      name: 'Startup',
      color: 'rgba(0, 153, 255, 1)',
      SN: 'SN-555099',
      type: 'alike'
    },
    {
      name: 'Movement',
      type: 'normal',
      SN: 'SN-223780',
      schedule: [
        {
          id: 1111,
          name: 'Move forward 5 meters',
          desc: 'Move precisely to the specified position',
          backgroundColor: 'rgba(255, 56, 76, 1)',
          progress: 45,
          status: 'progress',
          textColor: '#fff',
          days: ['2022-01-30 08:00', '2022-01-30 09:00']
        },
        {
          id: 1112,
          progress: 65,
          status: 'finish',
          name: 'Move backward 3 meters',
          desc: 'Move backward by the set distance',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-01-30 08:00', '2022-01-30 09:30', '2022-01-30 10:00', '2022-01-30 10:30']
        },
        {
          id: 1113,
          progress: 30,
          status: 'pause',
          name: 'Rotate 90 degrees',
          desc: 'Rotate 90 degrees clockwise',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-01-30 08:00', '2022-01-30 18:00']
        }
      ]
    },
    {
      name: 'Execution',
      type: 'normal',
      SN: 'SN-660690',
      schedule: [
        {
          id: 2221,
          name: 'Grab Items',
          progress: 50,
          status: 'fault',
          desc: 'Use the robotic arm to grab the target item',
          backgroundColor: 'rgba(237, 182, 1, 0.3)',
          textColor: '#fff',
          days: ['2022-01-30 10:00', '2022-01-30 18:00']
        },
        {
          id: 2222,
          progress: 80,
          status: 'pause',
          name: 'Place Items',
          desc: 'Place items at the specified location',
          backgroundColor: '#3A3D91',
          textColor: '#fff',
          days: ['2022-01-30 09:00', '2022-01-30 19:00']
        },
        {
          id: 2223,
          progress: 85,
          status: 'progress',
          name: 'Environment Detection',
          desc: 'Use sensors to detect the surrounding environment',
          backgroundColor: 'rgba(207, 236, 255, 1)',
          textColor: '#fff',
          days: ['2022-01-30 00:00', '2022-01-30 08:00']
        }
      ]
    },
    {
      name: 'Cleaning',
      type: 'normal',
      SN: 'SN-664328',
      schedule: [
        {
          id: 2231,
          progress: 60,
          status: 'progress',
          name: 'Clean bedroom',
          desc: 'Use the robotic arm to grab the target item',
          backgroundColor: 'rgba(237, 182, 1, 0.3)',
          textColor: '#fff',
          days: ['2022-01-30 12:00', '2022-01-30 19:00']
        },
        {
          id: 2232,
          progress: 85,
          status: 'finish',
          name: 'Clean kitchen',
          desc: 'Place items at the specified location',
          backgroundColor: '#3A3D91',
          textColor: '#fff',
          days: ['2022-01-30 01:00', '2022-01-30 10:00']
        }
      ]
    },
    {
      name: 'Maintenance',
      type: 'normal',
      SN: 'SN-333999',
      schedule: [
        {
          id: 2221,
          progress: 40,
          status: 'fault',
          name: 'Check Battery',
          desc: 'Check the battery level',
          backgroundColor: 'rgba(0, 153, 255, 1)',
          textColor: '#fff',
          days: ['2022-01-30 08:00', '2022-01-30 08:00']
        },
        {
          id: 2222,
          progress: 60,
          status: 'pause',
          name: 'Replace Parts',
          desc: 'Replace worn parts',
          backgroundColor: 'rgba(255, 56, 76, 1)',
          textColor: '#fff',
          days: ['2022-01-30 11:00', '2022-01-30 17:00']
        },
        {
          id: 2223,
          progress: 70,
          status: 'faut',
          name: 'System Update',
          desc: "Update the robot's operating system",
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-01-30 08:00', '2022-01-30 20:00']
        }
      ]
    },
    {
      name: 'Trouble',
      type: 'normal',
      SN: 'SN-992123',
      schedule: [
        {
          id: 2221,
          progress: 5,
          status: 'progress',
          name: 'Check Circuit',
          desc: 'Check if the circuit connection is normal',
          backgroundColor: 'rgba(255, 56, 76, 0.3)',
          textColor: '#fff',
          days: ['2022-01-30 03:00', '2022-01-30 08:00']
        },
        {
          id: 2222,
          progress: 100,
          status: 'finish',
          name: 'Repair Sensor',
          desc: 'Repair damaged sensors',
          backgroundColor: '#3A3D91',
          textColor: '#fff',
          days: ['2022-01-30 04:00', '2022-01-30 14:00']
        },
        {
          id: 2223,
          progress: 90,
          status: 'faut',
          name: 'Calibrate Accuracy',
          desc: "Calibrate the robot's motion accuracy",
          backgroundColor: 'rgba(207, 236, 255, 1)',
          textColor: '#fff',
          days: ['2022-01-30 06:00', '2022-01-30 08:00']
        }
      ]
    }
  ],
  data6: [
    {
      name: 'Robot Troubleshooting',
      type: 'normal',
      schedule: [
        {
          id: 2222,
          name: 'Repair Sensor',
          desc: 'Repair damaged sensors',
          backgroundColor: '#3A3D91',
          textColor: '#fff',
          days: ['2022-01-30 00:00', '2022-01-31 01:00']
        },
        {
          id: 2223,
          name: 'Calibrate Accuracy',
          desc: "Calibrate the robot's motion accuracy",
          backgroundColor: 'rgba(207, 236, 255, 1)',
          textColor: '#fff',
          days: ['2022-01-31 01:00', '2022-01-31 02:00']
        }
      ]
    }
  ]
};
