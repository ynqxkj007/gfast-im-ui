import { defineStore } from 'pinia'
import Observer  from '/@/utils/websocket/Observer.js'
import { Session } from '/@/utils/storage';
import {getUserList, getOnlineUserList, getRoomList} from "/@/api/chat/chat";

interface iMessage {
    from: string,
    to: string,
    message: string,
    time: string,
    mType: string,
    fileSize: number,
    fileName: string,
}

interface iUser {
    id: string,
    avatar: string,
    username: string,
    new_join?: boolean,
}

interface iFriend extends iUser{
    unread: number,
    online: boolean,
    isRoom: boolean,
    roomUsers: iUser[] | undefined,
    bequiet:boolean,
    roomInform: string,
    lastMessage: iMessage
}

const baseUrl = import.meta.env.VITE_API_URL
const wsUrl = baseUrl + "api/v1/chat/ws"
import chatDefaultFace from '/@/components/chatRoom/img/default_avatar.png'
import groupChatFace from '/@/components/chatRoom/img/group_chat.png'
import {buildImgUrl} from '/@/components/chatRoom/js/utils.js'
import avatarBuilder from '/@/components/chatRoom/js/avatar.js'



export const useChatStore = defineStore('chat', {
    state: () => {
        return {
            observer: undefined as any,               //  Observer
            sockets: undefined as any,
            friendList:[] as iFriend[],
            chatDefaultFace: chatDefaultFace, // 默认头像
        }
    },
    getters:{
        unreadTotal: (state)=> {
            return state.friendList.reduce((total, item)=> {
                total += item.unread
                return total
            },0)
        }
    },
    actions: {
        // 群成员退出
        removeRoomUser(id:string, roomUsers:iUser[]) {
            if (!id ||!roomUsers) {
                return
            }
            let room = this.friendList.find((friend:iFriend)=> {
                return friend.id === id
            })
            roomUsers.forEach((item:iUser)=> {
                if (room && room.roomUsers) {
                    let index = room.roomUsers.findIndex((user:iUser)=> {
                        return user.id === item.id
                    })
                    if (index > -1) {
                        room.roomUsers.splice(index, 1)
                    }
                }
            })
        },
        // 新增群聊成员
        addRoomUser(id:string, name:string, roomUsers:iUser[]) {
            if (!id || !roomUsers) {
                return
            }
            let room = this.friendList.find((item:iFriend)=> {
                return item.id === id
            })
            if (room && room.roomUsers) {
                room.roomUsers.push(...roomUsers.filter(item=> item.new_join))
            } else {
                this.addRoom(id, name, roomUsers)
            }
        },
        // 新增群聊
        async addRoom(id:string, name:string, roomUsers:iUser[], param:{ [key: string]: any;} = {}) {
            if (!id) {
                return
            }
            //console.log(roomUsers)
            const groupAvatar = await avatarBuilder.create(roomUsers.slice(0, 9).map((item:iUser)=> {
                return item.avatar
            }))

            // console.log( id, name, roomUsers)
            this.friendList.unshift({
                id: id,
                avatar: groupAvatar || groupChatFace,
                username: name,
                unread: 0,
                online:false,
                isRoom: true,
                roomUsers:roomUsers,
                bequiet: false,
                roomInform: param.roomInform || "",
                lastMessage:{
                    from: "",
                    to: "",
                    message: "",
                    time: "",
                    mType: "",
                    fileSize: 0,
                    fileName: "",
                }
            })
        },
        // 清空好友列表
        clearFriendList () {
            this.friendList = []
        },
        // 初始化群聊列表
        initRoom () {
            return getRoomList({}).then((res:any)=> {
                // console.log(res)
                const {code , message, data} = res
                if (code === 0) {
                    const {list} = data
                    if (Array.isArray(list)) {
                        list.forEach((item:any)=> {
                            const {identify, name, messageRoomMemberSuperList, inform} = item
                            const userList:iUser[] = []
                            if (Array.isArray(messageRoomMemberSuperList)) {
                                messageRoomMemberSuperList.forEach((item:any)=> {
                                    const {sysUserSuper} = item
                                    if (sysUserSuper) {
                                        userList.push({
                                            id: sysUserSuper.id + "",
                                            avatar: sysUserSuper.avatar ? buildImgUrl(sysUserSuper.avatar, baseUrl) : this.chatDefaultFace,
                                            username: sysUserSuper.userNickname,
                                        })
                                    }
                                })
                            }
                            this.addRoom(identify, name, userList, {roomInform:inform})
                        })
                    }
                } else {
                    console.error(message)
                }
            })
        },
        //  初始化好友列表
        initFriendList(opts:any) {
            return Promise.all([getUserList({...opts}).then((res:any)=>{
                const {code, message, data} = res
                let friendList:iFriend[] = []
                if (code === 0) {
                    if (Array.isArray(data.userList)) {
                        friendList = data.userList.map((item:any)=> {
                            return {
                                id: item.id + "",
                                avatar: item.avatar ? buildImgUrl(item.avatar, baseUrl) : this.chatDefaultFace,
                                username:item.userNickname,
                                unread:0,          // 未读消息数量
                                online:false,      // 是否在线
                                isRoom: false,
                                bequiet: false,     // 消息免打扰
                                roomInform:"",
                                lastMessage:{
                                    from: "",
                                    to: "",
                                    message: "",
                                    time: "",
                                    mType:'txt',       // 消息类型：file | img | txt
                                    fileSize:0,         // 文件大小
                                    fileName: '',       // 文件名称
                                }
                            }
                        })
                    }
                } else {
                    console.error(message)
                }
                return friendList
            }), getOnlineUserList().then((res:any)=> {
                const {code, data, message} = res
                if (code === 0 && Array.isArray(data.userList)) {
                    return data.userList
                } else {
                    message && console.error(message)
                    return []
                }
            })]).then(res => {
                const [friendList, onlineUser] = res
                if (friendList.length > 0 ) {
                    this.friendList.push(...friendList)
                }
                if (onlineUser.length > 0) {
                    onlineUser.forEach((item:any)=> {
                        this.online(item.uid)
                        this.messageTop(item.uid)
                    })
                }
            })
        },
        // 在线
        online(uid:string) {
            const user = this.getUser(uid)
            if (user) {
                user.online = true
            }
        },
        // 离线
        offline(uid:string) {
            const user = this.getUser(uid)
            if (user) {
                user.online = false
            }
        },
        // 查找好友
        getUser (uid:string):iFriend | undefined {
            for (let i = 0; i < this.friendList.length; i++) {
                if (this.friendList[i].id === uid) {
                    return this.friendList[i]
                }
            }
            return undefined
        },

        setLastMessageAndAddMsgNumber (uid:string,message:iMessage) {
            const user = this.getUser(uid)
            if (user) {
                user.lastMessage = message
                user.unread+=1
            }
        },

        setLastMessage (uid:string, message:iMessage) {
            const user = this.getUser(uid)
            if (user) {
                user.lastMessage = message
            }
        },
        clearMsgNumber(uid:string) {
            const user = this.getUser(uid)
            if (user) {
                user.unread = 0
            }
        },
        addMsgNumber(uid:string) {
            const user = this.getUser(uid)
            if (user) {
                user.unread+=1
            }
        },
        removeFriend (uid:string) {
            let index = -1
            for (let i = 0; i < this.friendList.length; i++) {
                if (this.friendList[i].id === uid) {
                    index = i
                    break
                }
            }
            if (index > -1) {
                this.friendList.splice(index, 1)
            }
        },
        messageTop(uid:string) {
            let index = -1

            for (let i = 0; i < this.friendList.length; i++) {
                if (this.friendList[i].id === uid && !this.friendList[i].bequiet) {
                    index = i
                    break
                }
            }

            if (index > -1) {
                const f = this.friendList.splice(index, 1)
                this.friendList.unshift(f[0])
            }
        },
        connect (opts:any = {}) {
            const url = this.getWsUrl()
            let vm = this
            this.observer = new Observer(url, opts)
            this.sockets = new Proxy({
                send: (data:any) => {
                    if (this.observer) {
                        this.observer.WebSocket.send(data)
                    }
                },
                sendObj:(data:any) => {
                    if (this.observer) {
                        this.observer.WebSocket.sendObj(data)
                    }
                },
                removeListener: (label:string, callback:any) => {
                    if (this.observer) {
                        this.observer.emitter.removeListener.apply(this.observer.emitter, label, callback, vm)
                    }
                }

            }, {
                set(target:any, key:string | symbol, value:any) {
                    vm.observer.emitter.addListener(key, value, vm)
                    target[key] = value
                    return true
                }
            })
        },
        getWsUrl() {
            return wsUrl + "?token=" + encodeURIComponent(Session.get('token'))
        },
        resetUrl () {
            this.observer.setUrl(this.getWsUrl())
        },
        close() {
            this.observer.close()
        }
    },
})


