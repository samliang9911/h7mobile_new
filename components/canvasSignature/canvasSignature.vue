<template>
	<view style="width: 100%;">
		<view class="title">请在下面输入签名：</view>
		<canvas class="mycanvas" canvas-id="mycanvas" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"></canvas>
		<view class="footer">
			<view class="left" @click="finish">完成</view>
			<view class="right" @click="clear">清除</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import {
		ref,
		reactive,
		getCurrentInstance
	} from "vue"
	import {
		onLoad
	} from "@dcloudio/uni-app"
	let {
		proxy
	} = getCurrentInstance() as any;
	let x = ref(20);
	let y = ref(20);
	let ctx = ref(); //绘图图像
	let points = reactive([]); //路径点集合
	onLoad(() => {
		ctx.value = uni.createCanvasContext("mycanvas", proxy); //创建绘图对象
		//设置画笔样式
		ctx.value.lineWidth = 4;
		ctx.value.lineCap = "round"
		ctx.value.lineJoin = "round"
	});
	//触摸开始，获取到起点
	let touchstart = (e) => {
		let startX = e.changedTouches[0].x;
		let startY = e.changedTouches[0].y;
		let startPoint = {
			X: startX,
			Y: startY
		};

		/* **************************************************
			#由于uni对canvas的实现有所不同，这里需要把起点存起来
		 * **************************************************/
		points.push(startPoint);
		//每次触摸开始，开启新的路径
		ctx.value.beginPath();
	};

	//触摸移动，获取到路径点
	let touchmove = (e) => {
		let moveX = e.changedTouches[0].x;
		let moveY = e.changedTouches[0].y;
		let movePoint = {
			X: moveX,
			Y: moveY
		};
		points.push(movePoint); //存点
		let len = points.length;
		if (len >= 2) {
			draw(); //绘制路径
		}

	};

	// 触摸结束，将未绘制的点清空防止对后续路径产生干扰
	let touchend = () => {
		points = [];
	};

	/* ***********************************************
	#   绘制笔迹
	#	1.为保证笔迹实时显示，必须在移动的同时绘制笔迹
	#	2.为保证笔迹连续，每次从路径集合中区两个点作为起点（moveTo）和终点(lineTo)
	#	3.将上一次的终点作为下一次绘制的起点（即清除第一个点）
	************************************************ */
	let draw = () => {
		let point1 = points[0]
		let point2 = points[1]
		points.shift()
		ctx.value.moveTo(point1.X, point1.Y)
		ctx.value.lineTo(point2.X, point2.Y)
		ctx.value.stroke()
		ctx.value.draw(true)
	};

	//清空画布
	let clear = () => {
		uni.getSystemInfo({
			success: (res) => {
				let canvasw = res.windowWidth;
				let canvash = res.windowHeight;
				ctx.value.clearRect(0, 0, canvasw, canvash);
				ctx.value.draw(true);
			},
		})
	};
	const emit = defineEmits(["signature"]);
	//完成绘画并保存到本地
	let finish = () => {
		let query = uni.createSelectorQuery().in(proxy).select('#mycanvas')
		uni.canvasToTempFilePath({
			canvasId: 'mycanvas',
			success: (res) => {
				let path = res.tempFilePath;
				emit('signature', path);
			},
			fail: (res) => {
				// console.log("失败回调")
			}
		}, proxy);
	}
</script>

<style>
	.title {
		height: 50upx;
		line-height: 50upx;
		font-size: 16px;
	}

	.mycanvas {
		width: 100%;
		height: calc(100vh - 800upx);
		background-color: #ECECEC;
	}

	.footer {
		font-size: 16px;
		height: 150upx;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.left,
	.right {
		line-height: 100upx;
		height: 100upx;
		width: 250upx;
		text-align: center;
		font-weight: bold;
		color: white;
		border-radius: 5upx;
	}

	.left {
		background: #007AFF;
	}

	.right {
		background: orange;
	}
</style>
