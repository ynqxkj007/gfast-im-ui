<template>
  <div class="icon-input">
    <input :value="modelValue" @input="inputHandle" placeholder="搜索"   class="search-input" type="text"  @keyup.enter="enterHandle"/>
    <img class="icon-search" src="../img/search.png" alt="搜索">
    <img v-show="!!modelValue" class="icon-little-close" src="../img/littleClose.png" alt="清空"  @click="clearHandle" >
  </div>
</template>

<script>
export default {
  name: 'iconInput',
  props:{
    modelValue: {
      type: String,
      default: ''
    }
  },
  methods: {
    enterHandle() {
      this.$emit("enter", this.modelValue)
    },
    inputHandle(e) {
      this.$emit("update:modelValue", e.target.value)
    },
    clearHandle() {
      this.$emit("update:modelValue", "")
      this.$emit("clear")
    }
  }
}
</script>

<style scoped>
.icon-input {
  margin-top:5px;
  position: relative;
  display: inline-block;

}

.icon-search {
  position: absolute;
  left: 8px; /* 调整图标位置 */
  top: 50%;
  transform: translateY(-50%);
  height:22px;
  width: 22px;
  background-color: #fff;
}

.icon-little-close {
  position: absolute;
  right: 5px; /* 调整图标位置 */
  top: 50%;
  transform: translateY(-50%);
  height:22px;
  width: 22px;
  background-color: #fff;
  border-radius: 100%;
  cursor: pointer;
}

.search-input {
  width: 160px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 10px;
  outline: none;
  text-indent: 22px;

}


</style>