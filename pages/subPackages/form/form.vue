<template>
	<view class="contentBox">
		<!-- 导航 -->
		<view class="navgation">
			<view class="navagequit">
				<view class="quit" @tap="back">
					<!-- #ifdef H5 -->
					<svg style="opacity: 0;" width="27" height="27" viewBox="0 0 32 32">
						<path
							d="M21.781 7.844l-9.063 8.594 9.063 8.594q0.25 0.25 0.25 0.609t-0.25 0.578q-0.25 0.25-0.578 0.25t-0.578-0.25l-9.625-9.125q-0.156-0.125-0.203-0.297t-0.047-0.359q0-0.156 0.047-0.328t0.203-0.297l9.625-9.125q0.25-0.25 0.578-0.25t0.578 0.25q0.25 0.219 0.25 0.578t-0.25 0.578z"
							fill="#000000"></path>
					</svg>
					<!-- #endif -->
					<!-- #ifdef MP-WEIXIN -->
					<up-icon name="arrow-left" color="#000000" size="40"></up-icon>
					<!-- #endif -->

				</view>
			</view>
			
			<view class="tabNaviBox">
				<view :style="{color : naviId == 1 ? '#131313' : '#606266'}" class="tabBakcground tabLeft" @tap="onTabNavi(1)">
					<text>{{itemSliderIndex == 1 || itemSliderIndex == 2 ? "审批单" : "通知"}}</text>
				</view>
				<view :style="{color : naviId == 2 ? '#131313' : '#606266'}" class="tabBakcground" @tap="onTabNavi(2)">
					<text>附件</text>
				</view>
				<view v-if="itemSliderIndex == 1 || itemSliderIndex == 2" :style="{color : naviId == 3 ? '#131313' : '#606266'}" class="tabBakcground" @tap="onTabNavi(3)">
					<text>流程</text>
				</view>
				<view v-if="reimDetailDataList && itemSliderIndex == 1 || itemSliderIndex == 2" :style="{color : naviId == 4 ? '#131313' : '#606266'}" class="tabBakcground"
					@tap="onTabNavi(4)">
					<text>明细</text>
				</view>
				<view :class="['tabBakcgroundMove',naviColor]" :style="{left: tabLeftPosition() }">
				</view>
			</view>
		</view>
		<!-- 表单 -->
		<view @tap="getForm" class="contentForm" v-show="naviId == 1">
			<view class="fromBox" :style="{height:innerHeight+'px',width:(innerWidth-40)+'px'}">
				<view class="headline">
					{{basicDataList['BusinessCategory'] || readData['Belong'] || ''}}
				</view>
				<!-- 表眉 -->
				<view class="grig">
					<view class="grig-item" @tap="goComputeShow(basicDataList['BusinessCategory'])" :style="'color:'+colorUr+';'">
						{{basicDataList['BusinessCode'] || readData['Code'] || ''}}
					</view>
					<view class="grig-item">
						{{basicDataList['SYS_Created'] || readData['SYS_Created'] || ''}}
					</view>
				</view>
				
				<!-- 表格内容 -->
				<view class="contentFormBox">					
					<view class="formTitle">
						<text class="formTitleText">{{setTitleCategory()}}</text>
					</view>
					
					<view class="row" v-if="itemSliderIndex == 1 || itemSliderIndex == 2 ">
						<view class="rowName">项目名称</view>
						<view class="projectNameContent">
							<view class=" rowContentVaule">
								{{basicDataList['ProjectName'] || ''}}
							</view>
						</view>
					</view>
					
					<view class="row" style="border-bottom: 0rpx;" >
						<view class="rowName"  style="padding:15rpx 0;">描述</view>
						<view  class="rowConfigFieldContent">
							<view v-for="(item,index) in formConfigData.Fields_CN_Mobile" :key="index">
								<view class="rowConfigField">
									<text class="fieldsName">{{item}}: {{formConfigData.Fields_Mobile[index]}}</text>
								</view>
							</view>
							<view v-if="itemSliderIndex == 3 || itemSliderIndex == 4">
								<view style="text-align: left;font-size: 25rpx;margin: 20rpx;">{{readData['Content']}}</view>
							</view>
						</view>
					</view>
					<view class="row" >
						<view class="rowItem">
							<text>经办人</text>
						</view>
						<view class="item-3" style="width: 180rpx;" >
							<text style="font-size: 25rpx;">{{basicDataList['PersonName'] || readData['PersonName'] || ''}}</text>
						</view>
						<view class="item-3" style="width: 150rpx" >申请时间</view>
						<view class="item-3" style="width: 188rpx; border-right: 0;" >
							<text style="font-size: 25rpx;">{{ splitDate(basicDataList['SYS_Created']) || splitDate(readData['SYS_Created'] ||'')}}</text>
						</view>
					</view>
					<view>
						<view class="row" >
							<view class="rowName" >备注</view>
							<view class="rowContent-4">
								<text style="text-align: left;font-size: 25rpx;margin: 20rpx;">{{basicDataList['Remark']}}</text>
							</view>
						</view>
					</view>
					
					<!-- 动态增加的列（部门） -->
					<view v-for="(node,index) in nodeDataList" :key="index">
						<view class="row" >
							<view class="rowName" >
								{{node.ActivityName}}
							</view>
							<!-- 审批内容 -->
							<view class="ideaBox">
								<view class="approveContent" v-for="(ExecutorInfo,exeIndex) in node.ExecutorInfo" :key="exeIndex">
										<view class="ideaContent">
											<text>{{ExecutorInfo.IdeaCodeValue}}</text>
											<text v-if="ExecutorInfo.IdeaCodeValue && ExecutorInfo.IdeaContent">(</text>
											<text>{{ExecutorInfo.IdeaContent}}</text>
											<text v-if="ExecutorInfo.IdeaCodeValue && ExecutorInfo.IdeaContent">)</text>
										</view>
										
										<view class="executorContent">											
											<view class="executorName">
												<text class="executorNameText" v-if="ExecutorInfo.FinishDate">{{ExecutorInfo.ExecutorName}}</text>
											</view>
											<view class="executorDate">
												<text class="executorDateText">{{ExecutorInfo.FinishDate}}</text>
											</view>											
										</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 提交按钮 -->
		<view @tap="getApprovalFlowpath" :class="['auditBtn',backGround]"
			:style="{display: itemSliderIndex === 1 && naviId === 1 ? 'block' : 'none'}">
			<text>审核</text>
		</view>

		<!-- 流程 -->
		<view class="process" :style="{display: naviId == 3 ? 'block' : 'none'}">
			<!-- <uni-steps :options="list2" /> -->
			<timeLine :preditLineData="preditLineData" :actuallyLineData="actuallyLineData" :currentStep="currentStep"></timeLine>
		</view>
		<!-- 附件 -->
		<view :style="{display: naviId == 2 ? 'block' : 'none',width:'100%'}">
			<file :nodeID="IsEideActivityID" :isEdit="editNodeList" :itemSliderIndex="itemSliderIndex" :fileList="fileList"></file>
		</view>
		
		<!-- 明细 -->
		<view v-if="tablesData.length > 0 && tablesData" :style="{display: naviId == 4 ? 'block' : 'none',width:'100%',height:'90vh'}">
			<z-table :tablesData="tablesData"></z-table>
		</view>
		
		<!-- 审核弹窗组件 -->
		<view :style="{display: popupShow ? 'block' : 'none','z-index':10}">
			<processFlow :IsIdea="IsIdea" :oldIdeaCode="IdeaCode"
				 :oldIdeaCodeValue="oldIdeaCodeValue" :jierenArr="jiedianArr"
				:ideaDecision="ideaDecision" :opinion="opinion" :flowAllData="flowAllData" :contentList="contentBtn"
				:popupShow="popupShow" @popWinValue="popupShowValue" :getBusinessTable="getBusinessTable"/>
		</view>
		<view>
			<up-popup v-model="cellShow" mode="center">
				<view class="popupContent" @tap="cellShow = false">
					<text :style="{transform: rotate?'rotate(90deg)' : ''}">{{cellContent}}</text>
				</view>
			</up-popup>
		</view>
		
		<!-- 阅读-评论 -->
		<view v-if="itemSliderIndex==3 || itemSliderIndex==4">
			<button class="commentShowBtn" type="primary" @click="clickCommentShow()">评论</button>
			<up-popup class="popupComment" v-model="commentShow" mode="bottom" length="550rpx" border-radius="24">
				<view class="inputLayout">
					<textarea :maxlength="500" @input="getInputContent" :value="commentContent" placeholder="请输入内容..."></textarea>
					<view style="margin-left: 85%;">
						<text>{{commentContent.length}}/500</text>
					</view>
				</view>
				<button class="confirmBtn" @click="updateComment(commentContent)" :disabled="!commentContent">确定</button>
			</up-popup>
		</view>
		
	</view>
</template>

<script setup>
	import {ref, getCurrentInstance, nextTick, onMounted, onBeforeMount, onUnmounted, watch} from 'vue';
	import {onLoad} from '@dcloudio/uni-app'
	import {http_request} from '/api/api.js';
	import {base64_HR} from '@/utils/base64.min.js';
	import {getUrlType,startUserImage,checkFileSass,classification,fileUrl,getloc} from "@/utils/instrumentType.js";
	import { getBasicJson, getFormConfigJson, getFormFieldsJson, getCompDetailTableJson, getDetailTableFieldJson, getReimDetailJson, getIdeaJson, getFileConfigJson, getFileJson,getFormRead,updateReadTable} from '/api/Json.js'
	import { getNodeIdea } from './form.js'
	import file from './file.vue';
	import timeLine from './time-line.vue';
  import processFlow from './processFlow/index.vue'
	// import popupWindows from './popupWindows.vue';
	
	const {proxy} = getCurrentInstance();
	const spanStyle =ref({'--color': '#333333'});
	const naviId  =ref(1);
	const innerHeight  =ref(undefined);
	const innerWidth  =ref(undefined);
	const fileList  =ref([]); //附件
	const x =ref(0);
	const y =ref(0);
	const old = ref({x: 0, y: 0});
	const InstanceID =ref('');
	const FlowID =ref('');
	const OID =ref('');
	const list =ref({}); //审批数据
	const popupShow =ref(false); //审批显示
	const UCML_UserOID =ref(uni.getStorageSync('UCML_UserOID'));
	let TaskID ='';
	const contentBtn =ref([]); //悬浮按钮
	const flowAllData =ref({}); // FlowInstance
	const ideaDecision =ref([]); // 意见决策
	const opinion =ref([]); // 常用意见
	const jiedianArr =ref([]); // 选节点选人选节点
	const backGround =ref(''); //全局背景颜色
	const naviColor =ref(''); //全局导航颜色
	const PageID =ref(''); //获取附件使用
	let BusinessKey = (''); //单据的业务键
	const itemSliderIndex =ref(""); //判断目前是待办进来还是已办进入
	const FromActivityID =ref(""); //是否可修改
	const BusinessState =ref(""); //状态 流转 草稿...
	const colorUr =ref('');
	const department =ref([]);
	const oldIdeaCodeValue =ref(""); //审批按钮弹窗意见内容
	const examineAndApproveIdeaCode =ref(0); //审批按钮弹窗意见选中索引
	const editNodeList =ref([]);	
	const IsEideActivityID =ref("");
	const urlPageValue =ref("");
	const IdeaCode =ref("");
	const movableY =ref(0);
	const movableX =ref(0);
	const movableScale =ref(1);
	const IsIdea =ref(false);
	const clickNum =ref(0);
	const clickTimer =ref(null);	
	const rotate =ref(false); //明细表格 旋转状态 旋转前=false 旋转后=true	
	const tablesData =ref([]); //费用报销明细配置
	const tablesColumns =ref({});
	const cellShow =ref(false); //单元格内容全屏显示
	const cellContent =ref(""); //单元格弹出层内容
	const BPOName =ref("");
	const tableCode =ref({}); //表 某一列对应代码ID{表名:{列名:对应代码ID}}例:{Fee_ReimbursementMX:{BillType: 'Fee_BillType'}}
	
	let dataList = ref([]); //上个页面的数据
	let basicDataList = ref([]); //基础数据
	let formConfigData = ref({}); //描述
	const nodeDataList = ref([]); //审批意见数据
	let PageConfigOID = ('');
	let getBusinessTable = ref(''); // 配置获取的业务表
	let clickFileNum = 0;
	let clickDetailNum = 0;
	let actuallyLineData = ref([]); // 实况流程
	let preditLineData  =ref([]); // 预计流程
	let currentStep = ref(0);
	let reimDetailDataList = ref([]);
	let businessTypeData = {}; //业务类型数据
	let readOID = ref('')
	let readData = ref({}); //阅读数据
	let commentShow = ref(false);
	let commentContent = ref(''); //评论内容
	
	onMounted(()=>{
		backGround.value = startUserImage().backGround //获取按钮背景颜色
		naviColor.value = startUserImage().naviColor //获取导航按钮背景颜色
		colorUr.value = startUserImage().colour //16进制颜色
		
		uni.getSystemInfo({
			success: (res) => {
				innerHeight.value = res.windowHeight;
				innerWidth.value = res.windowWidth;
				movableY.value = res.windowHeight + 80;
				movableX.value = res.windowWidth;
			}
		})			
		
		const itemJson = uni.getStorageSync("itemJson") //获取index页面的缓存
		dataList.value = itemJson
		
		IsEideActivityID.value = dataList.value.FromActivityID; //无
		OID.value = dataList.value.BusinessKeyOID; // 无
		InstanceID.value = dataList.value.InstanceID; //工作流实例
		FromActivityID.value = dataList.value.FromActivityID; ///来源节点			 
		FlowID.value = dataList.value.FlowID; //流程ID
		TaskID = dataList.value.TaskOID; //任务主键
		PageID.value = dataList.value.PageID; //页面ID
		itemSliderIndex.value = dataList.value.naviBtnShow; //上一页面的导航栏索引
		BPOName.value = dataList.value.PageID; //页面ID					
		BusinessKey  = dataList.value.BusinessKey; //业务外键
		BusinessState.value = dataList.value.BusinessState; //业务状态
		const BusinessUrl = dataList.value.BusinessUrl;
		PageConfigOID = BusinessUrl?.match(/Dev_PageConfigOID=([0-9a-f-]+)/)[1];
		readOID.value = dataList.value.Flow_ReadRecordOID;
		
		if(itemSliderIndex.value === 1 || itemSliderIndex.value === 2){
			getFormData();
		}else if (itemSliderIndex.value === 3 || itemSliderIndex.value === 4) {
			getReadData(itemSliderIndex.value,readOID.value);
		}
		
		for (let key in spanStyle.value) {
			//表单的边框颜色
			spanStyle.value[key] = '#333333'; //#FFFFFF //#f6000c
		}
		
		// record(dataList.value.itemSliderIndex, dataList.value.Flow_ReadRecordOID, dataList.value.RerderFK); //待阅数据
	})
	
	const tabLeftPosition = ()=>{
		if (!tablesData.value) {
		    return naviId.value === 1 ? '14%' : naviId.value === 2 ? '47%' : naviId.value === 3 ? '81%' : '89%';
		}else if(itemSliderIndex.value ===3 || itemSliderIndex.value === 4){
			return naviId.value === 1 ? '35%' : naviId.value === 2 ? '60%' : '';
		} else{
			return naviId.value === 1 ? '10%' : naviId.value === 2 ? '35%' : naviId.value === 3 ? '60%' : naviId.value === 4 ? '85%' : '100%';
		}
	}
	
	const setTitleCategory = ()=>{//标题
		if (itemSliderIndex.value === 1 || itemSliderIndex.value === 2) return '关于【'+basicDataList.value.PersonName+'】'+basicDataList.value.BusinessCategory;
		else if (itemSliderIndex.value === 3 || itemSliderIndex.value === 4) return readData.value.Title;
		return '';
	}

	//双击form表单
	const getForm = () =>{
		clickTimer.value && clearTimeout(clickTimer.value)
		clickNum.value++
		clickTimer.value = setTimeout(() => {
			if (clickNum.value >= 2) {
				movableScale.value = 1;
				movableY.value = Number(innerHeight.value) + 80;
				movableX.value = innerWidth.value;
			}
			clickNum.value = 0
		}, 200)

	}
	
	/**点单返回上一页*/
	const back = () =>{
		//#ifdef MP-WEIXIN
		uni.navigateBack({
			delta: 1
		});
		//#endif
		//#ifdef H5
		let canNavBack = getCurrentPages();
		if (canNavBack && canNavBack.length > 1) {
			uni.navigateBack({
				delta: 1
			});
		} else {
			history.back();
		}
		//#endif
	}

	/**点单据跳转页面*/
	const goComputeShow = (BusinessLX) =>{
    // uni.navigateTo({
    //   url:'/pages/subPackages/autopage/index?Dev_PageConfigOID=3e767019-2731-4190-a1f2-aff671cad853'
    // })
    // 在跳转前记录来源路径
    uni.setStorageSync('prevPage', getCurrentPages().slice(-1)[0].route);
    uni.navigateTo({
      url:'/pages/subPackages/autopage/index?Dev_PageConfigOID=ef5641e1-5eb4-4ae5-81bb-930253611dfe&operationOID=20e178f6-ac3f-41d2-84c0-3324a0daadc4'		
    })
    return 
		let json = [{
			tag: 'sel',
			tb: 'ActivityInfoEx',
			field: "*",
			n_ob: 'ActivityInfoExOID',
			wh: ` ActivityID = '${IsEideActivityID.value}'`
		}]
		
		http_request(proxy, {params: json}, '', (res) => {
			if (res.data.data.ActivityInfoEx) {
				let value = res.data.data.ActivityInfoEx[0];
				let json = {
					type: "",
					BPOName: value.BPOID,
					OID: OID.value,
					BusinessState: parseInt(BusinessState.value),
					InstanceID: InstanceID.value,
					FlowID: FlowID.value
				};
				json.type = 'modify'; //临时赋值 真为单按钮 修改
				//假表示只读
				if (parseInt(BusinessState.value) != 1 && parseInt(BusinessState.value) != 3) json.type = "read";
				uni.navigateTo({
					url: `/pages/subPackages/publicform/publicform?type=${json.type}&BPOName=${json.BPOName}&OID=${json.OID}&BusinessState=${json.BusinessState}&title=${BusinessLX}&FlowID=${json.FlowID}&InstanceID=${json.InstanceID}&TaskID=${TaskID}
					&UCML_UserOID=${OID.value}&ExtBillPermiss=${value.ExtBillPermiss}&Descriptions=${value.Descriptions}&TaskDescText=${value.TaskDescText}&ExtendData=${value.ExtendData}&approval=yes&ActivityID=${IsEideActivityID.value}`,
				})
			}
		})
	}
	
	/** 图片url拼接*/
	const imageUrlSplicing = (item)=> {
		if (item === null) return;
		return getUrlType(proxy) + "/" + item;
	}
	
	
	/** 获取表单数据*/
	const getFormData = async() =>{
		if (!InstanceID.value) return;
		//获取基础数据
		http_request(proxy, {json:getBasicJson(itemSliderIndex.value,TaskID)}, '', (res) => {
			basicDataList.value = res.data.data.Flow_AssignTask.Items[0];
			
			//获取表单配置
			http_request(proxy, {json:getFormConfigJson(basicDataList.value.TableLX)}, '', async(res) => {
				businessTypeData = res.data.data.Flow_BusinessType.Items[0];
				const table = businessTypeData.BusinessTable; //业务表
				getBusinessTable.value = businessTypeData.BusinessTable; //业务表
				
				let fieldsList = []; //请求需要的对应表的字段
				let FormConfig_Mobile = {}; //表单配置数据
				if(businessTypeData.FormConfig_Mobile){
					FormConfig_Mobile = JSON.parse(businessTypeData.FormConfig_Mobile);
				}
				
				let Fields_Mobile ='';	//自定义字段
				if(FormConfig_Mobile.Fields_Mobile && FormConfig_Mobile.Fields_CN_Mobile){
					Fields_Mobile = FormConfig_Mobile.Fields_Mobile;
					fieldsList.push(Fields_Mobile);
				}else {
					if (businessTypeData.BusinessTable === "Fee_Reimbursement"){
						Fields_Mobile = "Date_Reim,ReimObject,Total";
						fieldsList.push(Fields_Mobile);
					}else if(businessTypeData.BusinessTable === "Fee_LoanBill"){
						Fields_Mobile = "Borrower,LoanAmount,LoanDescription";
						fieldsList.push(Fields_Mobile);
					}
				}
									
				let Fields_CN_Mobile = ""; 	//自定义字段名称
				if(FormConfig_Mobile.Fields_CN_Mobile && FormConfig_Mobile.Fields_Mobile){
					Fields_CN_Mobile = FormConfig_Mobile.Fields_CN_Mobile;					
				}else {
					if (businessTypeData.BusinessTable === "Fee_Reimbursement"){
						Fields_CN_Mobile = "报销日期,报销对象,报销金额";
					}else if(businessTypeData.BusinessTable === "Fee_LoanBill"){
						Fields_CN_Mobile = "借款人,借款金额,借款说明";
					}
				}
				
				let RemarkField = "Remark";
				if(FormConfig_Mobile.Remark) RemarkField = FormConfig_Mobile.Remark;
				fieldsList.push(RemarkField);
				
				let ProjectNameField = ""; //项目名称
				if(FormConfig_Mobile.ProjectName) {
					ProjectNameField = FormConfig_Mobile.ProjectName;
					fieldsList.push(ProjectNameField);
				}
				
				let CodeField = "Code"; //单据编号
				if(FormConfig_Mobile.Code) CodeField = FormConfig_Mobile.Code;
				fieldsList.push(CodeField);
				
				let BusinessDateField = "SYS_Created"; //单据创建时间
				if(FormConfig_Mobile.BusinessDate) BusinessDateField = FormConfig_Mobile.BusinessDate;
				fieldsList.push(BusinessDateField);
				
				let BusinessTitleField = "";
				if(FormConfig_Mobile.BusinessTitle) {
					BusinessTitleField = FormConfig_Mobile.BusinessTitle;
					fieldsList.push(BusinessTitleField);
				}
				
				let ApplyPersonField = "PersonName";
				if(FormConfig_Mobile.ApplyPerson) ApplyPersonField = FormConfig_Mobile.ApplyPerson;
				fieldsList.push(ApplyPersonField);
				
				let ApplyDateField = "";
				if(FormConfig_Mobile.ApplyDate) {
					ApplyDateField = FormConfig_Mobile.ApplyDate;
					fieldsList.push(ApplyDateField);
				}
			
				// 获取表单对应表的字段数据
				http_request(proxy, {json:getFormFieldsJson(table,fieldsList.join(','),InstanceID.value)}, '', (res) => {
					const tableData = (res.data.data[table].Items[0])
					
					// 赋值			
					formConfigData.value = {
						"Fields_Mobile":[],
						"Fields_CN_Mobile":[],
						"combineFields":[],
						// "Remark":tableData.Remark || '',
						"ProjectName":tableData.ProjectName || '',
						"Code":tableData.Code,
						"BusinessDate":tableData.SYS_Created,
						"BusinessTitle":tableData.BusinessTitle,
						"ApplyPerson":tableData.PersonName,
						"ApplyDate":tableData.ApplyDate,
					};					
					
					Fields_Mobile.split(',').forEach((e)=>{
						formConfigData.value.Fields_Mobile.push(tableData[e]);
					})
					Fields_CN_Mobile.split(',').forEach((e)=>{
						formConfigData.value.Fields_CN_Mobile.push(e);
					})
					// 合并Fields
					const combineFields = formConfigData.value.Fields_CN_Mobile.reduce((Obj,key,index)=>{
						Obj[key] = formConfigData.value.Fields_Mobile[index];
						return Obj;
					},{});
					formConfigData.value.combineFields = combineFields;
					
					if (!tableData.ProjectName) formConfigData.value.ProjectName = basicDataList.value.ProjectName;
					if (!tableData.BusinessTitle) formConfigData.value.BusinessTitle = `关于【${basicDataList.value.PersonName}】的${basicDataList.value.BusinessCategory}`
					if (!tableData.ApplyDate) formConfigData.value.ApplyDate = basicDataList.value.SYS_Created;					
				})
			})
		})
		
		// 获取节点和审批内容
		const resIdeaData = await http_request('',{json:getIdeaJson(InstanceID.value)});
		const tempArray = getNodeIdea(resIdeaData);
		nodeDataList.value = tempArray.filter(f=>f.ActivityType != 'End')
	}
	
	
	//获取明细
	const getDetail = async(PageID='',mainTable='')=>{
		//获取组件明细表数量
		const resCompDetailTable = await http_request('', {json:getCompDetailTableJson(PageID)});
		const compDetailTableList = resCompDetailTable.Dev_PageComponent.Items;
		
		//通过组件OID，获取对应表配置
		let detailTablesData = [];
		let columnConfigList = [];
		compDetailTableList.forEach(async(compTableItem)=>{
			//获取组件明细表的内容
			let compTable = {
				"title": compTableItem.Title,
				"MainKey": compTableItem.MC_Field,
				"ChildKey": compTableItem.SC_Field,
				"isLandscape": false,
			};
			
			//获取明细表的配置
			const resDetailTableConfig = await http_request('', {json:getDetailTableFieldJson(compTableItem)});
			//解析列配置
			const Config = JSON.parse(resDetailTableConfig.Pub_Config.Items[0].Config);
			
			//最终字段：过滤掉number和newColumns1、newColumns2...
			const configFieldList = (Config.GridTemplate.Property.Data[0].Value).filter(item => !item.field.includes("newColumns") & item.field != "Number");
			
			compTable.field = configFieldList.map(item=>item.field).join(",");
			compTable.field_CN = configFieldList.map(item=>item.header).join(",");
			
			let filterDataTableList = [];
			//获取组件明细表的表名
			resDetailTableConfig.Pub_DataAPI.Items.forEach((dataTableItem)=>{
				if(dataTableItem.R_MainField == '' || dataTableItem.R_MainField == null || dataTableItem.R_MainField == undefined){
					compTable.tb = dataTableItem.tb;
				}
				//获取数据源的表字段
				const detailTableFieldArr = compTable.field.split(",");
				const dataTableFieldArr = dataTableItem.field.split(",");
				const filterFieldStr = detailTableFieldArr.filter(f => dataTableFieldArr.includes(f)).join(",");
				const tempFilterObj = {
					"tb": dataTableItem.tb,
					"field": filterFieldStr
				}
				filterDataTableList.push(tempFilterObj);
				
				//赋值主子键给配置表
				filterDataTableList.forEach((i)=>{
					if(compTable.tb == i.tb){
						i.MainKey = compTable.MainKey;
						i.ChildKey = compTable.ChildKey;
					}else{
						i.MainKey = dataTableItem.R_MainField;
						i.ChildKey = dataTableItem.R_ChildField;
					}
				})
			})
			filterDataTableList = filterDataTableList.filter(ii => ii.field.trim() !== ""); //过滤字段为空的子表
			
			//设置列宽、固定列和代码表
			let codeTableList = [];
			// {"col_width":"210,200,160,500","col_fixed":"BillDate,BillType","col_code":"BillType|Fee_BillType"}
			const keys = Object.keys(Config.FieldTemplate)
			keys.forEach((e)=>{
				Config.FieldTemplate[e].Property.Basics.forEach((item)=>{
					if(item.Param == "Fixed" && item.Value != "false"){ //添加固定列
						configFieldList.forEach((f)=>{
							if( e == f.field) {
								f.fixed = true;
								f.width = 120;
							}
						})
					}
					// if(item.Param == "Width" && item.Value){ //添加列宽
					// 	configFieldList.forEach((f)=>{
					// 		if( e == f.field)  item.Value;
					// 	})
					// }
					if(item.CodeTable){ //添加代码表
						configFieldList.forEach((f)=>{
							if( e == f.field) {
								f.CodeTable = item.CodeTable;
								codeTableList.push(item.CodeTable);
							}
						})
					}
				});
			})
			codeTableList = [...new Set(codeTableList)];
			// tablesColumns.value[compTable.tb] = configFieldList;
			compTable.columns = configFieldList;
			
			//获取需要请求的组件表数据
			const resDataTableData = await http_request('', {json:getReimDetailJson(filterDataTableList,mainTable,codeTableList,InstanceID.value)});
			const codeTableData = resDataTableData['Sys_CodeValue'] ? resDataTableData['Sys_CodeValue'].Items : "";
			compTable.data = resDataTableData[compTable.tb].Items;
			compTable.Sort = compTableItem.Sort;
			tablesData.value.push(compTable);
			tablesData.value = tablesData.value.sort((a,b)=>a.Sort -b.Sort); //排序
			
			//赋值代码表中文
			tablesData.value.forEach((item) => {
				if (codeTableList && codeTableList.length > 0 && item.data.length >0) {
					
					item.data.forEach((row) => {
						item.columns.forEach((col) => {
							if(col.CodeTable){
								const find = codeTableData.find((
									f) => f.CodeTableID === col.CodeTable && f.CodeID === row[col.field])
								if (find) {
									row[col.field] = find.CodeName;
								}
							}
						})										
					})
					
					
				}
			})											
		})
		
		
		
	}
	
	
	//明细 -双击单元格事件
	const clickCell = (row, column, index) =>{ //点击单元格触发
		clickTimer.value && clearTimeout(clickTimer.value)
		clickNum.value++
		clickTimer.value = setTimeout(() => {
			if (clickNum.value >= 2) {
				cellShow.value = true
				cellContent.value = row[column.name]
			}
			clickNum.value = 0
		}, 200)
	}
	
	const splitDate = (date)=>{
		if(date) return date.split(' ')[0];
		
	}
	
	const partition = (arr, start, end) =>{
		// 以最后一个元素为基准
		const pivotValue = arr[end];
		let pivotIndex = start;
		for (let i = start; i < end; i++) {
			if (arr[i] < pivotValue) {
				// 交换元素
				[arr[i], arr[pivotIndex]] = [arr[pivotIndex], arr[i]];
				// 移动到下一个元素
				pivotIndex++;
			}
		}
		// 把基准值放在中间
		[arr[pivotIndex], arr[end]] = [arr[end], arr[pivotIndex]]
		return pivotIndex;
	}

	const tap = (e) =>{
		x.value = old.value.x
		y.value = old.value.y
		nextTick(() =>{
			x.value = 30
			y.value = 30
		})
	}
	const onChange = (e)=> {
		old.value.x = e.detail.x
		old.value.y = e.detail.y
	}
	const onTabNavi = (naviIndex) =>{
		if (naviIndex == 1) { //审批单
			naviId.value = 1;
		} else if (naviIndex == 2) { //附件
			naviId.value = 2;
			if(clickFileNum === 0){
				clickFileNum++;
				getFileData();
			}
		} else if (naviIndex == 3) { //流程
			naviId.value = 3;
			if (preditLineData.value.length == 0) getTIMElineData();
		} else if (naviIndex == 4) { //明细
			naviId.value = 4;
			if(clickDetailNum === 0){
				clickDetailNum++;
				getDetail(businessTypeData.MobileFormPageID,getBusinessTable.value);
			}
			
		}

	}
	
	/**获取流程数据*/
	const getTIMElineData = ()=>{
		
		nodeDataList.value.forEach((item)=>{
			const isValid = item.ExecutorInfo.every(k=> k.FinishDate);
			if(isValid) currentStep.value++;
		})
		
		//预计
		preditLineData.value = JSON.parse(JSON.stringify(nodeDataList.value));
		preditLineData.value.forEach((item)=>{
			item.ExecutorInfo.forEach((executorItem)=>{
				if(executorItem.ResolutionCode && executorItem.ResolutionCode === "UnProcessed"){
					delete executorItem.ResolutionCode;
					item.createTime = '';
					return;
				}
			})
		})
		
		//实况
		const tempActually = JSON.parse(JSON.stringify(nodeDataList.value));
		tempActually.forEach((item,index)=>{
			if(item.createTime){
				actuallyLineData.value.push(item)
			}
			console.log("actuallyLineData.value",actuallyLineData.value)
		})
	}
	
	
	/**获取附件*/
	const getFileData = () =>{
		let getFileTableList = []; //附件表
		// let fileTableData = ([]); //获取到的附件表及其附件
		
		//获取附件表
		http_request(proxy, {json:getFileConfigJson(PageConfigOID)}, '', (res) => {
			const getFileConfigList = res.data.data.Pub_FileConfig.Items;			
			getFileConfigList.forEach((e)=>{
				if(!getFileTableList.includes(e.BusinessDataTable)){
					getFileTableList.push(e.BusinessDataTable)
				}
			})
			
			//  获取附件数据
			http_request(proxy, {json:getFileJson(BusinessKey, getFileTableList)}, '', (res) => {
				
				// 所有表的附件集合
				getFileTableList.forEach((table)=>{
					res.data.data[table].Items.forEach((item)=>{
						item.tableName = table;
						fileList.value.push(item);
					})
				})
				
				if (fileList.value !== null) {
					// 给原数据附加值
					fileList.value.forEach((e) => {
						let fileType = e.FileType.toLowerCase();
						if (['png','jpg','jpeg','gif','video','mp4'].includes(fileType)) {
							e.FromActivityID = FromActivityID.value;
							e.BusinessState = BusinessState.value;
							e.FilePath = getUrlType(proxy) + "/" + e.FilePath;
						} else {
							// e.FilePath = getUrlType(proxy) + "/" + e.FilePath;
						}
			
					})
					
					// 将数据按文件类型分类
					let FileListNewData = fileList.value.reduce((result, e) => {
						let fileType = e.FileType.toLowerCase();
						let typeFile ='';
						
						if(['png','jpg','jpeg','gif'].includes(fileType)){
							typeFile = "img";
						}else if(['video','mp4'].includes(fileType)){
							typeFile = "movie";
						}else if(['txt'].includes(fileType)){
							typeFile = "txt";
						}
						else{
							typeFile = "file";
						}
						
						// 如果 result 中没有 typeFile 属性，则初始化为空数组
						if (!result[typeFile]) {
						    result[typeFile] = [];
						  }

						// 将当前元素添加到对应类型的数组中
						result[typeFile].push(e);
						
						return result;
						
					}, [])
					
					fileList.value = Object.values(FileListNewData);
				} else {
					fileList.value = [] //获取不到数据让他为空
				}
				// console.log("fileList的FileListNewData：",fileList.value);
			})			
		})
	}
	
	/**审核关闭*/
	const popupShowValue = (v) =>{
		popupShow.value = v;
	}
	/**组装选节点选人数据*/
	const getFlowpath = (flowModel, activityInfo) =>{
		let flowpathItem = {
			flowpathName: "",
			FlowModelExOID: "",
			FlowID: "",
			StartType: "",
			SplitMode: null,
			FromActivityID: "",
			jiedianArr: null,
		};
		let jiedianArrs = [];
		activityInfo && activityInfo.forEach((item) => {
			let jiedianItem = {
				"checked": false,
				TaskAssignMode: null,
				xuanrenArr: null,
				nodeName: "",
				FlowModelExOID: "",
				FlowID: "",
				ActivityInfoExOID: "",
				ActivityID: "",
			};
			let xuanrenArr = [];
			let xuanrenNameArr = [];
			let xuanrenOIDArr = [];
			let xuanrenPostOID = [];

			if (item.ExecutorNames) {
				xuanrenNameArr = item.ExecutorNames.split(',');
				xuanrenOIDArr = item.Executors_FK.split(",");
				xuanrenPostOID = item.ExecutorsPost_FK.split(",");
			}
			for (let i = 0; i < xuanrenNameArr.length; i++) {
				let xuanrenItem = {
					"checked": false,
					Executor: null,
					ExecutorOID: "",
					FlowModelExOID: "",
					FlowID: "",
					ActivityInfoExOID: "",
					ActivityID: ""
				};
				
				xuanrenItem.ActivityID = item.ActivityID
				xuanrenItem.FlowModelExOID = flowModel.Flow_FlowModelExOID;
				xuanrenItem.ActivityInfoExOID = item.Flow_ActivityInfoExInsOID;
				xuanrenItem.Executor = xuanrenNameArr[i];
				xuanrenItem.ExecutorOID = xuanrenOIDArr[i];
				xuanrenItem.ExecutorsPostOID = xuanrenPostOID[i];
				
				xuanrenArr.push(xuanrenItem);
			}

			jiedianItem.TaskAssignMode = item.TaskAssignMode; //选人节点单选还是多选
			jiedianItem.nodeName = item.ActivityName;
			jiedianItem.FlowModelExOID = flowModel.Flow_FlowModelExOID;
			jiedianItem.FlowID = item.FlowID; // 81没有
			jiedianItem.ActivityInfoExOID = item.Flow_ActivityInfoExInsOID;
			jiedianItem.ActivityID = item.ActivityID;
			jiedianItem.xuanrenArr = xuanrenArr;
			jiedianArrs.push(jiedianItem);
		})
		
		flowpathItem.flowpathName = flowModel.FlowName;
		flowpathItem.FlowModelExOID = flowModel.Flow_FlowModelExOID;
		flowpathItem.FlowID = flowModel.FlowID;
		flowpathItem.StartType = flowModel.StartType; // 流程启动类型
		flowpathItem.SplitMode = flowModel.SplitMode; // 节点单多选
		flowpathItem.FromActivityID = flowModel.FromActivityID; // 节点单多选
		flowpathItem.jiedianArr = jiedianArrs;
		
		return flowpathItem;
	}
	
	// 获取审核数据
	const getApprovalFlowpath = () =>{
		let json = {
				"pageType": "Approval",
				"taskID": TaskID,
				// "UCML_UserOID": UCML_UserOID.value
			}
    popupShow.value = true; //展开审核弹出
		let url = getUrlType(proxy) + '/api/flowGet/approvalData';
		http_request(proxy,json,url, (res) => {
			// 选节点选人
			let jiedianArrs = []
			if (res.data.data.ActivityInfo){
				jiedianArrs = getFlowpath(res.data.data, res.data.data.ActivityInfo).jiedianArr;
				if (res.data.data.IdeaDecision && res.data.data.IdeaDecision.length >0) {
					if (res.data.data.IdeaCodeValue) {
						res.data.data.IdeaDecision.forEach((v) => {
							if (v.CodeID === res.data.data.IdeaCode) {
								oldIdeaCodeValue.value = v.CodeName;
							}
						})
					}  
					// else {
					// 	oldIdeaCodeValue.value = res.data.data.IdeaDecision[0].CodeName;
					// }
					IdeaCode.value = res.data.data.IdeaCode;
				}
			}
			let content = [];

      content.push(...(res.data.data.Action||[]).reduce((a,item,id)=>{
        if(item.ActionID=='WF_FINISHTASK'){
          a.push(...[
            {
              iconName: 'play-right',
              text: '执行',
              id: '2',
              ActionID: 'WF_FINISHTASK',
              active: false
            },
            {
              iconName: 'file-text',
              text: '保存',
              id: '1',
              ActionID: 'BU_SAVE',
              active: false
            }
          ])
        }
        else a.push({
          iconName: 'calendar',
          id,
          text: item.ActionName,
          ActionID: item.ActionID,
          active: false
        })
        return a
      },[]))
      
			/*let obj = null;
      res.data.data.Action && res.data.data.Action.forEach(
				(item) => {
					switch (item.ActionID) {
						// 协办
						case "WF_XIEBAN":
							obj = {
								iconName: 'calendar',
								id: '3',
								text: item.ActionName,
								ActionID: item.ActionID,
								active: false
							}
							content.unshift(obj)
							break;
							// 转签
						case "WF_SIGNTO":
							obj = {
								iconName: 'edit-pen',
								id: '4',
								text: item.ActionName,
								ActionID: item.ActionID,
								active: false
							}
							content.unshift(obj)
							break;
							// 加签
						case "WF_SIGN":
							obj = {
								iconName: 'plus',
								id: '5',
								text: item.ActionName,
								ActionID: item.ActionID,
								active: false
							}
							content.unshift(obj)
							break;
							// 会签
						case "WF_HUIQIN":
							// 有协办就不展示会签
							// if (JSON.stringify(content).indexOf("WF_XIEBAN") != -1) {
							// 	break;
							// }
							obj = {
								iconName: 'edit-pen',
								id: '6',
								text: item.ActionName,
								ActionID: item.ActionID,
								active: false
							}
							content.unshift(obj)
							break;
					}
				}
			)*/

			// 悬浮按钮
			contentBtn.value = content ? content : [];
			// FlowInstance 81没有
			flowAllData.value = res.data.data ? res.data.data : {}
			// 意见决策
			ideaDecision.value = res.data.data.IdeaDecision ? res.data.data.IdeaDecision : [];
			try {
				//是否有意见决策
				IsIdea.value = res.data.data.IdeaDecision ? true : false;
			} catch (e) {
				IsIdea.value = false;
			}
			// 常用意见
			opinion.value = res.data.data.Opinion ? res.data.data.Opinion : [];
			
			// 意见内容
			oldIdeaCodeValue.value = res.data.data.IdeaCodeValue ? res.data.data.IdeaCodeValue : '';
			// 选节点选人选节点
			jiedianArr.value = jiedianArrs ? jiedianArrs : []
		})

	}
	
	// 获取阅读
	const getReadData = async(itemSliderIndex=3,ReadOID='')=>{
		const resReadData = await http_request('',{json:getFormRead(ReadOID)});
		readData.value = resReadData.Flow_ReadRecord.Items[0];
		if(readData.value.Review){
			commentContent.value = readData.value.Review;
		}
	}
	
	const clickCommentShow = ()=>{
		commentShow.value = !commentShow.value;
	}
	
	const getInputContent = (e)=>{
		commentContent.value = e.detail.value;
	}
	
	//更新阅读
	const updateComment = async(comment)=>{
		
		uni.showModal({
			title:"请确认评论？",
			content:commentContent.value,
			success: (res) => {
				if(res.confirm){
					http_request('',{json:updateReadTable(itemSliderIndex.value,readOID.value,comment)},'',(res)=>{
						if(res.data.code === 1000){
							commentShow.value = false;
							uni.showToast({
								title:"操作成功",
								icon:"success",
								mask: true,
								success: () => {
									setTimeout(()=>{
										uni.switchTab({
											url: '/pages/index/items'
										})
									},1500)
								}
							})
						}
					});
				}
			}
		})
		
		
	}
</script>


<style lang="scss" scoped>
	.contentBox {
		width: 100%;
		height: 100%;
		color: #606266;
		margin-top: 25rpx;
		position:relative;

		.tableView {
			// width: 90%;
			// margin: 20rpx auto 100rpx;
			max-height: 100vw;
			border: 1rpx solid #DDDDDD;
			overflow: auto;
			text-align: center;

			.tableTitle {
				position: sticky;
				height: 80rpx;
				line-height: 80rpx;
				left: 0;
				top: 0;
				z-index: 9;
				border-bottom: 1rpx solid #DDDDDD;
				background-color: #F4F4F5;
			}
		}

		.rotateView {
			transition: transform .3s ease;
		}

		.rotate {
			transform: translateX(calc(100vw)) rotate(90deg);
			transform-origin: 0 0;
			width: 100vh;
			height: 100vw;
			position: absolute;
			top: 0;
			background-color: #fff;
			z-index: 99;
		}

		.navgation {

			width: 100%;
			padding-top: 40rpx;
			background-color: #fff;
			margin: 0 10% 0 0;
			display: flex;
			// #ifdef MP-WEIXIN
			// padding-top: 80rpx;


			//#endif
			.navagequit {
				width: 30%;
				display: none;

				.quit {
					height: 80rpx;
					display: flex;
					align-items: center;
					// #ifdef H5
					padding-left: 10%;
					//#endif
					// #ifdef MP-WEIXIN
					padding-left: 18%;
					//#endif
				}
			}

			.tabNaviBox {
				width: 70%;
				height: 80rpx;
				background-color: #ffffff;
				margin: 0rpx 0rpx 20rpx 15%;
				display: flex;
				justify-content: center;
				position: relative;

				.tabBakcground {
					// flex: 1;
					width: 25%;
					height: 100%;
					border-radius: 50rpx;
					text-align: center;
					line-height: 80rpx;
					color: #606266;
					font-size: 35rpx;
				}

				.tabBakcgroundMove {
					transition: all 0.3s ease-in-out;
					position: absolute;
					text-align: center;
					line-height: 80rpx;
					color: #fff;
					background-color: #606266;
					border-radius: 50rpx;
					font-size: 35rpx;
					width: 5%;
					height: 10%;
					bottom: 0;
					left: 0;
				}
			}
		}

		.contentForm {
			width: 100%;

			.fromBox {
				margin: 0 40rpx;
				font-size: 42rpx;
				background-color: #ffffff;

				.headline {
					display: flex;
					justify-content: center;
					align-items: center;
					margin-bottom: 30rpx;
				}

				.grig {
					display: flex;
					justify-content: space-between;
					.grig-item {
						font-size: 23rpx;
					}
				}

				.contentFormBox {
					padding-bottom: 200rpx;

					.formTitle {
						padding: 20rpx 15rpx;
						border: 1rpx solid #333333;
						
						.formTitleText{
							font-size: 35rpx;
							font-weight: bold;
							text-align: center;
							display: block;
							flex-wrap: wrap;
						}
					}

					.row {
						display: flex;
						flex-wrap: wrap;
						border-left: 1rpx solid #333333;
						border-right: 1rpx solid #333333;
						border-bottom: 1rpx solid #333333;						
						
						.rowName {
							width: 150rpx;
							padding:15rpx 0;
							font-size: 30rpx;
							text-align: center;
							border-right: 1rpx solid #333333;
							display: flex;
							align-items: center;
							justify-content: center;
						}
						
						.projectNameContent {
							width: 515rpx;
							font-size: 25rpx;
							box-sizing: border-box;
							text-align: center;
							display: flex;
							align-items: center;
							padding: 10rpx 10rpx 0rpx 20rpx;
							
							.rowContentVaule {
								font-size: 13px;
								margin: 20rpx;
							}
						}
						
						.rowConfigFieldContent{
							padding: 10rpx 10rpx 10rpx 20rpx;
							
							.rowConfigField {
								width: 480rpx;
								padding: 0rpx 0rpx 5rpx 0rpx;
								font-size: 25rpx;
								word-break: break-all;
								display: flex;
								
								.fieldsName{
									width: 100%;
									text-align: left;
									word-wrap: break-word;
								}
							}
						}
						
						.rowContent-4 {
							width: 515rpx;
							min-height: 140rpx;
							font-size: 25rpx;
							display: flex;
							flex-wrap: wrap;

							.qianming {
								float: left;
								width: 80rpx;
								height: 60rpx;
								margin: 15rpx 10rpx;
							}
						}

						.rowItem {
							font-size: 30rpx;
							width: 151rpx;
							padding: 15rpx 0;
							border-top: 1rpx solid #333333;
							border-right: 1rpx solid #333333;
							display: flex;
							justify-content: center;
							align-items: center;
							box-sizing: border-box;
						}
						
						.item-3 {
							font-size: 30rpx;
							text-align: center;
							border: 1rpx solid #333333;
							border-width: 1rpx 1rpx 0 0;
							box-sizing: border-box;
							display: flex;
							justify-content: center;
							align-items: center;
						}

						.item-4 {
							flex: 0 0 53.333%;
							font-size: 25rpx;
							border: 1rpx solid #333333;
							border-width: 1rpx 1rpx 0 0;
							box-sizing: border-box;
							text-align: center;
							border-left-width: 1rpx;
							border-right-width: 1rpx;
							text-align: center;
							display: flex;
							align-items: center;
							justify-content: center;
						}
						
						.ideaBox {
							width: 470rpx;
							min-height: 140rpx;
							padding: 20rpx;
							font-size: 25rpx;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: flex-start;
							
							.approveContent{
								display: flex;
								flex-direction: column;
								margin-bottom: 30rpx;
								
								.ideaContent{
									font-size: 25rpx;
									font-weight: bold;
									text-align: center;
								}
								
								.executorContent{
									margin-top: 5rpx;
									display: flex;
									justify-content: center;
									align-items: center;
									.executorName{
										.executorNameText{
											display: block;
											font-size:30rpx;
											font-weight: 600;
											font-family: 隶书;
										}	
									}
									.executorDate{
										.executorDateText{
											display:block;
											margin-left: 15rpx;
											font-size: 22rpx;
											font-weight: 600;
										}
										
									}
								}
							}
							.approveContent:last-child{
								margin-bottom: 0;
							}
							
						}
						
					}

					.tcs {
						border-top: 1rpx solid #333333;
						border-right: 1rpx solid #333333;
						// width: calc(100% - 0.4px);
					}
				}

			}

		}
		
		
		.auditBtn {
			width: 90%;
			margin: 0 5%;
			height: 80rpx;
			background-color: #606266;
			position: fixed;
			bottom: 50rpx;
			border-radius: 50rpx;
			text-align: center;
			line-height: 80rpx;
			color: #eee;
			font-size: 30rpx;
		}

		.process {
			width: 100%;
			padding: 30rpx 0rpx 30rpx 50rpx;
			box-sizing: border-box;
			background-color: #ffffff;
		}
		
		.popupContent {
			width: 100vw;
			height: 100vh;
			background-color: #F7F7F7;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 10%;
		}
	
		.commentShowBtn{
			width: 90%;
			margin: 0 5%;
			height: 80rpx;
			background-color: #4395ff;
			position: fixed;
			bottom: 50rpx;
			border-radius: 50rpx;
			text-align: center;
			line-height: 80rpx;
			font-size: 30rpx;
		}
		
		.popupComment{
			width: 100%;
			box-sizing: border-box;
			
			.inputLayout{
				width: 100% -20rpx;
				height: 360rpx;
				margin: 30rpx 20rpx;
				padding: 10rpx;
				box-sizing: border-box;
				background-color: #fafafa;
				border: 1rpx #eee solid;
				
				
			}
			
			.confirmBtn{
				width: 90%;
				margin: 20rpx 5%;
				height: 80rpx;
				background-color: #4395ff;
				border-radius: 50rpx;
				text-align: center;
				line-height: 80rpx;
				font-size: 30rpx;
			}
		}
	
	
	}
</style>