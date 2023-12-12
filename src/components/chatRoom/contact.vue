<template>
  <div class="contact">

    <div class="top">
      <div class="left">
        <img class="avatar" :src="currentUser.avatar" alt="头像"/>
      </div>
      <div class="right">
        <div>{{ currentUser.username }}<span v-show="currentUser.online" style="color:#67C23A">[在线]</span><span v-show="!currentUser.online" style="color:#da0606">[已离线或已他处登录]</span></div>
        <div style="display: flex">
          <div class="search">
            <IconInput v-model="searchValue" ></IconInput>
          </div>
          <div class="icon-add">
            <img src="./img/add.png" alt="创建群聊" @click="addGroupChat">
          </div>
        </div>
      </div>
    </div>

    <div v-if="friendList.length" class="bottom">
        <RightKeyMenu :menu="menuItems" v-for="friend in filterFriendList"
                      :key="friend.id"
                      @select="opt => selectMenuHandle(friend, opt)"
                      @showMenuBefore="showMenuBeforeHandle(friend)">
          <div class="friend" :class="{activeColor: isActive(friend.id)}" @click="setContact(friend.id)">
            <div class="left">
              <Badge :num="friend.unread" style="width: 48px;height: 48px;  margin: auto;">
                <img class="avatar" :src="friend.avatar"/>
              </Badge>
            </div>
            <div class="right">
              <p><span class="green-dot" v-if="friend.online"></span> {{ friend.username }}<span class="last-message" style="float:right;padding-right:15px;max-width:140px;">{{friend.lastMessage ? formatDate(friend.lastMessage.time): ""}}</span></p>
              <p class="last-message"  v-if="friend.lastMessage && friend.lastMessage.mType === 'txt'">{{truncateString(friend.lastMessage.message, 20)}}</p>
              <p class="last-message"  v-if="friend.lastMessage && friend.lastMessage.mType === 'img'">[图片]</p>
              <p class="last-message"  v-if="friend.lastMessage && friend.lastMessage.mType === 'file'">[文件]</p>
              <img v-if="friend.bequiet" src="./img/bequiet.png" class="bequiet" alt="免打扰">
            </div>
          </div>
        </RightKeyMenu>
    </div>

    <div v-else class="info">
      <div class="msg">
        还没有好友~~~
      </div>
    </div>

    <Teleport to="body">
      <!-- 使用这个 modal 组件，传入 prop -->
      <modal :show="showModal" @close="showModal = false">
        <template #header>
          <h3>修改群聊名称</h3>
        </template>

        <template #body>
          <div class="input-container">
            <input type="text" v-model="editRoomName"  placeholder="请输入新的群聊名称">
          </div>
        </template>

        <template  #footer>
          <button class="my-button" @click="editRoomNameHandle">确定</button>
          <button class="my-info-button" @click="showModal = false">取消</button>
        </template>

      </modal>
    </Teleport>

  </div>
</template>

<script>
import Badge from './components/badge.vue'
import {formatDate, truncateString} from './js/utils'
import RightKeyMenu from "./components/contextMenu/ContextMenu.vue";
import modal from "./components/modal/modal.vue";
import IconInput from "./components/iconInput.vue"

export default {
  name: 'myContact',
  components:{Badge, RightKeyMenu, modal, IconInput},
  props:{
    currentUser: {
      type: Object,
      default() {
        return {}
      }
    },
    friendList: {
      type:Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      active: 0,
      menuItems: [],
      showModal:false,
      searchValue: "", // 搜索好友
      editRoomName:"",
      editFriend: {}
    }
  },
  computed:{
    filterFriendList(){
      return this.friendList.filter(item=>{
        return item.username.indexOf(this.searchValue)!== -1
      })
    }
  },
  methods: {
    truncateString:truncateString,
    // 修改群聊名称
    editRoomNameHandle () {
      //console.log(this.editFriend, this.editRoomName)
      this.$emit("editRoomName", {
        friend: this.editFriend,
        name: this.editRoomName,
        close: () => {
          this.showModal = false
        }
      })
    },
    showMenuBeforeHandle(friend) {
      const bequietText = friend.bequiet ? '取消消息免打扰' : '消息免打扰'
      if (friend.isRoom) {
        this.menuItems = [
          { label: '置顶', cmd: "top" },
          { label: bequietText, cmd: "bequiet" },
          { label: '修改群聊名称', cmd: "edit" },
          { label: '退出群聊', cmd: "quit" }
        ]
      } else {
        this.menuItems = [
          { label: '置顶', cmd: "top" },
          { label: bequietText, cmd: "bequiet" },
        ]
      }
    },
    // 选择右键菜单
    selectMenuHandle(friend, opt) {
      // console.log(friend, opt)
      const {isRoom} = friend
      const {cmd} = opt
      if (cmd === 'edit') {
        this.editRoomName = friend.username
        this.editFriend = friend
        this.showModal = true
      } else if (cmd === 'quit') {
        this.$emit("quit", {
          friend: friend
        })
      } else if (cmd === 'top') {
        this.$emit("top", {
          friend: friend
        })
      } else if (cmd === 'bequiet') {
        this.$emit("bequiet", {
          friend: friend
        })
      }

    },

    // 搜素好友
    searchFriend() {

    },
    // 发起群聊
    addGroupChat() {
      this.$emit('addGroupChat')
    },
    formatDate(value) {
      return formatDate(value)
    },
    setContact(index) {
      this.active = index
      this.$emit('setContact', this.getFriend(index))
    },
    isActive(index) {
      return this.active === index
    },
    getFriend(uid) {
      for(let i = 0; i < this.friendList.length; i++) {
        if (this.friendList[i].id === uid) {
          return this.friendList[i]
        }
      }
      return undefined
    }
  }
}
</script>

<style scoped>
.contact {
  width: 360px;
  height: 100%;
  float: left;
  border-right: #d0d0d0 1px solid;
}

.bottom {
  height:calc(100% - 80px);
  overflow-x: hidden;
}

.bottom::-webkit-scrollbar {
  width: 8px;
  height: 1px;
}

.bottom::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background-color: #b2afaf;
}

.bottom::-webkit-scrollbar-track {
  background: #efeded;
  border-radius: 4px;
}


.top {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  border-bottom: #e0dfdf 1px solid;
}

.activeColor {
  background-color: #c9cbcb;
}

.top .left {
  flex: 1;
  text-align: center;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}


.right {
  position: relative;
  white-space: nowrap; /* 禁止文本换行 */
  overflow: hidden; /* 隐藏溢出的文本 */
  text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
  width: 100%; /* 为文本设置一个固定宽度 */
}

.right .bequiet{
  position: absolute;
  bottom: 0px;
  right: 20px;
  width:12px;
}


.top .right {
  flex: 3;
}

.friend {
  width: 360px;
  height: 60px;
  //line-height: 60px;
  display: flex;
  align-items: center;
  border-bottom: #faf7f7 1px solid;
}

.friend .left {
  flex: 1;
  margin-top: 10px;
  margin-left:15px;
  text-align: center;
}

.friend .right {
  //flex: 3;
  color: #575454;
  font-size: 14px;
}

.friend .avatar {
  width: 36px;
  height: 36px;
}

.last-message {
  font-size: 12px;
  color: #999;
  height: 18px;
  line-height: 18px;
  padding-right:20px;
}


.info {
  margin-top: 230px;
}

.info .msg {
  text-align: center;
}



.green-dot {
  width: 10px;
  height: 10px;
  background-color: #67C23A;
  border-radius: 50%;
  display: inline-block;
  margin-right: 3px;
}


.icon-add {
  margin-top:5px;
  margin-left:10px;
}

.icon-add img {
  transform: translateY(17%);
  height:22px;
  width: 22px;
  cursor: pointer;
}




</style>