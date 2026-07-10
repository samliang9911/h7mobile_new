<template>
  <view class="box">
    <view class="card">
      <view class="card-title">
        <view @click="active=0" :class="{active:!active}">
          <text>费用报销</text>
        </view>
        <view @click="active=1" :class="{active}">
          <text>流程</text>
        </view>
      </view>
      <render name="row" v-model="data" v-show="!active"/>
    </view>
    <up-modal :show="modalShow" mask-close-able title="页面信息错误" confirmText="复制错误"
     @confirm="confirm" width="90vw" showCancelButton @cancel="modalShow=false" buttonReverse>
        <view style="width: 90vw;overflow: auto;">
          {{ modalContent }}
        </view>
    </up-modal>
    <view class="loading" v-if="loading">
        <up-loading-icon mode="circle" color="#3c9cff" size="60"/>
    </view>
  </view>
</template>
<script setup lang="ts">
import {ref,onErrorCaptured} from 'vue'
import { onLoad,onBackPress } from "@dcloudio/uni-app"
import render from './components'
import get from '@/api/autopage'
import {CompConfig} from '@/api/autopage/indexTypes'
const data = ref<CompConfig[]>([]);
const loading = ref(true);
// #ifdef H5
(window as any).data = data
// #endif
const component:CompConfig[] = []
Object.defineProperty(data,'component',{
    value:component,
    writable:true
})
/**是否显示当前页提示框 */
const modalShow = ref(false)
/**当前页提示框内容 */
const modalContent = ref('')
const active = ref(0)
onLoad(async params => {
  const Dev_PageConfigOID:string|undefined = params?.Dev_PageConfigOID
  if(!Dev_PageConfigOID)return error('请传入【Dev_PageConfigOID】参数')
  get(Dev_PageConfigOID,{component,operationOID:params?.operationOID}).then(e=>{
    data.value.push(...e)
    loading.value=false
  }).catch(e=>error(e.stack))
})
onBackPress((options)=>{
  // 判断是否是从返回键触发
  if (options.from === 'backbutton') {
    // 先跳转到form页面
    uni.redirectTo({
      url: '/pages/subPackages/form/form'
    });
    // 阻止默认返回行为
    return true;
  }
})
onErrorCaptured(error=>{
  modalShow.value = true
  modalContent.value = error.stack||''
})
/**抛错*/
function error(str:string){
  modalShow.value = true
  modalContent.value = str
  throw new Error(str)
}
function confirm(){
  modalShow.value = false
  // 复制文本到剪贴板
  uni.setClipboardData({
    data: modalContent.value,
    success: function() {
      uni.showToast({
        title: '复制成功',
        icon: 'none'
      })
    },
    fail: function(err) {
      console.log('复制失败', err);
      uni.showToast({
        title: '复制失败',
        icon: 'none'
      })
    }
  })
}
</script>
<style scoped lang="scss">
@import "https://www.pcm77.com/font/H7_PC/iconfont.css";
.box{
  box-sizing: border-box;
  padding: calc(var(--status-bar-height) + 8px) 10px 8px 10px;
  height: 100vh;
  .card-title{
    display: grid;
    grid-template-columns: auto auto;
    width: 60%;
    margin: auto;
    height: 30px;
    &>view{
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      transition: font-size 0.1s;
    }
    &>view>text::after{
      content: "";
      height: 0px;
      display: inline-block;
      width: 0%;
      background: #3d96f1;
      border-radius: 3px;
      margin-top: 7px;
      position: absolute;
      top: 25px;
      left: 60%;
      transition:width 0.3s,left 0.2s;
    }
    &>.active{
      color: #3c9cff;
      font-size: 19px;
    }
    &>.active>text{
      position: relative;
    }
    &>.active>text::after{
      content: "";
      height: 3px;
      display: inline-block;
      width: 60%;
      background: #3d96f1;
      border-radius: 3px;
      margin-top: 7px;
      position: absolute;
      top: 25px;
      left: 20%;
    }
  }
  .loading{
    position: absolute;
    height: 100%;
    width: 100%;
    top: calc(var(--status-bar-height) + 45px);
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    z-index: 2;
  }
}
</style>