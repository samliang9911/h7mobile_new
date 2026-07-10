import { request } from '../autopage'
import { http_request } from '/api/api.js'
import { jParse } from '../autopage/cleansData'
import { generateUUID } from '/utils/index'
import { formatValue } from './format.ts'

export class Data {
	static data : any = null
	static id = null
	constructor(id) {
		return Data.id == id && Data.data ? Data.data : (Data.id = id, Data.data = this.getData(id))
	}
	async getData(id) {
		return (await request([
			{
				"tag": "sel",
				"tb": "Flow_AssignTask",
				"field": "T2.PersonName,T2.BusinessState,T3.SYS_Created,T1.Flow_AssignTaskOID,T1.InstanceID,T1.USR_LOGIN,T1.TaskName,T1.ResolutionCode,T1.IdeaCode,T1.IdeaCodeValue,T1.IdeaContent,T1.DealineTime,T1.Terminal,T1.FinishDate,T1.Power,T1.FromActivityID,T1.FromActivityName,T1.SignPerformer,T1.SignPerformerFK,T1.TableLX,T1.PageID,T1.BusinessUrl,T1.BusinessCode,T1.BusinessCategory,T1.OrgInfo,T1.OrgInfo_FK,T1.ProjectName,T1.Project_FK,T1.Money,T1.Remark,T1.CustomInfo,T1.FlowID,T1.FlowName,T1.ActionRecord,T1.ExecutorName,T1.Executor_FK,T1.ExecutorPost_FK,T1.ProxyName,T1.Proxy_FK,T1.FromTaskOID,T1.RootFromTaskOID,T1.FromActivity_FK,T1.Flow_TaskTicketOID,T1.SYS_ORG,T1.OrgName,T1.SYS_DIVISION,T1.Division,T1.SYS_POSTN,T1.PostName,T1.SYS_LAST_UPD,T1.SYS_CreatedBy,T1.SYS_Last_Upd_By,T1.SYS_REPLACEMENT,T1.SYS_Deleted,T1.OrderNo,T1.AssignedTS,T4.MobileFormPageID,T4.FormConfig_Mobile,T4.MobileFormPage_FK,T4.BusinessTable,T4.TypeName",
				"wh": {
					"Filter": "T1.Flow_AssignTaskOID = {OID}",
					"Param": {
						"OID": id,
					}
				},
				"jo": [
					{
						"tableName": "Flow_FlowInstanceMX",
						"on": "T1.InstanceID = T2.InstanceID",
						"alias": "T2"
					},
					{
						"tableName": "Flow_FlowInstance",
						"on": "T1.InstanceID = T3.InstanceID",
						"alias": "T3"
					},
					{
						"tableName": "Flow_BusinessType",
						"on": "T3.Flow_BusinessType_FK = T4.Flow_BusinessTypeOID",
						"alias": "T4"
					}
				],
				"tol": 10,
				"tbAlias": "T1",
			}
		]))[0] || {}
	}
}
export class NodeIdea {
	static data : any = null
	static id = null
	constructor(id) {
		return NodeIdea.id == id && NodeIdea.data ? NodeIdea.data : (NodeIdea.id = id, NodeIdea.data = this.getData(id))
	}
	async getData(InstanceID) {
		return this.getNodeIdea(await request([
			{
				"tag": "sel",
				"tb": "Flow_ActivityInfoExIns",
				"field": "*",
				"wh": {
					"Filter": "InstanceID = {value} ",
					"Param": {
						"value": InstanceID
					}
				},
				"page": 1,
				"tol": 100
			},
			{
				"tag": "sel",
				"tb": "Flow_LineIns",
				"field": "TransitionId,FromActivityID,FromActivityName,ToActivityID,ToActivityName,Priority,ConditionScript,PassCode,Remark,FromActivity_FK,ToActivity_FK,Flow_FlowModelEx_FK,Flow_LineInsOID,Flow_Line_FK,InstanceID,FromActivityIns_FK,ToActivityIns_FK",
				"wh": {
					"Filter": "InstanceID = {value}",
					"Param": {
						"value": InstanceID
					}
				},
				"page": 1,
				"tol": 100
			},
			{
				"tag": "sel",
				"tb": "Flow_TaskTicket",
				"field": "Flow_TaskTicketOID,FAssignedTask,ActivityID,ActivityName,ActivityType,Status,ExecutorNames,OrderNo,Flow_ActivityInfoExIns_FK,SYS_Created,ResolutionCode",
				"wh": {
					"Filter": "InstanceID = {value} and ResolutionCode != {flowStateResult}",
					"Param": {
						"value": InstanceID,
						"flowStateResult": "Repealed",
					}
				},
				"page": 1,
				"tol": 100
			},
			{
				"tag": "sel",
				"tb": "Flow_AssignTask",
				"field": "Flow_AssignTaskOID,Flow_TaskTicketOID,ResolutionCode,IdeaCode,IdeaCodeValue,IdeaContent,AssignedTS,FinishDate,ExecutorName,ProxyName,OrderNo,SYS_Created",
				"wh": {
					"Filter": "FromActivityType = {type} and InstanceID = {value} and ResolutionCode != {flowStateResult}",
					"Param": {
						"type": "Person",
						"value": InstanceID,
						"flowStateResult": "Repealed",
					}
				},
				"n_ob": "AssignedTS",
				"page": 1,
				"tol": 100
			},
		]) as any)
	}
	getNodeIdea({
		Flow_ActivityInfoExIns: activityList, //节点实例模型
		Flow_LineIns: lineList, //流转线
		Flow_TaskTicket: tickList, //流程任务
		Flow_AssignTask: taskList //待办任务
	}) {
		let startNode = activityList.find(item => item.ActivityType == 'Start') //开始节点
		let toNodeIDList = [startNode.ActivityID]; //目标节点ID，默认开始节点
		let ideaList : any = []; //所有节点的审批意见
		let lastIdeaList : any = []; // 所有节点的最后一次审批数据
		let resultData : any = []; //最终筛选出来的数据

		// 添加最后一次审批的数据
		// 先按步骤升序排序，再遍历添加进审批意见列表
		tickList.sort(function (a, b) { return a.Status - b.Status }).forEach((e) => {

			// 主办人: 存在执行人则取执行人，否则取节点主办人
			let masterRunner = e.ExecutorNames;
			if (!masterRunner) {
				let nodeInfo = activityList.find(d => d.ActivityID == e.ActivityID);
				masterRunner = nodeInfo.MasterRunner;
			}

			// 组装审批意见信息
			const ideaInfo = {
				ActivityID: e.ActivityID,
				ActivityName: e.ActivityName,
				ActivityType: e.ActivityType,
				OrderNo: e.OrderNo,
				createTime: e.SYS_Created,
				Status: e.Status,
				MasterRunner: masterRunner,
				ExecutorInfo: [] as any
			};
			// 补充执行人信息
			const ExecutorInfoList = taskList.filter(item => item.Flow_TaskTicketOID == e.Flow_TaskTicketOID)
			ExecutorInfoList.forEach((r) => {
				ideaInfo.ExecutorInfo.push({
					guid: r.Flow_AssignTaskOID,
					ExecutorName: r.ExecutorName,
					ProxyName: r.ProxyName,
					ResolutionCode: r.ResolutionCode,
					FinishDate: r.FinishDate,
					IdeaCode: r.IdeaCode,
					IdeaCodeValue: r.IdeaCodeValue,
					IdeaContent: r.IdeaContent
				})
			})
			ideaList.push(ideaInfo);
		})
		// 从审批意见列表获取节点最后审批的数据：拷贝、按送达时间降序排序
		ideaList.slice().sort((a, b) => { return b.createTime.localeCompare(a.createTime) }).forEach((e) => {
			if (e.ActivityType === 'Person') {
				// 检测ideaList表中的每个ActivityID是否存在于lastIdeaList表, 是则返回true, 否则返回false
				let isContain = lastIdeaList.some(d => d.ActivityID == e.ActivityID);
				if (!isContain) {
					lastIdeaList.push(e);
				}
			}
		})

		//按照节点数量遍历，对比流转线
		for (let i = 0; i < activityList.length; i++) {

			// 下一个节点的审批信息：先获取下一个节点ID，再匹配出这个节点的审批信息
			// 下一个节点ID: 先检测lineList的每一个来源ID是否存在于toNodeIDList列表，是则添加下一个节点ID
			toNodeIDList = lineList.filter(item => toNodeIDList.some(s => s == item.FromActivityID)).map(item => item.ToActivityID);
			// 下个节点的审批信息：检测最后审批意见列表lastIdeaList的每一个ID是否存在于下个节点列表toNodeIDList，是则添加
			let ideaInfo = lastIdeaList.filter(item => toNodeIDList.some(s => s == item.ActivityID));

			// 存在则添加
			if (ideaInfo.length > 0) {
				//下个节点存在多个时，优先已审批的
				ideaInfo.sort(function (a, b) { return b.Status - a.Status }).forEach((e) => {
					let isContain = resultData.some(d => d.ActivityID == e.ActivityID);
					if (!isContain) {
						resultData.push(e);
					}
				})
			} else {
				// 目标节点清单
				let toActivityList = activityList.filter(e => toNodeIDList.some(d => d == e.ActivityID));
				toActivityList.forEach(e => {
					// 主办人,存在执行人则取执行人，执行人为空则取节点主办人
					let masterRunner = e.ExecutorNames;
					if (!masterRunner) {
						masterRunner = e.MasterRunner;
					}
					const ideaInfo = {
						ActivityID: e.ActivityID,
						ActivityName: e.ActivityName,
						ActivityType: e.ActivityType,
						MasterRunner: masterRunner,
						createTime: null,
						Status: false,
						ExecutorInfo: [{
							ExecutorName: masterRunner,
						}]
					};
					resultData.push(ideaInfo);
				});
			}
		}
		console.log(resultData)
		return resultData;
	}
}
export async function getAudit(taskID) {
	const remind = request([{
		tag: 'sel',
		n_ob: 'OrderNo',
		tb: 'Sys_CodeValue',
		field: 'CodeID as value,CodeName as label',
		wh: {
			Filter: 'CodeTableID = {id}',
			Param: {
				id: 'Pub_SendWay'
			}
		}
	}])
	const res = await http_request({}, { "pageType": "Approval", taskID }, uni.getStorageSync('serverUrl') + '/api/flowGet/approvalData');
	const icon = { WF_XIEBAN: 'calendar', WF_SIGNTO: 'edit-pen', WF_SIGNAFTER: 'edit-pen-fill', WF_SIGN: 'plus', WF_HUIQIN: 'tags', WF_ABORT: 'eye', WF_PAUSE: 'pause' }
	const type = { All: 'checkbox', Balance: 'radio', Function: 'disabled' }
	const t = s => s ? s.split(',') : []
	return {
		movingConfig: {
			type: res.SplitMode == 'AND' ? 'checkbox' : 'radio',
			options: (res.ActivityInfo || []).map(e => ({
				label: e.ActivityName,
				value: e.ActivityID,
				type: type[e.TaskAssignMode],
				child: t(e.ExecutorNames).map((o, i) => ({
					label: o,
					value: t(e.Executors_FK)[i],
					post: t(e.ExecutorsPost_FK)[i]
				}))
			}))
		},
		/**意见决策 */
		decision: (res.IdeaDecision || []).map(e => ({
			value: e.CodeID,
			label: e.CodeName,
			isMovingShow: !e.ModifyNode
		})),
		/**意见决策 */
		code: res.IdeaCode || '',
		/**意见内容 */
		content: res.IdeaContent || '',
		/**节点选人提醒平台 */
		remind: await remind,
		/**常用意见 */
		idea: (res.Opinion || []).map(e => ({ label: e.Opinion })),
		/**悬浮按钮 */
		button: (res.Action || []).reduce((a, item) => {
			if (['WF_FINISHTASK', 'WF_NEXTSTEP', 'WF_NEXTSTEP2'].includes(item.ActionID)) {
				a.push(...[
					{ label: '执行', value: item.ActionID, icon: 'play-right' },
					{ label: '保存', value: 'BU_SAVE', icon: 'file-text' }
				])
			}
			else a.push({
				label: item.ActionName,
				value: item.ActionID,
				icon: icon[item.ActionID]
			})
			return a
		}, [])
	}
}
export async function getFormData(Flow_AssignTaskOID, InstanceID) {
	const res = (await new Data(Flow_AssignTaskOID)) as any
	/**
	 * 表单的【描述】字段
	 * 
	 * 键名是字段英文名，值是字段中文名
	 * 
	 * 例子：{"Date_Reim":"报销日期","ReimObject":"报销对象"}
	*/
	type Describe = {
		[key : string] : any
	}
	const config : { [key : string] : any, describe ?: Describe } = jParse(res.FormConfig_Mobile) || {}
	const { describe, isStretch, isCodeLink, bigTitle, projectNameLeft, conetentLeft, personLeft, timeLeft, remarkLeft } = config;

	const businessData = (await request([{
		tag: 'sel',
		tb: res.BusinessTable,
		field: '*',
		wh: {
			Filter: `InstanceID = {InstanceID}`,
			Param: { InstanceID }
		}
	}]))[0] || {}
	return {
		bigTitle: bigTitle,
		projectNameLeft: projectNameLeft,
		conetentLeft: conetentLeft,
		personLeft: personLeft,
		timeLeft: timeLeft,
		remarkLeft: remarkLeft,
		isCodeLink: isCodeLink,
		isStretch: isStretch,
		title: res.BusinessCategory,
		code: res.BusinessCode,
		createdDate: res.SYS_Created,
		label: (() => {
			try {
				return eval(`(${config.title})(businessData)`)
			} catch (e) {
				return config.title?.replace(/\{\{(\w+)\}\}/g, (_, e) => businessData[e] || '')
			}
		})(),
		projectName: res.ProjectName,
		describe: (describe || []).reduce((a, b) => {
			a.push({
				...b,
				value: formatValue(b, businessData) // 统一调用工具函数
			})
			return a
		}, []),
		operator: res.PersonName,
		applyDate: res.SYS_Created?.split(' ')[0] || '',
		remark: res.Remark,
		BusinessUrl: res.BusinessUrl
	}
}
export async function getReadData(InstanceID) {

	const [instanceMX] = await request([{
		tag: 'sel',
		tb: 'Flow_FlowInstanceMX',
		field: 'T1.*,T2.FormConfig_Mobile',
		tbAlias: 'T1',
		jo: [{
			alias: 'T2',
			tableName: 'Flow_BusinessType',
			on: 'T1.BusinessTable = T2.TypeNo'
		}],
		wh: {
			Filter: `T1.InstanceID = {InstanceID}`,
			Param: { InstanceID }
		}
	}])
	const [businessData] = await request([{
		tag: 'sel',
		tb: instanceMX.BusinessTable,
		field: '*',
		wh: {
			Filter: `InstanceID = {InstanceID}`,
			Param: { InstanceID }
		}
	}])
	const config = jParse(instanceMX.FormConfig_Mobile)

	return {
		title: instanceMX.Belong,
		label: (() => {
			try {
				return eval(`(${config.title})(businessData)`)
			} catch (e) {
				return config.title?.replace(/\{\{(\w+)\}\}/g, (_, e) => businessData[e] || '')
			}
		})(),
		code: instanceMX.Code,
		createdDate: instanceMX.SYS_Created,
		projectName: instanceMX.ProjectName,
		describe: (config.describe || []).reduce((a, b) => (
			a.push({
				label: b.label,
				field: b.field,
				value: b.render ? eval(`(${b.render})(businessData,businessData[b.field])`) : businessData[b.field]
			}), a
		), []),
		operator: instanceMX.PersonName,
		applyDate: instanceMX.SYS_Created?.split(' ')[0] || '',
		remark: instanceMX.Remark,
	}
}
/**处理明细的数据源 */
export function parseDetailApi(item, config, pages = 1) : any {
	const api = jParse(item.api)
	//父组件表,父组件条件
	const { BusinessTable, InstanceID } = config
	//父组件关联字段，当前组件关联字段
	const { MC_Field, SC_Field } = item.relation
	//备份主数据源
	const copy = api.splice(api.findIndex(e => !e.Relation), 1)[0]
	//主数据源
	const main = {
		tag: 'sel',
		tb: BusinessTable,
		field: 'T2.*',
		tbAlias: 'T1',
		pages,
		tol: 30,
		jo: [
			{
				"tableName": copy.tb,
				"on": `T1.${MC_Field} = T2.${SC_Field}`,
				"alias": "T2"
			}
		],
		wh: {
			Filter: `T1.InstanceID = {InstanceID}`,
			Param: { InstanceID }
		}
	}
	api.push(main)
	return api
}
//审批单-审批意见 /流程
/** 获取审批轨迹（仅过滤“结束”节点，保留所有原始字段） */
export async function getIdeaJson(InstanceID) {
	// 1. 获取原始轨迹数据
	const res = await new NodeIdea(InstanceID) as any

	// 2. 使用 filter 过滤掉名称为“结束”或“End”的行，然后再进行 map 转换
	return res.filter(e => e.ActivityName !== '结束' && e.ActivityName !== 'End').map(e => ({
		guid: e.ActivityID,
		label: e.ActivityName,
		info: (e.ExecutorInfo || []).reduce((a, b) => {
			if (!(!b.ResolutionCode ||
				["Canceled", "Repealed", "Aborted", "Exception", "Ignored", "UnProcessed"].includes(b.ResolutionCode)
			)) a.push({
				guid: b.guid,
				code: b.IdeaCodeValue,
				content: b.IdeaContent,
				name: b.ExecutorName,
				date: b.FinishDate
			})
			return a
		}, [])
	}))
}