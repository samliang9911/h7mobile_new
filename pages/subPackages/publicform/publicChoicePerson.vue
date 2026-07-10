<template>
	<view class="app-container">
		<view class="search-header">
			<view class="search-bar">
				<icon type="search" size="14" color="#94a3b8" />
				<input v-model="keyword" @input="onSearchInput" placeholder="查找成员、岗位、组织..." />
				<view v-if="keyword" @tap="clearSearch" class="clear-btn">
					<icon type="clear" size="14" color="#cbd5e1" />
				</view>
			</view>
		</view>

		<scroll-view scroll-x class="breadcrumb-container" :scroll-into-view="'path-' + (pathStack.length - 1)"
			:show-scrollbar="false">
			<view class="breadcrumb-inner">
				<view v-for="(path, index) in pathStack" :key="index" :id="'path-' + index" class="path-item"
					@tap="jumpToPath(index)">
					<text :class="{ 'path-active': index === pathStack.length - 1 }">{{ path.Name }}</text>
					<text v-if="index < pathStack.length - 1" class="path-sep">/</text>
				</view>
			</view>
		</scroll-view>

		<view class="main-content">
			<scroll-view scroll-y class="side-bar" :show-scrollbar="false" v-if="visibleTypeOptions.length > 0">
				<view v-for="type in visibleTypeOptions" :key="type.value" class="side-item"
					:class="{ 'side-active': activeType === type.value }" @tap="handleTypeChange(type.value)">
					<text>{{ type.label }}</text>
				</view>
			</scroll-view>

			<view class="list-content">
				<view v-if="pageLoading" class="loading-state">
					<view class="spinner"></view>
				</view>

				<scroll-view v-else scroll-y class="scroll-v" :show-scrollbar="false">
					<view class="list-wrapper">
						<view v-if="showSelectAllBar && chooseMode !== 'radio'" class="select-all-bar"
							@tap="toggleSelectAll">
							<text class="select-all-text">全选所有{{ currentTypeName }}</text>
							<text class="level-count">({{ combinedList.length }})</text>
							<view class="spacer"></view>
							<view
								:class="[chooseMode === 'radio' ? 'radio-circle' : 'check-box', isAllSelectedInLevel ? 'checked' : '']">
								<icon v-if="chooseMode !== 'radio' && isAllSelectedInLevel" type="success_no_circle"
									size="12" color="#fff" />
								<view v-if="chooseMode === 'radio' && isAllSelectedInLevel" class="inner-dot"></view>
							</view>
						</view>

						<block v-if="isSearching">
							<view v-for="item in searchResults" :key="item.UOID" class="list-row"
								@tap="handleSelect(item)">
								<view :class="['row-icon', item.type]">{{ getIconText(item) }}</view>
								<view class="row-info">
									<text class="row-name">{{ item.Name }}</text>
									<text class="row-path">{{ getSearchItemPath(item) }}</text>
								</view>
								<view
									:class="[chooseMode === 'radio' ? 'radio-circle' : 'check-box', selectedMap.has(item.UOID) ? 'checked' : '']">
									<icon v-if="chooseMode !== 'radio' && selectedMap.has(item.UOID)"
										type="success_no_circle" size="12" color="#fff" />
									<view v-if="chooseMode === 'radio' && selectedMap.has(item.UOID)" class="inner-dot">
									</view>
								</view>
							</view>
						</block>
						<block v-else>
							<view v-for="item in combinedList" :key="item.UOID" class="list-row"
								@tap="onItemClick(item)">
								<view :class="['row-icon', item.type]">{{ getIconText(item) }}</view>
								<view class="row-info">
									<text class="row-name">{{ item.Name }}</text>
									<text v-if="item.type === 'user'" class="row-sub">{{ item.PostName || '成员' }}</text>
								</view>

								<view class="action-area">
									<view
										v-if="activeType === 'dept' && item.Name === '采购部' && pathStack.some(p => p.Name.includes('土方'))"
										style="display: flex; align-items: center;">
										<view
											:class="[chooseMode === 'radio' ? 'radio-circle' : 'check-box', selectedMap.has(item.UOID) ? 'checked' : '']"
											@tap.stop="handleSelect(item)" style="margin-right: 20rpx;">
											<icon v-if="chooseMode !== 'radio' && selectedMap.has(item.UOID)"
												type="success_no_circle" size="12" color="#fff" />
											<view v-if="chooseMode === 'radio' && selectedMap.has(item.UOID)"
												class="inner-dot"></view>
										</view>
										<view v-if="checkHasChildren(item)" class="enter-badge">
											<text>下级</text>
											<icon type="arrowright" size="12" color="#3b82f6" />
										</view>
									</view>

									<block v-else>
										<view v-if="checkHasChildren(item)" class="enter-badge">
											<text>下级</text>
											<icon type="arrowright" size="12" color="#3b82f6" />
										</view>
										<view v-else-if="item.type === activeType"
											:class="[chooseMode === 'radio' ? 'radio-circle' : 'check-box', selectedMap.has(item.UOID) ? 'checked' : '']">
											<icon v-if="chooseMode !== 'radio' && selectedMap.has(item.UOID)"
												type="success_no_circle" size="12" color="#fff" />
											<view v-if="chooseMode === 'radio' && selectedMap.has(item.UOID)"
												class="inner-dot"></view>
										</view>
									</block>
								</view>
							</view>
						</block>
					</view>
				</scroll-view>
			</view>
		</view>

		<view class="overlay" v-if="showSelectedList" @tap="showSelectedList = false"></view>
		<view class="selected-drawer" :class="{ 'drawer-open': showSelectedList && selectedMap.size > 0 }">
			<view class="drawer-header">
				<view class="header-left">
					<text class="title">已选清单</text>
					<text class="count">({{ selectedMap.size }})</text>
				</view>
				<text class="clear-btn" @tap="clearAllSelected">清空全部</text>
			</view>
			<scroll-view scroll-y class="drawer-scroll">
				<view class="drawer-list-inner">
					<view v-for="[uoid, item] in selectedMap" :key="uoid" class="drawer-item">
						<view :class="['mini-icon', item.type]">{{ getIconText(item) }}</view>
						<view class="item-info">
							<text class="name">{{ item.Name }}</text>
							<text class="path">{{ item.path }}</text>
						</view>
						<view class="remove-action" @tap.stop="handleSelect(item)">
							<icon type="clear" size="20" color="#ff4d4f" />
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<view class="fixed-footer">
			<view class="footer-left" @tap="toggleSelectedList">
				<text class="selected-label">已选择：</text>
				<text class="selected-count">{{ selectedMap.size }}</text>
				<view class="arrow-box">
					<view :class="['arrow-icon', showSelectedList ? 'arrow-down' : 'arrow-up']"></view>
				</view>
			</view>
			<button class="confirm-btn" @tap="confirmSelection">确定</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed,
		getCurrentInstance
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		http_request
	} from '@/api/api.js';

	const allTypeOptions = [{
			label: '成员',
			value: 'user'
		},
		{
			label: '单位',
			value: 'unit'
		},
		{
			label: '部门',
			value: 'dept'
		},
		{
			label: '岗位',
			value: 'post'
		}
	];

	const visibleTypeOptions = ref([]);
	const activeType = ref('user');
	const chooseMode = ref('fcheck'); // 默认复合多选

	const flatData = ref([]);
	const pathStack = ref([{
		UOID: 'ROOT',
		Name: '集团总公司',
		type: 'root'
	}]);
	const selectedMap = ref(new Map());
	const keyword = ref('');
	const isSearching = ref(false);
	const searchResults = ref([]);
	const pageLoading = ref(true);
	const showSelectedList = ref(false);
	const {
		proxy
	} = getCurrentInstance();
	const selectedItems = ref([]);
	// 参数接收逻辑
	onLoad((options) => {
		// 1. 处理 Type
		let types = (options.Type || options.type || 'All').toLowerCase();
		if (types.includes('person')) types = types.replace('person', 'user');

		if (types === 'all') {
			visibleTypeOptions.value = allTypeOptions;
		} else {
			const typeArr = types.split(',').map(t => t.trim());
			visibleTypeOptions.value = allTypeOptions.filter(opt => typeArr.includes(opt.value));
		}

		if (visibleTypeOptions.value.length > 0) {
			activeType.value = visibleTypeOptions.value[0].value;
		} else {
			visibleTypeOptions.value = allTypeOptions;
		}

		// 2. 处理 Choose (新增样式判断依据)
		const choose = (options.Choose || options.choose || 'FCheck').toLowerCase();
		if (['radio', 'checkbox', 'fcheck'].includes(choose)) {
			chooseMode.value = choose;
		}

		// 3. 【核心修改】处理回显数据
		const eventChannel = proxy.getOpenerEventChannel();
		if (eventChannel) {
			// 监听 'acceptDataFromOpener' 事件
			eventChannel.on('acceptDataFromOpener', (data) => {
				// console.log("子页面接收到的回传数据：", data);

				// 容错处理：确保 data 是个数组
				const items = Array.isArray(data) ? data : (data.items || []);

				if (items.length > 0) {
					// 清空旧数据（可选，视需求而定）
					selectedMap.value.clear();

					items.forEach(item => {
						// A. 类型反向映射：将标准类型转回内部类型
						// 父页面可能是 Person/Org/Dept/Post -> 子页面需要 user/unit/dept/post
						let innerType = item.type || 'user';
						if (innerType === 'Person') innerType = 'user';
						else if (innerType === 'Org') innerType = 'unit';
						else if (innerType === 'Dept') innerType = 'dept';
						else if (innerType === 'Post') innerType = 'post';

						// B. 确保 UOID 存在 (如果父页面没存 UOID，这里需要尝试重建)
						//人员(U:OID), 组织(O:OID), 岗位(P:OID)
						let targetUOID = item.UOID;
						if (!targetUOID && item.OID) {
							if (innerType === 'user') targetUOID = `(U:${item.OID})`;
							else if (innerType === 'unit' || innerType === 'dept') targetUOID =
								`(O:${item.OID})`;
							else if (innerType === 'post') targetUOID = `(P:${item.OID})`;
						}

						// C. 存入 Map 触发回显
						if (targetUOID) {
							selectedMap.value.set(targetUOID, {
								...item, // 保留原信息
								type: innerType, // 修正为内部类型，确保图标颜色正确
								UOID: targetUOID,
								Name: item.Name || item.Name_All, // 兼容字段名
								DeptName: item.DeptName || '',
								OrgName: item.OrgName || '',
								PostName: item.PostName || '',
								path: item.path
							});
						}
					});

					// 更新一下全选状态判定
					// (由于 isAllSelectedInLevel 是 computed，它会自动更新，无需手动处理)
				}
			});
		}
	});

	const showSelectAllBar = computed(() => {
		if (chooseMode.value === 'radio') return false; // 单选不显示全选
		if (isSearching.value || combinedList.value.length === 0) return false;
		if (activeType.value === 'unit' && pathStack.value.length === 1) return false;
		return combinedList.value.every(item => item.type === activeType.value);
	});

	const currentTypeName = computed(() => visibleTypeOptions.value.find(t => t.value === activeType.value)?.label || '');
	const isAllSelectedInLevel = computed(() => combinedList.value.length > 0 && combinedList.value.every(item =>
		selectedMap.value.has(item.UOID)));

	const toggleSelectAll = () => {
		if (chooseMode.value === 'radio') return;

		if (chooseMode.value === 'checkbox' && selectedMap.value.size > 0) {
			const firstItem = selectedMap.value.values().next().value;
			if (firstItem && firstItem.type !== activeType.value) {
				uni.showModal({
					title: '提示',
					content: `切换将清空已选`,
					success: (res) => {
						if (res.confirm) {
							selectedMap.value.clear();
							doSelectAll();
						}
					}
				});
				return;
			}
		}
		doSelectAll();
	};

	const doSelectAll = () => {
		const currentStatus = isAllSelectedInLevel.value;
		combinedList.value.forEach(item => {
			if (currentStatus) selectedMap.value.delete(item.UOID);
			else selectedMap.value.set(item.UOID, item);
		});
	}

	onMounted(async () => {
		try {
			const res = await http_request('', {
				json: [getPersonQuery(), getOrgDeptQuery(), getPostQuery()]
			});
			const allItems = [];
			const orgLookup = new Map();

			// 1. 处理单位和部门，生成 UOID 为 (O:GUID)
			(res?.orgdept?.Items || []).forEach(item => {
				const isUnit = item.Lev === true || item.Lev === 1;
				// 标准要求：组织机构Key(包含部门) 使用 (O:...)
				const uoid = `(O:${item.OID})`;
				orgLookup.set(item.OID, {
					UOID: uoid,
					OID: item.OID,
					type: isUnit ? 'unit' : 'dept',
					Name: item.Name
				});
			});

			// 构建树形结构并预填充字段
			(res?.orgdept?.Items || []).forEach(item => {
				const current = orgLookup.get(item.OID);
				let pid = 'ROOT';
				if (item.ParentOID && item.ParentOID !== '00000000-0000-0000-0000-000000000000') {
					const parent = orgLookup.get(item.ParentOID);
					if (parent) pid = parent.UOID;
				}
				allItems.push({
					UOID: current.UOID,
					OID: item.OID,
					PID: pid,
					Name: item.Name,
					type: current.type,
					// 补充标准所需字段
					DeptName: current.type === 'dept' ? current.Name : '',
					OrgName: current.type === 'unit' ? current.Name : '',
					DeptOID: current.type === 'dept' ? current.OID : '',
					OrgOID: current.type === 'unit' ? current.OID : '',
					PostName: '',
					PostOID: ''
				});
			});

			// 2. 处理人员，生成 UOID 为 (U:GUID)
			(res?.person?.Items || []).forEach(i => {
				const targetOID = i.SYS_DivisionOID || i.Sys_OrganizeOID;
				if (targetOID && orgLookup.has(targetOID)) {
					const parent = orgLookup.get(targetOID);
					allItems.push({
						UOID: `(U:${i.OID})`,
						OID: i.OID,
						PID: parent.UOID,
						Name: i.Name,
						type: 'user',
						PostName: i.PostName || '',
						PostOID: i.PostOID || '',
						DeptName: parent.type === 'dept' ? parent.Name : '',
						OrgName: parent.type === 'unit' ? parent.Name : '',
						DeptOID: parent.type === 'dept' ? parent.OID : '',
						OrgOID: parent.type === 'unit' ? parent.OID : ''
					});
				}
			});

			// 3. 处理岗位，生成 UOID 为 (P:GUID)
			(res?.post?.Items || []).forEach(i => {
				if (i.Sys_Division_FK && orgLookup.has(i.Sys_Division_FK)) {
					const parent = orgLookup.get(i.Sys_Division_FK);
					allItems.push({
						UOID: `(P:${i.OID})`,
						OID: i.OID,
						PID: parent.UOID,
						Name: i.Name,
						type: 'post',
						PostName: i.Name,
						PostOID: i.OID,
						DeptName: parent.type === 'dept' ? parent.Name : '',
						OrgName: parent.type === 'unit' ? parent.Name : '',
						DeptOID: parent.type === 'dept' ? parent.OID : '',
						OrgOID: parent.type === 'unit' ? parent.OID : ''
					});
				}
			});

			flatData.value = allItems;
		} catch (e) {
			console.error(e);
		} finally {
			pageLoading.value = false;
		}
	});

	const getPersonQuery = () => ({
		tag: 'sel',
		tb: 'Sys_User',
		alias: 'person',
		tbAlias: 'T1',
		wh: {
			Filter: 'T1.Status = {status}',
			Param: {
				status: 1
			}
		},
		field: `T1.Sys_UserOID as OID, T1.SYS_DivisionOID, T1.Sys_OrganizeOID, T1.RealName as Name, Post.PostName`,
		jo: [{
			tableName: 'Sys_Post',
			alias: 'Post',
			on: 'T1.Sys_PostOID = Post.Sys_PostOID',
			joinType: 1
		}],
		tol: 9999
	});
	const getOrgDeptQuery = () => ({
		tag: 'sel',
		tb: 'Sys_Organize',
		alias: 'orgdept',
		tbAlias: 'T1',
		wh: {
			Filter: 'T1.Status = {status}',
			Param: {
				status: 1
			}
		},
		field: `Sys_OrganizeOID as OID, ParentOID, OrgName as Name, ORG_FLG as Lev`,
		tol: 9999
	});
	const getPostQuery = () => ({
		tag: 'sel',
		tb: 'Sys_Post',
		alias: 'post',
		tbAlias: 'T1',
		wh: {
			Filter: 'T1.Status = {status}',
			Param: {
				status: 1
			}
		},
		field: `Sys_PostOID as OID, Sys_Division_FK, PostName as Name`,
		tol: 9999
	});

	const combinedList = computed(() => {
		const cur = pathStack.value[pathStack.value.length - 1];
		let items = flatData.value.filter(i => i.PID === cur.UOID);
		if (activeType.value === 'unit') return items.filter(i => i.type === 'unit');
		return items.filter(i => i.type === 'unit' || i.type === 'dept' || i.type === activeType.value);
	});

	const checkHasChildren = (item) => {
		if (activeType.value === 'unit') return pathStack.value.length === 1;
		return flatData.value.some(i => i.PID === item.UOID && (i.type === 'unit' || i.type === 'dept' || i.type ===
			activeType.value));
	};

	const onItemClick = (item) => {
		if (checkHasChildren(item)) pathStack.value.push(item);
		else if (item.type === activeType.value) handleSelect(item);
	};

	const handleSelect = (item) => {
		// Radio 模式
		if (chooseMode.value === 'radio') {
			if (selectedMap.value.has(item.UOID)) {
				selectedMap.value.delete(item.UOID);
			} else {
				selectedMap.value.clear();
				selectedMap.value.set(item.UOID, item);
			}
			if (selectedMap.value.size === 0) showSelectedList.value = false;
			return;
		}

		// Checkbox 模式
		if (chooseMode.value === 'checkbox') {
			if (selectedMap.value.has(item.UOID)) {
				selectedMap.value.delete(item.UOID);
				if (selectedMap.value.size === 0) showSelectedList.value = false;
				return;
			}
			if (selectedMap.value.size > 0) {
				const firstItem = selectedMap.value.values().next().value;
				if (firstItem && firstItem.type !== item.type) {
					uni.showModal({
						title: '提示',
						content: `当前已选择 ${getIconText(firstItem)} 类型，切换将清空已选`,
						success: (res) => {
							if (res.confirm) {
								selectedMap.value.clear();
								selectedMap.value.set(item.UOID, item);
							}
						}
					});
					return;
				}
			}
		}

		// FCheck / Checkbox 通用
		if (selectedMap.value.has(item.UOID)) {
			selectedMap.value.delete(item.UOID);
			if (selectedMap.value.size === 0) showSelectedList.value = false;
		} else {
			selectedMap.value.set(item.UOID, item);
		}
	};

	const jumpToPath = (idx) => pathStack.value = pathStack.value.slice(0, idx + 1);

	const getIconText = (i) => {
		if (i.type === 'user') return '员';
		if (i.type === 'unit') return '单';
		if (i.type === 'dept') return '部';
		if (i.type === 'post') return '岗';
		return '';
	};

	const handleTypeChange = (t) => {
		activeType.value = t;
		pathStack.value = [{
			UOID: 'ROOT',
			Name: '集团总公司',
			type: 'root'
		}];
		isSearching.value = false;
		keyword.value = '';
	};

	const toggleSelectedList = () => {
		if (selectedMap.value.size > 0) showSelectedList.value = !showSelectedList.value;
	};

	const clearAllSelected = () => {
		selectedMap.value.clear();
		showSelectedList.value = false;
	};

	const onSearchInput = () => {
		const v = keyword.value.trim();
		isSearching.value = !!v;
		if (v) searchResults.value = flatData.value.filter(i => i.Name.includes(v) && i.type === activeType.value);
	};

	const clearSearch = () => {
		keyword.value = '';
		isSearching.value = false;
	};
	const getSearchItemPath = (item) => {
		let path = [];
		let pid = item.PID;
		while (pid && pid !== 'ROOT') {
			const p = flatData.value.find(f => f.UOID === pid);
			if (p) {
				path.unshift(p.Name);
				pid = p.PID;
			} else break;
		}
		return path.join(' > ') || '顶级';
	};

	// 修改：返回数据格式 
	const confirmSelection = (e) => {
		// 防御性编程，部分场景下避免刷新
		if (e && e.preventDefault) e.preventDefault();

		const selectedList = Array.from(selectedMap.value.values());

		// 1. 构造 itemsArray，映射内部字段到标准输出字段
		const itemsArray = selectedList.map(i => {
			// 类型映射: user->Person, unit->Org, dept->Dept, post->Post
			let typeStr = i.type;
			if (i.type === 'user') typeStr = 'Person';
			else if (i.type === 'unit') typeStr = 'Org';
			else if (i.type === 'dept') typeStr = 'Dept';
			else if (i.type === 'post') typeStr = 'Post';

			return {
				OID: i.OID || '',
				UOID: i.UOID || '',
				Name: i.Name || '',
				type: typeStr,
				checked: true,
				UserOID: i.type === 'user' ? i.OID : null,
				DeptOID: i.DeptOID || '',
				OrgOID: i.OrgOID || '',
				PostOID: i.PostOID || '',
				PostName: i.PostName || '',
				DeptName: i.DeptName || '',
				OrgName: i.OrgName || '',
				MobilePhone: null,
				Name_All: i.Name || '',
				id: undefined,
				path: i.path || getSearchItemPath(i)
			};
		});

		// 2. 构造“类数组对象”，将指定 Key 的值拼成逗号分隔字符串挂载到数组对象上
		const result = [...itemsArray];
		const keys = ['OID', 'UOID', 'Name', 'DeptOID', 'OrgOID', 'PostOID', 'PostName', 'DeptName', 'OrgName'];

		keys.forEach(key => {
			result[key] = itemsArray.map(item => {
				const val = item[key];
				// 关键：即使值为空，也保留空字符串，确保逗号分隔的数量与数组长度一致
				return (val === null || val === undefined) ? '' : String(val);
			}).join(',');
		});

		const eventChannel = proxy.getOpenerEventChannel();
		// 将选中数据回传给父页面
		eventChannel.emit('acceptDataFromChild', result);
		uni.navigateBack();
	}
</script>

<style lang="scss" scoped>
	.app-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #fff;
		overflow: hidden;
	}

	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
	}

	.search-header {
		padding: 20rpx 30rpx;
		flex-shrink: 0;
	}

	.search-bar {
		display: flex;
		align-items: center;
		background: #f3f4f6;
		height: 72rpx;
		border-radius: 36rpx;
		padding: 0 24rpx;

		input {
			flex: 1;
			margin-left: 12rpx;
			font-size: 26rpx;
		}
	}

	.breadcrumb-container {
		padding: 15rpx 30rpx;
		border-bottom: 1rpx solid #f1f5f9;
		white-space: nowrap;
		flex-shrink: 0;

		.path-item {
			display: inline-block;
			font-size: 24rpx;
			color: #3b82f6;

			.path-active {
				color: #333;
				font-weight: bold;
			}

			.path-sep {
				margin: 0 10rpx;
				color: #ccc;
			}
		}
	}

	.main-content {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.side-bar {
		width: 160rpx;
		background: #f8fafc;
		border-right: 1rpx solid #eee;

		.side-item {
			padding: 40rpx 20rpx;
			font-size: 26rpx;
			color: #64748b;
			text-align: center;

			&.side-active {
				background: #fff;
				color: #3b82f6;
				font-weight: bold;
				border-left: 6rpx solid #3b82f6;
			}
		}
	}

	.list-content {
		flex: 1;
		background: #fff;
		position: relative;

		.scroll-v {
			height: 100%;
		}
	}

	.list-wrapper {
		padding-bottom: 140rpx;
	}

	.select-all-bar {
		display: flex;
		align-items: center;
		padding: 24rpx 30rpx;
		background: #f0f7ff;
		border-bottom: 1rpx solid #dbeafe;
		position: sticky;
		top: 0;
		z-index: 10;

		.select-all-text {
			font-size: 26rpx;
			color: #1d4ed8;
			font-weight: bold;
		}

		.level-count {
			font-size: 24rpx;
			color: #60a5fa;
			margin-left: 8rpx;
		}

		.spacer {
			flex: 1;
		}
	}

	.list-row {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f9fafb;

		&:active {
			background: #f8fafc;
		}
	}

	.row-info {
		flex: 1;
		overflow: hidden;
		margin-right: 10rpx;

		.row-name {
			font-size: 28rpx;
			color: #1e293b;
			display: block;
		}

		.row-sub {
			font-size: 22rpx;
			color: #94a3b8;
			margin-top: 4rpx;
		}
	}

	.action-area {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		min-width: 140rpx;

		.enter-badge {
			display: flex;
			align-items: center;
			background: #eff6ff;
			padding: 4rpx 12rpx;
			border-radius: 8rpx;

			text {
				font-size: 20rpx;
				color: #3b82f6;
				margin-right: 4rpx;
			}
		}
	}

	.row-icon,
	.mini-icon {
		width: 64rpx;
		height: 64rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: large;
		color: #fff;
		margin-right: 20rpx;

		&.unit {
			font-size: large;
			background: #6366f1;
		}

		&.dept {
			font-size: large;
			background: #3b82f6;
		}

		&.post {
			font-size: large;
			background: #f59e0b;
		}

		&.user {
			font-size: large;
			background: #10b981;
			border-radius: 50%;
		}
	}

	.mini-icon {
		width: 44rpx;
		height: 44rpx;
		font-size: 18rpx;
		border-radius: 8rpx;
		margin-right: 16rpx;
	}

	/* 单选框样式 */
	.radio-circle {
		width: 42rpx;
		height: 42rpx;
		border: 3rpx solid #cbd5e1;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		&.checked {
			border-color: #3b82f6;

			.inner-dot {
				width: 18rpx;
				height: 18rpx;
				background: #3b82f6;
				border-radius: 50%;
			}
		}
	}

	/* 复选框样式（方形） */
	.check-box {
		width: 42rpx;
		height: 42rpx;
		border: 3rpx solid #cbd5e1;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s;

		&.checked {
			border-color: #3b82f6;
			background: #3b82f6;
		}
	}

	.fixed-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 110rpx;
		background: #fff;
		border-top: 1rpx solid #eee;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 40rpx;
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 100;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);

		.footer-left {
			display: flex;
			align-items: center;
			height: 100%;
			flex: 1;

			.selected-label {
				font-size: 30rpx;
				color: #64748b;
			}

			.selected-count {
				font-size: 36rpx;
				color: #3b82f6;
				font-weight: bold;
			}

			.arrow-box {
				margin-left: 12rpx;
				display: flex;
				align-items: center;
			}

			.arrow-icon {
				width: 0;
				height: 0;
				border-left: 8rpx solid transparent;
				border-right: 8rpx solid transparent;
				transition: transform 0.3s;
			}

			.arrow-up {
				border-bottom: 10rpx solid #3b82f6;
			}

			.arrow-down {
				border-top: 10rpx solid #3b82f6;
			}
		}

		.confirm-btn {
			background: #3b82f6;
			color: #fff;
			font-size: 30rpx;
			height: 74rpx;
			line-height: 74rpx;
			padding: 0 50rpx;
			border-radius: 37rpx;
			margin: 0;

			&:active {
				opacity: 0.8;
			}
		}
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 90;
	}

	.selected-drawer {
		position: fixed;
		bottom: 110rpx;
		left: 0;
		right: 0;
		background: #fff;
		z-index: 95;
		border-radius: 24rpx 24rpx 0 0;
		transform: translateY(120%);
		transition: transform 0.3s;
		max-height: 700rpx;
		display: flex;
		flex-direction: column;
		padding-bottom: env(safe-area-inset-bottom);

		&.drawer-open {
			transform: translateY(0);
		}

		.drawer-header {
			flex-shrink: 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx 40rpx;
			border-bottom: 1rpx solid #f1f5f9;

			.header-left {
				display: flex;
				align-items: center;

				.title {
					font-size: 32rpx;
					font-weight: bold;
				}

				.count {
					font-size: 28rpx;
					color: #94a3b8;
					margin-left: 8rpx;
				}
			}

			.clear-btn {
				font-size: 26rpx;
				color: #ef4444;
			}
		}

		.drawer-scroll {
			flex: 1;
			overflow-y: auto;

			.drawer-list-inner {
				display: flex;
				flex-direction: column;

				.drawer-item {
					display: flex;
					align-items: center;
					padding: 24rpx 40rpx;
					border-bottom: 1rpx solid #f9fafb;

					.item-info {
						flex: 1;

						.name {
							font-size: 32rpx;
							color: #333;
						}

						.path {
							font-size: 24rpx;
							color: #999;
							display: block;
							margin-top: 2rpx;
						}
					}

					.remove-action {
						padding: 10rpx;
					}
				}
			}
		}
	}

	.loading-state {
		padding-top: 100rpx;
		display: flex;
		justify-content: center;

		.spinner {
			width: 40rpx;
			height: 40rpx;
			border: 4rpx solid #f3f4f6;
			border-top-color: #3b82f6;
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>