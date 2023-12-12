<template>
  <div class="box">
    <slot></slot>
    <div v-show="num > 0" class="hang">
      <span class="badge">{{num >= 99 ? "99+" : num}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'mybadge',
  props: {
    num:{
      type: Number,
      default :0
    }
  }
}
</script>

<style scoped>
.box {
  position: relative;

}
.badge {
  display: inline-block;
  padding: 0 10px;
  background-color: #f56c6c;
  color: white;
  font-size: 9px;
  font-weight: bold;
  line-height: 16px;
  border-radius: 10px;

}

.hang{
  position: absolute;
  top:-10px;
  left:-10px;
}
</style>