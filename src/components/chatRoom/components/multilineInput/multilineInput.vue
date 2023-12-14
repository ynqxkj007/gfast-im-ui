<template>
   <textarea
       ref="textarea"
       :rows="rows"
       :placeholder="placeholder"
       :value="modelValue"
       @input="inputHandle"
   ></textarea>
</template>
<script>
export default {
  props: {
    rows: {
      type: [String, Number],
      default: 3,
    },
    placeholder: {
      type: String,
      default: "请输入内容",
    },
    modelValue: {
      type: String,
      default: ''
    }
  },

  data() {
    return {

    };
  },

  methods: {
    inputHandle(e) {
      this.$emit("update:modelValue", e.target.value)
    },
  },


};
</script>
<style scoped>
textarea {
  width: 100%;
  font-size: 16px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
}
</style>