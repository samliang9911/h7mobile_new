<template>
	<view :class="{'fixed-button':true,action}" @click="onActive">
		<up-icon name="plus" color="#ffffff" size="25" />
		<view class="button" :style="{width:width+'px',display:action?'':'none'}">
			<view class="button-content">
				 <view v-for="item in button" @click="onButton(item)">
				 	<up-icon :name="item.icon" color="rgb(0, 170, 255)" size="15" />
				 	<text>{{ item.label }}</text>
				 </view>
			</view>
		</view>
	</view>
</template>

<script>
	import {getCurrentInstance, ref} from 'vue'
	const button = defineModel<[]>({ default: [] })
	console.log('button ',button)
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

<style>
	  .fixed-button {
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
</style>