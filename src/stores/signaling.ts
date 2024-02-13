import {defineStore} from "pinia";
import Observer from "/@/utils/websocket/Observer.js";
import {Session} from "/@/utils/storage";

const baseUrl = import.meta.env.VITE_API_URL
const wsUrl = baseUrl + "api/v1/chat/signalingWs"
export const useSignalingStore = defineStore("signaling", {
    state: () => {
        return {
            observer: undefined as any,               //  Observer
            sockets: undefined as any,
            roomId : "",            // 房间号
            remotes: {},
        }
    },
    actions:{

        getRemote(key) {
            if (this.remotes[key]) {
                return this.remotes[key]
            }
        },
        closeRemotes(key) {
            if (this.remotes[key]) {
                this.remotes[key].pc.close()
                delete this.remotes[key]
            }
        },
        clearRemotes () {
            for (const key in this.remotes) {
                if (this.remotes.hasOwnProperty(key)) {
                    this.remotes[key].pc.close()
                }
            }
            this.remotes = {}
        },
        createRTC (stream:any, id:string) {
            const pc = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: 'stun:stun.l.google.com:19302'
                    }
                ]
            })
            // 获取本地网络信息，并发送给通信方
            pc.addEventListener('icecandidate', event => {
                console.log("send icecandidate : ", event)
                if (event.candidate) {
                    // 发送自身的网络信息到通信方
                    this.sendMsg(id, {
                        type: 'candidate',
                        candidate: {
                            sdpMLineIndex: event.candidate.sdpMLineIndex,
                            sdpMid: event.candidate.sdpMid,
                            candidate: event.candidate.candidate
                        }
                    })
                }
            })

            // 有远程视频流时，显示远程视频流
            pc.addEventListener('track', event => {
                console.log(`track`)
                this.remotes[id].video.srcObject = event.streams[0]
            })

            // 添加本地视频流到会话中
            stream.getTracks().forEach(track => pc.addTrack(track, stream))

            // 用于显示远程视频
            const video = document.createElement('video')
            video.setAttribute('autoplay', true)
            video.setAttribute('playsinline', true)
            video.style.backgroundColor = 'black';
            const client = {
                pc,
                video
            }

            this.remotes[id] = client
            return client
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
        sendMsg (toId, msg) {
            this.sockets.sendObj({
                from: String(Session.get('userInfo').id),
                to: toId,
                msg
            })
        },
        setRoomId(roomId:string) {
            this.roomId = roomId
        },
        getWsUrl() {
            return wsUrl + "?token=" + encodeURIComponent(Session.get('token')) + "&roomId=" + this.roomId
        },
        resetUrl () {
            this.observer.setUrl(this.getWsUrl())
        },
        close() {
            if (this.observer) {
                this.observer.close()
            }
        }
    }
})