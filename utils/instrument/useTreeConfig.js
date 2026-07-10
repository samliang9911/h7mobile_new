/**
 * 解析树配置
 * @param {*} Config  Pub_Config配置
 * @returns
 */
export const useTreeConfig = (Config, data) => {
	if (!isObject(Config)) {
		Config = jsonParse(Config)
	}
	const TreeBasics = Config['Tree'] ? Object.values(Config['Tree']).flatMap((o) => Object.values(o).flatMap((e) =>
		e)) : []

	function getParamValue(Basics, Param) {
		return Basics.find((e) => e.Param === Param)?.Value
	}

	/**
	 * 将数据转换为树形结构
	 * @param {*} nodes 数据
	 * @param {*} idKey 主键
	 * @param {*} parentKey 父键
	 * @param {*} childrenKey 子元素键
	 * @returns
	 */
	function buildTree(nodes, idKey, parentKey = 'ParentOID', childrenKey = 'children') {
		const tree = []
		const lookup = {}

		// 初始化每个节点的字典
		nodes.forEach((node) => {
			node[childrenKey] = []
			lookup[node[idKey]] = node
		})

		// 构建树结构
		nodes.forEach((node) => {
			if (!node[parentKey] || node[parentKey] === '00000000-0000-0000-0000-000000000000') {
				tree.push(node)
			} else {
				const parent = lookup[node[parentKey]]
				if (parent) {
					parent[childrenKey].push(node)
				}
			}
		})

		return tree
	}

	// #region ----------------------------树--------------------------------begin
	const TreeConfig = {
		/** 树组件的标识字段 */
		NodeKeyField: getParamValue(TreeBasics, 'NodeKeyField') || 'OID',
		/** 树组件的节点名称字段 */
		NodeNameField: getParamValue(TreeBasics, 'NodeNameField') || 'NodeName',
		/** 树组件的父节点字段 */
		ParentNodeField: getParamValue(TreeBasics, 'ParentNodeField') || 'ParentOID'
	}

	return {
		...TreeConfig,
		data: buildTree(data, TreeConfig.NodeKeyField, TreeConfig.ParentNodeField)
	}
}




function isObject(val) {
	return val && toString.call(val) === '[object Object]'
}

function isArray(val) {
	return val && Array.isArray(val)
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