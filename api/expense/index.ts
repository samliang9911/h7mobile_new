import { request } from '../autopage'
import { http_request } from '/api/api.js'
import { queryApi } from '../autopage/indexTypes'
import { Data, NodeIdea, getAudit, getFormData, getReadData, getIdeaJson, parseDetailApi } from './hook'
import { jParse } from '../autopage/cleansData'
import { generateUUID } from '/utils/index'

/**获取审批单*/
export const getApproval = async (param) => {
	const { naviId, Flow_AssignTaskOID, InstanceID } = param;

	// 扩展信息 & 审核信息
	const extend = getIdeaJson(InstanceID)
	const audit = naviId == 1 ? getAudit(Flow_AssignTaskOID) : Promise.resolve()

	// 表单数据
	const form = await (
		['1', '2'].includes(naviId)
			? getFormData(Flow_AssignTaskOID, InstanceID)
			: getReadData(InstanceID)
	)

	audit.then(auditData => {
		auditData.isStretch = form.isStretch
	})

	// ====== 代码表处理整合 ======
	// 从表单配置里提取 codeTable
	const config = form.describe || []

	const CodeTableID = config
		.filter(col => col.codeTable)
		.map(col => col.codeTable)

	// 请求代码表数据
	const codeValue = CodeTableID.length ? await request([{
		tag: 'sel',
		tb: 'Sys_CodeValue',
		field: 'CodeTableID,CodeName,CodeID',
		tol: 9999,
		wh: {
			Filter: 'CodeTableID in {CodeTableID}',
			Param: { CodeTableID }
		}
	}]) : []

	// 将代码表映射到数据
	const parseCodeTableFlat = (fields : any[], codeValue : any[]) => {
		fields.forEach(field => {
			if (field.codeTable && field.value != null) {
				const match = codeValue.find(cv =>
					cv.CodeTableID === field.codeTable &&
					cv.CodeID === field.value
				)
				if (match) {
					field.value = match.CodeName
				}
			}
		})

		return fields
	}

	// 实现代码表转换
	const parsedDescribe = parseCodeTableFlat(config, codeValue)

	// ====== 返回结果 ======
	return {
		...form,
		naviId,
		extend: await extend,
		audit: await audit,
		describe: parsedDescribe // 替换后的字段数组
	}
}

/**获取附件 */
export const getAnnex = async (param) => {
	const { Flow_AssignTaskOID, Flow_ReadRecordOID, InstanceID, naviId } = param;
	let res = await (
		['1', '2'].includes(naviId)
			? new Data(Flow_AssignTaskOID) as any
			: request([{
				tag: 'sel',
				tb: 'Flow_ReadRecord',
				tbAlias: 'T1',
				field: 'T2.*',
				jo: [{
					tableName: "Flow_BusinessType",
					alias: "T2",
					on: "T1.TableLX = T2.TypeNo"
				}],
				wh: {
					Filter: 'T1.Flow_ReadRecordOID = {Flow_ReadRecordOID}',
					Param: { Flow_ReadRecordOID }
				}
			}])
	)
	if (Array.isArray(res)) res = res[0]
	const businessData = (await request([{
		tag: 'sel',
		tb: res.BusinessTable,
		field: '*',
		wh: {
			Filter: `InstanceID = {InstanceID}`,
			Param: { InstanceID }
		}
	}]))[0] || {}
	const config : { [key : string] : any } = jParse(res.FormConfig_Mobile) || {}
	type AnnexConfig = {
		/**唯一标识符 */
		"guid" ?: string
		/**附件标题 */
		"title" : string
		/**附件表名 */
		"annexTb" : string
		/**附件关联子表外键 */
		"annexKey" : string
		/**子表名 */
		"tb" : string
		/**子表与主表关系 */
		"relation" : {
			/**主表主键 */
			"main" : string
			/**子表外键 */
			"child" : string
		}
	}[]
	/**获取附件数据 */
	const get = async (config : AnnexConfig = [], data = {}, main) => {
		if (!config.find(e => e.tb == main.BusinessTable)) {
			const tb = main.BusinessTable
			config.unshift({
				tb,
				annexTb: 'Pub_BusinessFile',
				title: main.TypeName,
				annexKey: 'BusinessKey',
				relation: {
					main: tb + 'OID',
					child: tb + 'OID'
				}
			})
		}
		const json = config.reduce((a, e) => {
			const guid = e.guid = generateUUID('_')
			const child = {
				alias: guid,
				tag: 'sel',
				tb: e.tb,
				field: e.tb + 'OID',
				wh: {
					Filter: ` ${e.relation.child} = {oid} `,
					Param: { oid: data[e.relation.main] || '' }
				}
			}
			const annex = {
				alias: guid + 'annex',
				ChildAlias: [guid],
				tag: 'sel',
				tb: e.annexTb,
				field: '*',
				wh: {
					Filter: ` ${e.annexKey} in {${guid}.${e.tb}OID} `
				}
			}
			a.push(...[child, annex])
			return a
		}, [] as any)
		const res = await http_request('', { json })
/* 		const result = config.map(e => ({
			title: e.title,
			annex: res[e.guid + 'annex'].Items.map(v => ({
				guid: v.Pub_BusinessFileOID,
				name: v.FileName,
				path: v.FilePath,
				type: v.FileType,
				user: v.PersonName,
				date: v.SYS_Created,
				FileSize: v.FileSize,
				FileSizeKb: v.FileSizeKb,
				Pub_BusinessFileOID: v.Pub_BusinessFileOID

			}))
		})).filter(e => e.annex.length) */
		
		const result = config.map(e => ({
			title: e.title,
			annex: res[e.guid + 'annex'].Items.map(v => ({
				...v
			}))
		})).filter(e => e.annex.length)
		if (result.length == 1 && result[0].title == main.TypeName) {
			result[0].title = ''
		}
		return result
	}
	return get(config.annex, businessData, res)
}
/**获取流程 */
export const getFlow = async (param) => {
	const { InstanceID } = param
	const data = (await new NodeIdea(InstanceID) as any).filter(f => f.ActivityType != 'End')
	return {
		actuallyLineData: data.filter(e => e.createTime),
		preditLineData: data.map(e => {
			const obj = { ...e }
			obj.ExecutorInfo = e.ExecutorInfo.map(o => {
				const u = { ...o }
				if (o.ResolutionCode == "UnProcessed") {
					delete u.ResolutionCode;
					//obj.createTime = ''
				}
				return u
			})
			return obj
		})
	}
}
let detail : any[] = []
/**获取明细 */
export const getDetail = async ({ Flow_AssignTaskOID }) => {
	type Columns = {
		field : string
		label : string
		codeTable ?: string
	}[]
	type Config = {
		title : string
		api : queryApi[]
		columns : Columns
		data : { [key : string] : any }[]
	}[]

	// 1. 获取表单配置
	const res = await new Data(Flow_AssignTaskOID) as any
	const config : Config = jParse(res.FormConfig_Mobile, {}).detail || []

	// 2. 收集所有 codeTable ID
	const CodeTableID = config.reduce((acc, table) => {
		acc.push(...table.columns
			.filter(col => col.codeTable)
			.map(col => col.codeTable as string))
		return acc
	}, [] as string[])

	// 3. 请求代码表映射数据
	const codeValue = CodeTableID.length ? await request([{
		tag: 'sel',
		tb: 'Sys_CodeValue',
		field: 'CodeTableID,CodeName,CodeID',
		tol: 9999,
		wh: {
			Filter: 'CodeTableID in {CodeTableID}',
			Param: { CodeTableID }
		}
	}]) : []

	// 4. 保存每个明细的 API 配置
	detail = config.map(e => e.api?.length ? parseDetailApi(e, res) : [])

	// 5. 请求每个明细的数据
	const dataList = await Promise.all(
		config.map(e => e.api?.length ? request(parseDetailApi(e, res)) : [])
	)

	// 6. 处理数据：代码表转换 + 附件挂载
	const parse = async (data : any[], columns : Columns, tbName : string) => {
		// ✅ 使用统一的代码表转换函数
		parseCodeTableFlat(data, columns, codeValue)

		// 附件挂载
		const oidField = tbName + 'OID'
		for (const row of data) {
			const oid = row[oidField]
			if (!oid) {
				row.annex = []
				continue
			}
			const annexRes = await request([{
				tag: 'sel',
				tb: 'Pub_BusinessFile',
				field: '*',
				tol: 9999,
				wh: {
					Filter: 'BusinessKey = {oid}',
					Param: { oid }
				}
			}])
			row.annex = annexRes.map(v => ({
				guid: v.Pub_BusinessFileOID || '',
				name: v.FileName || '',
				path: v.FilePath || '',
				type: v.FileType || '',
				user: v.PersonName || '',
				date: v.SYS_Created || ''
			}))
		}

		return data
	}

	// 7. 返回结果：每个明细带 columns、data、codeValue
	const result = await Promise.all(config.map(async (e, i) => ({
		title: e.title,
		columns: e.columns,
		codeValue, // ✅ 挂载代码表映射，方便触底加载时使用
		data: await parse(dataList[i], e.columns, e.api?.[0]?.tb || '')
	})))

	return result
}

/**单个明细表格数据 */
export const getDetailSingle = async (index, pages) => {
	const api = jParse(detail[index])
	api[0].pages = pages
	return request(api)
}

/**代码表转换函数（在文件内定义） */
export function parseCodeTableFlat(data : any[], columns : any[], code : any[]) {
	data.forEach(row => {
		for (const key in row) {
			const col = columns.find(c => c.field === key)
			if (col?.codeTable) {
				const codeData = code.filter(cv => cv.CodeTableID === col.codeTable)
				if (codeData.length) {
					row[key] = codeData.find(v => v.CodeID === row[key])?.CodeName || row[key]
				}
			}
		}
	})
	return data
}

/**提交审核内容 */
export const commitAudit = async ({ action, person = [] as { id : string, post : string, moving : string }[], code = '', codeValue = '', content = '' }) => {
	const url = uni.getStorageSync('serverUrl') + "/api/flowAction/approvalHandle"
	type ToActivityInfo = {
		/**【申请人修改|成本会计】的id */
		activityID : string,
		/**人员主键 */
		executorStrOID : string,
		/**岗位主键 */
		executorPostStrOID : string
	}
	const actionList = [{
		action,
		TaskID: Data.id,
		personOIDs: person.map(e => e.id),
		IdeaCode: code,
		IdeaCodeValue: codeValue,
		IdeaContent: content,
		haveActivity: !!person.length,
		toActivityInfo: person.map(e => ({
			activityID: e.moving,
			executorStrOID: e.id,
			executorPostStrOID: e.post
		})) as ToActivityInfo[]
	}]
	await http_request('', { actionList }, url)
}
/**保存审批流程内容 */
export const saveFlow = ({ code, content }) : Promise<any> =>
	http_request('', {
		json: [
			{
				tag: 'upd',
				tb: 'Flow_AssignTask',
				field: [{
					Flow_AssignTaskOID: Data.id,
					IdeaCode: code,
					IdeaContent: content
				}]
			}
		]
	})