import { request as rawRequest } from "../api";
import { queryApi, CompConfig } from './indexTypes'
import { generateUUID } from '@/utils/index'
import cleansData from './cleansData'
import { useGlobalStoreHook } from '@/store/modules/autoPage'
/**数据请求 */
export const request = (sql : queryApi[]) : Promise<{ [key : string] : any }[]> =>
	rawRequest(sql).then((e : Object) => {
		let keys = Object.keys(e)
		return keys.length > 1 ? keys.reduce((a, b) => (a[b] = e[b].Items, a), {}) : Object.values(e)[0].Items
	});
/**页面布局 */
const getLayout = async (Dev_PageConfigOID) => {
	const layout = await request([{
		tag: 'sel',
		tb: 'Dev_PageConfig',
		field: 'Code,PageName,MobileMode',
		wh: {
			Filter: ' Dev_PageConfigOID = {Dev_PageConfigOID}',
			Param: { Dev_PageConfigOID }
		}
	}])
	if (!layout[0]) throw new Error(`未找到页面【${Dev_PageConfigOID}】`)
	return layout[0]
}
/**页面组件 */

//获取附件配置
export const getComponent = (Dev_PageConfigOID) => {
	return request([
		{
			"tag": "sel",
			"tb": "Dev_PageComponent",
			"field": "T1.*,T2.Config",
			"tbAlias": "T1",
			"jo": [
				{
					"tableName": "Pub_Config",
					"on": "T2.BusinessKey = T1.Dev_PageComponentOID",
					"alias": "T2"
				}
			],
			"wh": {
				"Filter": "T1.Dev_PageConfig_FK = {OID}",
				"Param": { "OID": Dev_PageConfigOID }
			},
			"n_ob": "Sort",
			"tol": 1000
		},
		{
			"tag": "sel",
			"tb": "Pub_FileConfig",
			"field": "*",
			"ChildAlias": ["Dev_PageComponent"],
			"wh": {
				"Filter": "BusinessKey in {Dev_PageComponent.Dev_PageComponentOID}",
				"Param": {}
			},
			"n_ob": "Sort",
			"tol": 1000
		},
		{
			"tag": "sel",
			"tb": "Cus_Config",
			"field": "T1.*,T2.Config",
			"tbAlias": "T1",
			"ChildAlias": ["Dev_PageComponent"],
			"jo": [
				{
					"tableName": "Pub_Config",
					"on": "T1.Cus_ConfigOID = T2.BusinessKey",
					"alias": "T2"
				}
			],
			"wh": {
				"Filter": "T1.Class_FK in {Dev_PageComponent.Dev_PageComponentOID}",
				"Param": {}
			},
			"n_ob": "",
			"tol": 1000
		}
	])
}

/**页面按钮 */
const getButton = (Dev_PageConfigOID) => {
	return request([
		{
			"tag": "sel",
			"tb": "Dev_PageBotton",
			"field": "T1.*",
			"tbAlias": "T1",
			"jo": [
				{
					"tableName": "Dev_PageComponent",
					"on": "T1.Dev_PageComponent_FK = T2.Dev_PageComponentOID",
					"alias": "T2"
				}
			],
			"wh": {
				"Filter": "T2.Dev_PageConfig_FK = {OID}",
				"Param": { "OID": Dev_PageConfigOID }
			},
			"tol": 1000,
			"n_ob": "T1.Sort"
		}
	])
}
/**表单字段 */
const getFormField = (Dev_PageConfigOID) => {
	return request([
		{
			"tag": "sel",
			"tb": "Dev_PageField",
			"field": "T1.*,T3.Config",
			"tbAlias": "T1",
			"jo": [
				{
					"tableName": "Dev_PageComponent",
					"on": "T1.Dev_PageComponent_FK = T2.Dev_PageComponentOID",
					"alias": "T2"
				},
				{
					"tableName": "Pub_Config",
					"on": "T3.BusinessKey = T1.Dev_PageFieldOID",
					"alias": "T3"
				}
			],
			"wh": {
				"Filter": "T2.Dev_PageConfig_FK = {OID}",
				"Param": { "OID": Dev_PageConfigOID }
			},
			"tol": 1000,
			"n_ob": "_Sort"
		},
		{
			"tag": "sel",
			"tb": "Sys_CodeValue",
			"field": "CodeTableID,CodeName as label,CodeID as value",
			"ChildAlias": [
				"Dev_PageField"
			],
			"wh": {
				"Filter": "CodeTableID in {Dev_PageField.CodeTableID} OR CodeTableID = {CodeTableID}",
				"Param": {
					"CodeTableID": "Flow_BusinessState"
				}
			},
			"n_ob": "OrderNo",
			"tol": 1000
		}
	])
}
/** 自定义事件*/
const getCustomEvent = (BusinessKey : string) => {
	return request([{
		tag: 'sel',
		field: 'JSCode',
		tb: 'Sys_DynamicCode',
		wh: {
			Filter: ' BusinessKey = {BusinessKey}',
			Param: { BusinessKey }
		}
	}]).then(e => {
		let data = {}
		try {
			// const decodeData = JSON.parse(e[0]?.JSCode) 

			const rawJSCode = e[0]?.JSCode;

			if (rawJSCode) {
				// 先解码
				const decodedJSCode = c_decodeJR(rawJSCode);
				// 再解析为对象
				data = JSON.parse(decodedJSCode);
			}
		} catch (e) { }
		return data
	})
}
/// 兼容历史的没有编码的，和编码的，处理值
///str 解码的字符，Uint8Array 二进制
// 修正后的解码函数
const c_decodeJR = (str) => {
	if (!isEncoded(str)) return str;
	let _JSCode = str;
	try {
		let byteObj;

		// 如果是字符串格式（从数据库读取），需要先解析
		if (typeof str === 'string') {
			try {
				byteObj = JSON.parse(str);
			} catch (parseError) {
				console.warn("解码时JSON解析失败:", parseError, "原始字符串:", str);
				return str; // 解析失败则返回原字符串
			}
		} else if (typeof str === 'object' && str !== null) {
			// 如果已经是对象格式（从内存获取）
			byteObj = str;
		} else {
			return str; // 非字符串非对象，直接返回
		}

		// 提取字节并转换为字符串
		const keys = Object.keys(byteObj).map(Number).sort((a, b) => a - b);
		const bytes = new Uint8Array(keys.length);

		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			if (byteObj[key] !== undefined) {
				bytes[i] = byteObj[key];
			}
		}
		_JSCode = new TextDecoder('utf-8').decode(bytes);
	} catch (decodeError) {
		console.warn("解码失败:", decodeError, "原始字符串:", str);
		_JSCode = str; // 解码失败时返回原字符串
	}
	return _JSCode;
};

/**
 * 判断输入是否为 Uint8Array 编码后的数组形式
 * 即：[123, 34, 48, ...] 这种数字数组的字符串表示
 * @param {any} input - 输入值（可能是字符串、数组等）
 * @returns {boolean} - true 表示已编码，false 表示是明文
 */
function isEncoded(input) {
	// 如果已经是数组，检查是否为纯数字数组
	if (Array.isArray(input)) {
		return input.length > 0 && input.every(item => typeof item === 'number' && item >= 0 && item <= 255);
	}
	// 如果是字符串，尝试解析为数组
	if (typeof input === 'string') {
		try {
			const arr = JSON.parse(input);
			return Array.isArray(arr) &&
				arr.length > 0 &&
				arr.every(item => typeof item === 'number' && item >= 0 && item <= 255);
		} catch (e) {
			return false; // 解析失败 → 不是编码数据
		}
	}
	// 其他类型（如对象、null 等）→ 不是编码数据
	return false;
}

/**组件数据源 */
const getDataApi = (Dev_PageConfigOID) => {
	return request([{
		"tag": "sel",
		"tb": "Pub_DataAPI",
		"field": "T1.*,T2.MC_Key,T2.IsJoin,T2.MC_Field,T2.SC_Field",
		"tbAlias": "T1",
		"jo": [
			{
				"tableName": "Dev_PageComponent",
				"on": "T1.BusinessKey = T2.Dev_PageComponentOID",
				"alias": "T2"
			}
		],
		"wh": {
			"Filter": "T2.Dev_PageConfig_FK = {Dev_PageConfigOID}",
			"Param": { Dev_PageConfigOID }
		}
	}]).then(e => {

		e.forEach(o => {
			for (let key in o) {
				try { o[key] = JSON.parse(o[key]) } catch (e) { }
			}
		})


		return e
	})
}

//获取附件数据
/* const getAnnaxData = () ={
	return request()
} */

/**获取页面数据*/

export default function (Dev_PageConfigOID : string, extend) {
	return Promise.all([
		getLayout(Dev_PageConfigOID),
		getComponent(Dev_PageConfigOID),
		getFormField(Dev_PageConfigOID),
		getCustomEvent(Dev_PageConfigOID),
		getButton(Dev_PageConfigOID),
		getDataApi(Dev_PageConfigOID)
	]).then(e => {
		/* 	 			const globalStore = useGlobalStoreHook()
							globalStore.setIsBusinessPage(e[0].IsBusinessPage)
						globalStore.init(e) */
		// console.log('IsBusinessPage',globalStore.IsBusinessPage)
		return Layout[e[0].MobileMode || 'childLevel'](e, extend)
	})
}

/**-------------------------以下是工具函数------------------------------------ */

const Layout = {
	/**水平 */
	level(e, extend) {
		const dataApiList = Array.isArray(e[5]) ? e[5] : [];

		// 1. 排序并处理所有组件
		const sortedComponents = e[1].Dev_PageComponent.sort((a, b) => a.Sort - b.Sort);

		// 2. 为每个组件生成 cleansData 数据
		const allTabData = sortedComponents.map(o => {
			const filteredDataApi = dataApiList.filter(
				u => o.Dev_PageComponentOID === u.BusinessKey
			);
			return cleansData({
				extend,
				formConfig: e[2],
				customEvent: e[3],
				component: o,
				dataApi: filteredDataApi,
				annexConfig: e[1].Pub_FileConfig
			});
		});

		// 3. ✅ 只返回 ONE tabs object，data 是所有页签的数组
		return [{
			guid: generateUUID(),
			title: '页签容器',
			name: 'tabs',           // 这个 name 表示“这是一个 tabs 容器”
			data: allTabData,       // ← 所有页签数据都在这里（水平排列）
			config: getTabsButton(allTabData, e[4], e[3]) // 配置也基于全部数据
		}];
	},
	/*    level(e, extend) {
			  const dataApiList = Array.isArray(e[5]) ? e[5] : [];
			const combined = [...e[1].Dev_PageComponent, e[1].Pub_FileConfig[2]];
				const sortedComponents = combined.sort((a, b) => a.Sort - b.Sort);   
				  // 2. 为每个组件生成 cleansData 数据
				  const allTabData = sortedComponents.map(o => {
				   const filteredDataApi = dataApiList.filter(
					  u => o.Dev_PageComponentOID === u.BusinessKey
					);
					return cleansData({
					  extend,
					  formConfig: e[2],
					  customEvent: e[3],
					  component: o,
					  dataApi: filteredDataApi
					});
				  });
				  // 3. ✅ 只返回 ONE tabs object，data 是所有页签的数组
				  return [{
					guid: generateUUID(),
					title: '页签容器',
					name: 'tabs',           // 这个 name 表示“这是一个 tabs 容器”
					data: allTabData,       // ← 所有页签数据都在这里（水平排列）
					config: getTabsButton(allTabData, e[4], e[3]) // 配置也基于全部数据
				  }];
				}, */

	/**垂直 */
	/* vertical(e){
	  return e[1].sort((a,b)=>a.Sort-b.Sort).map(o=>({
		guid:generateUUID(),
		title: '页签',
		name: 'tabs',
		data: [cleansData({
			formConfig:e[2],
			customEvent:e[3],
			component: o,
			})]
	  })) */
	/* 	vertical(e, extend){
		  return e[1].sort((a,b)=>a.Sort-b.Sort).map(o=>({
			guid:generateUUID(),
			title: '页签',
			name: 'tabs',
			data: [cleansData({
				formConfig:e[2],
				customEvent:e[3],
				component: o,
				})]
		  })) */
	/* 	vertical(e, extend){
		  return e[1].sort((a,b)=>a.Sort-b.Sort).map(o=>({
			guid:generateUUID(),
			title: '页签',
			name: 'tabs',
			data: [cleansData({
				  extend,
				  formConfig:e[2],
				  customEvent:e[3],
				  component:o,
				  dataApi:e[5].filter(u=>o.Dev_PageComponentOID==u.BusinessKey)
				  })],
			config:getTabsButton(data,e[4],e[3])
		  }))
	  }, */
	vertical(e, extend) {
		const dataApiList = Array.isArray(e[5]) ? e[5] : [];

		return e[1].Dev_PageComponent
			.sort((a, b) => a.Sort - b.Sort)
			.map(o => {
				// 1. 过滤 dataApi
				const filteredDataApi = dataApiList.filter(
					u => o.Dev_PageComponentOID === u.BusinessKey
				);

				// 2. ✅ 构造 sharedData —— 这就是你要的 data 值
				const sharedData = [
					cleansData({
						extend,
						formConfig: e[2],
						customEvent: e[3],
						component: o,
						dataApi: filteredDataApi
					})
				];

				// 3. 同时用于 data 和 config
				return {
					guid: generateUUID(),
					title: '页签',
					name: 'tabs',
					data: sharedData,                          // ← 用 sharedData
					config: getTabsButton(sharedData, e[4], e[3]) // ← 也用 sharedData
				};
			});
	},
	/**子表水平 */
	childLevel(e, extend) {
		const mainComp = e[1].Dev_PageComponent.find(o => !o.MC_Key || o.MC_Key == '00000000-0000-0000-0000-000000000000')
		let main = [cleansData({
			extend,
			formConfig: e[2],
			customEvent: e[3],
			component: mainComp,
			dataApi: e[5].filter(u => mainComp.Dev_PageComponentOID == u.BusinessKey)
		})]
		let child = e[1].Dev_PageComponent.filter(o => o.MC_Key && o.MC_Key != '00000000-0000-0000-0000-000000000000').sort((a, b) =>
			a.Sort - b.Sort).map(o => cleansData({
				extend,
				formConfig: e[2],
				customEvent: e[3],
				component: o,
				dataApi: e[5].filter(u => o.Dev_PageComponentOID == u.BusinessKey)
			}))
		return [
			{
				guid: generateUUID(),
				title: '页签',
				name: 'tabs',
				data: main,
				config: getTabsButton(main, e[4], e[3]).map(e => ({ guid: e.guid, fixed: true, button: e.button.filter(e => !['antiAudit', 'viewFlow'].includes(e.function)) }))
			},
			{
				guid: generateUUID(),
				title: '页签',
				name: 'tabs',
				data: child,
				config: getTabsButton(child, e[4], e[3])
			}
		]
	}
}
function getTabsButton(tabs, button, event) {
	return tabs.map(e => ({
		guid: e.guid,
		button: button.filter(o => o.Dev_PageComponent_FK == e.guid).map(u => {
			let obj = {
				guid: u.Dev_PageBottonOID,
				color: u.BottonStyle,
				name: u.ButtonName,
				type: u.ButtonType,
				icon: u.BottonIcon,
				function: u.BottonFunction,
			}
			obj.function == 'customFunc' && (obj['code'] = event[e.guid]?.button?.[obj.guid] || '')
			return obj
		})
	}))
}
/**把旧的布局结构转成新的布局结构 */
function parse(layout, component, formConfig, customEvent) : CompConfig[] {
	merge(layout)
	return layout.reduce((a, b) => {
		if (b.type.trim() == 'row') {
			a.push({
				guid: generateUUID(),
				title: '列布局器',
				name: 'column',
				data: b.children.map(item => {
					let c : any = { guid: generateUUID(), title: '行布局器', name: 'row', data: [] }
					if (item.children.length) c.data.push(...parse(item.children, component, formConfig, customEvent));
					else if (item.tab.length) {
						c.data.push({
							guid: generateUUID(),
							title: '页签',
							name: 'tabs',
							data: item.tab.map(e => cleansData({
								formConfig,
								customEvent,
								component: component.find(item => item.Dev_PageComponentOID == e.oid.toLowerCase()),
							}))
						})
					}
					return c
				}, [])
			})
		}
		return a
	}, [])
}
/**把第一行以上的所有行合并到第一行的最后一列的页签上 */
function merge(layout) {
	if (layout.length < 2) return;
	//第二、三...行
	const after = layout.splice(1, layout.length).reduce((a, b) => {
		a.push(...b.children[0].tab)
		return a
	}, [])
	let col = layout[0].children
	//第一行最后一列
	col[col.length - 1].tab.push(...after)
}