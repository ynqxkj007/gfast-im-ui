<template>
  <div v-show="show" class="modal-mask" >
    <div class="modal-container box">
      <div class="hang" @click="closeHandle">
        <img src="./img/close.png" alt="关闭"   class="icon" />
      </div>
      <myChat ref="myChatRef"
          :currentUser="currentUser"
          :friendList="friendList"
          :uploadUrl="uploadUrl"
          :baseUrl="baseUrl"
          :show="show"
          @scrollTop="scrollTopHandle"
          @getHistory="getHistoryHandle"
          @say="sendMessage"
          @createGroup="createGroupHandle"
          @addGroupMember="addGroupMemberHandle"
          @activeFriend="activeFriendHandle"
          @editRoomName="editRoomNameHandle"
          @quitRoom="quitRoomHandle"
          @topMessage="topMessageHandle"
          @bequiet="bequietHandle"
          @editRoomInform="editRoomInformHandle"
      >
      </myChat>
    </div>
  </div>
</template>


<script  setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, onUnmounted} from 'vue'
import myChat from "/@/components/chatRoom/index.vue";
import {useChatStore} from "/@/stores/chat";
import {useUserInfo} from "/@/stores/userInfo";
import {Session} from "/@/utils/storage";
import {ElMessage} from "element-plus";
import {getHistoryMessage, addRoom, updateRoomName, quitRoom, addGroupMember, updateRoomNotice} from "/@/api/chat/chat";
import {buildImgUrl} from '/@/components/chatRoom/js/utils.js'
import {getEditUser} from '/@/api/system/user/index'


const chatStore = useChatStore()
const userInfoStore = useUserInfo()
const { userInfos:localUserInfo } = storeToRefs(userInfoStore);
const {friendList} = storeToRefs(chatStore)
const baseUrl = import.meta.env.VITE_API_URL
const uploadApi = baseUrl + "api/v1/chat/upload/singleImg"


const props = defineProps({
  modelValue:{
    type: Boolean,
    default : false
  }
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const myChatRef = ref(null)



// 免打扰
const bequietHandle = ({friend}) => {
  // console.log(friend)
  friend.bequiet = !friend.bequiet
}

// 消息置顶
const topMessageHandle = ({friend}) => {
  // console.log(friend)
  const {id} = friend
  chatStore.messageTop(id)
}

//退出群聊
const quitRoomHandle = ({friend}) => {
  // console.log(friend)
  const {id, isRoom} = friend
  if (!isRoom) {
    return
  }
  quitRoom({
    identify:id,
    quitUserId:currentUser.value.id,
  }).then(res => {
    const {code, message} = res
    if (code === 0) {
      chatStore.removeFriend(id)
    } else {
      ElMessage.error(message || '退出群聊错误')
    }
  })
}

//// 修改群聊的公告
const editRoomInformHandle = ({close, id, content})=> {
  //console.log(id, content)
  updateRoomNotice({id:id, inform:content}).then(res=>{
    const {code, message} = res
    if (code === 0) {
      close(true)
    } else {
      ElMessage.error(message || '修改群聊公告错误')
    }
  })
}



// 修改群聊名称
const editRoomNameHandle = ({friend, name, close}) => {
  // console.log(friend, name)
  const {id, username} = friend
  if (username === name) {
    close()
    return
  }
  updateRoomName({id,name}).then(res => {
    const {code, message} = res
    if (code === 0) {
      friend.username = name
      close()
    } else {
      ElMessage.error(message || '修改群聊名称错误')
    }
  })

}

// 关闭
const closeHandle = () => {
  show.value = false
}

const getUploadUrl = () => {
  return uploadApi + "?token=" + encodeURIComponent(Session.get('token'))
}

const uploadUrl = ref(getUploadUrl())


const  currentUserOnline = ref(false)


//  当前登录人信息
// console.log(localUserInfo)
const currentUserInfo = ref({})

// 当前登录用户
const currentUser = computed(()=> {
  return {
    id: currentUserInfo.value.id ? currentUserInfo.value.id + "" : "",
    avatar:currentUserInfo.value.avatar ? buildImgUrl(currentUserInfo.value.avatar, baseUrl) : chatStore.chatDefaultFace,
    username:currentUserInfo.value.userNickname? currentUserInfo.value.userNickname : "",
    online:currentUserOnline.value,
  }
})


// 新增群聊人员
const addGroupMemberHandle = ({checked, contact, close}) =>  {
  // console.log(checked , contact)
  addGroupMember({
    identify:contact.id,
    userIds:checked.map(item => item.id),
  }).then(res => {
    const {code, data, message} = res
    if (code === 0) {
      ElMessage.success('添加成功')
    } else {
      ElMessage.error(message)
    }
  }).finally(()=> {
    close()
  })
}


// 创建群聊组
const createGroupHandle = ({checked, close})=> {
  if (checked.length === 0) {
    ElMessage.error('请选择用户')
    return
  }

  addRoom({
    name: "群聊",
    userIds:checked.map(item => item.id),
  }).then(res => {
    //console.log(res)
    const {code, data, message} = res
    if (code === 0) {
      const {identify, roomName, userList} = data
      chatStore.addRoom(identify, roomName, Array.isArray(userList) ? userList.map(item => {
        return {
          id: item.id + "",
          avatar: item.avatar ? buildImgUrl(item.avatar, baseUrl) : chatStore.chatDefaultFace,
          username: item.userNickname,
        }
      }) :[])
    } else {
      ElMessage.error(message)
    }
  }).finally(()=> {
    close()
  })

}

// 激活的好友
const activeFriend = ref(null)

const activeFriendHandle = (friend) => {
  activeFriend.value = friend
}


// 获取历史数据
const getHistoryHandle = (params)=> {
    scrollTopHandle(params)
}

// 获取历史数据
const scrollTopHandle = ({cancel, done, addHistoryMsg,  contactId, firstDate})=> {
  //console.log( contactId, firstDate)

  // "演示站不进数据库"提示可注释
  ElMessage.error("演示站聊天记录不进数据库")

  if(firstDate) {
    getHistoryMessage({
      formId: currentUser.value.id,
      toId: !activeFriend.value.isRoom ? contactId : 0,
      roomId:activeFriend.value.isRoom ? contactId : '',
      isRoom: activeFriend.value.isRoom? 1 : 0,
      toDate: firstDate,
      limit:10
    }).then(res => {
      const {code, data} = res
      if(code === 0) {
        const messageListSuperList = data.messageListSuperList
        if (Array.isArray(messageListSuperList) && messageListSuperList.length > 0) {
          const mTypeTxt = ['txt', 'img']
          const messageList = messageListSuperList.reverse().map(item => {
            const {fromSysUser} = item
            return {
              from: item.from + "",
              to: item.to + "",
              fromUserInfo:{
                uid: fromSysUser.id ? fromSysUser.id + "" : "",
                nickname: fromSysUser.userNickname || "",
                avatar: buildImgUrl(fromSysUser.avatar || ""),
              },
              contactMark : item.roomId ? item.roomId : contactId + "",
              isSys: 0,
              type: 0,
              message: item.messageContentSuper.content,
              time: item.msgTime,
              mType: mTypeTxt[item.ctype],       // 消息类型：file | img | txt
              fileSize:0,         // 文件大小
              fileName: '',       // 文件名称
            }
          })
          addHistoryMsg(messageList)
        } else {
          done()
        }
      }
    }).finally(()=> {
      cancel()
    })
  }

}

// 用户发送消息
const sendMessage = (data)=> {
  // console.log(data)
  const {from, to, message, time, mType, fileSize, fileName, isRoom, roomUsers, roomId} = data
  if (isRoom && !roomUsers.length) {
    return
  }

  if (message.trim() === '') {
    return
  }

  if (mType === 'img') {
    if (isRoom) {
      chatStore.sockets.sendObj({
        c_type: 1,
        time: time,
        content: message,
        ats: roomUsers.map(item => item.id),
        room_id: roomId
      })
    } else {
      chatStore.sockets.sendObj({
        c_type: 1,
        time: time,
        content: message,
        ats:[to],
        room_id: undefined
      })
    }
  } else if(mType === 'txt') {
    if (isRoom) {
      chatStore.sockets.sendObj({
        c_type: 0,
        time: time,
        content: message,
        ats: roomUsers.map(item => item.id),
        room_id: roomId
      })
    } else {
      chatStore.sockets.sendObj({
        c_type: 0,
        time: time,
        content: message,
        ats:[to],
        room_id: undefined
      })
    }
  }

}


onMounted(async ()=> {
  // 获取当前登录人信息
  getEditUser(localUserInfo.value.id).then(res=> {
    //console.log(res)
    const {code, data} = res
    // console.log(data.user)
    if (code === 0) {
      //const {id, avatar, userNickname} = data.user || {}
      currentUserInfo.value = data.user || {}

    }

  })

  await Promise.all([chatStore.initRoom(), chatStore.initFriendList({notSelf:1})])
  chatStore.connect({
    reconnection:true,
    reconnectionDelay:3000,
    format:'json',
  })

  chatStore.sockets.onopen = () => {
    console.log("the webSocket is successful")
    currentUserOnline.value = true
  }

  chatStore.sockets.onmessage = (res) => {
    // console.log(res)

    if(typeof res.data === 'string' && res.data.indexOf("{") > -1 ) {
      try {
        const message = JSON.parse(res.data)
        // console.log(message)
        /**
         * type: 0 用户消息 1 用户进入 2 用户退出 3 错误消息 4 新增群聊 5 群成员加入 6 群成员退出
         * c_type: 0 文本 1 图片
         * isSys: 0 普通用户消息 1 系统消息
         */
        const {c_type, content, msg_time, type, user, ats, room_id} = message
        const {addr, enterAt, isSys, payload, uid} = user // 发信人
        const {nickname, avatar} = payload || {}

        let contactMark = uid
        if (room_id) {
          contactMark = room_id
        }

        if (isSys === 1) {
          // 系统消息
          if (type === 3) {
            // 错误消息
            //console.log(content)
            ElMessage.warning(content || '连接错误');
          } else if (type === 4) {
            //console.log(content)
            // 新增群聊
            if (content) {
              const roomInfo = JSON.parse(content)
              //console.log(roomInfo)
              chatStore.addRoom(roomInfo.id, roomInfo.name, roomInfo.users)
            }
          } else if (type === 5) {
            // 群成员加入
            if (content) {
              const roomInfo = JSON.parse(content)
              //console.log(roomInfo)
              chatStore.addRoomUser(roomInfo.id,roomInfo.name, roomInfo.users)
              const joinUsers = roomInfo.users.filter(item=> item.new_join).map(item=> item.username).join(",")
              const m = {
                from: uid,
                fromUserInfo:{
                  uid: uid,
                  nickname: nickname,
                  avatar: buildImgUrl(avatar),
                },
                contactMark: contactMark,
                isSys: isSys,
                type: type,
                to: currentUser.value.id,
                message: `${joinUsers} 加入群聊`,
                time: msg_time,
                mType:'txt',       // 消息类型：file | img | txt
                fileSize:0,         // 文件大小
                fileName: '',       // 文件名称
              }
              myChatRef.value.addMsgList(contactMark, m)

            }
          } else if (type === 6) {
            // 群成员退出
            if (content) {
              const roomInfo = JSON.parse(content)
              //console.log(roomInfo)
              chatStore.removeRoomUser(roomInfo.id, roomInfo.users)
              const joinUsers = roomInfo.users.map(item=> item.username).join(",")
              const m = {
                from: uid,
                fromUserInfo:{
                  uid: uid,
                  nickname: nickname,
                  avatar: buildImgUrl(avatar),
                },
                contactMark: contactMark,
                isSys: isSys,
                type: type,
                to: currentUser.value.id,
                message:  `${joinUsers} 退出群聊`,
                time: msg_time,
                mType:'txt',       // 消息类型：file | img | txt
                fileSize:0,         // 文件大小
                fileName: '',       // 文件名称
              }
              myChatRef.value.addMsgList(contactMark, m)
            }
          } else if (type === 7) {
            // 新的群公告
            const m = {
              from: uid,
              fromUserInfo:{
                uid: uid,
                nickname: nickname,
                avatar: buildImgUrl(avatar),
              },
              contactMark: contactMark,
              isSys: isSys,
              type: type,
              to: currentUser.value.id,
              message:  content,
              time: msg_time,
              mType:'txt',       // 消息类型：file | img | txt
              fileSize:0,         // 文件大小
              fileName: '',       // 文件名称
            }
            myChatRef.value.addMsgList(contactMark, m)
          }
        } else {

          // 普通用户消息
          if (type === 0) {
            // 用户消息
            const m = {
              from: uid,
              fromUserInfo:{
                uid: uid,
                nickname: nickname,
                avatar: buildImgUrl(avatar),
              },
              contactMark: contactMark,
              isSys: isSys,
              type: type,
              to: currentUser.value.id,
              message: content,
              time: msg_time,
              mType:'txt',       // 消息类型：file | img | txt
              fileSize:0,         // 文件大小
              fileName: '',       // 文件名称
            }
            if (c_type === 1) {
              m.mType = 'img'
            }
            myChatRef.value.addMsgList(contactMark, m)
            chatStore.messageTop(contactMark)
          } else if (type === 1) {
            // 用户进入
            chatStore.online(contactMark)
            chatStore.messageTop(contactMark)
          } else if (type === 2) {
            // 用户退出
            chatStore.offline(contactMark)
          }

        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  chatStore.sockets.onclose = () => {
    console.log("the webSocket is closed")
    currentUserOnline.value = false
    uploadUrl.value = getUploadUrl()
    chatStore.resetUrl()
  }





})

onUnmounted(()=> {
  console.log("onUnmounted")
  chatStore.close()
  chatStore.clearFriendList()
})



</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  margin: auto;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.icon{
  width:20px;
  height:20px;
  cursor: pointer;
}


.box {
  position: relative;
}

.hang{
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
}
</style>