<template>
  <div class="notice">
    <span class="time" v-if="showTime">{{ showTime }}</span>
    <span class="content"  v-if="message.isSys === 1">"{{message.message}}"</span>
  </div>
</template>
<script>
import { shortTime} from '../../js/utils'
import noticeTime from "/@/components/chatRoom/components/notice/noticeTime";

export default {
  name: "myNotice",
  props: {
    message :{
      type: Object,
      default: () => {
        return {
          "from": "",
          "to": "",
          "fromUserInfo": {
            "uid": "",
            "nickname": "",
            "avatar": ""
          },
          "contactMark":"",
          "isSys": 0,
          "type": 0,
          "message": "",
          "time": "",
          "mType": "",
          "fileSize": 0,
          "fileName": ""
        }
      }
    }
  },
  computed: {
    showTime() {
      if (this.message.isSys === 1) {
        return ""
      }
      const t = new Date(this.message.time)
      if (!noticeTime.checkInterval(this.message.contactMark, t, 3600)) {
        return ""
      }
      return shortTime(t)
    }
  },
  data() {
    return {

    }
  },
}
</script>



<style scoped>
.notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size:12px;
}

.notice .time {
  margin: 5px 0;
  border-radius: 5px;
  height:22px;
  line-height: 22px;
  padding: 0 5px;
  background-color:#DADADA;
  color: #fff;

}

.notice .content {
  margin: 5px 0;
  color:#999;
}
</style>