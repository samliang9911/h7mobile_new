import {Button} from './types'
import {generateUUID} from '@/utils/index'
import { request } from "@/api/api.js";
import {h} from 'vue'

/**按钮事件 */
export const event:{[key:string]:(params:{button:Button,component:any,pageComponents?: any})=>any} = {
  /**自定义代码 */
/* customFunc({button}){
	  console.log('button.code', button.code)
    eval(button.code||'')
  }, */
  
customFunc({ button, component, pageComponents }) {
    const code = button.code?.trim();
    if (!code) return;
  
    try {
      // ====== 1. 提取组件 ======
      let mainForm: any = null;
      let mxGrid: any = null;
      let deductionsGrid: any = null;
  
      if (pageComponents?.value && Array.isArray(pageComponents.value)) {
        for (const comp of pageComponents.value) {
          if (comp.name === 'form' && comp.title === '费用报销') {
            mainForm = comp;
          } else if (comp.name === 'grid' && comp.title === '费用报销明细') {
            mxGrid = comp;
          } else if (comp.name === 'grid' && comp.title === '冲账明细') {
            deductionsGrid = comp;
          }
        }
      }
  
      // ====== 2. 构建 currentData（当前 UI 数据） ======
      const currentData: Record<string, any[]> = {
        Fee_Reimbursement: mainForm?.data ? [mainForm.data] : [],
        Fee_ReimbursementMX: Array.isArray(mxGrid?.data) ? mxGrid.data : [],
        EPC_Deductions: Array.isArray(deductionsGrid?.data) ? deductionsGrid.data : [],
        Pub_BusinessFile: [],
        Fee_InvoiceCompare: []
      };
  
      // ====== 3. 构建 originData（原始数据） ======
      const originData: Record<string, any[]> = {
        Fee_Reimbursement: mainForm?.rawData ? [mainForm.rawData] : [],
        Fee_ReimbursementMX: Array.isArray(mxGrid?.rawData) ? mxGrid.rawData : [],
        EPC_Deductions: Array.isArray(deductionsGrid?.rawData) ? deductionsGrid.rawData : [],
        Pub_BusinessFile: [],
        Fee_InvoiceCompare: []
      };
  
      // ====== 4. 聚合 model 变更 ======
      const aggregatedModel = { add: [], upd: [], del: [] };
  
      const mergeModel = (target: any, source: any) => {
        if (source.add) target.add.push(...source.add);
        if (source.upd) target.upd.push(...source.upd);
        if (source.del) target.del.push(...source.del);
      };
  
      // 主表 model
      if (mainForm?.model && mainForm.api?.[0]) {
        const tb = mainForm.api[0].tb;
        const model = mainForm.model.getModel(tb);
        mergeModel(aggregatedModel, model);
      }
  
      // 明细表 model（注意：可能有多个 api，通常第二个是主数据）
      if (mxGrid?.model && mxGrid.api?.length) {
        // 找到主数据 API（通常 tag !== 'sel' 或包含主键字段）
        const mainApi = mxGrid.api.find((a: any) => a.tb === 'Fee_ReimbursementMX') || mxGrid.api[0];
        const model = mxGrid.model.getModel(mainApi.tb);
        mergeModel(aggregatedModel, model);
      }
  
      // 冲账明细 model
      if (deductionsGrid?.model && deductionsGrid.api?.[0]) {
        const tb = deductionsGrid.api[0].tb;
        const model = deductionsGrid.model.getModel(tb);
        mergeModel(aggregatedModel, model);
      }
  
      // ====== 5. 执行用户代码 ======
      const fakeThis = {
        getData() {
          return {
            currentData,
            originData,
            model: aggregatedModel,
            fileModules: {}
          };
        }
      };
  
      new Function(code).call(fakeThis);
    } catch (error) {
      console.error('[customFunc] 执行错误:', error);
    }
  },
  


  
  /**保存 */
/* save({ button, component, pageComponents }){
	console.log('pageComponents', pageComponents)
  }, */
  
save({ button, component, pageComponents }) {
  console.log('pageComponents', pageComponents);
  
  // 遍历所有组件
  const allRequests :any = [];
  
  for (const comp of pageComponents.value) {
    console.log('处理组件:', comp.name || comp.title);
    
    // 获取组件ID
    const compId = comp.guid || comp.component?.Dev_PageComponentOID;
    
    // 遍历model中的所有数据源
    if (comp.model && typeof comp.model === 'object') {
      for (const dataSourceId in comp.model) {
        const dataSource = comp.model[dataSourceId];
        console.log('数据源:', dataSourceId, dataSource);
        
        // 检查每个操作类型
        const operations = {
          add: dataSource.add,
          upd: dataSource.upd,
          del: dataSource.del
        };
        
        for (const [tag, items] of Object.entries(operations)) {
          if (Array.isArray(items) && items.length > 0) {
            console.log(`${tag} 操作有 ${items.length} 个项`);
            
            // 获取表名
            let tableName = '';
            
            // 从 api 获取表名
            if (dataSource.api && dataSource.api.tb) {
              tableName = dataSource.api.tb;
            } else {
              // 从第一个item中推断表名
              const firstItem = items[0];
              if (firstItem) {
                const oidKey = Object.keys(firstItem).find(key => 
                  key.toUpperCase().includes('OID')
                );
                if (oidKey) {
                  // 去掉OID后缀获取表名
                  tableName = oidKey.replace(/OID$/i, '');
                }
              }
            }
            
            if (tableName) {
              // 收集请求
              for (const item of items) {
                allRequests.push({
                  tag: tag,
                  tb: tableName,
                  item: item
                });
              }
            }
          }
        }
      }
    }
  }
  
  if (allRequests.length === 0) {
    console.log('没有需要保存的变更');
    return;
  }
  
  console.log(`总共收集到 ${allRequests.length} 个请求`);
  
  // 分组合并请求
  const groupedRequests = {};
  
  for (const req of allRequests) {
    const key = `${req.tag}_${req.tb}`;
    
    if (!groupedRequests[key]) {
      groupedRequests[key] = {
        tag: req.tag,
        tb: req.tb,
        items: []
      };
    }
    
    // 查找主键字段
    let primaryKey = '';
    for (const key in req.item) {
      if (key.toUpperCase().includes('OID')) {
        primaryKey = key;
        break;
      }
    }
    
    // 去重
    if (primaryKey) {
      const exists = groupedRequests[key].items.some(existingItem => 
        existingItem[primaryKey] === req.item[primaryKey]
      );
      if (!exists) {
        groupedRequests[key].items.push(req.item);
      }
    } else {
      groupedRequests[key].items.push(req.item);
    }
  }
  
  // 发送请求
  const promises :any = [];
  
  for (const key in groupedRequests) {
    const group = groupedRequests[key];
    // console.log(`发送批量请求: ${group.tb} 表的 ${group.items.length} 个 ${group.tag} 操作`);
    console.log('group',group)
    promises.push(
      request([{
        tag: group.tag,
        tb: group.tb,
        field: group.items
      }])
    );
  }
  
  // 处理所有请求
  Promise.all(promises)
    .then(results => {
      uni.showToast({
      	title: '保存成功',
		icon: 'success'
      })
	  console.log('results',results)
      // 清空已保存的变更
      for (const comp of pageComponents.value) {
        if (comp.model) {
          for (const dataSourceId in comp.model) {
            const dataSource = comp.model[dataSourceId];
            if (dataSource.add) dataSource.add = [];
            if (dataSource.upd) dataSource.upd = [];
            if (dataSource.del) dataSource.del = [];
          }
        }
      }
    })
    .catch(error => {
      console.error('保存失败:', error);
	  uni.showToast({
	  	title: '保存失败',
	  	icon: 'none'
	  })
    });
},
  
  
  
  
  /**启动流程 */
  startFlow(){
    console.log('启动流程');
  },
  /**查看流程 */
  viewFlow(){
    console.log('查看流程');
  },
  /**流程审批 */
  approvalFlow(){
    console.log('流程审批');
  },
  /**反审核 */
  antiAudit(){
    console.log('反审核');
  },
  /**提交 */
  submit(){
    console.log('提交');
  },
  /**表格新增 */
/* addGrid({component}){
    component.methods.addGrid(component)
  }, */

	addGrid({component, pageComponents}) {
	  // 生成唯一的 OID
	  const generateOid = () => {
	    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	      const r = Math.random() * 16 | 0;
	      const v = c === 'x' ? r : (r & 0x3 | 0x8);
	      return v.toString(16);
	    });
	  };  
	  // 生成当前时间戳（保持格式一致）
	  const generateTimestamp = () => {
	    return Date.now().toString() + '00';
	  };
	  // 判断标题并新增数据
	  if (component.title === '冲账明细') {
		  let BusinessKey :any;
		  BusinessKey = pageComponents.value[1].data[0].Fee_Reimbursement_FK
	    // 创建冲账明细的新数据行
	    const newRow = {
	      BusinessKey: BusinessKey,  // 业务键
	      EPC_DeductionsOID: generateOid(),  // 生成唯一的 OID
	      Timestamp: generateTimestamp()  // 时间戳
	    }; 
	    // 添加到 data.data 数组
	    component.data.push(newRow);
		uni.showToast({
			title: '新增成功',
			icon: 'success'
		})
	  } else if (component.title === '费用报销明细') {
		  let Fee_Reimbursement_FK :any;
		  let Pub_Project_FK :any;
		  if(component.data[0]){
			  Fee_Reimbursement_FK = component.data[0].Fee_Reimbursement_FK
			  Pub_Project_FK = component.data[0].Pub_Project_FK
		  }else{
			  Fee_Reimbursement_FK = "ba997429-a36e-4d04-b515-09cf6e602ee4"
			  Pub_Project_FK = "000c62fd-0000-0000-0000-0000814a57c5"
		  }
	    // 创建费用报销明细的新数据行
	    const newRow = {
	      Fee_ReimbursementMXOID: generateOid(),  // 生成唯一的 OID
	      BillDate: new Date().toISOString().replace('T', ' ').substring(0, 19),  // 默认当前日期
	      Fee_Reimbursement_FK: Fee_Reimbursement_FK,
	      Pub_Project_FK: Pub_Project_FK,
	      Timestamp: generateTimestamp()  // 时间戳
	    };
	    
	    // 添加到 data.data 数组
	    component.data.push(newRow);
		uni.showToast({
			title: '新增成功',
			icon: 'success'
		})
	  } else {
	    console.log('未识别的表格类型:', component.title);
		uni.showToast({
			title: '新增失败',
			icon: 'none'
		})
	  }
	},

  /**选择页面 */
  btnChoose(){
    console.log('选择页面');
  }
}
/**事情触发前 */
export const eventBefore = (item)=>{
  // console.log(item+'前事件')
}
/**事件触发后 */
export const eventAfter = (item)=>{
  // console.log(item+'后事件')
}


