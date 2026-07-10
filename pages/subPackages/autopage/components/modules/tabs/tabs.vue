<template>
  <view v-if="data[0]" class="tabs">
    <view class="tabs-wrapper">
	  <!-- <up-tabs :list="list" keyName="title" @change="e=>current=data.find(o=>o.guid==e.guid)!"/> -->
      <up-tabs :list="list" keyName="title" @change="handleTabChange"/>
    </view>
    <view class="tabs-content">
      <view v-if="current.loading" class="loading">
        <up-loading-icon mode="circle" color="#3c9cff" size="36"/>
      </view>
      <components v-model="current.data" v-bind="current" :key="current.guid" :component="current"/>
    </view>
    <!-- <tabButton v-model="fixed" fixed :component="current" v-if="fixed.length" :key="current.guid" /> -->
	<view :class="{'fixed-button':true,action}" @click="onActive">
		<up-icon name="plus" color="#ffffff" size="25" />
		<view class="button" :style="{width:width+'px',display:action?'':'none'}">
			<view class="button-content">
				 <tabButton v-model="button" :component="current" v-if="button.length" :key="current.guid"/>
			</view>
		</view>
	</view>
  </view>
</template>
<script lang="ts" setup>
/* import {ref,computed } from 'vue' */
import { ref, computed, provide ,getCurrentInstance} from 'vue'
import tabButton from './button.vue'
import {CompConfig} from '@/api/autopage/indexTypes'
import components from '@/pages/subPackages/autopage/components'
const data = defineModel<CompConfig[]>({default:[]})
provide('pageComponents', data)
const {config} = defineProps<{config:{guid:string,button:any[],fixed?:boolean}[]}>()
const current = ref<CompConfig>(data.value[0])
const list = computed(()=>data.value.map(o=>({guid:o.guid,title:o.title})))
const fixed = computed(()=>config.find(e=>e.guid==current.value.guid&&e.fixed)?.button||[])
//保存按钮
let saveButton :any;
const button = computed(()=>{
	let result = config.find(e=>e.guid==current.value.guid&&!e.fixed)?.button||[]
	return result
})

const handleTabChange = (e: any) => {
  const found = data.value.find(o => o.guid === e.guid)
  if (found) {
    current.value = found  // 更新 current.value
	console.log('current ',current.value)
  }
}
/**悬浮操作按钮 */
const action = ref(false)
/**悬浮按钮内容宽度 */
const width = ref(0)
const { proxy } = getCurrentInstance()!
/**悬浮按钮开关 */
function onActive() {
	if (action.value) width.value = 0
	else getRect('.button-content').then(e => width.value = e.width)
	action.value ? setTimeout(() => action.value = false, 280) : (action.value = true)
}
/**获取元素数值 */
function getRect(select, time = 0) : Promise<{ width : number, height : number }> {
	return new Promise((res) => {
		setTimeout(() => {
			const query = uni.createSelectorQuery().in(proxy)
			query.select(select).boundingClientRect((rect : any) => res(rect)).exec()
		}, time)
	})
}
</script>
<style lang="scss" scoped>
.tabs{
  position: relative;
  height: 100%;
  
  &>.tabs-content{
    height: calc(100% - 104px);
    overflow: auto;
    position: relative;
    &>.loading{
      position: absolute;
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #b1b1b11c;
      z-index: 1;
      mask-image: radial-gradient(ellipse at center, black 50%, transparent 100%);
    }
  }
  
  
  &>.fixed-button {
  	position: fixed;
  	right: 20rpx;
  	bottom: 100rpx;
  	height: 80rpx;
  	width: 80rpx;
  	border-radius: 50%;
  	background-color: #4395ff;
  	display: flex;
  	justify-content: center;
  	align-items: center;
  
  	&>.u-icon {
  		transition: transform 0.3s;
  	}
  
  	&>.button {
  		height: 100%;
  		transition: width 0.3s;
  		position: absolute;
  		right: 40rpx;
  		overflow: hidden;
  		border-right: 0;
  		border-radius: 40rpx 0 0 40rpx;
  		box-shadow: -5px 0 7px 1px rgba(0, 0, 0, 0.2);
  		padding: 0 35rpx 0 10rpx;
  		display: flex;
  		justify-content: center;
  		align-items: center;
  
  		&>.button-content {
  			display: inline-flex;
  
  			&>view {
  				display: inline-flex;
  				padding: 0 7rpx;
  				color: #606266;
  				font-size: 18rpx;
  
  				&>text {
  					white-space: nowrap;
  				}
  			}
  		}
  	}
  }
  
  .fixed-button.action>.u-icon {
  	transform: rotate(225deg)
  }
  
}
</style>