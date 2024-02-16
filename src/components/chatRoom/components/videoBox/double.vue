<template>
  <div class="video-box">
    <video class="video-big" ref="currentVideo" width="450" height="210" style="background: #000;" autoplay muted playsinline></video>
    <div class="video-little" ref="videos"></div>
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
      video: { width: 450, height: 200 },
      aspectRatio: { ideal: 9 / 16 } // 16:9 比例
    })
    .then(stream => {
        currentVideo.value.srcObject = stream
        signalingStore.close()
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
          //console.log("signaling onmessage:" + evt.data);
          try {
            const content = JSON.parse(evt.data)
            const {from, msg} =  content
            switch(msg.type) {
              case 'join' : {
                const {pc, video} = signalingStore.createRTC(stream, from, (remote, event) => {
                  if(remote) {
                    remote.video.srcObject = stream
                    currentVideo.value.srcObject = event.streams[0]
                  }
                })
                initVideoElement(video)
                video.width = 150;
                video.height = 70;
                videos.value.append(video)
                pc.createOffer().then(offer => {
                  pc.setLocalDescription(offer)
                  console.log(`join: ${from}, send offer:`, offer)
                  signalingStore.sendMsg(from, {type:'offer',offer})
                })
                break
              }
              case 'leave': {
                console.log(`leave: ${from}, receive leave:`, msg)
                const r = signalingStore.getRemote(from)
                console.log(r)
                if (r) {
                  signalingStore.closeRemotes(from)
                  videos.value.removeChild(r.video)
                  currentVideo.value.srcObject = stream
                }
                break
              }
              case 'offer' : {
                console.log(`from: ${from}, receive offer:`, msg)
                const {pc, video} = signalingStore.createRTC(stream, from, (remote, event) => {
                  if(remote) {
                    remote.video.srcObject = stream
                    currentVideo.value.srcObject = event.streams[0]
                  }
                })
                initVideoElement(video)
                video.width = 150;
                video.height = 70;
                videos.value.append(video)
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
    })
    .catch(e=> {
      console.error("getUserMedia error:", e)
    })

const initVideoElement = (el) => {
  el.addEventListener('click', event => {
    //console.log(event)
    const tempSrc = el.srcObject;
    el.srcObject = currentVideo.value.srcObject
    currentVideo.value.srcObject = tempSrc
  })

}
</script>

<style scoped>
.video-box{
  display: flex;
  flex-direction:column;
}

.video-big {

}
.video-little {
  margin-top:10px;
}
</style>