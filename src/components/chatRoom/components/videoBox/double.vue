<template>
  <div class="video-box">
    <video ref="currentVideo" autoplay muted playsinline></video>
    <div ref="videos"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {generateUniqueValue} from '/@/components/chatRoom/js/utils'
import {useSignalingStore} from "/@/stores/signaling";
const signalingStore = useSignalingStore()
const currentVideo = ref(null)
const videos = ref(null)

const props = defineProps({
  roomId: {
    type: String,
    default: generateUniqueValue("roomId_")
  }
})

const emit = defineEmits(['success'])

navigator.mediaDevices
    .getUserMedia({
      audio: true, // 本地测试防止回声
      video: { width: 600, height: 300 }
    })
    .then(stream => {
        currentVideo.value.srcObject = stream
        signalingStore.setRoomId(props.roomId)
        signalingStore.connect({
          reconnection:true,
          reconnectionDelay:3000,
          format:'json',
        })

        signalingStore.sockets.onopen = () => {
          console.log("signaling open");
          emit('success', props.roomId)
        }

        signalingStore.sockets.onmessage = (evt) => {
          console.log("signaling onmessage:" + evt.data);
          try {
            const content = JSON.parse(evt.data)
            const {from, msg} =  content
            switch(msg.type) {
              case 'join' : {
                // 有新的人加入就重新设置会话，重新与新加入的人建立新会话
                const pc = signalingStore.createRTC(stream, from).pc
                pc.createOffer().then(offer => {
                  pc.setLocalDescription(offer)
                  console.log(`join: ${from}, send offer:`, offer)
                  signalingStore.sendMsg(from, {type:'offer',offer})
                })
                break
              }
              case 'leave': {
                console.log(`leave: ${from}, receive leave:`, msg)
                if (signalingStore.remotes[from]) {
                  // signalingStore.remotes[from].pc.close()
                  // videos.value.removeChild(signalingStore.remotes[from].video)
                  // delete signalingStore.remotes[from]
                  signalingStore.closeRemotes(from)
                  videos.value.removeChild(signalingStore.remotes[from].video)
                }
                break
              }
              case 'offer' : {
                console.log(`from: ${from}, receive offer:`, msg)
                const pc = signalingStore.createRTC(stream, from).pc
                pc.setRemoteDescription(new RTCSessionDescription(msg.offer))
                pc.createAnswer().then(answer => {
                  pc.setLocalDescription(answer)
                  signalingStore.sendMsg(from, {type:'answer', answer})
                })
                break
              }
              case 'answer' : {
                console.log(`from: ${from}, receive answer:`, msg)
                const pc = signalingStore.remotes[from].pc
                pc.setRemoteDescription(new RTCSessionDescription(msg.answer))
                break
              }
              case 'candidate' : {
                console.log(`from: ${from}, receive candidate:`, msg)
                const pc = signalingStore.remotes[from].pc
                pc.addIceCandidate(new RTCIceCandidate(msg.candidate))
                break
              }
              case 'error':{
                console.error("server err:", msg.info)
                signalingStore.close()
                break
              }

              case 'info':{
                console.log(msg.info)
                break
              }
              default :
                console.log("default", content)
                break
            }
          } catch (e) {
            console.error("signalingStore.sockets.onmessage error:", e)
          }

        }

        signalingStore.sockets.onclose = (event) => {
          console.log("signaling close:", event);
        }

        signalingStore.sockets.onerror = (event) => {
          console.log("signaling error:", event);
        }

        // 向目标发出邀请
    })
</script>

<style scoped>
.video-box{

}
</style>