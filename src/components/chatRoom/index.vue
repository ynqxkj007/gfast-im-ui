<template>
  <div class="main">
    <Contact :currentUser="currentUser"
             :friendList="friendList"
             @setContact="setContactHandle"
             @editRoomName="e =>$emit('editRoomName', e)"
             @quit="e => $emit('quitRoom', e)"
             @top="e => $emit('topMessage', e)"
             @bequiet="e => $emit('bequiet', e)"
             @addGroupChat="addGroupChatHandle"/>
    <KeepAlive>
      <MyDialog
        :key="contactId"
        :ref="'dialog_'+ contactId"
        :currentUser="currentUser"
        :contact="contact"
        :uploadUrl="uploadUrl"
        :baseUrl="baseUrl"
        @scrollTop="scrollTopHandle"
        @getHistory="getHistoryHandle"
        @say="sayHandle"
        @addGroupMember="showAddGroupMemberHandle"
      />
    </KeepAlive>
    <!--    新增群聊房间-->
    <ContactList v-drag="['.my-drag-contact', '.my-drag-contact-header']" class="group-chat" v-model="showGroupChat" :friendList="friendListNotRoom" @confirm="createGroupHandle"></ContactList>
    <!--    新增群聊人员-->
    <ContactList v-drag="['.my-drag-contact', '.my-drag-contact-header']" class="group-chat" v-model="showGroupMember" :friendList="addGroupMemberFriendList" @confirm="addGroupMemberHandle"></ContactList>
  </div>
</template>

<script>
import MyDialog from "./dialog.vue";
import Contact from "./contact.vue";
import historyMessage from "./js/historyMessage.js";
import {deepCopy} from './js/utils'
import ContactList from './components/contactList.vue'
import {drag} from "/@/components/chatRoom/js/customDirective";
import './css/index.css'


export default {
  name: 'myChat',
  components: {Contact, MyDialog, ContactList},
  directives:{
    drag
  },
  props:{
    // 当前用户
    currentUser: {
      type: Object,
      default() {
        return {}
      }
    },
    // 好友列表
    friendList: {
      type:Array,
      default() {
        return []
      }
    },
    uploadUrl:{
      type:String,
      default:'',
    },
    baseUrl:{
      type:String,
      default:'',
    },
    show: {       // 是否展示状态
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      contact: null,      // 当前激活的联系人
      showGroupChat: false, // 新增群聊房间
      showGroupMember: false,

    }
  },

  watch:{
    show(value) {
      if (value && this.contactId) {
        const friend = this.getFriend(this.contactId)
        if (friend) {
          friend.unread = 0
        }
      }
    }
  },
  computed:{
    contactId () {
      return  (this.contact && this.contact.id) ? this.contact.id : ''
    },
    friendListNotRoom(){
      return this.friendList.filter(item => {
        return !item.isRoom
      })
    },

    addGroupMemberFriendList () {
      const notRoomFilterList =   this.friendList.filter(item => {
        return !item.isRoom
      })

      if (this.contact) {
        const {roomUsers} = this.contact
        if (Array.isArray(roomUsers) && roomUsers.length > 0) {

          return notRoomFilterList.filter(item => {
            return roomUsers.find(u => {
              return u.id === item.id
            }) === undefined
          })

        }
      }
      return notRoomFilterList
    }
  },
  methods: {
    // 创建群聊
    createGroupHandle(e) {
      this.$emit("createGroup", e)
    },

    // 添加群聊人员
    addGroupMemberHandle(e) {
      this.$emit("addGroupMember", {
        ...e,
        contact: this.contact
      })
    },

    // 新增群聊人员
    showAddGroupMemberHandle() {
      // console.log(this.contact)
      this.showGroupMember = true
    },

    // 新增群聊房间
    addGroupChatHandle() {
      this.showGroupChat = true
    },
    getHistoryHandle({cancel, done, addHistoryMsg,firstDate}) {
      this.$emit("getHistory", {
        cancel:cancel,
        done:done,
        addHistoryMsg: (data)=> {
          addHistoryMsg(data)
        },
        firstDate:firstDate,
        contactId:this.contactId
      })
    },
    scrollTopHandle({cancel, done, addHistoryMsg,firstDate}) {
      this.$emit("scrollTop", {
        cancel:cancel,
        done:done,
        addHistoryMsg: (data)=> {
          addHistoryMsg(data)
        },
        firstDate:firstDate,
        contactId:this.contactId
      })
    },
    // 激活窗口
    setContactHandle(user) {
      //console.log(user)
      // 已激活窗口不做任何操作
      if (this.contact && this.contact.id === user.id) {
        return
      }

      // 非激活窗口获取并设置聊天信息
      let message = historyMessage.popAllMessage(user.id)
      if (Array.isArray(message) && message.length > 0) {
        message = deepCopy(message)
      } else {
        message = []
      }

      this.contact = user
      const friend = this.getFriend(user.id)
      if (friend) {
        friend.unread = 0
      }

      this.$emit("activeFriend", user)
      this.$nextTick(()=> {
        if (message.length > 0) {
          if (this.$refs['dialog_' + this.contactId]) {
            this.$refs['dialog_' + this.contactId].batchMsgList(message)
          }
        } else {
          if (this.$refs['dialog_' + this.contactId]) {
            this.$refs['dialog_' + this.contactId].scrollToBottom()
          }
        }
      })

    },

    // 本人发送消息
    sayHandle (toUid, msg) {
      this.$emit("say", msg)
    },

    // 添加消息
    addMsgList(uid, msg) {
      // 激活窗口
      if (this.contact && uid === this.contact.id) {
        if (this.$refs['dialog_' + this.contactId]) {
          this.$refs['dialog_' + this.contactId].addMsgList(msg)
        }
        if (!this.show) {
          this.addUnread(uid)
        }
      } else {
        // 非激活窗口
        historyMessage.addMsgList(uid, msg)
        //  设置最后一条信息及未读数量
        const friend = this.getFriend(uid)
        if (friend) {
          friend.unread += 1
          friend.lastMessage = msg
        }
      }
    },

    addUnread(uid) {
      const friend  = this.getFriend(uid)
      if (friend) {
        friend.unread += 1
      }
    },

    setLastMessage (uid, msg) {
      const friend  = this.getFriend(uid)
      if (friend) {
        friend.lastMessage = msg
      }
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
.main {
  width: 1085px;
  height: 655px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 5px;
  background-color: #efeded;
  border: #d0d0d0 1px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  position: relative;
}

.group-chat {
  position: absolute;
  left: 400px;
  top: 10px;
  background-color: #efeded;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0,.12), 0 0 6px rgba(0, 0, 0,.04);
  z-index: 2;
}

</style>