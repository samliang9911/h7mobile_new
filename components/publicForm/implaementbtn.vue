<template>
	<view class="btnContent">
		<view class="btn" style="justify-content: center">
			<view @tap="implement(btnValueOne)" class="btnone wave-ripple" :style="[{
				background:backGround,
				width:single || approval ? '90%':'45%',
				marginRight: '10rpx',
			}]">
				<text :style="[{
					fontSize:fontSize+'rpx',
					color:coloUr,
				}]">{{btnValue(btnValueOne)}}</text>
			</view>
			<view @tap="implement(btnValueTwo)" class="btnone wave-ripple" v-if="approval ? false : !single" :style="[{
				background:backGroundTwo,
				marginLeft: '10rpx',
			}]">
				<text :style="[{
					fontSize:fontSize+'rpx',
					color:coloUr,
				}]">{{btnValue(btnValueTwo)}}</text>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import {
		withDefaults,
	} from "vue"
	interface Props {
		btnValueOne ? : String, //按钮标题
			btnValueTwo ? : String, //按钮标题
			coloUr ? : String, //按钮字体颜色
			fontSize ? : String, //按钮字体
			backGround ? : String, //背景颜色
			backGroundTwo ? : String, //背景颜色
			single ? : Boolean, //单按钮还是双按钮
			approval ? : String, //审批
	}
	interface Emit {
		(e: "implement", event ? : String): void;
	}
	let emit = defineEmits < Emit > ();
	const props = withDefaults(defineProps < Props > (), {
		btnValueOne: () => "按钮1",
		btnValueTwo: () => "按钮2",
		coloUr: () => "#ffffff",
		fontSize: () => "30",
		backGround: () => "#2979ff",
		backGroundTwo: () => "#2979ff",
		single: () => true,
		approval: () => ""
	})
	let implement = (item: String) => {
		emit("implement", props.approval ? 'approval' : item);
	}
	let btnValue = (value: String) => {
		if (props.approval) {
			return "审批";
		} else {
			if (value.toLowerCase() === "c") {
				return "保存";
			} else if (value.toLowerCase() === "d") {
				return "提交";
			} else if (value.toLowerCase() === "b") {
				return "启动流程";
			}
		}

		return "\n";
	}
</script>

<style lang="scss" scoped>
	.btnContent {
		width: 100%;
		position: fixed;
		bottom: 2%;
		z-index: 12;
		transition: all .8s;
		-webkit-transition: all .8s;
		-ms-transition: all .8s;
		-moz-transition: all .8s;
		-o-transition: all .8s;

		.btn {
			width: 100%;
			display: flex;
			justify-content: space-between;

			.btnone {
				background-color: red;
				width: 45%;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 20rpx;
				border-radius: 10rpx;
			}
			.wave-ripple {
					position: relative;
					overflow: hidden;
				}
			
			.wave-ripple::before {
				content: "";
				background: #b9c6ff;
				position: absolute;
				width: 750rpx;
				height: 750rpx;
				left: calc(50% - 375rpx);
				top: calc(50% - 375rpx);
				opacity: 0;
				margin: auto;
				border-radius: 50%;
				transform: scale(1);
				transition: all 0.5s ease-in-out;
			}
		
			.wave-ripple:active::before {
				transform: scale(0);
				opacity: 1;
				transition: 0s;
			}
		}

	}
</style>
