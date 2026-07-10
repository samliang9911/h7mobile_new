<!-- 一人多岗 -->
<template>
	<view class="textareaContent" :style="{'borderBottom': underline ? '1rpx solid #f0f0f0' :'1rpx solid #f0f0f000'}" v-if="showComponent">
		<view class="textareaTitle">
			<view>
				<view style="display: flex;align-items: center;" @tap="setInfo">
					<up-icon style="margin-right: 8rpx;" :name="icontype" :color="showToast ? iconColorUr : '#8a8a8a64'" :size="iconSize"></up-icon>
					<text :style="[{fontSize:textSize}]">创建信息</text>
					<text :style="{display:showToast ? 'block' : 'none'}">
						<svg t="1658297792493" class="icon" viewBox="0 0 1024 1024" version="1.1" p-id="10551" data-spm-anchor-id="a313x.7781069.0.i12">
							<path d="M436.790468 965.130894l-0.435745-0.740766c-0.588255-1.024-1.612255-2.331234-2.505532-3.485958l-0.305021-0.501106c-0.457532-0.653617-1.002213-1.350809-1.350808-2.004426l-2.244085-3.246298-0.261447-0.305021-109.916596-169.199659a90.939915 90.939915 0 0 1-13.07234-67.126469 88.761191 88.761191 0 0 1 36.537191-57.017191 84.36017 84.36017 0 0 1 85.405958-6.209362v-282.798298C428.511319 323.322553 465.571404 283.234043 511.106723 283.234043c45.469957 0 82.595404 40.088511 82.595405 89.327659v90.852766a66.233191 66.233191 0 0 1 20.741446-3.377021c21.525787 0 41.875064 10.370723 56.211064 28.27983a69.828085 69.828085 0 0 1 37.670128-11.677958 68.629787 68.629787 0 0 1 42.485106 15.011404c9.477447 7.40766 17.429787 16.994043 23.203405 28.12732 6.710468-2.113362 13.682383-3.268085 20.676085-3.268086 42.37617 0 76.821787 40.088511 76.821787 89.32766v237.655149c0 52.572596-23.246979 110.679149-59.217702 148.109617-20.044255 20.850383-41.613617 32.397617-60.938894 32.397617H516.531745c-44.010213 0-63.771234-32.637277-79.741277-58.869106z m319.335489 14.946042c7.124426 0 24.837447-11.89583 42.201873-38.236596 18.628085-28.43234 29.30383-62.464 29.30383-93.249361V604.138213c0-19.978894-12.331574-37.321532-26.384341-37.321532a18.737021 18.737021 0 0 0-8.889191 2.287659v85.493107h-0.087149c-1.002213 14.336-12.505872 25.447489-26.384341 25.512851-13.922043 0-25.491064-11.329362-26.427915-25.491064h-0.043574V580.411915l-1.590468-20.828596c-1.372596-18.562723-13.246638-33.704851-26.515064-33.704851-5.882553 0-11.917617 3.268085-16.689021 8.714894v92.465021c-0.043574 15.12034-11.89583 27.342979-26.536851 27.386553-14.597447-0.065362-26.427915-12.288-26.47149-27.386553v-81.353532l-1.982638-9.499234c-3.268085-15.817532-14.248851-27.713362-25.425702-27.713362-7.625532 0-15.251064 5.403234-20.414638 14.18349l-0.849703 91.724255v34.489191c0 13.377362-10.610383 24.379915-23.552 24.379915h-5.730042c-13.006979 0-23.573787-11.002553-23.573787-24.379915V373.585702l-0.152511-9.717106c0-20.588936-14.466723-37.25617-32.354043-37.25617-17.865532 0-32.332255 16.710809-32.332255 37.25617l1.154724 267.547234c0.065362 0.806128 0.087149 1.634043 0.087149 2.461957v106.147404c-0.217872 13.660596-10.087489 25.098894-23.181618 26.841873a26.580426 26.580426 0 0 1-28.977021-19.913532l-9.956766-30.001021a36.014298 36.014298 0 0 0-22.985532-15.904681 35.077447 35.077447 0 0 0-27.103319 5.621106c-16.558298 11.50366-20.937532 34.685277-9.84783 51.810043l113.315405 174.145361 0.370383 0.47932 1.394383 2.135149 1.742978 2.679829c1.067574 1.742979 2.222298 3.398809 3.246298 4.684256l0.740766 0.958638 0.544681 1.198298c17.64766 29.151319 24.445277 35.44783 37.844426 35.44783h242.491914v-0.174298 0.043574z" fill="#4395ff" p-id="10552" data-spm-anchor-id="a313x.7781069.0.i8" class="selected">
							</path>
							<path d="M343.148936 359.489362c0 15.033191-12.200851 27.234043-27.234042 27.234042H174.297872a27.234043 27.234043 0 0 1 0-54.468085h141.617022c15.033191 0 27.234043 12.200851 27.234042 27.234043zM887.829787 359.489362c0 15.033191-12.200851 27.234043-27.234042 27.234042H718.978723a27.234043 27.234043 0 0 1 0-54.468085h141.617022c15.033191 0 27.234043 12.200851 27.234042 27.234043zM802.772426 97.824681a27.234043 27.234043 0 0 1 0 38.498042l-118.173958 118.195745a27.234043 27.234043 0 0 1-38.51983-38.51983l118.173958-118.173957a27.234043 27.234043 0 0 1 38.51983 0zM253.908426 97.824681a27.234043 27.234043 0 0 1 38.519829 0l118.173958 118.173957a27.234043 27.234043 0 0 1-38.51983 38.51983L253.908426 136.322723a27.234043 27.234043 0 0 1 0-38.498042zM528.340426 0c15.033191 0 27.234043 12.200851 27.234042 27.234043v141.617021a27.234043 27.234043 0 0 1-54.468085 0v-141.617021C501.106383 12.200851 513.307234 0 528.340426 0z" fill="#515151" p-id="10553" data-spm-anchor-id="a313x.7781069.0.i11" class="selected">
							</path>
						</svg>
					</text>
				</view>
				<view style="width: 100%;display: flex; justify-content: space-between;flex-direction: column;}">
					<view style="display: flex;width: 100%;">
						<view style="width: 50%;">
							<up-tag :tagStyle="{textAlign: 'center'}" :text="tap != '0' ? PersonName:getloc('EmployeeName')" mode="light" style="margin: 10rpx 5rpx;width: 90%;" border-color="rgb(41, 121, 255)" bg-color="rgba(41, 121, 255, 0.118)" color="rgb(41, 121, 255)" />
						</view>
						<view style="width: 50%;">
							<up-tag :tagStyle="{textAlign: 'center'}" :text="tap != '0' ? PcreateTime : createtime" mode="light" style="margin: 10rpx 5rpx;width: 90%;" border-color="rgb(101, 255, 222)" bg-color="rgba(101, 255, 222, 0.118)" color="rgb(44, 113, 97)" />
						</view>
					</view>
					<view style="display: flex;width: 100%;">
						<view style="width: 50%;">
							<up-tag :text="tap != '0' ? isSetInfo ? saveData['PostName']: PostName: isSetInfo ? saveData['PostName']:getloc('PostName')" mode="light" style="margin: 10rpx 5rpx;width: 90%;" border-color="rgb(255, 147, 254)" bg-color="rgba(255, 147, 254, 0.118)" color="rgb(185, 107, 185)" />
						</view>
						<view style="width: 50%;">
							<up-tag :tagStyle="{textAlign: 'center'}" :text="tap != '0' ?isSetInfo ? saveData['DeptName'] : Division:isSetInfo ? saveData['DeptName'] :getloc('Division')" mode="light" style="margin: 10rpx 5rpx;width: 90%;" border-color="rgb(18, 47, 41)" bg-color="rgba(18, 47, 41, 0.118)" color="rgb(18, 47, 41)" />
						</view>
					</view>
					<up-tag :tagStyle="{textAlign: 'center'}" :text="tap != '0' ? isSetInfo? saveData['OrgName'] :OrgName:isSetInfo? saveData['OrgName'] :getloc('OrgName')" mode="light" style="margin: 10rpx 5rpx;" border-color="rgb(111, 44, 255)" bg-color="rgba(111, 44, 255, 0.118)" color="rgb(111, 44, 255)" />

				</view>
			</view>
		</view>
		<view class="textareaContainer">

		</view>
		<view class="tips">
			{{tips}}
		</view>
		<view :class="[!isHide?'hide':'','codeBox']" v-show="isShow">
			<view class="personInfoBox" :style="{backgroundColor:'#fff'}">
				<view class="iconClose" @tap="iconclose">
					<up-icon style="margin-right: 8rpx;background-color: transparent;" name="close" color="#4d4d4dAA" size="45">
					</up-icon>
				</view>
				<view class="enter">
					<view @tap="enter" class="enterBtn" :style="{backgroundColor:startUserImage().colour}">
						确认
					</view>
				</view>
				<view class="contentBox">
					<up-radio-group wrap v-model="value" style="background-color: transparent;">
						<up-radio style="background-color: transparent;padding: 7rpx 0;" @change="radioChange" v-for="(item, index) in list" :key="index" :name="item['UCML_PostOID']" :radioItem="item">
							<!-- 单位 -->
							<text class="textColor " :style="{backgroundColor: 'rgba(111, 44, 255, 0.118)',border: 'rgb(111, 44, 255) solid 1rpx',color:' rgb(111, 44, 255)'}">
								{{item['OrgName']}}</text>
							<!-- 部门 -->
							<text class="textColor " :style="{backgroundColor: 'rgba(18, 47, 41, 0.118)',border: 'rgb(18, 47, 41) solid 1rpx',color:'rgb(18, 47, 41)'}">
								{{item['DeptName']}}</text>
							<!-- 岗位 -->
							<text class="textColor" :style="{backgroundColor: 'rgba(255, 147, 254, 0.118)',border: 'rgb(255, 147, 254) solid 1rpx',color:' rgb(255, 147, 254)'}">
								{{item['PostName']}}</text>
						</up-radio>
					</up-radio-group>
				</view>

			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { //自己的工具包
		getloc,
		startUserImage
	} from "@/utils/instrument/instrumentType.js"
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import {
		withDefaults,
		ref,
		getCurrentInstance, //泛型指定类型
	} from "vue"
	let { //proxy vue3没有this,这个类似this
		proxy
	} = getCurrentInstance() as any;
	interface Props {
		textSize ? : String, //标题字体大小
			value ? : any, //内容
			tips ? : String,
			index ? : String | Number, //索引
			icontype ? : String, //图标类型
			iconColorUr ? : String, //图标颜色
			iconSize ? : String, //图标大小
			underline ? : Boolean, //下划线
			tap ? : String, //当前状态
			PcreateTime ? : String, //code创建时间
			PersonName ? : String, //创建人
			PostName ? : String, //创建人
			OrgName ? : String, //创建人
			Division ? : String, //创建人
			IsEide ? : Boolean, //是否只读状态
	}
	interface Emit {
		(e: "getPersonInfo", event ? : Object): void;
	}
	let emit = defineEmits < Emit > ();
	const props = withDefaults(defineProps < Props > (), {
		textSize: () => "30",
		value: () => "",
		tips: () => "",
		index: () => 0,
		icontype: () => "coupon",
		iconColorUr: () => "#2979ff",
		iconSize: () => "42",
		underline: () => true,
		tap: () => "",
		PcreateTime: () => "",
		PersonName: () => "",
		PostName: () => "",
		OrgName: () => "",
		Division: () => "",
		IsEide: () => true
	})
	let isHide = ref(false);
	let isShow = ref(false);
	let list = ref([])
	let showComponent = ref(true);
	let saveData = ref({});
	let saveDataCopy = ref({});
	// u-radio-group的v-model绑定的值如果设置为某个radio的name，就会被默认选中
	let value = ref('');
	let createtime = getloc('datetime');
	let showToast = ref(true);
	onLoad(() => {
		let json = [{
			tag: "sel", //Select
			tb: "UCML_POSTN_PER_MAP T1", //表名           
			wh: "T1.UCML_CONTACTOID='" + getloc("UCML_CONTACTOID") + "' ", // 是否多岗 
			jo: ` LEFT OUTER JOIN UCML_Post T2 ON T1.UCML_PostOID=t2.UCML_PostOID
							LEFT OUTER JOIN UCML_Organize T3 ON T2.UCML_DivisionOID=T3.UCML_OrganizeOID
							LEFT OUTER JOIN UCML_Organize T4 ON T2.UCML_OrganizeOID=T4.UCML_OrganizeOID`,
			field: "T2.UCML_PostOID,T2.PostName,T2.UCML_DivisionOID,T3.OrgName AS DeptName,T2.UCML_OrganizeOID,T4.OrgName", //字段
			n_ob: "T1.UCML_PostOID", //排序(必填)
		}]

		proxy.$http_request(proxy, { //获取扩展字段内容
			json: json
		}, '', (res: any) => {
			//模拟数据
			try {
				if (!res.data.data.UCML_POSTN_PER_MAP) {
					showToast.value = false;
				} else {
					if (res.data.data.UCML_POSTN_PER_MAP.length == 0) {
						showToast.value = false;
					} else {
						showToast.value = true;
					}
				}
			} catch (e) {
				//TODO handle the exception
				showToast.value = false;
			}

			list.value = res.data.data.UCML_POSTN_PER_MAP;
			//默认显示数据
			if (list.value) {
				value.value = list.value[0].UCML_PostOID;
				saveData.value = list.value[0];
				saveDataCopy.value = list.value[0];
			}
		})


	})
	let setInfo = () => {
		if (!props.IsEide) return;
		if (!showToast.value) return;
		isShow.value = true;
		isHide.value = true;
	}

	let iconclose = () => {
		isHide.value = false;
		setTimeout(() => {
			isShow.value = false;
		}, 500)
	}
	// 选中某个单选框时，由radio时触发
	let radioChange = (e: string, item: any) => {
		saveDataCopy.value = item;
	}
	let isSetInfo = ref(false);
	let enter = () => {

		saveData.value = saveDataCopy.value;
		isSetInfo.value = true;
		console.log(saveData.value)
		emit("getPersonInfo", saveData.value);
		isHide.value = false;
		setTimeout(() => {
			isShow.value = false;
		}, 500)
	}
</script>

<style lang="scss" scoped>
	.textareaContent {
		width: 94%;
		// border-top: 1rpx solid #f0f0f0;
		padding-bottom: 150rpx;
		margin: 30rpx 3% 0 3%;
	}

	@keyframes show {
		0% {
			transform: rotateX(90deg);
			-webkit-transition: rotateX(90deg);
			-ms-transition: rotateX(90deg);
			-moz-transition: rotateX(90deg);
			-o-transition: rotateX(90deg);
		}

		8% {
			opacity: 1;
			transform: rotateX(-60deg);
			-webkit-transition: rotateX(-60deg);
			-ms-transition: rotateX(-60deg);
			-moz-transition: rotateX(-60deg);
			-o-transition: rotateX(-60deg);
		}

		18% {
			opacity: 1;
			transform: rotateX(40deg);
			-webkit-transition: rotateX(40deg);
			-ms-transition: rotateX(40deg);
			-moz-transition: rotateX(40deg);
			-o-transition: rotateX(40deg);
		}

		34% {
			opacity: 1;
			transform: rotateX(-28deg);
			-webkit-transition: rotateX(-28deg);
			-ms-transition: rotateX(-28deg);
			-moz-transition: rotateX(-28deg);
			-o-transition: rotateX(-28deg);
		}

		44% {
			opacity: 1;
			transform: rotateX(18deg);
			-webkit-transition: rotateX(18deg);
			-ms-transition: rotateX(18deg);
			-moz-transition: rotateX(18deg);
			-o-transition: rotateX(18deg);
		}

		58% {
			opacity: 1;
			transform: rotateX(-12deg);
			-webkit-transition: rotateX(-12deg);
			-ms-transition: rotateX(-12deg);
			-moz-transition: rotateX(-12deg);
			-o-transition: rotateX(-12deg);
		}

		72% {
			opacity: 1;
			transform: rotateX(9deg);
			-webkit-transition: rotateX(9deg);
			-ms-transition: rotateX(9deg);
			-moz-transition: rotateX(9deg);
			-o-transition: rotateX(9deg);
		}

		88% {
			opacity: 1;
			transform: rotateX(-5deg);
			-webkit-transition: rotateX(-5deg);
			-ms-transition: rotateX(-5deg);
			-moz-transition: rotateX(-5deg);
			-o-transition: rotateX(-5deg);
		}

		96% {
			opacity: 1;
			transform: rotateX(2deg);
			-webkit-transition: rotateX(2deg);
			-ms-transition: rotateX(2deg);
			-moz-transition: rotateX(2deg);
			-o-transition: rotateX(2deg);
		}

		100% {
			transform: rotateX(1deg);
			-webkit-transition: rotateX(1deg);
			-ms-transition: rotateX(1deg);
			-moz-transition: rotateX(1deg);
			-o-transition: rotateX(1deg);
			opacity: 1;
		}
	}

	.codeBox {
		z-index: 12;
		perspective: 400px;
		position: fixed;
		top: 35%;
		left: 0;
		margin: auto;
		width: 100%;
		height: auto;
	}

	.codeBox view {
		cursor: pointer;
		background: #fff no-repeat center center;
		background-size: 190px;
		border-radius: 6px;
		// box-shadow: 0 2px 7px rgb(0 0 0 / 30%);
		// opacity: 0;
		transition: all 1s ease-in-out;
		// transform-style: preserve-3d;  safari浏览器不支持 会导致出现一半的情况
		transform-origin: center center;
		// overflow: hidden;
		opacity: 1;
		// -webkit-animation: show 3s ease-in-out 0s 1 normal forwards;
	}

	.personInfoBox {
		display: flex;
		flex-direction: column-reverse;
		width: 94%;
		height: 400rpx;
		margin: 0 3%;
		position: relative;
		box-shadow: 1px 0px 20px 1px rgb(38 53 62 / 63%);

		.iconClose {
			height: 20%;
			position: absolute;
			right: 20rpx;
			top: 20rpx;
			background-color: transparent;
		}

		.contentBox {
			background-color: transparent;
			display: flex;
			height: 70%;
			margin: 0 20rpx;
			overflow-y: scroll;

			.textColor {
				border-radius: 13rpx;
				padding: 8rpx 22rpx;
				font-size: 18rpx;
				margin: 0 10rpx;
				position: relative;


			}

			.textBefore {
				&::before {
					position: absolute;
					right: -20rpx;
					top: 45%;
					width: 20%;
					height: 2rpx;
					background-color: #737373;
					content: "";
				}
			}

		}

		.enter {
			height: 17%;
			width: 100%;
			display: flex;
			flex-direction: row-reverse;
			position: relative;
			background-color: transparent;
			z-index: 15;

			.enterBtn {
				z-index: 15;
				position: absolute;
				bottom: 20rpx;
				right: 20rpx;
				width: 20%;
				height: 100%;
				line-height: 250%;
				text-align: center;
				color: #fff;
			}
		}
	}

	.hide {
		-webkit-animation: hide .5s ease-in-out 0s 1 normal forwards;
	}

	@keyframes hide {

		20%,
		50% {
			transform: scale(1.08, 1.08);
			opacity: 1;
		}

		100% {
			opacity: 0;
			transform: rotateZ(40deg) scale(0.6);
		}
	}
</style>
