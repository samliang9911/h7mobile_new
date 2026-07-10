//事项
let getJsons = (pageNo=0, naviId =0, UserOID = '',query='') => {
  const NotAdmin = ' and ( T1.Executor_FK = {UserOID} or T1.Proxy_FK = {UserOID} )'
  const filter = query?` and ( T1.TaskName like {query} or T1.BusinessCode like {query} or T2.PersonName
    like {query} or T1.OrgInfo like {query} or T1.ProjectName like {query} or T1.Remark like {query} )`:'';
	if (naviId === 1){//待办
		return [
			{
				"tag": "sel",
				"tb": "Flow_AssignTask",
				"field": "T2.PersonName,T2.BusinessState,T2.BusinessKey,T3.SYS_Created,T1.Flow_AssignTaskOID,T1.InstanceID,T1.USR_LOGIN,T1.TaskName,T1.ResolutionCode,T1.IdeaCode,T1.IdeaCodeValue,T1.IdeaContent,T1.DealineTime,T1.Terminal,T1.FinishDate,T1.Power,T1.FromActivityID,T1.FromActivityName,T1.SignPerformer,T1.SignPerformerFK,T1.TableLX,T1.PageID,T1.BusinessUrl,T1.BusinessCode,T1.BusinessCategory,T1.OrgInfo,T1.OrgInfo_FK,T1.ProjectName,T1.Project_FK,T1.Money,T1.Remark,T1.CustomInfo,T1.FlowID,T1.FlowName,T1.ActionRecord,T1.ExecutorName,T1.Executor_FK,T1.ExecutorPost_FK,T1.ProxyName,T1.Proxy_FK,T1.FromTaskOID,T1.RootFromTaskOID,T1.FromActivity_FK,T1.Flow_TaskTicketOID,T1.SYS_ORG,T1.OrgName,T1.SYS_DIVISION,T1.Division,T1.SYS_POSTN,T1.PostName,T1.SYS_LAST_UPD,T1.SYS_CreatedBy,T1.SYS_Last_Upd_By,T1.SYS_REPLACEMENT,T1.SYS_Deleted,T1.OrderNo,T1.AssignedTS",
				"wh": {
					"Filter": `T1.FromActivityType = {type} AND T1.ResolutionCode = {status} ${filter}`,
					"Param": {
						"type": "Person",
						"status": "Unprocessed",
            query
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
					}
				],
				"tol": 10,
				"pages": pageNo,
				"n_ob": "T1.SYS_Created desc",
				"tbAlias": "T1",
			}
		]
	}
	else if(naviId === 2){//已办		
		return[
			{
				"tag": "sel",
				"tb": "Flow_AssignTask",
				"field":"T2.BusinessState,T2.PersonName,T2.SYS_Created,T1.Flow_AssignTaskOID,T1.InstanceID,T1.USR_LOGIN,T1.TaskName,T1.ResolutionCode,T1.FinishDate,T1.FromActivityID,T1.FromActivityName,T1.TableLX,T1.PageID,T1.BusinessUrl,T1.BusinessCode,T1.BusinessCategory,T1.OrgInfo,T1.OrgInfo_FK,T1.ProjectName,T1.Project_FK,T1.Money,T1.Remark,T1.CustomInfo,T1.FlowID,T1.FlowName,T1.ActionRecord,T1.ExecutorName,T1.Executor_FK,T1.ExecutorPost_FK,T1.ProxyName,T1.Proxy_FK,T1.FromTaskOID,T1.FromActivity_FK,T1.Flow_TaskTicketOID,T1.SYS_ORG,T1.OrgName,T1.SYS_LAST_UPD,T1.SYS_Last_Upd_By,T1.SYS_REPLACEMENT,T1.AssignedTS",
				"wh": {
					"Filter": "T1.FromActivityType = {type} and T1.ResolutionCode in {resolution} and T2.BusinessState > {state} " + (UserOID == '00000000-0000-0000-0000-000000000001'?'':NotAdmin) + filter,
					"Param": {
						"type": "Person",
						"resolution":['Canceled','Repealed','Processed','Aborted','AddSignatured','TransferSignatured','Assisted','Entrusted'],
						"state": "1",
						"UserOID":UserOID
					},
				},
				"jo": [
					{
						"tableName": "Flow_FlowInstanceMX",
						"on": "T1.InstanceID = T2.InstanceID",
						"alias": "T2"
					}
				],
				"tol": 10,
				"pages": pageNo,
				"n_ob": "T1.SYS_Created desc",
				"tbAlias": "T1",
			}
		]	
	}
	else if( naviId === 3 ){//待阅
		return [
			{
				"tag": "sel",
				"tb": "Flow_ReadRecord",
				"field": "*",
				"wh": {
					"Filter": " ( Flow_ReadRecord.IsRead = {Wh0} )  ",
					"Param": {
					"Wh0": 0	
					},
					"visual": true
				},
				"tol": 10,
				"pages": pageNo,
			}
		]
	}
	else if ( naviId === 4 ){//已阅
		return [			
			{
				"tag": "sel",
				"tb": "Flow_ReadRecord",
				"alias": "Flow_ReadRecord_02",
				"field": "*",
				"wh": {
					"Filter": " ( Flow_ReadRecord.IsRead = {Wh0} )  ",
					"Param": {
					"Wh0": 1
					},
					"visual": true
				},
				"tol": 10,
				"pages": pageNo
			}
		]
	}
}
function getJson(pageNo=0, naviId =0, UserOID = '',query=''){
  //1待办2已办
  if([1,2].includes(naviId)){
    const NotAdmin = ' and ( T1.Executor_FK = {UserOID} or T1.Proxy_FK = {UserOID} )'
    const filter = query?` and ( T1.TaskName like {query} or T1.BusinessCode like {query} or T2.PersonName
      like {query} or T1.OrgInfo like {query} or T1.ProjectName like {query} or T1.Remark like {query} )`:'';
    return [{
      "tag": "sel",
      "tb": "Flow_AssignTask",
      "field": "T2.PersonName,T2.BusinessState,T2.BusinessKey,T3.SYS_Created,T1.Flow_AssignTaskOID,T1.InstanceID,T1.USR_LOGIN,T1.TaskName,T1.ResolutionCode,T1.IdeaCode,T1.IdeaCodeValue,T1.IdeaContent,T1.DealineTime,T1.Terminal,T1.FinishDate,T1.Power,T1.FromActivityID,T1.FromActivityName,T1.SignPerformer,T1.SignPerformerFK,T1.TableLX,T1.PageID,T1.BusinessUrl,T1.BusinessCode,T1.BusinessCategory,T1.OrgInfo,T1.OrgInfo_FK,T1.ProjectName,T1.Project_FK,T1.Money,T1.Remark,T1.CustomInfo,T1.FlowID,T1.FlowName,T1.ActionRecord,T1.ExecutorName,T1.Executor_FK,T1.ExecutorPost_FK,T1.ProxyName,T1.Proxy_FK,T1.FromTaskOID,T1.RootFromTaskOID,T1.FromActivity_FK,T1.Flow_TaskTicketOID,T1.SYS_ORG,T1.OrgName,T1.SYS_DIVISION,T1.Division,T1.SYS_POSTN,T1.PostName,T1.SYS_LAST_UPD,T1.SYS_CreatedBy,T1.SYS_Last_Upd_By,T1.SYS_REPLACEMENT,T1.SYS_Deleted,T1.OrderNo,T1.AssignedTS",
      "wh": {
        "Filter": `T1.FromActivityType = {type} AND T1.ResolutionCode in {status} ${filter}`+(UserOID == '00000000-0000-0000-0000-000000000001'?'':NotAdmin),
        "Param": {
          type: "Person",
          status:[
            ["Unprocessed"],
            ['Canceled','Repealed','Processed','Aborted','AddSignatured','TransferSignatured','Assisted','Entrusted']
          ][naviId-1],
          UserOID,
          query
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
        }
      ],
      "tol": 10,
      "pages": pageNo,
      "n_ob": "T1.SYS_Created desc",
      "tbAlias": "T1",
    }]
  }
  //3待阅4已阅
  else if([3,4].includes(naviId)){
    const filter = query?' and ( Rerder like {query} or Title like {query} or Code like {query} ) ':''
    return [{
      "tag": "sel",
      "tb": "Flow_ReadRecord",
      "field": "*",
      "wh": {
        "Filter": " ( IsRead = {Wh0} ) "+filter+(UserOID == '00000000-0000-0000-0000-000000000001'?'':' AND Rerder_FK = {UserOID} '),
        "Param": {
          UserOID,
          query,
          Wh0: naviId - 3
        }
      },
      "tol": 10,
      "pages": pageNo
    }]
  }
}

/**
 * @param {number}  naviBtnShow: item页面滑块的索引
 * @param {string}  OID: 单据OID，待办/待阅
*/
//审批单-单据基本信息
let getBasicJson = (naviBtnShow=0, TaskID='') => {
		return [
			{
				"tag": "sel",
				"tb": "Flow_AssignTask",
				"field": "T2.PersonName,T2.BusinessState,T3.SYS_Created,T1.Flow_AssignTaskOID,T1.InstanceID,T1.USR_LOGIN,T1.TaskName,T1.ResolutionCode,T1.IdeaCode,T1.IdeaCodeValue,T1.IdeaContent,T1.DealineTime,T1.Terminal,T1.FinishDate,T1.Power,T1.FromActivityID,T1.FromActivityName,T1.SignPerformer,T1.SignPerformerFK,T1.TableLX,T1.PageID,T1.BusinessUrl,T1.BusinessCode,T1.BusinessCategory,T1.OrgInfo,T1.OrgInfo_FK,T1.ProjectName,T1.Project_FK,T1.Money,T1.Remark,T1.CustomInfo,T1.FlowID,T1.FlowName,T1.ActionRecord,T1.ExecutorName,T1.Executor_FK,T1.ExecutorPost_FK,T1.ProxyName,T1.Proxy_FK,T1.FromTaskOID,T1.RootFromTaskOID,T1.FromActivity_FK,T1.Flow_TaskTicketOID,T1.SYS_ORG,T1.OrgName,T1.SYS_DIVISION,T1.Division,T1.SYS_POSTN,T1.PostName,T1.SYS_LAST_UPD,T1.SYS_CreatedBy,T1.SYS_Last_Upd_By,T1.SYS_REPLACEMENT,T1.SYS_Deleted,T1.OrderNo,T1.AssignedTS",
				"wh": {
					"Filter": "T1.Flow_AssignTaskOID = {OID}",
					"Param": {
						"OID": TaskID,
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
					}
				],
				"tol": 10,
				"tbAlias": "T1",
			}
		]	
}

//审批单-表单配置
let getFormConfigJson = (type='') => {
		return [
			{
				"tag": "sel",
				"tb": "Flow_BusinessType",
				"field": "Flow_BusinessTypeOID,TypeNo,TypeName,BusinessTable,FormConfig_Mobile,MobileFormPageID",
				"wh": {
					"Filter":"TypeNo = {value}",
					"Param":{
						"value":type
					}
				},
				"tol": 100
			}
		]	
}
//审批单-表单配置-对应表数据
let getFormFieldsJson = (table='', fields='', InstanceID='') => {
		return [
			{
				"tag": "sel",
				"tb": table,
				"field": fields,
				"wh": {
					"Filter":"InstanceID = {value}",
					"Param":{
						"value":InstanceID
					},
				}
			}
		]	
}

// 表单-待阅
const getFormRead = (OID='')=>{
	return [
		{
			"tag": "sel",
			"tb": "Flow_ReadRecord",
			"field": "*",
			"wh": {
				"Filter": "Flow_ReadRecordOID = {OID} ",
				"Param": {
					"OID":OID
				},
			},
		}
	]
}
// 表单-待阅-更新
const updateReadTable = (index = 3,OID='',comment='')=>{
	if(index === 3){
		return [
			{
				"tag": "upd",
				"tb": "Flow_ReadRecord",
				"field": {
					IsRead:true,
					Review:comment,
					Flow_ReadRecordOID:OID
				},
			}
		]
	}else {
		return [
			{
				"tag": "upd",
				"tb": "Flow_ReadRecord",
				"field": {
					Review:comment,
					Flow_ReadRecordOID:OID
				},
			}
		]
	}
	
}



// 获取明细-表单配置
let getReimDetailJson = (configList=[],mainTable,CodeArr=[],InstanceID='')=>{
	let json = [];
	
	configList.forEach((item)=>{
		const fields = (item.field).split(",").map( f => `T1.${f}`).join(",");
		json.push(
			{
				"tag": "sel",
				"tb": item.tb,
				"field": fields,
				"wh": {
					"Filter":"T2.InstanceID = {value}",
					"Param":{
						"value":InstanceID
					}
				},
				jo:[
					{
						"tableName":mainTable,//Fee_Reimbursement
						"on":`T1.${item.ChildKey} = T2.${item.MainKey}`,
						"alias":"T2"
					},
				],
				"tbAlias":"T1",
			}
		);
	})
	//代码表
	if (CodeArr.length>0){
		CodeArr = CodeArr.join(',');
		json.push({
			tag: 'sel',
			tb: 'Sys_CodeValue',
			field: 'CodeTableID,CodeName,CodeID',
			wh: {
				"Filter":"CodeTableID IN {value}",
				"Param":{
					"value":CodeArr
				}
			},
			// tol: 1000
		})
	}
	return json;
}
//明细-获取页面组件的明细表数量
let getCompDetailTableJson = (PageID='')=>{
	//获取需要展示的明细表
	return [
		{
			"tag": "sel",
			"tb": "Dev_PageConfig",
			"field": "*",
			"wh": {
				"Filter":"Code = {value}",
				"Param":{
					"value":PageID
				}
			},
		},
		{
			"ChildAlias":["Dev_PageConfig"],
			"OnlyChild":false,
			"tag": "sel",
			"tb": "Dev_PageComponent",
			"field": "*",
			"wh": {
				"Filter":"Dev_PageConfig_FK in {Dev_PageConfig.Dev_PageConfigOID} AND ( MC_Key NotNull )",
				"Param":{
					// "value":PageID
				}
			},
		}
	]
	
	
}
//明细-获取对应的表字段
const getDetailTableFieldJson = (table={})=>{
		return[
			{//获取配置字段
				"tag": "sel",
				"tb": "Pub_Config",
				"field": "*",
				"wh": {
					"Filter":"BusinessKey = {value}",
					"Param":{
						"value":table.Dev_PageComponentOID
					}
				},
			},
			{//获取明细表的数据源列表
				"tag": "sel",
				"tb": "Pub_DataAPI",
				"field": "Pub_DataAPIOID,tb,field,FieldName_CN,R_MainField,R_ChildField,Title,BusinessKey",
				"wh": {
					"Filter":"BusinessKey = {value}",
					"Param":{
						"value":table.Dev_PageComponentOID
					}
				},
			},
		]
	
}


//审批单-审批意见 /流程
let getIdeaJson = (InstanceID='') => {
		return [
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
				"field": "Flow_TaskTicketOID,FAssignedTask,ActivityID,ActivityName,ActivityType,Status,ExecutorNames,OrderNo,Flow_ActivityInfoExIns_FK,SYS_Created",
				"wh": {
					// "Filter": "InstanceID = {value} and ResolutionCode != {flowStateResult} and ResolutionCode = {Processed}",
					"Filter": "InstanceID = {value} and ResolutionCode != {flowStateResult}",
					"Param": {
						"value": InstanceID,
						"flowStateResult": "Repealed",
						// "Processed": "Processed"
				  }
				},
				"page": 1,
				"tol": 100
			},
			{
				"tag": "sel",
				"tb": "Flow_AssignTask",
				"field": "Flow_AssignTaskOID,Flow_TaskTicketOID,ResolutionCode,IdeaCode,IdeaCodeValue,IdeaContent,AssignedTS,FinishDate,ExecutorName,ProxyName,OrderNo",
				"wh": {
					// "Filter": "InstanceID = {value} and ResolutionCode != {flowStateResult} and ResolutionCode = {Processed}",
					"Filter": "FromActivityType = {type} and InstanceID = {value} and ResolutionCode != {flowStateResult}",
					"Param": {
						"type": "Person",
						"value": InstanceID,
						"flowStateResult": "Repealed",
						// "Processed": "Processed"
					}
				},
				"n_ob": "AssignedTS",
				"page": 1,
				"tol": 100
			},
		]	
}


//附件-获取对应的表名
let getFileConfigJson = (PageConfigOID)=>{
	return [
		{
			"tag": "sel",
			"tb": "Pub_FileConfig",  
			"field": "T1.Pub_FileConfigOID,T1.BusinessDataTable,T1.BusinessKey,T2.Dev_PageComponentOID,T2.Component,T2.Sort,T2.Title,T2.Dev_PageConfig_FK",
			"wh": {
				"Filter": " T2.Dev_PageConfig_FK = {PageConfigOID} AND T2.Component = {value} ",
				"Param": {
					"PageConfigOID": PageConfigOID,
					"value": "Form",
					"value1": null
				}
			},
			"jo": [
				{
					"tableName": "Dev_PageComponent",
					"on": "T1.BusinessKey = T2.Dev_PageComponentOID",
					"alias": "T2",
				}
			],
			"page": 1,
			"tol": 30,
			"tbAlias": "T1" 
		}
	]
}

//附件
let getFileJson = (Key,TableList)=>{
	let json = [];
	
	TableList.forEach((Table)=>{
		json.push(
			{
				"tag": "sel",
				"tb": Table,
				// "field": "FileName,FilePath,FileType,FileSize,FileSizeKb,PersonName,BusinessKey,SYS_Created,SYS_LAST_UPD",
				"field": "*",
				"wh": {
					"Filter": " BusinessKey = {value} ",
					"Param": {
						"value": Key
					}
				},
				"page": 1,
				"tol": 100
			}
		)
	})
	return json
}


//用户
let getUserJson = ()=>{
	
}

export { 
	getJson,
	getBasicJson,
	getFormConfigJson,
	getFormFieldsJson,
	getFormRead,
	updateReadTable,
	getIdeaJson,
	getFileConfigJson,
	getFileJson,
	getUserJson,
	getReimDetailJson,
	getCompDetailTableJson,
	getDetailTableFieldJson
}