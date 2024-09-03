<template>
  <div v-if="contact"  class="dialog">
    <div class="top">
      <div class="name">
        <span>{{ contact.username }}</span>
        <img v-if="contact.isRoom" style="width:18px;float:right;cursor: pointer" src="./img/more.png" alt="更多" @click="moreHandle">
      </div>
    </div>

    <div class="middle" ref="middleRef" @mouseover="over" @mouseout="out">
      <div class="loading" v-if="isLoading">
        <img src="./img/load.gif" alt="加载">
      </div>
      <div class="loading history" v-if="!isLoading && !isDone" @click="getHistory">点击获取历史数据</div>
      <div v-if="msgList.length">
        <div v-for="msg in msgList" :key="msg.from+ '_' + msg.time">
          <Notice :message="msg"></Notice>

          <template v-if="!msg.isSys">
            <div v-if="msg.from === currentUser.id" class="msg"  style="flex-direction: row-reverse;">
              <div class="avatar">
                <img :src="currentUser.avatar" alt="头像"/>
              </div>
              <div style="flex: 13;">
                <Message class="bubble-msg-right" style="margin-left: 75px;" :baseUrl="baseUrl" :message="msg"></Message>
              </div>
            </div>

            <div v-else  class="msg" style="flex-direction: row;">
              <div class="avatar">
                <img :src="msg.fromUserInfo.avatar" alt="头像"/>
              </div>
              <div style="flex: 13;">
                <p v-show="contact.isRoom" class="bubble-msg-username" >{{msg.fromUserInfo.nickname || ''}}</p>
                <Message class="bubble-msg-left" style="margin-right: 75px;" :baseUrl="baseUrl" :message="msg"></Message>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>

    <div class="line"></div>
    <div class="bottom">
      <div class="tools">
<!--        发送图片-->
        <span><UploadImg :uploadUrl="uploadUrl" @success="uploadImgSuccess"></UploadImg></span>
<!--        单人视频通话-->
        <Video v-if="!contact.isRoom" :contact="contact" style="margin-left:10px; cursor: pointer;" @initVideo="e => $emit('initVideo', e)"></Video>
      </div>
      <label>
        <textarea
            class="messageText"
            maxlength="256"
            v-model="msg"
            :placeholder="hint"
            @keydown="sendMsgKeydown"
        ></textarea>
      </label>
      <div class="send">
        <span class="send-tips">按下CTRL+ENTER发送</span>
        <button class="send-button" :class="{emptyText: isEmptyText}" title="按下CTRL+ENTER发送" @click="sendMsg">发送</button>
      </div>
    </div>

<!--    群聊面板-->
    <div class="right-menu" v-if="showRightMenu && contact.isRoom">
      <div class="notice-title"><span>群公告</span><img style="width:16px;cursor: pointer" src="./img/edit.png" alt="编辑公告" @click="editInform"></div>
      <div class="notice-content">
        {{contact.roomInform}}
      </div>
      <div class="member-title"><span>群成员</span> <img style="width:16px;cursor: pointer" src="./img/add.png" alt="添加成员" @click="addRoomMember"></div>
      <div class="member-list">
        <div v-for="item in contact.roomUsers" :key="item.id" class="friend">
          <div class="left">
            <img class="avatar" :src="item.avatar"/>
          </div>
          <div class="right">
            <p>{{ item.username }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div v-else class="info">
    <div class="msg">
      找个好友聊天吧~~~
    </div>
  </div>
</template>

<script>

import {debounce, formatDate} from './js/utils'
import UploadImg from "./components/uploadImg.vue";
import Message from "./components/message.vue"
import Notice from  "./components/notice/notice.vue"
import Video from "./components/video.vue"


export default {
  name: "myDialog",
  components:{
    UploadImg,
    Message,
    Notice,
    Video
  },
  props: {
    currentUser: {
      type: Object,
      default() {
        return {}
      }
    },
    contact: {
      type: Object,
      default() {
        return {}
      }
    },
    uploadUrl:{
      type:String,
      default:'',
    },
    baseUrl:{
      type:String,
      default:'',
    }
  },
  data() {
    return {
      msg: '',
      hint: '',
      bubbleMsg: '',
      isEmptyText: true,
      msgList:[],
      isLoading :false,
      isDone: false,    // 没有更多的历史数据
      callback: undefined,
      showRightMenu: false,
      showRightMenuSingle: false, // 单聊
    }
  },
  watch: {
    msgList: {
      handler(newVal, oldVal) {
        if(!this.isLoading) {
          // 新消息
          const mid = this.$refs['middleRef']
          this.$nextTick(() => {
            mid && (mid.scrollTop = mid.scrollHeight)
          })
        } else {
          // 历史消息
          const mid = this.$refs['middleRef']
          this.$nextTick(() => {
            mid && (mid.scrollTop = mid.scrollHeight * 0.2 )
          })
        }
      },
      deep:true
    },

    msg() {
      this.isEmptyText = !this.msg
    }
  },
  mounted() {

    const mid = this.$refs['middleRef']
    this.callback =  debounce(event => {
      if(!this.isDone && event.target.scrollTop === 0){
        this.isLoading = true
        this.$emit("scrollTop", {
          addHistoryMsg: this.addHistoryMsg,
          firstDate: this.getFirstDate(),
          cancel: () => this.isLoading = false,
          done:()=> this.isDone =  true
        })
      }
    }, 200)

    mid && mid.addEventListener('scroll',this.callback)
  },
  unmounted() {
    const mid = this.$refs['middleRef']
    mid && mid.removeEventListener('scroll', this.callback)
  },
  methods: {

    // 编辑公告
    editInform() {
      this.$emit('editInform', this.contact)
    },

    // 新增成员
    addRoomMember() {
      // console.log(this.contact)
      this.$emit('addGroupMember', this.contact)
    },

    // 更多
    moreHandle () {
      //console.log(this.contact)
      // 群聊
      this.showRightMenu = !this.showRightMenu
      // 单聊
    },

    roomFace (to) {
      const user = this.contact.roomUsers.find(item => item.id === to)
      //console.log(to, user)
      return user ? user.avatar : ''
    },
    // 滚动到底部
    scrollToBottom() {
      const mid = this.$refs['middleRef']
      mid && (mid.scrollTop = mid.scrollHeight)
    },

    // 获取历史数据
    getHistory() {
      this.isLoading = true
      this.$emit("getHistory", {
        addHistoryMsg: this.addHistoryMsg,
        firstDate: this.getFirstDate(),
        cancel: () => this.isLoading = false,
        done:()=> this.isDone =  true
      })
    },
    getFirstDate() {
      let firstDate
      if (this.msgList.length > 0) {
        firstDate = formatDate(this.msgList[0].time)
      } else {
        firstDate = formatDate(new Date())
      }
      return firstDate
    },
    addHistoryMsg(data) {
      if (Array.isArray(data)) {
        this.msgList.unshift(...data)
      }
    },
    batchMsgList(msgs) {
      if (Array.isArray(msgs) && msgs.length > 0) {
          this.msgList.push(...msgs)
      }
    },
    addMsgList(content) {
      this.msgList.push(content)
    },
    over() {
      this.setColor('#c9c7c7')
    },
    out() {
      this.setColor('#0000')
    },
    setColor(color) {
      document.documentElement.style.setProperty('--scroll-color', `${color}`)
    },
    sendMsgKeydown (event) {
      if (event.key === 'Enter' && event.ctrlKey) {
        this.sendMsg()
      }
    },
    // 发送图片信息
    uploadImgSuccess(res) {
      // console.log(res)
      const {code, message, data} = res
      if (code === 0) {
        const {size, path, fullPath, name, type} = data
        let entity = {
          from: this.currentUser.id,
          to: this.contact.isRoom ? 0 : this.contact.id,
          fromUserInfo: {
            uid: this.currentUser.id,
            nickname: this.currentUser.username,
            avatar:this.currentUser.avatar
          },
          contactMark: this.contact.id,
          message: path,
          time: formatDate(new Date()),
          mType:'img',       // 消息类型：file | img | txt
          fileSize:size,         // 文件大小
          fileName: name,       // 文件名称
          isRoom: this.contact.isRoom,
          roomUsers: this.contact.roomUsers,
          roomId: this.contact.isRoom ? this.contact.id: "",
        }
        //console.log("图片:", entity)
        this.addMsgList(entity)
        this.$emit("say", this.contact.id, entity)
      } else {
        console.error("uploadImg error", message)
      }

    },
    // 发送文本
    sendMsg() {
      if (!this.msg) {
        this.hint = '信息不可为空！'
        return
      }
      let entity = {
        from: this.currentUser.id,
        to: this.contact.isRoom ? 0 : this.contact.id,
        fromUserInfo: {
          uid: this.currentUser.id,
          nickname: this.currentUser.username,
          avatar: this.currentUser.avatar
        },
        contactMark:this.contact.id,
        isSys: 0,
        type: 0,
        message: this.msg,
        time: formatDate(new Date()),
        mType:'txt',       // 消息类型：file | img | txt
        fileSize:0,         // 文件大小
        fileName: '',       // 文件名称
        isRoom: this.contact.isRoom,
        roomUsers: this.contact.roomUsers,
        roomId: this.contact.isRoom ? this.contact.id: "",
      }
      //console.log("文本:", entity)
      this.addMsgList(entity)
      this.$emit("say", this.contact.id,  entity)
      this.msg = ''
      this.hint = ''
    }
  }
}
</script>

<style scoped>

:root {
  --scroll-color: #0000;
}

.dialog {
  width: 719px;
  height: 100%;
  float: right;
  position:relative;
}

.dialog .right-menu {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 300px;
  height:calc(100% - 60px);
  background: #f5f5f5;
  border-left: #d0d0d0 1px solid;
  display: flex;
  flex-direction: column;
}

.dialog .right-menu .notice-title {
  width: 100%;
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
  border-bottom: #d0d0d0 1px solid;
  display: flex;
  align-items: center;
  justify-content:space-between;
}

.dialog .right-menu .notice-content {
  width: 100%;
  height: 120px;
  border-bottom: #d0d0d0 1px solid;
  padding:10px;
  overflow: auto;
}
.dialog .right-menu .member-title {
  width: 100%;
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
  border-bottom: #d0d0d0 1px solid;
  display: flex;
  align-items: center;
  justify-content:space-between;
}
.dialog .right-menu .member-list {
  width: 100%;
  height: 100%;
  border-bottom: #d0d0d0 1px solid;
  overflow: auto;
}

.friend {
  height: 60px;
  display: flex;
  align-items: center;
  border-bottom: #faf7f7 1px solid;
}

.friend .left {
  margin-top: 10px;
  margin-left:15px;
  text-align: center;
}

.friend .right {
  color: #575454;
  font-size: 14px;
  padding-left: 10px;
}

.friend .avatar {
  width: 36px;
  height: 36px;
}


.top .name {
  position: relative;
  top: 33px;
  padding: 0 5px 0 10px;
}

.info {
  width: 719px;
  height: 100%;
  display: flex;
  align-items: center;
}

.info .msg {
  flex: 1;
  text-align: center;
}

.top {
  width: 100%;
  height: 60px;
  border-bottom: #d0d0d0 1px solid;
}



.middle {
  height: 432px;
  overflow: auto;
  padding: 10px;
  margin: 6px 0 11px 0;
}

.middle::-webkit-scrollbar {
  width: 8px;
  height: 1px;
}

.middle::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background-color: var(--scroll-color);
}

.middle::-webkit-scrollbar-track {
  background: #efeded;
  border-radius: 4px;
}

.middle .msg {
  display: flex;
  padding-top:10px;
}

.middle .msg .avatar {
  margin: 8px;
  flex: 1;
}

.middle .msg .avatar img {
  width: 36px;
  height: 36px;
  border-radius: 4px;
}

.bubble-msg-left, .bubble-msg-right {
  padding: 10px;
  font-size: 14px;
  margin-top: 5px;
  line-height: 24px;
  border-radius: 5px;
  width: fit-content;
  line-break: anywhere;
}

.bubble-msg-username {
  font-size:12px;
  color:#b9b9b9;
  position: relative;
  left: -10px
}


.bubble-msg-left {
  float: left;
  color: black;
  margin-left: -12px;
  text-indent: -0.5em;
  background-color: white;
}

.bubble-msg-right {
  float: right;
  color: white;
  background-color: #1e6ee1;
}

.bubble-msg-right::before {
  content: " ";
  float: right;
  position: relative;
  left: 18px;
  border: 4px solid #0000;
  border-left-color: #1e6ee1;
}

.bubble-msg-left::before {
  content: " ";
  float: left;
  position: relative;
  left: -18px;
  border: 4px solid #0000;
  border-right-color: white;
}

.line {
  width: 100%;
  height: 0;
  position: relative;
  top: -6px;
  border-top: #d0d0d0 1px solid;
}

.bottom{
  position: relative;
}

.dialog .bottom {
  padding-left: 10px;
  padding-right: 25px;
}

.messageText {
  margin-right: 2px;
  font: 14px/1.5 Helvetica,Arial,Tahoma,微软雅黑;
  width: 100%;
  height: 80px;
  outline: none;
  background: #efeded;
  border: 0 none;
  overflow-y: auto;
  box-sizing: border-box;
  resize: none;
  vertical-align: middle;
  display: inline-block;
}

.send {
  margin-top:5px;
  float: right;
}

.send-tips {
  font-size: 12px;
  color: #999;
  height: 18px;
  line-height: 18px;
  margin-right:10px;
}

.send-button:focus{
  outline: none;
}

.send-button {
  background-color: #51a5e6;
  border: #87ceeb;
  color: #fff;
  font-size: 12px;
  width: 128px;
  height: 26px;
  border-radius: 3px;
  cursor: pointer;
}

.emptyText {
  background-color: #d0d0d0;
}

.loading {
  text-align: center;
  font-size: 12px;
  color: #398ee5;
  height: 18px;
  line-height: 18px;
}

.history {
  cursor: pointer;
}


</style>