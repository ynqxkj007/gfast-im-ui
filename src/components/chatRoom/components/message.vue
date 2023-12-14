<template>
  <div>
    <template v-if="message.mType === 'txt'">{{message.message}}</template>
    <template  v-if="message.mType === 'img'">
      <div class="message-img-box">
        <img :src="buildImgUrl(message.message)"  alt=""/>
      </div>
    </template>
  </div>
</template>

<script>

import {buildImgUrl} from '../js/utils'

export default {
  name: "myMessage",
  props: {
    // 当前用户
    message: {
      type: Object,
      default() {
        return {
          "from": "",
          "to": "",
          "fromUserInfo": {
            "uid": "",
            "nickname": "",
            "avatar": ""
          },
          "contactMark":"",
          "message": "",
          "time": "",
          "mType": "",
          "fileSize": 0,
          "fileName": ""
        }
      }
    },
    baseUrl:{
      type:String,
      default:'',
    }
  },
  data() {
    return {

    }
  },
  methods:{
    buildImgUrl(path) {
      return buildImgUrl(path,this.baseUrl)
    }
  }

}
</script>


<style scoped>
  .message-img-box{
    max-width:480px;
    overflow:hidden;
    //max-height:430px;
  }

  .message-img-box img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
</style>