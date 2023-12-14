<template>
  <div ref="containerRef">
    <slot></slot>
    <Teleport to="body">
        <div v-if="!disabled && showMenu" class="context-menu" :style="{ left: x + 'px', top: y + 'px' }">
          <div class="menu-list">
            <!-- 添加菜单的点击事件 -->
            <div @click="handleClick(item)" class="menu-item" v-for="(item, i) in props.menu" :key="item.label">
              {{ item.label }}
            </div>
          </div>
        </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import useContextMenu from './useContextMenu';
const props = defineProps({
  menu: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
const containerRef = ref(null);
const emit = defineEmits(['select', 'showMenuBefore']);
const { x, y, showMenu, monitor } = useContextMenu(containerRef);

monitor.showMenu = ()=> {
  emit('showMenuBefore')
}

// 菜单的点击事件
function handleClick(item) {
  // 选中菜单后关闭菜单
  showMenu.value = false;
  // 并返回选中的菜单
  emit('select', item);
}

</script>
<style  scoped>
.context-menu {
  position: absolute;
  z-index: 9999;
}
.context-menu .menu-list {
  padding: 0 10px;
  background: #fff;
}
.context-menu .menu-list .menu-item {
  padding: 4px 5px;
  text-align: left;
  cursor: pointer;
  color:#333;
}
.context-menu .menu-list .menu-item:hover {
  color: #0073e5;
}
</style>