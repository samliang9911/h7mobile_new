<!-- 
此文件为旧的通用选人文件，已不在使用
新通用选人文件路径为/pages/subPackages/publicform/publicChoicePerson
 -->

<template>
	<view class="box">
		<view>
			<up-search v-model="input" :showAction="true" actionText="搜索" :animation="true" bgColor="white"
				:clearabled="true" borderColor="rgb(184 184 184)" shape="square" @search="search" @clear="clear"
				@custom="search">
			</up-search>
		</view>
		<view style="padding-top:10rpx;">
			<up-tabs :list="tabs" @change="({index})=>current=index" :current="current" height="55" font-size="25" />
		</view>
		<view class="content">
			<view v-if="loading" class="loading">
				<up-loading-icon mode="semicircle" color="#2979ff" size="36"></up-loading-icon>
			</view>
			<swiper class="swiper" @change="e=>current=e.detail.current" :current="current">
				<swiper-item v-for="(item,keys) in data">
					<DaTree :ref="el => setTreeRef(el, keys)" :data="item" labelField="Name" valueField="OID"
						:showCheckbox="showCheckbox" :defaultExpandAll="defaultExpandAll[keys]" @change="treeChange">
					</DaTree>
				</swiper-item>
			</swiper>
		</view>
		<view>
			<up-button type="primary" plain ripple ripple-bg-color="#2979ff" @click="sure">
				确认选择
			</up-button>
		</view>
		<view class="selected">
			<up-popup :show="popupShow" mode="bottom" @close="popupShow=false">
				<view class="popup">
					<popup v-model="checkedData" @delete="checkedDataDel"></popup>
				</view>
			</up-popup>
			<up-button type="success" plain ripple ripple-bg-color="#2979ff" :custom-style="{fontSize:'20rpx'}"
				@click="popupShow=true">
				已选择
			</up-button>
		</view>
	</view>
</template>
<script setup>
	import {
		get
	} from '@/api/publicform/publicChoicePerson.js'
	import {
		ref,
		computed,
		getCurrentInstance,
		nextTick,
		watch
	} from "vue"
	import {
		onLoad
	} from "@dcloudio/uni-app"
	import DaTree from '@/uni_modules/da-tree/components/da-tree/index.vue'
	import popup from '@/pages/subPackages/publicform/choicePerson/popup.vue'
	/**页面原始数据*/
	let rawData = []
	/**树组件加载动画 */
	const loading = ref(true)
	const popupShow = ref(false)
	/**树组件是否多选 */
	const showCheckbox = ref(true)
	/**页面渲染数据*/
	const data = ref([])
	/**选中数据*/
	const checkedData = ref([])
	/**搜索框内容 */
	const input = ref()
	/**当前选中类别*/
	const current = ref(0)
	/**类别*/
	const tabs = ref([])
	/**是否全部展开*/
	const defaultExpandAll = ref({})
	/**当前选中类别英文 */
	const tabsCurrent = computed(() => tabs.value[current.value].value)
	/** 上一次搜索的页签*/
	let oldSearchTabs = ''
	/**树组件ref */
	const treeRefs = ref({});
	const {
		proxy
	} = getCurrentInstance()
	onLoad(async (params) => {

		showCheckbox.value = /^(?!.*\bRadio\b).*$/i.test(params.Choose)

		const allType = {
			person: '人员',
			org: '单位',
			dept: '部门',
			orgdept: '单位/部门',
			post: '岗位',
			group: '群组'
		};
		const type = (params.Type && /^(?!.*ALL).*$/i.test(params.Type) ? params.Type.split(',') : Object.keys(
			allType)).map(e => e.toLowerCase());
		tabs.value = type.map(e => ({
			name: allType[e],
			value: e
		}));
		rawData = await get(type, params);
		data.value = JSON.parse(JSON.stringify(rawData))
		await nextTick()
		loading.value = false
	})
	//回显数据
	proxy.getOpenerEventChannel().on('echoChoicePerson', async (data) => {
		await treeMounted()
		for (let {
				value
			}
			of tabs.value) {
			treeRefs.value[value].setCheckedKeys(data.map(e => e.OID), true)
		}
		//暂时这么用着先，有空再优化
		setTimeout(() => {
			treeChange()
		}, 500);
		// let a = data.map(e => {
		// 	for (let item in rawData) {
		// 		let res = JSON.parse(JSON.stringify(getNode(rawData[item], 'OID', e.OID)))[0]
		// 		if (res) {
		// 			delete res.children
		// 			return res
		// 		}
		// 	}
		// })
		// console.log(a);
	})
	/**树组件加载完事件 */
	function treeMounted() {
		return new Promise((resolve) => {
			// 监听 `treeRefs` 变化，判断 DaTree 是否渲染完成
			watch(treeRefs, () => {
				resolve(true)
			}, {
				deep: true,
				once: true
			});
		});
	}
	// 绑定 ref
	function setTreeRef(el, key) {
		if (el) treeRefs.value[key] = el;
	};
	/**删除已选 */
	function checkedDataDel(val) {
		for (let {
				value
			}
			of tabs.value) {
			treeRefs.value[value].setCheckedKeys(val.map(e => e.OID), false)
		}
	}
	/**搜索框搜索 */
	function search(val) {
		data.value[tabsCurrent.value] = val ?
			getNode(rawData[tabsCurrent.value], 'Name', val, tabsCurrent.value == 'person' ? e => e.UserOID : void 0) :
			rawData[tabsCurrent.value]
		//过滤全部展开否则不展开
		defaultExpandAll.value[tabsCurrent.value] = !!val
		if (oldSearchTabs && oldSearchTabs !== tabsCurrent.value) {
			data.value[oldSearchTabs] = JSON.parse(JSON.stringify(rawData[oldSearchTabs]))
			defaultExpandAll.value[oldSearchTabs] = false
		}
		oldSearchTabs = tabsCurrent.value
	}
	/**搜索框清除 */
	function clear() {
		data.value[tabsCurrent.value] = JSON.parse(JSON.stringify(rawData[tabsCurrent.value]))
		input.value = ''
		defaultExpandAll.value[tabsCurrent.value] = false
	}
	/**单选复选框被选时触发 */
	function treeChange() {
		let filterField = {
			person: 'UserOID',
			dept: 'DeptOID',
			post: 'PostOID'
		}
		checkedData.value = tabs.value.reduce((a, b) => {
			let node = (treeRefs.value[b.value].getCheckedNodes() || []).map(e => ({
					...e.originItem
				}))
				.filter(e => filterField[b.value] ? e[filterField[b.value]] : true)
			a.push(...node)
			return a
		}, [])
	}
	/**确定选择 */
	function sure() {
		proxy.getOpenerEventChannel().emit('ChoicePerson', checkedData.value);
		// uni.$emit('ChoicePerson',checkedData.value);
		uni.navigateBack(); // 关闭当前页面
	}
	/**
	 * 获取节点
	 * @param {Array} data 数据
	 * @param {String} key 值字段
	 * @param {String} value 搜索值
	 * @param {Function} condition 条件
	 * @returns {Array}
	 */
	function getNode(data = [], key, value, condition = () => true) {
		const map = (data) => {
			const res = []
			for (let item of data) {
				if (item.children) {
					const e = map(item.children)
					if (e.length) {
						res.push({
							...item,
							children: e
						})
					} else if (item[key].includes(value) && condition(item)) {
						res.push({
							...item,
							children: null
						})
					}
				} else if (item[key].includes(value) && condition(item)) {
					res.push(item)
				}
			}
			return res
		}
		return map(data)
	}
</script>
<style lang="scss" scoped>
	.box {
		position: relative;
		height: 100vh;
		width: 100vw;
		padding: calc(var(--status-bar-height) + 20rpx) 30rpx 20rpx 30rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;

		.content {
			flex-grow: 1;
			overflow: auto;
			position: relative;

			.swiper {
				height: 100%;
			}

			.loading {
				position: absolute;
				height: 100%;
				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				z-index: 1;
				background: white;
			}
		}

		.selected {
			position: absolute;
			right: 20rpx;
			top: 45%;
			height: 80rpx;
			width: 100rpx;

			.popup {
				height: 80vh;
				width: 100%;
				padding: 20rpx;
				box-sizing: border-box;
			}
		}
	}
</style>