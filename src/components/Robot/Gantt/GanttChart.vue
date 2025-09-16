<template>
  <div id="gantt-chart-container">
    <div ref="gantt" class="gantt">
      <div class="guide-header">
        <div class="guide-column-header">
          <div v-for="item in listHeaders" :key="item.lable" class="desc">
            <span class="date">{{ item.label }}</span>
          </div>
        </div>
        <div class="item-name-list">
          <div v-for="n in listHeaders" :key="n" class="guide-column">
            <div
              v-for="(item, index) in data"
              :key="index"
              :class="{
                'guide-name': true,
                'last-guide-name': index === data.length - 1
              }"
              :style="item.type === 'alike' && computedStyle(item)"
            >
              <span :title="item[n.value]">{{ item[n.value] }}</span>

            </div>
          </div>
        </div>
      </div>
      <div ref="innerRef" class="gantt-chart" :class="{ 'gantt-chart-x-scroll': isScroll }" @wheel="handleWheel">
        <div class="gantt-chart-node">
          <div class="date-list first-date-list">
            <div class="range-item">
              <div v-if="scheduleDate.type !== 'multipleDays'" class="range">{{ scheduleDate.dateRange }}</div>
              <div v-if="scheduleDate.type === 'multipleDays'" class="range">
                <div v-for="item in scheduleDate.dateRange" :key="item">{{ item }}</div>
              </div>
              <div class="day-box">
                <div
                  v-for="(dayItem, dayIndex) in visibleTimeNodes"
                  :key="dayIndex"
                  :class="{
                    'day-item': true,
                    'first-day-item': dayIndex === 0,
                    'date-active': false
                  }"
                >
                  <div>{{ dayItem }}</div>
                </div>
              </div>
            </div>
          </div>

          <div ref="scheduleRef" class="schedule-box">
            <div
              v-for="(item, index) in data"
              :key="index"
              :class="{
                'date-box': true
              }"
            >
              <div
                v-for="(dateItem, dateIndex) in getOptimizedRenderWorks(item)"
                :key="`${dateItem.date || dateIndex}-${dateItem.id || 'normal'}`"
                :class="{
                  'date-item': true,
                  'date-item-work': dateItem.type === 'works',
                  'date-active': dateItem.date === props.activeDate
                }"
                :style="computedStyle(item, dateItem, dateIndex)"
                @mouseover="(event) => dateItemMove(dateItem, event)"
                @mouseout="(event) => dateItemMoveOut(dateItem, event)"
                @click="(event) => scheduleClick({ ...dateItem, event })"
              >
                <span v-if="dateItem.type === 'works'" class="work-desc">{{ getDesc(dateItem) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="gantt-legend">
      <div v-for="color in legends" :key="color" class="legend-item">
        <div class="color-item" :style="{ backgroundColor: props.colors[color][0] }"></div>
        {{ color }}
      </div>
    </div>
  </div>

  <div id="guatt-chart-tooltip" :style="tooltipStyle">
    <div v-for="item in tooltipInfo" :key="item.lable" class="tooltip-item">
      <div class="tooltip-title">{{ item.lable }}</div>
      <div class="tooltip-value">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect, ref, onMounted, nextTick, reactive, computed, shallowRef, ComponentInternalInstance, onUnmounted } from 'vue';
import { getTimeNodesBasedOnRange, fetchToday, getTimeNodes } from './date';

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  dateRangeList: {
    type: Array,
    required: true,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: () => []
  },
  colors: {
    type: Object,
    required: true,
    default: () => {}
  },
  unitTime: {
    type: String,
    default: () => 'day'
  },
  activeDate: {
    type: String,
    default: () => fetchToday()
  },
  repeatMode: {
    // extract 将重叠部分抽取，单独生成独立的日程
    // cover 重叠部分按照征程日期排序覆盖
    type: Object,
    default: () => ({ mode: 'cover', backgroundColor: '#FFFFCC', textColor: '#336666', name: '重叠日程', desc: '这是多个日程' })
  },
  // 每个日程格子的宽度
  itemWidth: {
    type: Number,
    default: 40,
    validator(value) {
      return value >= 40;
    }
  },
  itemHeight: {
    type: Number,
    default: 40,
    validator(value) {
      return value >= 40;
    }
  },
  listHeaders: {
    type: Array,
    default: () => []
  },
  scheduleTitle: {
    type: Function,
    default: null
  },
  borderColor: {
    type: String,
    default: '#eee'
  },
  alikeName: {
    type: Function,
    default: null
  },
  // 是否隐藏没有数据的时间节点
  hideEmptyTimeNodes: {
    type: Boolean,
    default: false
  },
  // 虚拟滚动的可见项数量
  virtualScrollItemCount: {
    type: Number,
    default: 50
  }
});
const legends = ref(Object.keys(props.colors));
const isScroll = ref(false);
const totalWidth = ref(0);
const innerRef = ref(null);
const scheduleRef = ref(null);
let rangeDate = ref([]);
const tooltipStyle = ref({});
const hoverColor = ref('#fff');
const tooltipInfo = reactive([
  {
    lable: 'Task name',
    value: ''
  },
  {
    lable: 'Task progress',
    value: ''
  },
  {
    lable: 'Location',
    value: ''
  }
]);
const emit = defineEmits(['scheduleClick', 'scrollXEnd', 'scrollYEnd']);

// 性能优化：使用缓存存储计算结果
const renderCache = new Map();
const timeNodeCache = new Map();

// 使用shallowRef来避免深度响应式带来的性能损耗
const optimizedData = shallowRef([]);

let scheduleDate = ref({});
const ganttMaxWidth = ref('2000px');
const ganttInnerHeight = ref('0px');
// 甘特图 dom
const gantt = ref();

// 计算有数据的时间节点
const visibleTimeNodes = computed(() => {
  if (!props.hideEmptyTimeNodes) {
    return scheduleDate.value.timeHeaders || scheduleDate.value.timeNodes || [];
  }

  const cacheKey = `timeNodes_${JSON.stringify(rangeDate.value)}_${JSON.stringify(optimizedData.value.map((item) => item.schedule))}`;
  if (timeNodeCache.has(cacheKey)) {
    return timeNodeCache.get(cacheKey);
  }

  const allTimeNodes = scheduleDate.value.timeHeaders || scheduleDate.value.timeNodes || [];
  const hasDataTimeNodes = new Set();

  // 收集所有有数据的时间节点
  optimizedData.value.forEach((item) => {
    if (item.schedule && item.schedule.length) {
      item.schedule.forEach((scheduleItem) => {
        if (scheduleItem.days && Array.isArray(scheduleItem.days)) {
          scheduleItem.days.forEach((day) => {
            hasDataTimeNodes.add(day);
          });
        }
      });
    }
  });

  const result = allTimeNodes.filter((timeNode) => hasDataTimeNodes.has(timeNode));
  timeNodeCache.set(cacheKey, result);
  return result;
});

let computeTimer = null;
// 计算当前图表内容区域高度
const computedGanttInnerHeight = () => {
  clearTimeout(computeTimer);
  computeTimer = setTimeout(() => {
    if (!gantt.value) return;
    ganttInnerHeight.value = 0;
    nextTick(() => {
      // ganttInnerHeight.value = parent.clientHeight - ganttHead.clientHeight - (ganttHead.offsetTop - parent.offsetTop) - 2 + 'px'
      // gannt顶部的其余内容高
      ganttInnerHeight.value = gantt.value.scrollHeight + 'px';
    });
  }, 200);
};

const getDesc = (item) => {
  if (item.status === 'Done' || item.status === 'Scheduled') {
    return item.name;
  }

  return `${item.name} (${item.progress}%)`;
};

onMounted(() => {
  window.addEventListener('resize', computedGanttInnerHeight);
  computedGanttInnerHeight();

  nextTick(() => {
    isScroll.value = gantt.value.scrollHeight <= gantt.value.clientHeight;
  });
});

// 组件卸载时清理缓存和事件监听器
onUnmounted(() => {
  clearCaches();
  window.removeEventListener('resize', computedGanttInnerHeight);
  if (typeof computeTimer !== 'undefined') {
    clearTimeout(computeTimer);
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});

watchEffect(() => {
  try {
    const date = getTimeNodesBasedOnRange(props.dateRangeList[0], props.dateRangeList[1], props.unitTime);
    scheduleDate.value = date;
    rangeDate.value = date.timeNodes || [];

    // 确保时间节点数组不为空
    if (!rangeDate.value.length && props.dateRangeList.length >= 2) {
      console.warn('时间节点生成失败，使用备用方案');
      // 备用方案：手动生成时间节点
      const start = new Date(props.dateRangeList[0]);
      const end = new Date(props.dateRangeList[1]);
      const nodes = [];
      const current = new Date(start);

      while (current <= end) {
        nodes.push(current.toISOString().split('T')[0]);
        if (props.unitTime === 'day') {
          current.setDate(current.getDate() + 1);
        } else if (props.unitTime === 'hour') {
          current.setHours(current.getHours() + 1);
        } else {
          current.setDate(current.getDate() + 1);
        }
      }
      rangeDate.value = nodes;
      scheduleDate.value = { ...date, timeNodes: nodes };
    }

    if (scheduleRef.value) {
      const visibleNodes = props.hideEmptyTimeNodes ? visibleTimeNodes.value : rangeDate.value;
      totalWidth.value = visibleNodes.length * props.itemWidth;
      scheduleRef.value.style.width = totalWidth.value + 'px';
    }

    ganttMaxWidth.value = props.itemWidth * rangeDate.value.length + 80 + 'px';
  } catch (error) {
    console.error('Time range processing failed:', error);
  }
});

const checkValidator = () => {
  const keys = ['type', 'name', 'schedule'];
  const scheduleKeys = ['id', 'name', 'desc', 'backgroundColor', 'textColor', 'days'];
  props.data.forEach((item) => {
    if (item.type === 'normal') {
      const arr = Object.keys(item);
      const res = keys.find((v) => !arr.includes(v));
      if (res) {
        throw new Error(`Schedule missing ${res} items`);
      }
      item.schedule.forEach((v) => {
        if (!v.list) {
          const arrs = Object.keys(v);
          const ress = scheduleKeys.find((val) => !arrs.includes(val));
          if (ress) {
            throw new Error(`Schedule missing ${ress} items`);
          }
        }
      });
    }
  });
};

// eslint-disable-next-line vue/no-dupe-keys
const data = ref([]);

// 清理缓存的函数
const clearCaches = () => {
  renderCache.clear();
  timeNodeCache.clear();
};

// 性能监控
const performanceMonitor = {
  renderTimes: [],
  addRenderTime: (time) => {
    performanceMonitor.renderTimes.push(time);
    if (performanceMonitor.renderTimes.length > 10) {
      performanceMonitor.renderTimes.shift();
    }
  },
  getAverageRenderTime: () => {
    if (performanceMonitor.renderTimes.length === 0) return 0;
    return performanceMonitor.renderTimes.reduce((a, b) => a + b, 0) / performanceMonitor.renderTimes.length;
  }
};

// 防抖函数
let debounceTimer = null;
const debounce = (func, delay = 100) => {
  return (...args) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
};

const sortFilterData = () => {
  checkValidator();

  // 清除缓存
  renderCache.clear();
  timeNodeCache.clear();

  // 使用浅拷贝而不是深拷贝来提高性能
  const processedData = props.data.map((item) => {
    if (item.type === 'normal' && Array.isArray(item.schedule)) {
      const newItem = { ...item };
      newItem.schedule = item.schedule
        .filter((scheduleItem) => {
          // 提前过滤掉不在时间范围内的数据
          if (!scheduleItem.days || !scheduleItem.days.length) return false;
          const lastDay = scheduleItem.days[scheduleItem.days.length - 1];
          const checkTime = rangeDate.value[0] || rangeDate.value[0]?.[0];
          return !checkTime || new Date(lastDay).getTime() >= new Date(checkTime).getTime();
        })
        .sort((a, b) => {
          const aTime = a.days?.[0] ? new Date(a.days[0]).getTime() : 0;
          const bTime = b.days?.[0] ? new Date(b.days[0]).getTime() : 0;
          return aTime - bTime;
        })
        .map((schedule) => {
          const newSchedule = { ...schedule };
          if (schedule.days && schedule.days.length === 2) {
            try {
              newSchedule.days = getTimeNodes(schedule.days[0], schedule.days[1], props.unitTime);
            } catch (error) {
              console.warn('Time node generation failed:', error, schedule.days);
              newSchedule.days = schedule.days;
            }
          }
          return newSchedule;
        });
      return newItem;
    }
    return item;
  });

  data.value = processedData;
  optimizedData.value = processedData;
};

// 防抖版本的sortFilterData
const debouncedSortFilterData = debounce(sortFilterData, 150);

const computedStyle = (parent, item, index = null) => {
  let res = {};

  if (item && item.type === 'works') {
    res = {
      ...res,
      // backgroundColor: item.backgroundColor,
      background: `linear-gradient(to right, 
        ${item.progressColor} ${item.progress}%, 
        ${item.progressColor} ${item.progress}%, 
        ${item.backgroundColor} ${item.progress}%, 
        ${item.backgroundColor} 100%)`,
      color: item.textColor,
      width: item.width + 'px',
      marginLeft: -item.left + 'px'
    };
  }

  if (index !== null) {
    res.position = 'absolute';
    res.left = index * props.itemWidth + 'px';
  }
  return res;
};

// 计算当前日程范围在指定日期范围应该渲染的宽度 (假设日程范围都是合法的)
const computeWordWidth = (schedule, days) => {
  const hasFirst = days.findIndex((v) => v.date == schedule[0]) > -1;
  const hasLast = days.findIndex((v) => v.date == schedule[schedule.length - 1]) > -1;

  if (hasFirst && hasLast) {
    const padding = props.unitTime == 'day' ? 1 : 0;
    return (schedule.length - padding) * props.itemWidth;
  }
  if (!hasFirst && hasLast) {
    // 无头有尾
    return getTimeNodes(days[0].date, schedule[schedule.length - 1], props.unitTime).length * props.itemWidth;
  } else if (hasFirst && !hasLast) {
    // 有头无尾
    return getTimeNodes(schedule[0], days[days.length - 1].date, props.unitTime).length * props.itemWidth;
  } else if (!hasFirst && !hasLast) {
    // 无头无尾 当前日程垮度直接覆盖当前展示日程范围
    return getTimeNodes(days[0].date, days.at(-1).date, props.unitTime).length * props.itemWidth;
  }
  throw new Error('computeWordwidth e！');
};
// 检查当前日期是否是指定项目的日程
const _checkTodayIsWork = (today, schedule) => {
  return schedule.days.includes(today);
};
// 检查当前日期是否在最终结果列表上
const _checkTodayInResult = (today, result, id) => {
  return !!result.find((item) => item.date === today && item.id === id);
};
// 检查当前日程是否已经添加到最终结果列表上
const _checkWorkInResult = (work, result) => {
  return !!result.find((item) => item.id === work.id);
};
// 检查当前日期是否在指定的日程列表中
const _checkTodayInWorkList = (today, workList, id) => {
  const status = !!workList.find((item) => {
    return item.id === id && item.days.includes(today);
  });
  return status;
};
// 检查当前日期是否在最终结果已经添加的日程列表中
const _checkTodayInAllWorkList = (today, result, id) => {
  const res = result.filter((item) => item.type === 'works');
  return !!_checkTodayInWorkList(today, res, id);
};
// 把日期范围二维数组处理成适用于日程渲染的一维数组
const _flatDateRange = (dateRange) => {
  return dateRange.map((item) => {
    return {
      type: 'normal',
      date: item
    };
  });
};
// 检查两个日程的重叠范围
const _checkWorkRepeatRange = (workA, workB) => {
  return workA.days.filter((item) => workB.days.includes(item));
};
// 从最终结果中找到指定日期所在的日程信息
const _findTodayForWork = (today, res) => {
  return res.find((item) => item.type === 'works' && item.days.includes(today));
};
// 更新已有日程
const _updateScheduleItem = (scheduleItem, result) => {
  // 检查当前要更新进去的日程有没有重叠的部分
  const inWorkInfo = _findTodayForWork(scheduleItem.days[0], result);
  if (inWorkInfo && scheduleItem.id !== inWorkInfo.id) {
    // 获取重叠范围
    const repeatList = _checkWorkRepeatRange(inWorkInfo, scheduleItem);
    const start = scheduleItem.days.slice(repeatList.length)[0];
    const index = result.findIndex((item) => item.date === start);
    result[index] = {
      type: 'works',
      date: scheduleItem.days[0],
      width: computeWordWidth(scheduleItem.days, result),
      left: repeatList.length * props.itemWidth,
      ...scheduleItem
    };
  } else {
    // 正常更新 (有头有尾)
    const index = result.findIndex((item) => item.date === scheduleItem.days[0]);
    result[index] = {
      type: 'works',
      date: scheduleItem.days[0],
      width: computeWordWidth(scheduleItem.days, result),
      left: 0,
      ...scheduleItem
    };
  }
  // 新增日程，需要同步删除更新日程列表，把原本为空的部分日程删掉
  // result = result.filter(item => {
  //   return !(item.type === 'normal' && scheduleItem.days.includes(item.date));
  // })
  return result;
};

const handleNonWorkDay = (dayItem, res, todayInResult, todayInAllWorkList) => {
  if (!todayInResult && !todayInAllWorkList) {
    addNonWorkDay(dayItem, res);
  }
  // else: 当前日期没有添加 && 当前日期在已经添加的日程范围内，无需处理
};

// 优化后的渲染函数 - 使用原始逻辑避免连续时间段渲染多个bar
const getOptimizedRenderWorks = (game) => {
  const gameId = game.id || game.name || JSON.stringify(game);
  const cacheKey = `render_${gameId}_${JSON.stringify(rangeDate.value)}_${JSON.stringify(game.schedule)}`;

  if (renderCache.has(cacheKey)) {
    return renderCache.get(cacheKey);
  }

  const timeNodes = props.hideEmptyTimeNodes ? visibleTimeNodes.value : rangeDate.value;
  const dateRange = timeNodes.map((date) => ({ type: 'normal', date }));

  // 如果当前项目没有日程安排，直接返回默认的数据
  if (!game.schedule || !game.schedule.length) {
    renderCache.set(cacheKey, dateRange);
    return dateRange;
  }

  // 使用原始renderWorks的逻辑，但优化性能
  let res = [];
  game.schedule.forEach((scheduleItem) => {
    dateRange.forEach((dayItem) => {
      const isWork = _checkTodayIsWork(dayItem.date, scheduleItem);
      const todayInResult = _checkTodayInResult(dayItem.date, res, scheduleItem.id);
      const todayInAllWorkList = _checkTodayInAllWorkList(dayItem.date, res, scheduleItem.id);

      if (isWork) {
        handleWorkDay(dayItem, scheduleItem, res, todayInResult, todayInAllWorkList, dateRange);
      } else {
        handleNonWorkDay(dayItem, res, todayInResult, todayInAllWorkList);
      }
    });
  });

  renderCache.set(cacheKey, res);
  return res;
};

// 辅助函数 - 从原始代码复制
const handleWorkDay = (dayItem, scheduleItem, res, todayInResult, todayInAllWorkList, dateRange) => {
  if (!todayInResult && !todayInAllWorkList) {
    addNewWorkDay(dayItem, scheduleItem, res, dateRange);
  } else if (!todayInResult && todayInAllWorkList) {
    handleOverlappingWorkDay(dayItem, scheduleItem, res);
  } else if (todayInResult && !todayInAllWorkList) {
    updateWorkDay(scheduleItem, res);
  }
  // else: 当前日期已经被添加 && 当前日期在已添加的日程范围内，无需处理
};

const addNewWorkDay = (dayItem, scheduleItem, res, dateRange) => {
  const index = res.findIndex((item) => item.date === dayItem.date);
  const node = {
    type: 'works',
    date: dayItem.date,
    width: computeWordWidth(scheduleItem.days, dateRange),
    left: 0,
    ...scheduleItem
  };
  if (index < 0) {
    res.push(node);
  } else {
    res[index] = node;
  }
};

const handleOverlappingWorkDay = (dayItem, scheduleItem, res) => {
  const inWorkInfo = _findTodayForWork(dayItem.date, res);
  if (scheduleItem.id !== inWorkInfo.id) {
    _checkWorkRepeatRange(inWorkInfo, scheduleItem);
    _updateScheduleItem(scheduleItem, res);
  } else {
    const index = res.findIndex((item) => item.date === dayItem.date);
    if (index < 0) {
      res.push(dayItem);
    }
  }
};

const updateWorkDay = (scheduleItem, res) => {
  _updateScheduleItem(scheduleItem, res);
};

const addNonWorkDay = (dayItem, res) => {
  const index = res.findIndex((item) => item.date === dayItem.date);
  if (index < 0) {
    res.push(dayItem);
  }
};

// 保留原有的renderWorks函数作为备用
const renderWorks = (game) => {
  const dateRange = _flatDateRange(rangeDate.value);
  // 如果当前游戏项目没有日程安排，直接返回默认的数据
  if (!game.schedule || !game.schedule.length) return dateRange;
  let res = [];
  game.schedule.forEach((scheduleItem) => {
    dateRange.forEach((dayItem) => {
      const isWork = _checkTodayIsWork(dayItem.date, scheduleItem);
      const todayInResult = _checkTodayInResult(dayItem.date, res, scheduleItem.id);
      const todayInAllWorkList = _checkTodayInAllWorkList(dayItem.date, res, scheduleItem.id);

      if (isWork) {
        handleWorkDay(dayItem, scheduleItem, res, todayInResult, todayInAllWorkList, dateRange);
      } else {
        handleNonWorkDay(dayItem, res, todayInResult, todayInAllWorkList);
      }
    });
  });
  return res;
};

const dateItemMove = (item, event) => {
  if (item.type !== 'works') return;

  for (let i in tooltipInfo) {
    if (i == 0) {
      tooltipInfo[i].value = item.name;
    } else if (i == 1) {
      tooltipInfo[i].value = item.progress + '%'; // TBD.
    } else {
      tooltipInfo[i].value = item.location || item.desc; // TBD.
    }
  }

  const tooltipWidth = 120;
  const tooltipHeight = 180;
  let left = event.clientX + 8;
  let top = event.clientY;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  // 检查右侧边界
  if (left + tooltipWidth > windowWidth) {
    left = windowWidth - tooltipWidth;
  }

  // 检查底部边界
  if (top + tooltipHeight > windowHeight) {
    top = windowHeight - tooltipHeight;
  }

  hoverColor.value = item.progressColor;
  tooltipStyle.value = {
    left: `${left}px`,
    top: `${top}px`
  };
};

const dateItemMoveOut = (item, event) => {
  if (item.type !== 'works') return;

  tooltipStyle.value = {
    left: '9999px',
    top: '9999px'
  };
};

const handleWheel = (event) => {
  if (gantt.value.scrollTop != 0) return;

  innerRef.value.scrollLeft += event.deltaY;
};

watchEffect(() => {
  debouncedSortFilterData();
});

const scheduleClick = (item) => {
  emit('scheduleClick', item);
};
</script>

<style lang="scss" scoped>
$borderWidth: 1px;
$borderColor: rgba(237, 242, 245, 1);
$cellBKColor: #ecefff;
$border: 1px solid $borderColor;
$fontSize: 14px;
$fontColor: #333;
$itemWidth: 56px;
$itemHeight: 58px;
$totalWidth: v-bind(totalWidth + 'px');
$headerWidth: 118px;
$headerHeight: 63px;

#gantt-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;

  .gantt-legend {
    height: 60px;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;

    .legend-item {
      padding: 1rem;
      line-height: 16px;
      text-transform: capitalize;

      .color-item {
        width: 1rem;
        height: 6px;
        display: inline-block;
        margin-right: 0.5rem;
      }
    }
  }
}

* {
  box-sizing: border-box;
}

.row {
  display: flex;
  flex-direction: row;
}

.center {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.single-line-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gantt-chart-x-scroll {
  overflow-x: auto;
  overflow-x: overlay;
}

.gantt {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 450px);
  overflow-y: auto;
  user-select: none;
  box-sizing: border-box;
  border: $border;
  font-size: $fontSize;
  color: $fontColor;
  display: flex;
  flex-direction: row;
  position: relative;
  border-radius: 8px 0px 0px 8px;
  border-top: 1px solid $borderColor;
  border-bottom: 1px solid $borderColor;
  border-left: 1px solid $borderColor;
  background: #fff;

  *::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 5px;
    /*高宽分别对应横竖滚动条的尺寸*/
    height: 5px;
  }

  *::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 2px;
    box-shadow: inset 0 0 2px rgba(10, 10, 10, 0.2);
    background: #818181;
  }

  *::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    box-shadow: inset 0 0 2px rgba(10, 10, 10, 0.2);
    border-radius: 2px;
    background: #ededed;
  }

  .guide-header {
    flex-shrink: 0;
    height: v-bind(ganttInnerHeight);
    border-radius: 8px 0px 0px 8px;
    border-top: 1px solid $borderColor;
    border-bottom: 1px solid $borderColor;
    border-left: 1px solid $borderColor;
    background: #fff;
    display: flex;
    flex-direction: column;
    border: none;
    box-shadow: 0 4px 48px 0 rgba(0, 0, 0, 0.2);

    .guide-column-header {
      display: flex;
      flex-direction: row;
      background-color: $borderColor;
    }

    .guide-column {
      width: $headerWidth;
      height: $itemHeight;
    }

    .guide-name {
      width: 100%;
      height: $itemHeight;
      border-bottom: $border;
      padding: 0 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-wrap;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;

      span {
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        text-align: center;
      }
    }

    .desc {
      width: 7.375rem;
      height: 3.875rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      color: #71797e;
      font-weight: 600;
      line-height: 16px;
    }

    .item-name-list {
      max-height: v-bind(ganttInnerHeight);
      display: flex;
      flex-direction: row;
    }
  }

  .gantt-chart {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;

    .gantt-chart-node {
      width: v-bind(ganttMaxWidth);
      height: 100%;
    }

    .date-list {
      width: 100%;
      height: $headerHeight;
      display: flex;

      .range-item {
        width: auto;
        border-bottom: $border;
        display: flex;
        flex-direction: column;
        padding: 0 0 0 28px;
        border-radius: 0px 8px 0px 0px;
        background: #ebf0f3;
        height: $headerHeight;

        .range {
          flex: 1;
          border-left: $border;
          border-bottom: $border;
          text-align: center;
          font-size: 12px;
          line-height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;

          font-weight: 600;
          color: #002e4d;

          div {
            flex: 1;
            border-right: 1px solid $borderColor;
          }
        }

        .day-box {
          flex: 2;
          display: flex;

          .day-item {
            width: $itemWidth;

            line-height: 16px;
            color: #002e4d;
            text-align: left;
            display: flex;
            align-items: center;
            transform: translateX(-16px);

            .day {
              width: $itemWidth;
              height: 50%;
              border-left: $border;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }

          .day-item:nth-of-type(odd) {
            visibility: visible;
          }

          .day-item:nth-of-type(even) {
            visibility: hidden;
          }
        }

        &:first-child {
          .month {
            border-left: none;
          }

          .day-box {
            .first-day-item {
              .day {
                border-left: none;
              }

              .week {
                border-left: none;
              }

              border-left: none;
            }
          }
        }
      }

      &.first-date-list {
        border-left: none;
      }
    }

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }

    .schedule-box {
      max-height: v-bind(ganttInnerHeight);
      position: relative;
      left: 0;
      bottom: 0;
      margin-left: 28px;

      .date-box-background {
        height: $itemHeight;
        display: flex;
        align-items: center;
      }
    }

    .schedule-box::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    .date-box {
      height: $itemHeight;
      display: flex;
      align-items: center;
      border-left: 1px solid $borderColor;
      padding-left: 1px;

      .date-item {
        flex-shrink: 0;
        width: $itemWidth;
        height: $itemHeight;
        border-left: $border;
        border-bottom: $border;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 0 10px;

        .work-desc {
          width: 100%;
          height: 100%;
          line-height: calc($itemHeight) / 2;
          text-align: left;
          font-size: 12px;
          display: block;
          pointer-events: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &.date-item-work {
          cursor: pointer;
          position: relative;
          height: 1.5rem;
          line-height: 1.5rem;
          font-size: 12px;
          font-weight: 600;
          z-index: 1;
          border-radius: 8px;
          padding: 0 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &:first-child {
          border-left: none;
        }
      }

      .date-item:nth-of-type(even) {
        background-color: rgba(236, 239, 255, 0.3);
      }

      &.alike {
        .date-item {
          border-left: transparent;
        }
      }

      &:last-child {
        .date-item {
          border-bottom: none;
        }
      }
    }

    .date-active {
      background-color: #caf2ff;
    }
  }
}

#guatt-chart-tooltip {
  position: fixed;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 196px;
  z-index: 100;
  opacity: 1;
  visibility: visible;
  pointer-events: none;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
  border-left: 7px solid v-bind(hoverColor);
  max-width: 200px;
  padding: 12px 0;

  .tooltip-item {
    padding: 2px 10px;
    padding-left: 17px;
    text-align: left;

    .tooltip-title {
      color: #a2aaaf;

      font-size: 10px;
      font-weight: 400;
      line-height: 10px;
    }

    .tooltip-value {
      color: #11191e;
      font-size: 12px;
      font-weight: 600;
      line-height: 12px;
      padding: 8px 0 12px 0;
    }
  }
}
</style>
