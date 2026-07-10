//选择页数据 81
// 该文件用于处理数据源 详细转换规则请看README.md

/**
 * 处理数据源
 */
export function handleDataAPI(DataAPIList, ComponentList) {
	// 处理主组件数据源
	function handleMainComponent(MC_DataAPIList) {
		MC_DataAPIList.forEach((DataAPI) => {
			if (DataAPI.Relation == '1') {
				let aliasPointField = findFieldName(DataAPI, DataAPI.R_ChildField) // 查找出子表关联字段对应的别名
				const ParentDataAPI = getParentDataAPI(DataAPI.ParentOID, MC_DataAPIList)
				const M_AliasOrTb = ParentDataAPI.alias || ParentDataAPI.tb
				DataAPI.ChildAlias = [...DataAPI.ChildAlias, M_AliasOrTb]
				if (DataAPI.wh.Filter) {
					DataAPI.wh.Filter =
						`( ${DataAPI.wh.Filter} ) AND ${aliasPointField} in {${M_AliasOrTb}.${DataAPI.R_MainField}}`
				} else {
					DataAPI.wh.Filter = `${aliasPointField} in {${M_AliasOrTb}.${DataAPI.R_MainField}}`
				}
				if (!DataAPI.wh.Param) DataAPI.wh.Param = {}
			}
		})
	}

	// 子组件数据源处理 参数说明: 主组件数据源 子组件数据源 主组件信息 子组件信息
	function handleSubComponent(MC_DataAPIList, SC_DataAPIList, SC_Info) {
		let MC_M_DataAPI,
			MC_SR_DataAPI,
			SC_M_DataAPI,
			SC_SR_DataAPI,
			MC_OS_DataAPI = [],
			SC_OS_DataAPI = []
		MC_DataAPIList.forEach((item) => {
			// 主数据源
			if (!item.Relation) MC_M_DataAPI = item
			const fieldList = extractFields(item.field, item.oField)
			if (fieldList.includes(SC_Info.MC_Field) && item.Relation == '1') {
				// 组件关联的数据源
				MC_SR_DataAPI = item
			} else if (item.Relation == '1') {
				// 子数据源
				MC_OS_DataAPI.push(item)
			}
		})
		SC_DataAPIList.forEach((item) => {
			// 主数据源
			if (!item.Relation) SC_M_DataAPI = item
			const fieldList = extractFields(item.field, item.oField)
			if (fieldList.includes(getFieldName(SC_Info.SC_Field)) && item.Relation == '1') {
				// 组件关联的数据源
				const M_fieldList = extractFields(item.field, item.oField)
				if (!M_fieldList.includes(getFieldName(SC_Info.SC_Field))) SC_SR_DataAPI = item
			} else if (item.Relation == '1') {
				// 子数据源
				SC_OS_DataAPI.push(item)
			}
		})
		const MC_M_AliasOrTb = MC_M_DataAPI ? MC_M_DataAPI.alias || MC_M_DataAPI.tb : null
		const MC_SR_AliasOrTb = MC_SR_DataAPI ? MC_SR_DataAPI.alias || MC_SR_DataAPI.tb : null

		SC_OS_DataAPI.forEach((DataAPI) => {
			const ParentDataAPI = getParentDataAPI(DataAPI.ParentOID, SC_DataAPIList)
			const M_AliasOrTb = ParentDataAPI.alias || ParentDataAPI.tb
			let aliasPointField = findFieldName(DataAPI, DataAPI.R_ChildField)
			DataAPI.ChildAlias = [M_AliasOrTb]
			if (DataAPI.wh.Filter) {
				DataAPI.wh.Filter =
					`( ${DataAPI.wh.Filter} ) AND ${aliasPointField} in {${M_AliasOrTb}.${DataAPI.R_MainField}}`
			} else {
				DataAPI.wh.Filter = `${aliasPointField} in {${M_AliasOrTb}.${DataAPI.R_MainField}}`
			}
			if (!DataAPI.wh.Param) DataAPI.wh.Param = {}
		})

		if (!MC_SR_DataAPI && !SC_SR_DataAPI) {
			// 主组件主数据源 与 子组件主数据源关联 ==> 主关联数据源插入关联条件
			let aliasPointField = getRealSCField(SC_M_DataAPI, SC_Info.SC_Field)
			SC_M_DataAPI.ChildAlias = [MC_M_AliasOrTb]
			SC_M_DataAPI.wh.Filter =
				`${SC_M_DataAPI.wh.Filter ? `( ${SC_M_DataAPI.wh.Filter} ) AND ` : ''}${aliasPointField} in {${`${MC_M_AliasOrTb}.${SC_Info.MC_Field}`}}`
			if (!SC_M_DataAPI.wh.Param) SC_M_DataAPI.wh.Param = {}
		} else if (MC_SR_DataAPI && !SC_SR_DataAPI) {
			// 主组件子数据源与 子组件主数据源关联 ==> 主关联数据源插入关联条件
			let aliasPointField = getRealSCField(SC_M_DataAPI, SC_Info.SC_Field)
			SC_M_DataAPI.ChildAlias = [MC_SR_AliasOrTb]
			SC_M_DataAPI.wh.Filter = `${SC_M_DataAPI.wh.Filter ? `( ${SC_M_DataAPI.wh.Filter} ) AND ` : ''
                }${aliasPointField} in {${`${MC_SR_AliasOrTb}.${SC_Info.MC_Field}`}}`
			if (!SC_M_DataAPI.wh.Param) SC_M_DataAPI.wh.Param = {}
		} else {
			// 主组件子数据源与 子组件子数据源关联 ==> 子关联数据源插入关联条件
			// 有歧义 暂时没想通
			uni.showToast({
				title: "不支持子组件的子数据源与主组件的数据源关联！",
				duration: 5000
			})
		}
	}

	function getPageComponentByOID(OID) {
		return ComponentList.find(item => item.Dev_PageComponentOID == OID)
	}

	// 数据源 wh jo 转换
	DataAPIList.forEach((DataAPI) => {
		DataAPI.wh = jsonParse(DataAPI.wh)
		DataAPI.jo = DataAPI.jo ? jsonParse(DataAPI.jo) : []
		DataAPI.ChildAlias = DataAPI.ChildAlias ? jsonParse(DataAPI.ChildAlias) : []
		DataAPI.oField = DataAPI.oField ? jsonParse(DataAPI.oField) : {}
		DataAPI.groupBy = DataAPI.groupBy ? jsonParse(DataAPI.groupBy) : []
	})
	// 数据源分类
	const C_DataAPIList = groupByCategory(DataAPIList, 'BusinessKey')

	for (const Dev_PageComponentOID in C_DataAPIList) {
		// 获取组件信息
		const Dev_PageComponent = getPageComponentByOID(Dev_PageComponentOID)
		// 获取组件绑定的 组件主键OID
		const MC_Key = Dev_PageComponent.MC_Key
		// 判断组件是否为主组件 判断MC_Key是否为空
		if (isEmptyUUID(MC_Key)) {
			// 主组件数据源处理
			handleMainComponent(C_DataAPIList[Dev_PageComponentOID])
		} else {
			// 子组件数据源处理
			handleSubComponent(C_DataAPIList[MC_Key], C_DataAPIList[Dev_PageComponentOID], Dev_PageComponent)
		}
	}
	return DataAPIList
}



/**
 * 根据数据源获取字段的查询格式 字段 | 别名.字段
 * @param {*} DataAPI 数据源
 * @param {*} field   查找字段
 */
function findFieldName(DataAPI, field) {
	let aliasPointField = field
	if (aliasPointField.includes('.')) {
		return aliasPointField
	} else if (!DataAPI.jo.length) {
		return DataAPI.tbAlias ? `${DataAPI.tbAlias}.${aliasPointField}` : aliasPointField
	} else {
		// 从数据源中找到目标字段
		const fieldList = DataAPI.field.split(',')
		for (let i = 0; i < fieldList.length; i++) {
			if (fieldList[i].includes('.')) {
				const [, fieldName] = fieldList[i].split('.')
				if (field === fieldName) return fieldList[i]
			}
		}

		uni.showToast({
			title: "找不到字段" + field,
			duration: 5000
		})

		//console.error('找不到字段', field)
		return void 0
	}
}


/**
 * 获取数据源的父级数据源
 * @param {*} ParentOID       父级数据源OID 
 * @param {*} DataAPIOIDList  数据源列表
 * @returns 
 */
function getParentDataAPI(ParentOID, DataAPIOIDList) {
	const masterDS = DataAPIOIDList.find(item => !item.Relation)
	if (isEmptyUUID(ParentOID)) {
		return masterDS
	} else {
		const find = DataAPIOIDList.find((item) => item.Pub_DataAPIOID === ParentOID)
		if (find) return find
		else {
			uni.showToast({
				title: "找不到父级数据源",
				duration: 5000
			})
			return
		}
	}
}


function extractFields(...fieldInfo) {
	const fields = []
	fieldInfo.forEach((info) => {
		if (info && typeof info === 'string') {
			const infoFields = info.split(',').map((field) => {
				const asIndex = field.toLowerCase().indexOf(' as ')
				if (asIndex > -1) {
					return field.substring(asIndex + 4).trim()
				} else if (field.indexOf('.') > -1) {
					return field.substring(field.indexOf('.') + 1).trim()
				} else if (field.indexOf('=') > -1) {
					return field.split('=')[0].trim()
				} else {
					return field.trim()
				}
			})
			fields.push(...infoFields)
		} else if (isObject(info)) {
			fields.push(...Object.keys(info))
		} else if (isArray(info)) {
			fields.push(extractFields(...info))
		}
	})
	return fields
}

function isObject(val) {
	return val !== null && is(val, 'Object')
}
/**判断是否数组类型 */
function isArray(val) {
	return val && Array.isArray(val)
}

function is(val, type) {
	return toString.call(val) === `[object ${type}]`
}

function groupByCategory(data, propertyName) {
	return data.reduce((acc, obj) => {
		const category = obj[propertyName]
		if (!acc[category]) {
			acc[category] = []
		}
		acc[category].push(obj)
		return acc
	}, {})
}

function jsonParse(str) {
	if (!str) return {}
	if (isObject(str) || isArray(str)) return str
	try {
		return JSON.parse(str)
	} catch (e) {
		if (typeof str === 'string' && str.startsWith('[')) return []
		return {}
	}
}


function getFieldName(fieldStr) {
	if (!fieldStr) {
		return '';
	} else if (fieldStr.indexOf('.') > -1) {
		return fieldStr.split('.').at(-1)
	} else {
		return fieldStr;
	}
}

function isEmptyUUID(val) {
	return val === '00000000-0000-0000-0000-000000000000' || val === '' || val === null || val === undefined
}


function getRealSCField(DataAPI, field) {
	const realFields = extractFields(DataAPI.field)
	const rawFields = DataAPI.field ? DataAPI.field.split(',') : []
	const tbAliasOrTb = DataAPI.tbAlias || DataAPI.tb

	const tableNameList = [{
		tableName: DataAPI.tb,
		alias: DataAPI.tbAlias || DataAPI.tb
	}, ...DataAPI.jo]

	if (field.includes('.')) {
		const aliasName = field.split('.')[0]
		if (tableNameList.some(item => item.alias === aliasName)) return field
	} else {
		// 从数据源字段判断
		const index = realFields.findIndex(item => item === field)
		if (index > -1) {
			const rawField = rawFields[index]
			if (rawField.includes('.')) return rawField
			else if (!DataAPI.jo.length) return `${tbAliasOrTb}.${rawField}`
		}
	}
	uni.showToast({
		title: "无法识别子组件字段, 请检查【页面组件】的【当前组件字段】是否正确！",
		duration: 5000
	})

}