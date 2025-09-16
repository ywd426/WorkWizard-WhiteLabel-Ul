// 辅助函数：将日期字符串转换为 Date 对象
const parseDate = (dateStr) => {
  const [datePart, timePart] = dateStr.split(' ');
  const [year, month, day] = datePart.split('-').map((num) => parseInt(num, 10));

  if (!timePart) return new Date(year, month - 1, day);

  const [hour, minute, second] = timePart.split(':').map((num) => parseInt(num, 10));
  return new Date(year, month - 1, day, hour, minute, second);
};

// 跨平台安全的日期时间格式化函数
const formatDateTimeSafe = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 跨平台安全的日期格式化函数
const formatDateSafe = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 1. 获取从00:00到24:00，半小时为单位的时间节点
const getHalfHourTimeNodesOfDay = (dateStr) => {
  const startOfDay = new Date(dateStr.split(' ')[0] + ' 00:00:00');
  const timeNodes = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeNode = new Date(startOfDay);
      timeNode.setHours(hour, minute, 0, 0);
      timeNodes.push(formatDateTimeSafe(timeNode));
    }
  }
  return timeNodes;
};

// 2. 根据起始时间和截止时间，获取所有的半小时时间节点
const getTimeNodesBetween = (startDateStr, endDateStr) => {
  const startDate = parseDate(startDateStr);
  const timeNodes = [];
  let current = new Date(startDate);

  // 循环获取时间节点
  while (current <= parseDate(endDateStr)) {
    timeNodes.push(formatDateTimeSafe(current));
    current.setMinutes(current.getMinutes() + 30); // 增加半小时
  }

  return timeNodes;
};

// 3. 如果不是整点或半点，取就近时间节点
const roundToNearestHalfHour = (dateStr) => {
  const date = parseDate(dateStr);
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 30) * 30; // 四舍五入到最接近的半小时
  date.setMinutes(roundedMinutes, 0, 0);
  return formatDateTimeSafe(date);
};

// 4. 获取指定日期范围内的所有日期（以天为单位）
const getAllDatesBetween = (startDateStr, endDateStr) => {
  const startDate = parseDate(startDateStr);
  const dates = [];

  let current = new Date(startDate); // 保证从起始日期开始
  while (current <= parseDate(endDateStr)) {
    dates.push(formatDateSafe(current));
    current.setDate(current.getDate() + 1); // 增加一天
  }

  return dates;
};

// 5. 根据起始时间和截止时间，获取所有日期的时间节点（00:00 和 12:00）
const getAllDateTimeNodesBetween = (startDateStr, endDateStr) => {
  const allDates = getAllDatesBetween(startDateStr, endDateStr);
  const timeNodes = [];

  allDates.forEach((date) => {
    timeNodes.push(date + ' 00:00:00');
    timeNodes.push(date + ' 12:00:00');
  });

  return timeNodes;
};

// 6. 如果起始和截止时间不是整天，取就近的时间节点
const roundDatesToNearestWholeDay = (startDateStr, endDateStr) => {
  const roundedStart = roundToNearestHalfHour(startDateStr);
  const roundedEnd = roundToNearestHalfHour(endDateStr);
  return { roundedStart, roundedEnd };
};

// 判断两个日期是否是同一天
const isSameDay = (dateStr1, dateStr2) => {
  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);
  return formatDateSafe(date1) === formatDateSafe(date2); // 比较年月日
};

const getHourlyTimeNodesOfDay = (dateStr, onlyDay = false) => {
  const result = [];
  const date = new Date(dateStr + 'T00:00:00');

  for (let i = 0; i < 24; i++) {
    const time = new Date(date);

    time.setHours(i);
    const pad = (n) => (n < 10 ? '0' + n : n);
    const padding = onlyDay ? '' : `${formatDate(time)} `;
    result.push(`${padding}${pad(time.getHours())}:${pad(time.getMinutes())}`);

    const timehalf = new Date(date);
    timehalf.setHours(i);
    timehalf.setMinutes(30);
    const halfPadding = onlyDay ? '' : `${formatDate(timehalf)} `;
    result.push(`${halfPadding}${pad(timehalf.getHours())}:${pad(timehalf.getMinutes())}`);
  }
  return result;
};

const getTimeNodesBasedOnRange = (startDateStr, endDateStr, unitTime) => {
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);

  // 如果日期相同，返回当天的小时节点
  if (isSameDay(startDateStr, endDateStr)) {
    return {
      type: 'sameDay',
      dateRange: formatUSDate(startDateStr.split(' ')[0]), // 返回年月日部分
      timeNodes: getHourlyTimeNodesOfDay(startDateStr),
      timeHeaders: getHourlyTimeNodesOfDay(startDateStr, true)
    };
  }

  // 如果日期不同且间隔大于七天，返回时间跨度和所有日期
  const diffInTime = endDate - startDate; // 时间差，单位是毫秒
  const diffInDays = diffInTime / (1000 * 3600 * 24); // 转换为天数
  if (unitTime == 'day') {
    // 日期范围小于等于 7 天
    const allDates = getAllDatesBetween(startDateStr, endDateStr); // 获取范围内的所有日期
    const timeNodesPerDay = allDates.map((date) => ({
      date, // 日期
      timeNodes: getHourlyTimeNodesOfDay(date), // 每天的小时和半小时节点
      timeHeaders: getHourlyTimeNodesOfDay(startDateStr, true)
    }));
    const timeNodes = timeNodesPerDay.flatMap((day) => day.timeNodes);

    return {
      type: 'multipleDays',
      dateRange: allDates.map((d) => formatUSDate(d)), // 返回日期数组形式
      timeNodes: timeNodes, // 每天的时间节点
      timeHeaders: timeNodesPerDay.flatMap((day) => day.timeHeaders)
    };
  }

  if (diffInDays > 7) {
    const allDates = getAllDatesBetween(startDateStr, endDateStr);
    return {
      type: 'date',
      dateRange: `${formatUSDate(startDateStr.split(' ')[0])} - ${formatUSDate(endDateStr.split(' ')[0])}`,
      timeNodes: allDates
    };
  }

  // 如果日期不同且间隔小于等于7天，可以根据需要进行其他处理
  return {
    type: 'shortSpan',
    message: 'The date range is within 7 days but not the same day.'
  };
};

function formatUSDate(dateString) {
  const date = new Date(dateString);

  // 验证日期有效性
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return dateString; // 返回原始字符串作为fallback
  }

  // 获取月份、日期和年份
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  // 处理日期后缀的更健壮方法
  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const suffix = getDaySuffix(day);

  // 格式化日期字符串
  return `${month} ${day}${suffix} ${year}`;
}

const getTimeNodes = (startDate, endDate, unitTime, interval = 30) => {
  const result = [];

  // 将日期字符串转换为 Date 对象
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 检查日期是否为同一天
  if ((start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate()) || unitTime == 'day') {
    const current = new Date(start);

    // 按照 interval（分钟）生成时间节点
    while (current <= end) {
      const formatted = formatDateTime(current);
      result.push(formatted);

      // 时间步进 interval 分钟
      current.setMinutes(current.getMinutes() + interval);
    }
  } else {
    // 获取所有包含的日期
    const current = new Date(start);

    while (current <= end) {
      const formatted = formatDate(current);
      result.push(formatted);

      // 日期步进一天
      current.setDate(current.getDate() + 1);
    }
  }

  return result;
};

// 格式化时间为 HH:MM
const formatDateTime = (date) => {
  const pad = (n) => (n < 10 ? '0' + n : n);
  // ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// 格式化日期为 YY-MM-DD
function formatDate(date) {
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const fetchToday = () => {
  const now = new Date();
  const currentYear = String(now.getFullYear()).padStart(4, '0');
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  return `${currentYear}-${currentMonth}-${currentDay}`;
};

const getDateOnly = (dateStr) => dateStr.split(' ')[0];

function roundDownToNearestHalfHour(timeString) {
  const date = new Date(timeString);

  // 获取小时和分钟
  const minutes = date.getMinutes();

  // 向下取整到整点或半点
  if (minutes < 30) {
    date.setMinutes(0); // 整点
  } else {
    date.setMinutes(30); // 半点
  }

  date.setSeconds(0);

  // 格式化时间为 "YYYY-MM-DD HH:mm:ss"
  return formatDateTimeSafe(date);
}

export {
  getTimeNodesBasedOnRange,
  getHalfHourTimeNodesOfDay,
  getTimeNodesBetween,
  roundToNearestHalfHour,
  getAllDatesBetween,
  getAllDateTimeNodesBetween,
  roundDatesToNearestWholeDay,
  getTimeNodes,
  getDateOnly,
  fetchToday,
  formatDate,
  roundDownToNearestHalfHour,
  formatDateTimeSafe,
  formatDateSafe
};
