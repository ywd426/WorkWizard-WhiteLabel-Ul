import { parseTime } from '@/utils/ruoyi';
import useAppStore from '@/store/modules/app';

/**
 * 表格时间格式化
 */
export const formatDate = (cellValue: string) => {
  if (cellValue == null || cellValue == '') return '';
  const timeZone = useAppStore().currentTimeZone;
  const date = new Date(new Date(cellValue).toLocaleString('en-US', { timeZone }));
  if (isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
};

export const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export const formatTime = (time: string, option: string) => {
  let t: number;
  if (('' + time).length === 10) {
    t = parseInt(time) * 1000;
  } else {
    t = +time;
  }
  const d: any = new Date(t);
  const now = Date.now();

  const diff = (now - d) / 1000;

  if (diff < 30) {
    return 'Just';
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + 'Minutes Ago';
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + 'Hours Ago';
  } else if (diff < 3600 * 24 * 2) {
    return '1 Day Ago';
  }
  if (option) {
    return parseTime(t, option);
  } else {
    return d.getMonth() + 1 + 'Month' + d.getDate() + 'Day' + d.getHours() + 'Hours' + d.getMinutes() + 'Minutes';
  }
};

/**
 * @param {string} url
 * @returns {Object}
 */
export const getQueryObject = (url: string) => {
  url = url ?? window.location.href;
  const search = url.substring(url.lastIndexOf('?') + 1);
  const obj: { [key: string]: string } = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
};

/**
 * @param {string} input value
 * @returns {number} output value
 */
export const byteLength = (str: string) => {
  // returns the byte length of an utf8 string
  let s = str.length;
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xdc00 && code <= 0xdfff) continue;
  }
  return s;
};

/**
 * @param {Array} actual
 * @returns {Array}
 */
export const cleanArray = (actual: Array<any>): any[] => {
  return actual.filter(Boolean);
};

export const formatRunningHours = (value) => {
  if (!value) return '0min';
  const totalSeconds = Number(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
};

/**
 * @param {Object} json
 * @returns {Array}
 */
export const param = (json: any) => {
  if (!json) return '';
  return cleanArray(
    Object.keys(json).map((key) => {
      if (json[key] === undefined) return '';
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
    })
  ).join('&');
};

/**
 * @param {string} url
 * @returns {Object}
 */
export const param2Obj = (url: string) => {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ');
  if (!search) {
    return {};
  }
  const obj: any = {};
  const searchArr = search.split('&');
  searchArr.forEach((v) => {
    const index = v.indexOf('=');
    if (index !== -1) {
      const name = v.substring(0, index);
      const val = v.substring(index + 1, v.length);
      obj[name] = val;
    }
  });
  return obj;
};

/**
 * @param {string} val
 * @returns {string}
 */
export const html2Text = (val: string) => {
  const div = document.createElement('div');
  div.innerHTML = val;
  return div.textContent || div.innerText;
};

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export const objectMerge = (target: any, source: any) => {
  if (typeof target !== 'object') {
    target = {};
  }
  if (Array.isArray(source)) {
    return source.slice();
  }
  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property];
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty);
    } else {
      target[property] = sourceProperty;
    }
  });
  return target;
};

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export const toggleClass = (element: HTMLElement, className: string) => {
  if (!element || !className) {
    return;
  }
  let classString = element.className;
  const nameIndex = classString.indexOf(className);
  if (nameIndex === -1) {
    classString += '' + className;
  } else {
    classString = classString.substring(0, nameIndex) + classString.substring(nameIndex + className.length);
  }
  element.className = classString;
};

/**
 * @param {string} type
 * @returns {Date}
 */
export const getTime = (type: string) => {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90;
  } else {
    return new Date(new Date().toDateString());
  }
};

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export const debounce = (func: any, wait: number, immediate: boolean) => {
  let timeout: any, args: any, context: any, timestamp: any, result: any;

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return (...args: any) => {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }
    return result;
  };
};

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export const deepClone = (source: any) => {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone' as any);
  }
  const targetObj: any = source.constructor === Array ? [] : {};
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
};

/**
 * @param {Array} arr
 * @returns {Array}
 */
export const uniqueArr = (arr: any) => {
  return Array.from(new Set(arr));
};

/**
 * @returns {string}
 */
export const createUniqueString = (): string => {
  const timestamp = +new Date() + '';
  const num = (1 + Math.random()) * 65536;
  const randomNum = parseInt(num + '');
  return (+(randomNum + timestamp)).toString(32);
};

/**
 * Check if an element has a class
 * @param ele
 * @param {string} cls
 * @returns {boolean}
 */
export const hasClass = (ele: HTMLElement, cls: string): boolean => {
  return ele.classList.contains(cls);
};

/**
 * Add class to element
 * @param ele
 * @param {string} cls
 */
export const addClass = (ele: HTMLElement, cls: string) => {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls;
};

/**
 * Remove class from element
 * @param ele
 * @param {string} cls
 */
export const removeClass = (ele: HTMLElement, cls: string) => {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
    ele.className = ele.className.replace(reg, ' ');
  }
};

/**
 * @param {string} path
 * @returns {Boolean}
 */
export const isExternal = (path: string) => {
  return /^(https?:|http?:|mailto:|tel:)/.test(path);
};

// adjust in mobile isMobileDevice or not
export const isMobileDevice = () => {
  const ua = navigator.userAgent.toLowerCase();

  // 判断是否为手机
  const isPhone = /iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/.test(ua);

  // 判断是否为平板（包括 iPad 和 Android 平板）
  const isTablet = /ipad|android(?!.*mobile)|tablet/.test(ua);

  return isPhone || isTablet;
};

export const getDateRange = (period: string | number) => {
  const today = new Date();
  const startDate = new Date(today);
  const dayOfWeek = startDate.getDay();
  const difference = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  let endDate;
  switch (period) {
    case '0':
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      break;
    case '1':
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      break;
    case '2':
      startDate.setDate(startDate.getDate() - difference);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      break;
    case '3':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      break;
    default:
      return [];
  }
  const dates = [];
  if (endDate) {
    dates.push(formatDateToDay(startDate));
    dates.push(formatDateToDay(endDate));
  }
  return dates;
};
export const formatDateToDay = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const getSinceLastData = (preDate: string) => {
  if (!preDate) {
    return;
  }
  const millisecondsDifference = new Date().getTime() - new Date(preDate).getTime();
  const hoursDifference = millisecondsDifference / (1000 * 60 * 60); // 将毫秒转换为小时
  return parseFloat(hoursDifference.toFixed(1)) + 'h';
};
export const operateFormat = (item: string) => {
  item = item.toLowerCase();
  if (item == 'active') {
    return 'el-dict-active';
  } else if (item == 'suspended') {
    return 'el-dict-suspended';
  } else if (item == 'deactivated') {
    return 'el-dict-deactivated';
  } else if (item == 'pending') {
    return 'el-dict-pending';
  } else {
    return 'el-dict-active';
  }
};
export const scheduleFormat = (item: string) => {
  item = item.toLowerCase();
  if (item == 'scheduled') {
    return 'el-dict-scheduled';
  } else if (item == 'in progress') {
    return 'el-dict-progress';
  } else if (item == 'uncompleted') {
    return 'el-dict-uncompleted';
  } else if (item == 'done') {
    return 'el-dict-done';
  } else {
    return 'el-dict-scheduled';
  }
};
export const alertTypeFormat = (item: string) => {
  item = item.toLowerCase();
  if (item == 'high') {
    return 'Above Upper Limit';
  } else if (item == 'low') {
    return 'Below Lower Limit';
  } else if (item == 'mixed') {
    return 'Outside Range';
  } else {
    return item;
  }
};
export const getActiveColor = (value: number) => {
  if (!value) {
    return 'var(--el-text-color-b69)';
  }
  if (value < 30) {
    return 'var(--color-danger)';
  } else if (value < 60) {
    return 'var(--color-dark-yellow)';
  } else if (value < 90) {
    return 'var(--color-dark-blue)';
  } else {
    return 'var(--color-success)';
  }
};

export const revertStatus = (status: string, type = '1'): string => {
  status = status?.toLowerCase() || '';

  if (type === '2' && status === 'done') {
    return 'Done';
  }

  switch (status) {
    case 'not started':
      return 'Scheduled';
    case 'in progress':
      return 'In Progress';
    case 'task suspended':
    case 'task interrupted':
    case 'task abnormal':
    case 'task cancelled':
      return 'Uncompleted';
    case 'task ended':
      return 'Done';
    default:
      return 'Scheduled';
  }
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

type UnitType = 'length' | 'weight' | 'volume' | 'area' | 'areaPerVolume';

interface ConvertOptions {
  value: number | string; // 公制数值
  type: UnitType; // 数据类型
  useImperial?: boolean; // 是否显示为英制（默认 false）
  precision?: number; // 保留小数位数（默认 2）
  useMilli?: boolean; // 仅 volume 类型可用，true 表示使用毫升
  hideUnit?: boolean; // 是否隐藏单位，默认 false
}

// 公制 → 英制 转换配置
const conversionMap: Record<UnitType, { factor: number; metricUnit: string; imperialUnit: string }> = {
  length: { factor: 3.28084, metricUnit: 'm', imperialUnit: 'ft' },
  weight: { factor: 2.20462, metricUnit: 'kg', imperialUnit: 'lb' },
  volume: { factor: 0.264172, metricUnit: 'L', imperialUnit: 'gal' }, // 升 ↔ 加仑
  area: { factor: 10.7639, metricUnit: 'm²', imperialUnit: 'ft²' },
  areaPerVolume: { factor: 40.7458, metricUnit: 'm²/L', imperialUnit: 'ft²/gal' } // m²/L ↔ ft²/gal
};

// 毫升转换（美制液体盎司）
const mlToFlOzFactor = 0.033814;

export const convertWithUnit = (options: ConvertOptions): string => {
  const { type, precision = 2, useMilli = false, hideUnit = false } = options;
  const useImperial = useAppStore().currentUnits === 'imperial';
  const value = Number(options.value);

  // 毫升单独处理
  if (type === 'volume' && useMilli) {
    if (useImperial) {
      return `${(value * mlToFlOzFactor).toFixed(precision)} fl oz`;
    } else {
      return `${value.toFixed(precision)} ml`;
    }
  }

  const config = conversionMap[type];
  if (!config) throw new Error(`Unsupported type: ${type}`);

  let displayValue = value;
  let unit = config.metricUnit;

  if (useImperial) {
    displayValue = value * config.factor;
    unit = config.imperialUnit;
  }

  return hideUnit ? `${displayValue.toFixed(precision)}` : `${displayValue.toFixed(precision)} ${unit}`;
};
