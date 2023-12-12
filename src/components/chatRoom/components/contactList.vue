<template>

    <div class="contact my-drag-contact" v-show="show">

        <div class="top my-drag-contact-header">
          <IconInput v-model="searchValue"  @enter="enterHandle"   @clear="clearHandle"></IconInput>
          <button class="my-button"  @click="confirm">确 定</button>
          <div class="hang" @click="closeHandle">
            <img src="../img/close.png" alt="关闭"   class="icon" />
          </div>
        </div>

        <div v-if="filterFriendList.length" class="bottom">
          <div v-for="friend in filterFriendList" :key="friend.id" class="friend" @click="tapItem(friend)">
            <div class="check">
              <input v-model="friend.checked" type="checkbox">
            </div>
            <div class="left">
              <img class="avatar" :src="friend.avatar"/>
            </div>
            <div class="right">
              <p>{{ friend.username }}</p>
            </div>
          </div>
        </div>

        <div v-else class="info">
          <div class="msg">没有数据</div>
        </div>

    </div>



</template>

<script>
import IconInput from "./iconInput.vue"
import {deepCopy} from "../js/utils"
export default {
  name: 'myContactList',
  components:{IconInput},
  props:{
    friendList: {
      type:Array,
      default() {
        return []
      }
    },
    modelValue:{
      type:Boolean,
      default:false
    }
  },
  data() {
    return {
      searchValue:"",
    }
  },
  computed:{
    show:{
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    filterFriendList(){
      return this.friendList.filter(item=>{
        return item.username.indexOf(this.searchValue)!== -1
      })
    }
  },
  methods:{
    tapItem(item) {
      item.checked = !item.checked
    },
    enterHandle(){},
    clearHandle() {},
    confirm () {
      const checkedList = this.friendList.filter(item => item.checked)
      this.$emit("confirm", {checked:deepCopy(checkedList), close: this.closeHandle})
    },
    closeHandle() {
      this.show = false
      this.friendList.forEach(item => {
        item.checked = false
      })
    }

  }
}
</script>

<style scoped>

.contact {
  width: 360px;
  height: 600px;
}

.top {
  width: 100%;
  height: 40px;
  border-bottom: #e0dfdf 1px solid;
  padding-left:8px;
  position: relative;
}


.hang{
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
}

.hang img {
  width:20px;
  height:20px;
  cursor: pointer;
}

.bottom {
  height:calc(100% - 40px);
  overflow-x: hidden;
}


.avatar {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}


.right {
  white-space: nowrap; /* 禁止文本换行 */
  overflow: hidden; /* 隐藏溢出的文本 */
  text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
  width: 100%; /* 为文本设置一个固定宽度 */
}

.top .right {
  flex: 3;
}

.friend {
  width: 360px;
  height: 60px;
  display: flex;
  align-items: center;
  border-bottom: #faf7f7 1px solid;
  cursor: pointer;
}

.friend .left {
  flex: 1;
  margin-top: 10px;
  margin-left:15px;
  margin-right:10px;
  text-align: center;
}

.friend .right {
  color: #575454;
  font-size: 14px;
}

.friend .avatar {
  width: 36px;
  height: 36px;
}

.my-button{
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

.info {
  margin-top: 230px;
}

.info .msg {
  text-align: center;
}

.check {
  width: 20px;
  height: 20px;
  margin-left: 10px;
  transform: translateY(12%);
}


</style>