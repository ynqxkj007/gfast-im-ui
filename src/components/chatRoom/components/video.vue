<template>
  <span class="icon-video" @click="startVideo" ></span>
</template>
<script setup>
import modal from "./modal/modal.vue";
import { useCommandComponent } from '/@/hooks/useCommandComponent';
const modalDialog = useCommandComponent(modal)


const props = defineProps({
  contact: {
    type: Object,
    default() {
      return {}
    }
  }
})

const emit = defineEmits(['initVideo'])

// 创建视频房间
const startVideo = () => {
  //console.log(props.contact)
  // 检查对方是否在线
  // if (!props.contact.online) {
  //   modalDialog({}, {
  //     header: ()=> "提示",
  //     body: ()=> `用户${props.contact.username}不在线，无法发起视频通话！`,
  //   })
  //   return
  // }
  emit('initVideo', props.contact)
}
</script>
<style scoped>

</style>