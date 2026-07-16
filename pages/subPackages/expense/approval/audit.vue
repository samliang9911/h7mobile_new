<template>
	<scroll-view class="container" scroll-y>
		<template v-if="isMovingShow">
			<template v-if="data.movingConfig.type=='radio'">
				<view class="idea">
					<text>流转节点</text>
					<hr-radio v-model="data.movingConfig.data" :options="data.movingConfig.options" type="radio"
						@change="setHeight(1)" />
				</view>
				<view :class="{'moving-pick':true,active:data.movingConfig.data}" :style="{height:movingHeight+'px'}">
					<view class="moving-content">
						<hr-radio v-model="currentMoving.data" :options="currentMoving.child"
							:type="currentMoving.type" />
						<up-button type="primary" v-if="isNodePickPerson"
							@click="addNodePerson(currentMoving.child,1)">增加</up-button>
					</view>
				</view>
			</template>
			<view v-else class="moving-form">
				<text>流转节点:</text>
				<view>
					<view v-for="item in data.movingConfig.options">
						<view>
							<text>{{ item.label }}:</text>
							<hr-radio v-model="item.data" :options="item.child" :type="item.type" />
						</view>
						<up-button type="primary" v-if="isNodePickPerson"
							@click="addNodePerson(item.child)">增加</up-button>
					</view>
				</view>
			</view>
		</template>
		<view class="idea" v-if="data.decision.length">
			<text>意见决策</text>
			<hr-radio v-model="data.code" :options="data.decision" @change="e=>e.label&&(data.content=e.label)" />
		</view>
		<view class="idea">
			<text>意见内容：</text>
			<view @click="popup={show:true,type:'idea'}">常用意见
				<up-icon class="right" name="arrow-right" color="#333333" size="14" />
			</view>
		</view>
		<view class="textarea">
			<textarea v-model="data.content" :maxlength="500" placeholder="请输入内容" />
			<text>{{data.content.length}}/500</text>
		</view>
		<view class="node-pick" :style="{height:height+'px'}">
			<view>
				<view v-for="(item,index) in nodePick">
					<view>
						<view>{{ item.label }}</view>
						<view class="remind" @click="popup.show = true,popup.type = 'remind',popup.extend = index">
							<view>{{ item.remind?.label||'提醒' }}</view>
							<text @click.stop="nodePickPerson(index)">
								{{ item.person.reduce((a,b:any,i)=>a+=(b.Name+(item.person.length-1==i?'':',')),'') }}
							</text>
						</view>
					</view>
					<up-icon name="plus" color="rgb(67, 149, 255)" size="25" @click="nodePickPerson(index)" />
				</view>
			</view>
		</view>
		<view class="hr-with-text" @click="onMore">
			<hr>
			<text>{{more?'收起':'展开'}}</text>
		</view>
		<view :class="{'fixed-button':true,action}" @click="onActive">
			<up-icon name="plus" color="#ffffff" size="25" />
			<view class="button" :style="{width:width+'px',display:action?'':'none'}">
				<view class="button-content">
					<view v-for="item in data.button" @click="onButton(item)">
						<up-icon :name="item.icon" color="rgb(0, 170, 255)" size="15" />
						<text>{{ item.label }}</text>
					</view>
				</view>
			</view>
		</view>
		<up-popup :show="popup.show" @close="popup.show=false">
			<up-cell-group>
				<up-cell v-for="item in data[popup.type]" :titleStyle="{ 'display': 'flex',
          'align-items': 'center', 'justify-content': 'center', 'width': '100%' }" :title="item.label"
					@click="popup.value = item,popup.show = false" />
			</up-cell-group>
		</up-popup>
		<up-toast ref="uToastRef" />
	</scroll-view>
</template>
<script setup lang="ts">
	import { h, computed, ref, reactive, watch, getCurrentInstance, onMounted } from 'vue'
	import UpRadioGroup from 'uview-plus/components/u-radio-group/u-radio-group.vue'
	import UpRadio from 'uview-plus/components/u-radio/u-radio.vue'
	import UpCheckboxGroup from 'uview-plus/components/u-checkbox-group/u-checkbox-group.vue'
	import UpCheckbox from 'uview-plus/components/u-checkbox/u-checkbox.vue'
	import { commitAudit, saveFlow } from '@/api/expense'
	/**展开督办&知会/参阅【节点选人】 */
	const more = ref(false)
	/**【常用意见&节点提醒】弹窗 */
	const popup = ref<{ show : boolean, type : 'idea' | 'remind', value ?: any, extend ?: any }>
		({ show: false, type: 'idea' })
	/**悬浮操作按钮 */
	const action = ref(false)
	/**悬浮按钮内容宽度 */
	const width = ref(0)
	/**选人节点高度 */
	const height = ref(0)
	/**流转节点高度 */
	const movingHeight = ref(0)
	/**提示框实例 */
	const uToastRef = ref()
	const { proxy } = getCurrentInstance()!
	const data = defineModel<{
		isStretch : boolean
		/**意见决策 */
		code : string
		/**意见内容 */
		content : string
		/**流转节点 */
		movingConfig : {
			type : 'checkbox' | 'radio'
			data : string
			options : {
				label : string, value : string, data : any, type : string, child : {
					label : string, value : string, post : string
				}[]
			}[]
		}
		/**意见决策 */
		decision : { label : string, value : string, isMovingShow : boolean }[]
		/**常用意见 */
		idea : { label : string }[]
		/**节点选人提醒平台 */
		remind : { label : string, value : string }[]
		/**操作按钮 */
		button : { label : string, value : string, icon : string }[]
	}>({ default: {} })
	/**当前选中流转节点 */
	const currentMoving = computed<any>(() =>
		data.value.movingConfig.options.find(e => e.value == data.value.movingConfig.data) || {}
	)
	/**流转节点是否可选人 */
	const isNodePickPerson = computed(() => !!data.value.button.find(e => e.value == 'WF_NEXTSTEP2'))
	/**流转节点是否显示 */
	const isMovingShow = computed(() => data.value.movingConfig.options.length &&
		data.value.decision.find(e => e.value == data.value.code)?.isMovingShow)
	/**节点选人 */
	const nodePick = reactive<{ label : string, remind : { label ?: string, value ?: string }, person : any[] }[]>([
		{ label: '督办', remind: {}, person: [] },
		{ label: '知会/参阅', remind: {}, person: [] },
	])
	//意见决策默认同意
	if (data.value.decision.length && !data.value.code) {
		data.value.code = '1'
		data.value.content = '同意'
	}
	//弹窗内容值变动时给【常用意见|节点提醒】赋值
	watch(() => popup.value.value, val =>
		val && (popup.value.type == 'idea' ? data.value.content = val.label : nodePick[popup.value.extend].remind = val)
	)
	async function addNodePerson(itemArray : any[], type = 0) {
		// 传入当前数组以供选人页面回显
		const resList = await pickPerson(itemArray);

		// 只要 resList 存在（用户点击了确认按钮），就同步最终选择的结果
		if (resList) {
			// 修改点：先清空原有人员，实现删除/清空同步
			itemArray.length = 0;

			// 重新填充选人页面返回的所有人员
			resList.forEach((newItem : any) => {
				itemArray.push({
					...newItem,
					label: newItem.Name || newItem.label,
					value: newItem.OID || newItem.value || newItem.id
				});
			});

			if (type === 1) setHeight(1);
		}
	}
	/**操作按钮点击事件 */
	function onButton(item) {
		uni.showModal({
			title: '提示',
			content: `确定${item.label}吗?`,
			success: async res => {
				if (res.confirm) {
					if (item.value == 'BU_SAVE') {
						await saveFlow(data.value)
						uToastRef.value?.show({
							type: 'success',
							message: '保存成功!'
						})
					}
					else {
						if (data.value.content) {
							const json = {
								action: item.value,
								code: data.value.code,
								codeValue: data.value.decision?.find(e => e.value == data.value.code)?.label,
								content: data.value.content
							}
							if (['WF_FINISHTASK', 'WF_ABORT', 'WF_PAUSE'].includes(item.value)) { }
							else if (['WF_NEXTSTEP', 'WF_NEXTSTEP2'].includes(item.value)) {
								json['person'] = parse(data.value.movingConfig)
								if (isMovingShow.value && !json['person'].length) {
									return uToastRef.value?.show({
										type: 'error',
										message: '请先在【流转节点】选人!'
									})
								}
							}
							else json['person'] = (await pickPerson()).map(e => ({ id: e.OID }))
							await commitAudit(json)
							uToastRef.value?.show({
								type: 'success',
								message: '操作成功!',
								complete: () => {
									!['WF_HUIQIN', 'WF_XIEBAN'].includes(item.value) && uni.switchTab({
										url: '/pages/index/items'
									})
								}
							})
						}
						else uToastRef.value?.show({
							type: 'error',
							message: '请先填写意见内容!'
						})
					}
				}
			}
		});
		function parse({ data, options }) : { id : string, post : string, moving : string }[] {
			//单选
			if (data) {
				const { data: childData, child, value } = options.find(e => e.value == data)
				return child.filter(e => childData.includes(e.value)).map(v => ({ id: v.value, post: v.post, moving: value }))
			}
			//多选
			else {
				return options.reduce((a, b) => {
					a.push(...b.child.filter(e => (b.data || []).includes(e.value)).map(v => ({ id: v.value, post: v.post, moving: b.value })))
					return a
				}, [])
			}
		}
	}
	/**节点选人 */
	async function nodePickPerson(index) {
		const currentPersonList = nodePick[index].person;
		const resList = await pickPerson(currentPersonList);
		// 覆盖更新
		nodePick[index].person = resList.map((e : any) => ({
			...e,
			Name: e.Name || e.label,
			OID: e.OID || e.value
		}));
		setHeight(0)
	}
	/**选人 */
	function pickPerson(alreadySelected : any[] = []) : Promise<any[]> {
		return new Promise((resolve) => {
			uni.navigateTo({
				url: `/pages/subPackages/publicform/publicChoicePerson?Type=Person&Choose=checkbox`,
				events: {
					acceptDataFromChild: function (data : any) {
						// console.log('父页面接收到回传数据:', data);
						resolve((data && data.data) || data || []);
					}
				},
				success: (res) => {
					res.eventChannel.emit('acceptDataFromOpener', {
						items: JSON.parse(JSON.stringify(alreadySelected))
					});
				},
				fail: (err) => {
					console.error('跳转选人页面失败', err);
					resolve([]);
				}
			})
		})
	}
	/**设置节点选人高度 */
	async function setHeight(n : 0 | 1) {
		//  选择器改为指向新加的 .moving-content
		// 这样无论里面的 hr-radio 渲染成什么样，都能获取高度
		const e : any = [
			[height, '.node-pick>*'],
			[movingHeight, '.moving-pick .moving-content']
		]

		//  适当增加延时到 50ms，确保 DOM 渲染完成（v-if 切换需要时间）
		const rect = await getRect(e[n][1], 50)

		//  增加空值判断
		if (rect) {
			e[n][0].value = rect.height
		} else {
			// 如果没找到元素（比如刚切换还没渲染出来），不执行赋值，避免报错
			console.warn('未找到元素高度:', e[n][1])
		}
	}
	/**点击展开更多分割线 */
	function onMore() {
		more.value ? height.value = 0 : setHeight(0)
		more.value = !more.value
	}
	/**悬浮按钮开关 */
	function onActive() {
		if (action.value) width.value = 0
		else getRect('.button-content').then(e => width.value = e.width)
		action.value ? setTimeout(() => action.value = false, 280) : (action.value = true)
	}
	// 初始化时根据 isStretch 设置默认状态
	onMounted(() => {
		if (data.value?.isStretch == true) {
			action.value = true
			getRect('.button-content').then(e => width.value = e.width)
		} else {
			action.value = false
			width.value = 0
		}
	})

	/**获取元素数值 */
	function getRect(select, time = 0) : Promise<{ width : number, height : number }> {
		return new Promise((res) => {
			setTimeout(() => {
				const query = uni.createSelectorQuery().in(proxy)
				query.select(select).boundingClientRect((rect : any) => res(rect)).exec()
			}, time)
		})
	}
	/**【单选|多选】组件 */
	function HrRadio(props) {
		const c = props.type == 'checkbox' ? [UpCheckboxGroup, UpCheckbox] : [UpRadioGroup, UpRadio]
		return h(c[0], props, {
			default: () => renderList(props.options, e => h(c[1], {
				label: e.label,
				name: e.value,
				labelSize: '25rpx',
				onChange: () => props.onChange?.(e)
			}))
		})
	}
	const isArray = Array.isArray;
	const isString = (val) => typeof val === "string";
	const isObject = (val) => val !== null && typeof val === "object";
	function renderList(source, renderItem, cache ?, index ?) {
		let ret;
		const cached = cache && cache[index];
		if (isArray(source) || isString(source)) {
			ret = new Array(source.length);
			for (let i = 0, l = source.length; i < l; i++) {
				ret[i] = renderItem(source[i], i, void 0, cached && cached[i]);
			}
		} else if (typeof source === "number") {
			ret = new Array(source);
			for (let i = 0; i < source; i++) {
				ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
			}
		} else if (isObject(source)) {
			if (source[Symbol.iterator]) {
				ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
			} else {
				const keys = Object.keys(source);
				ret = new Array(keys.length);
				for (let i = 0, l = keys.length; i < l; i++) {
					const key = keys[i];
					ret[i] = renderItem(source[key], key, i, cached && cached[i]);
				}
			}
		} else {
			ret = [];
		}
		if (cache) {
			cache[index] = ret;
		}
		return ret;
	}
</script>
<style lang="scss" scoped>
	.container {
		position: relative;
		padding-top: 10rpx;
		font-size: 25rpx;
		color: #606266;
		box-sizing: border-box;
		max-height: calc(100vh - 100rpx);
		overflow-y: auto;

		.idea {
			padding: 1rpx 20rpx;
			height: 80rpx;
			line-height: 80rpx;

			&>text,
			.left {
				float: left;
			}

			&>view,
			.right {
				float: right;
				height: 80rpx;
				line-height: 80rpx;
			}
		}

		.moving-form {
			padding: 20rpx;
			box-sizing: border-box;
			width: 100vw;

			&>view {
				margin-top: 10rpx;
				border: 1px solid rgb(135, 185, 251);
				background-color: rgb(67 149 255 / 4%);
				padding: 10rpx 20rpx;
				box-sizing: border-box;
				width: 100%;

				&>view {
					display: flex;
					justify-content: space-between;
					padding: 5rpx 0;

					&>view {
						display: flex;
						flex: 1;
						overflow: hidden;

						&>text {
							white-space: nowrap;
						}

						&>view {
							margin-top: -8rpx;
						}
					}

					&>.u-button {
						width: 80rpx;
						height: 40rpx;
						font-size: 20rpx;
						margin: 0;
					}
				}
			}
		}

		.moving-pick {
			height: 0px;
			overflow: hidden;
			background-color: rgb(67 149 255 / 4%);
			display: flex;
			justify-content: space-between;
			align-items: center;
			transition: height .5s, border .5s, margin .5s;
			border: 0px solid rgba(67, 149, 255, 0);

			.u-button {
				display: none;
			}
		}

		.moving-pick.active {
			padding: 0 10rpx;
			margin: 10rpx;
			border: 1px solid rgb(67, 149, 255);

			.u-button {
				display: flex;
				width: 80rpx;
				height: 50rpx;
				font-size: 23rpx;
				margin: 0;
			}
		}

		.u-radio-group,
		.u-checkbox-group {
			gap: 0 !important;

			:deep() {

				.u-radio,
				.u-checkbox {
					margin: 10rpx;

					.u-radio__icon-wrap--circle,
					.u-checkbox__icon-wrap {
						height: 25rpx !important;
						width: 25rpx !important;
					}
				}
			}
		}

		.textarea {
			background-color: #fafafa;
			display: flex;
			flex-direction: column;
			align-items: end;
			padding: 10rpx 20rpx;
			box-sizing: border-box;
			width: 100%;
			color: #606266;
			margin-top: 10rpx;

			&>textarea {
				width: 100%;
				font-size: 25rpx;
			}

			&>text {
				float: right;
			}
		}

		.node-pick {
			transition: height 0.3s;
			overflow: hidden;

			&>view {
				padding: 20rpx;
				padding-bottom: 0;
				box-sizing: border-box;

				&>view {
					display: flex;
					justify-content: space-between;

					.remind {
						display: flex;
						margin: 10rpx 0 30rpx;

						&>view {
							white-space: nowrap;
							margin-right: 30rpx;
							color: #989898;
						}

						&>text {
							color: rgb(67, 149, 255);
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 10;
							overflow: hidden;
							flex: 1;
						}
					}

					.remind::before {
						content: '';
						background-image: url(/static/remind.svg);
						background-repeat: no-repeat;
						background-position: center;
						background-size: contain;
						width: 30rpx;
						height: 30rpx;
						margin-right: 10rpx;
					}
				}
			}
		}

		.hr-with-text {
			margin-top: 30rpx;
			position: relative;
			text-align: center;
			height: 150rpx;
			line-height: 150rpx;

			&>hr {
				position: absolute;
				top: 50%;
				width: 100%;
				margin: 0;
				border: none;
				border-top: 1px solid rgb(220, 223, 230);
			}

			&>text {
				color: rgb(144, 147, 153);
				position: relative;
				background: white;
				padding: 0 15px;
			}
		}

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
	}
</style>