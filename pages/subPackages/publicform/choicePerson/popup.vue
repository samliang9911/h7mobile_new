<template>
  <view class="popup-box">
    <view class="header">
      <view class="title">
        <up-badge is-center size="mini" type="success" :count="visibleData.length"></up-badge>
        <text style="font-weight: 900;color: #3c9cff;">已选择</text>
      </view>
      <view style="margin-right: 10rpx;width:150rpx">
        <up-button type="warning" plain ripple ripple-bg-color="#2979ff"
        size="mini" @click="clearUnselected">
          清除未选中
        </up-button>
      </view>
      <view style="width:120rpx;">
        <up-button type="error" plain ripple ripple-bg-color="#2979ff" size="mini"
        :custom-style="{fontSize:'20rpx'}" @click="clearAll">
          清除所有
        </up-button>
      </view>
    </view>
    <scroll-view scroll-y="true" class="content" >
      <up-empty text="暂无已选中" mode="list" v-if="!visibleData.length"></up-empty>
      <up-checkbox-group v-model="checkboxValue1" placement="column" @change="checkboxChange">
        <up-checkbox v-for="item in visibleData" :key="item.OID" :label="item.Name" :name="item.OID">
        </up-checkbox>
      </up-checkbox-group>
		</scroll-view>
  </view>
</template>
<script setup>
import { ref,reactive, onMounted } from 'vue';
const data = defineModel();
const emit = defineEmits(['delete']);
const visibleData = ref([]); // 当前显示的数据
const batchSize = 1; // 每批渲染的数量
const checkboxValue1 = reactive([])
onMounted(() => {
  visibleData.value = []
  loadBatchData();
  data.value.forEach(e => {
    checkboxValue1.push(e.OID)
  });
});
const checkboxChange = (e)=>{
  checkboxValue1.length = 0
  checkboxValue1.push(...e)
}
const clearUnselected = () => {
  let notSel = data.value.filter(e=>!checkboxValue1.includes(e.OID));
  emit('delete',JSON.parse(JSON.stringify(notSel)))
  let index = notSel.length;
  for (let i=0;i<index;i++) {
    data.value.splice(data.value.findIndex(e=>e.OID===notSel[i].OID),1)
    visibleData.value.splice(visibleData.value.findIndex(e=>e.OID===notSel[i].OID),1)
  }
}
const clearAll = () => {
  emit('delete',JSON.parse(JSON.stringify(data.value)))
  checkboxValue1.length = 0
  data.value = []
  visibleData.value = []
}
// 加载下一批数据
const loadBatchData = () => {
  let index = 0;
  const batchRender = () => {
    const batch = data.value.slice(index, index + batchSize);
    visibleData.value.push(...batch);
    index += batchSize;

    if (index < data.value.length) {
      setTimeout(batchRender, 0); // 延迟渲染下一批
    }
  };

  batchRender();
};
</script>
<style lang="scss" scoped>
.popup-box{
  height: 100%;
  width: 100%;
  padding-left:30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .header{
    height: 70rpx;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    .title{
      position: absolute;
      z-index: 2;
      left: 50rpx;
    }
  }
  .content{
    overflow: hidden;
    flex: 1;
    .popup-item{
      height: 60rpx;
    }
  }
}
</style>