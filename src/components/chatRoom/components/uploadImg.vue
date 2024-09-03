<template>
  <img @click="uploadImgHandle" ref="imgRef" src="../img/upload_img.png" class="icon"/>
</template>

<script>
const uploadImgFileInputId = "upload-img-fileinput123"
export default {
  name: "myUploadImg",
  props:{
    uploadUrl:{
      type:String,
      default:'',
    }
  },
  methods:{
    uploadImgHandle() {
      if (!this.uploadUrl) {
        console.error("uploadUrl必须")
        return
      }
      let fileInput =  document.getElementById(uploadImgFileInputId)
      fileInput = document.createElement('input')
      fileInput.type = 'file';
      fileInput.accept = '.jpg,.png,.gif';
      fileInput.id = uploadImgFileInputId;
      fileInput.style.display = 'none';
      fileInput.onchange = (event) => {
        this.handleFileSelect(event, ()=> {
          fileInput.parentNode.removeChild(fileInput)
        });
      };
      window.document.body.appendChild(fileInput)
      fileInput.click()
    },

    handleFileSelect(event, done){
      const file = event.target.files.length > 0 ? event.target.files[0] : null
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.uploadUrl, true);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            //console.log(xhr)
            const responseObj = JSON.parse(xhr.responseText)
            try {
              this.$emit("success", responseObj)
            }catch (e) {
              console.log(e)
            }
          } else if(xhr.readyState === 4) {
            console.log(`上传失败: ${xhr.statusText}`);
          }
          if(typeof done === 'function') done()

        };

        xhr.send(formData);
      } else {
        alert("未选择文件")
        console.log('未选择文件');
      }
    }


  }

}
</script>

<style scoped>
.icon{
  width:20px;
  height:20px;
  cursor: pointer;
}
</style>