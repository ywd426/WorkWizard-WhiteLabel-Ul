// directives/tooltip.js
import { createApp, h, nextTick } from "vue";
import { ElTooltip } from "element-plus";

export default {
  mounted(el, binding) {
    const content = binding.value || "";
    const placement = binding.arg || "top"; // 默认 "top"
    const effect = binding.modifiers.light ? "light" : "dark"; // 通过 `v-tooltip.light` 设置浅色主题

    const tooltipInstance = createApp({
      render() {
        // 创建一个新的 span 元素，并复制原元素的样式
        const span = h("span", {
          style: el.style.cssText, // 复制原元素的样式
          class: el.className, // 复制原元素的类名
        }, el.innerHTML);

        return h(
          ElTooltip,
          { content, placement, effect },
          { default: () => span }
        );
      },
    });

    const tooltipContainer = document.createElement("div");
    tooltipInstance.mount(tooltipContainer);

    nextTick(() => {
      el.innerHTML = "";
      el.appendChild(tooltipContainer);
    });

    el._tooltipInstance = tooltipInstance;
  },
  updated(el, binding) {
    if (el._tooltipInstance) {
      el._tooltipInstance._instance.props.content = binding.value || "";
    }
  },
  unmounted(el) {
    if (el._tooltipInstance) {
      el._tooltipInstance.unmount();
      el._tooltipInstance = null;
    }
  },
};