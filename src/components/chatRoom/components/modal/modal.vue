<template>
    <div v-if="show" :class="['modal-box',{'modal-mask': props.mask }]" v-drag="['.modal-box', '.modal-header']">
      <div class="modal-container" :style="{minWidth: props.width}" >
        <div class="modal-header">
          <slot name="header"></slot>
        </div>

        <div class="modal-body">
          <slot name="body"></slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            <button class="modal-default-button my-info-button" @click="$emit('close')">取消</button>
          </slot>
        </div>
      </div>
    </div>
</template>

<script setup>
import {drag as vDrag} from "../../js/customDirective";
import {ref, watchEffect} from 'vue'

const show = ref(false)
const props = defineProps({
  visible:{
    type: Boolean,
    default : false
  },
  width: {
    type: String,
    default: '300px',
  },
  mask: {
    type: Boolean,
    default: true
  }
})

watchEffect(()=> {
    show.value = props.visible
})
</script>

<style scoped>


.modal-box {
  position: fixed;
  z-index: 9998;
  top: 50%;
  left: 50%;
  display: flex;
}

.modal-mask {
  top: 0 !important;
  left: 0 !important;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
}

.modal-container {
  margin: auto;
  //padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}


.modal-header {
  padding:10px;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
 padding: 20px;
}

.modal-footer {
  padding:10px;
  display: flex;
  justify-content:flex-end;
}


.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.my-button {
  background-color: #51a5e6;
  border: #87ceeb;
  color: #fff;
  font-size: 12px;
  width: 80px;
  height: 26px;
  border-radius: 3px;
  margin-left: 10px;
  cursor: pointer;
}

.my-info-button {
  background-color: #d0d0d0;
  border: #87ceeb;
  color: #fff;
  font-size: 12px;
  width: 80px;
  height: 26px;
  border-radius: 3px;
  margin-left: 10px;
  cursor: pointer;

}


</style>