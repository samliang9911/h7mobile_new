/**
 *  获取审批意见函数
 * @param {Object} res 请求返回的表数据
 * @param {*} callBack 成功回调函数
*/
function getNodeIdea (res, callBack){
	let activityList = res.Flow_ActivityInfoExIns.Items; //节点实例模型
	let lineList = res.Flow_LineIns.Items; //流转线
	let tickList = res.Flow_TaskTicket.Items; //流程任务
	let taskList = res.Flow_AssignTask.Items; //待办任务
	
	let startNode = activityList.find(item => item.ActivityType == 'Start') //开始节点
	let toNodeIDList = [startNode.ActivityID]; //目标节点ID，默认开始节点
	let ideaList = []; //所有节点的审批意见
	let lastIdeaList = []; // 所有节点的最后一次审批数据
	let resultData = []; //最终筛选出来的数据
	
	// 添加最后一次审批的数据
	// 先按步骤升序排序，再遍历添加进审批意见列表
	tickList.sort(function(a,b){return a.Status - b.Status}).forEach((e)=>{
		
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
			ExecutorInfo:[]
		};
		// 补充执行人信息
		const ExecutorInfoList = taskList.filter(item => item.Flow_TaskTicketOID == e.Flow_TaskTicketOID)
		ExecutorInfoList.forEach((r)=>{
			ideaInfo.ExecutorInfo.push({
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
	ideaList.slice().sort((a,b)=>{ return b.createTime.localeCompare(a.createTime)}).forEach((e)=>{
		if (e.ActivityType === 'Person'){
			// 检测ideaList表中的每个ActivityID是否存在于lastIdeaList表, 是则返回true, 否则返回false
			let isContain = lastIdeaList.some(d => d.ActivityID == e.ActivityID);
			if (!isContain) {
				lastIdeaList.push(e);
			}			
		}
	})
	
	//按照节点数量遍历，对比流转线
	for (let i=0; i < activityList.length; i++) {
		
		// 下一个节点的审批信息：先获取下一个节点ID，再匹配出这个节点的审批信息
		// 下一个节点ID: 先检测lineList的每一个来源ID是否存在于toNodeIDList列表，是则添加下一个节点ID
		toNodeIDList = lineList.filter(item => toNodeIDList.some(s => s == item.FromActivityID)).map(item => item.ToActivityID);
		// 下个节点的审批信息：检测最后审批意见列表lastIdeaList的每一个ID是否存在于下个节点列表toNodeIDList，是则添加
		let ideaInfo = lastIdeaList.filter(item => toNodeIDList.some(s => s == item.ActivityID));
		
		// 存在则添加
		if (ideaInfo.length > 0){
			//下个节点存在多个时，优先已审批的
			ideaInfo.sort(function(a,b){ return b.Status - a.Status}).forEach((e)=>{
				let isContain = resultData.some(d => d.ActivityID == e.ActivityID);
				if (!isContain) {
					resultData.push(e);
				}
			})
		}else {
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
	
	return resultData;
}



/**
 * 预览office文件
 * @param {any}  e
 * @param {any}  Config 附件配置，
 */
function preOffice(e, Config = {}) {
  let panel = 'false'; //面板是否启用
  let fileSize = e.FileSizeKb * 1024;
  let permission = 'write';
  // const globalStore = useGlobalStoreHook();
  const PrimaryKey = e.tableName ? e.tableName + 'OID' : '';
  const OID = e[PrimaryKey];
  const serverUrl = uni.getStorageSync("serverUrl");
  
  // if (globalStore.IsBusinessPage) {
  //   let BusinessState = null
  //   const IsAdmin = localStorage.IsAdmin == "true" ? true : false
  //   const ActivityID = getURLParameters('ActivityID')
  //   try {
  //     BusinessState = globalStore.refList[globalStore.Dev_PageComponent.find(item => item.Component == 'Form').Name].model.BusinessState
  //     if (IsAdmin) {
  //       permission = "write"
  //     } else if ((BusinessState == 1 || BusinessState == 3)) {
  //       permission = 'write'
  //     } else if (ActivityID && Config.CanModifyNode) {
  //       const CanModifyNode = Config.CanModifyNode.split(',')
  //       if (CanModifyNode.includes(ActivityID)) permission = 'write'
  //       else permission = 'read'
  //     } else {
  //       permission = "read"
  //     }
  //   } catch (error) {
  //     permission = "read"
  //   }
  // }

  const jsonData = {
    "fileName": e.FileName,				                    //文件名称
    "filePath": e.FilePath,         //文件路径
    // "filePath": "http://pcm.tpddns.cn:81" + e.FilePath,    //公网文件路径 方便测试
    "uid": e.UserOID,	                    //登录用户ID
    "uname": e.UserName,	                  //登录用户名称
    "fileID": OID ? OID : e.Key,					            //文件ID
    "size": fileSize,					                        //文件大小 单位 B 字节 
    "permission": permission,			                    //权限 read 预览 write 编辑
    "source": serverUrl,                     // 文件来源
    "panel": panel,                                //OnlyOffice 模板预览
    "tb": e.tableName //业务表名
  };


  var tempForm = document.createElement("form");

  // 判断当站点是否为内网
  if (isPrivateIP(location.hostname)) {
    const officeUrl = new URL(uni.getStorageSync("H7_Office"));

    //文件大小大于默认值之后跳转OnlyOffice服务地址
    if (fileSize / 1024 > uni.getStorageSync("H7_FileSize") * 1024) {

      tempForm.action = `http://192.168.0.71:801/Office/OnlyIndex`

    } else {

      tempForm.action = `http://192.168.0.71:801${officeUrl.pathname}`
    }

  } else {

    tempForm.action = uni.getStorageSync("H7_Office") || 'http://pcm.tpddns.cn:86/Office/Index2';
	}
  // tempForm.action = 'http://pcm.tpddns.cn:5006/Office';  //v1版 wps接口i
  // tempForm.action = 'http://192.168.0.139:5006/Office';
  // tempForm.action = 'http://pcm.tpddns.cn:5006/Office/Index2'; //v3版 wps接口
  // tempForm.action = 'http://192.168.0.139:5006/Office/Index2';
  // tempForm.action = 'http://pcm.tpddns.cn:86/Office/Index2';
  
  tempForm.target = "_blank";
  tempForm.method = "post";
  tempForm.name = "look";
  tempForm.style.display = "none";

  for (var x in jsonData) {
    var opt = document.createElement("textarea");
    opt.name = x;
    opt.value = jsonData[x];
    tempForm.appendChild(opt);
  }
  document.body.appendChild(tempForm);
  tempForm.submit();
}


export {
	getNodeIdea,
	preOffice
}