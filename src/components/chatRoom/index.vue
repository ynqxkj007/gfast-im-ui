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
        @editInform="showEditInformHandle"
      />
    </KeepAlive>

    <!--    新增群聊房间-->
    <ContactList v-drag="['.my-drag-contact', '.my-drag-contact-header']" class="group-chat" v-model="showGroupChat" :friendList="friendListNotRoom" @confirm="createGroupHandle"></ContactList>

    <!--    新增群聊人员-->
    <ContactList v-drag="['.my-drag-contact', '.my-drag-contact-header']" class="group-chat" v-model="showGroupMember" :friendList="addGroupMemberFriendList" @confirm="addGroupMemberHandle"></ContactList>

    <!-- 编辑群公告 -->
    <Teleport to="body">
      <modal :show="showEditInformModal" @close="showEditInformModal = false">
        <template #header>
          <span class="dialog-title">编辑群公告</span>
        </template>

        <template #body>
          <multilineInput v-model="editInformContent" placeholder="群公告"></multilineInput>
        </template>

        <template  #footer>
          <button class="my-button" @click="editRoomInformHandle">确定</button>
          <button class="my-info-button" @click="showEditInformModal = false">取消</button>
        </template>

      </modal>
    </Teleport>

  </div>
</template>

<script>
import MyDialog from "./dialog.vue";
import Contact from "./contact.vue";
import historyMessage from "./js/historyMessage.js";
import {deepCopy} from './js/utils'
import ContactList from './components/contactList.vue'
import {drag} from "./js/customDirective";
import './css/index.css'
import modal from "./components/modal/modal.vue";
import multilineInput from "./components/multilineInput/multilineInput.vue";
export default {
  name: 'myChat',
  components: {Contact, MyDialog, ContactList, modal, multilineInput},
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
      showGroupMember: false,   // 显示添加群成员
      showEditInformModal: false, // 显示编辑群公告
      editInformContent: "", // 编辑群公告内容
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

    // 显示编辑群公告
    showEditInformHandle() {
      //console.log(this.contact)
      const {id,roomInform} = this.contact
      this.editInformContent = roomInform
      this.showEditInformModal = true
    },
    // 编辑公告
    editRoomInformHandle() {
      const {id} = this.contact
      this.$emit("editRoomInform", {
        close: (isEdit = false) => {
          if (isEdit) {
            this.contact.roomInform = this.editInformContent
          }
          this.showEditInformModal = false
        },
        id: id,
        content: this.editInformContent
      })
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
          !msg.isSys && this.addUnread(uid)
        }
      } else {
        // 非激活窗口
        historyMessage.addMsgList(uid, msg)
        !msg.isSys && this.setLastMessageAndUnread(uid,msg)
      }
    },

    addUnread(uid) {
      const friend  = this.getFriend(uid)
      if (friend) {
        friend.unread += 1
      }
    },

    setLastMessageAndUnread (uid, msg) {
      const friend  = this.getFriend(uid)
      if (friend) {
        friend.lastMessage = msg
        friend.unread += 1
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