import {reactive,watch} from 'vue'
import { request } from "../api";
import {generateUUID} from '@/utils/index'
import DataPool from '../DataPool.js'
import {FieldConfig,CompConfig,AllCleansFunc} from './indexTypes'
const all:AllCleansFunc = {
  form(data,{component,formConfig,customEvent,annexConfig}){
    const {field:fieldEvent={}} = customEvent[component.Dev_PageComponentOID]||{}
    data.data = {}
    data.config = parseFormConfig(formConfig,fieldEvent,data)
    data.request?.then(e=>{
		Object.defineProperty(e[0],'annexConfig',
		{
		  value:annexConfig,
		  enumerable: true,
		  writable: true
		})
		getAnnex(e[0].Fee_ReimbursementOID).then(result => {
		  const annexData = result.Pub_BusinessFile.Items || null; // 取第一个对象
		  Object.defineProperty(e[0], 'annex', {
		    value: annexData,
		    enumerable: true,
		    writable: true
		  });
/* 		  console.log('annexData',annexData)
		  console.log('annex',e[0].annex)
		  */
		  for(let key in e[0]){
		    data.data[key] = e[0][key]
		  }
		  Object.defineProperty(data,'rawData',{
		    value:jParse(e[0]),
		    writable: true
		  })
		})
    }).then(()=>{
      watchModel(data,data.config,val=>[[data.rawData],[val]])
      // const main = toMain(data.api)
      // //没有主数据源
      // if(!main)return;
      // const key = main.tb+'OID'
      // watch(()=>data.data,(val)=>{
      //   const diff = diffArrays([data.rawData] as any,[val] as any,key)
      //   console.log(diff);
      // },{deep:true})
    })
    return data
  },
  grid(data,{component,formConfig,customEvent}){
    const {field:fieldEvent={}} = customEvent[component.Dev_PageComponentOID]||{}
    data.data = []
    const columns = parseFormConfig(formConfig,fieldEvent,data)
    data.config = {
      mode:component.GridMode,
      columns
    }
    data.request?.then(e=>{
		if(data.title === '冲账明细'){
			e.forEach((item, index) => {
				// 使用当前项的 EPC_DeductionsOID 获取附件
				getAnnex(item.EPC_DeductionsOID).then(result => {
				  const annexData = result.Pub_BusinessFile.Items || null; // 取第一个对象
				  Object.defineProperty(item, 'annex', {
				    value: annexData,
				    enumerable: true,
				    writable: true
				  });
				  data.data.splice(0,data.data.length)
				  data.data.push(...e)
				  Object.defineProperty(data,'rawData',{
				    value:jParse(e),
				    writable: true
				  })
				})
			});
		}else if(data.title === '费用报销明细'){
			e.forEach((item, index) => {
				// 使用当前项的 Fee_ReimbursementMXOID获取附件
				getAnnex(item.Fee_ReimbursementMXOID).then(result => {
				  const annexData = result.Pub_BusinessFile.Items || null; // 取第一个对象
				  Object.defineProperty(item, 'annex', {
				    value: annexData,
				    enumerable: true,
				    writable: true
				  });
				  data.data.splice(0,data.data.length)
				  data.data.push(...e)
				  Object.defineProperty(data,'rawData',{
				    value:jParse(e),
				    writable: true
				  })
				})

			});
		}
    }).then(()=>{
      watchModel(data,columns)
    })
    return data
  }
}
//获取附件数据
function getAnnex(tableOID){
	let sql:any = [
		{
			"field": "Pub_BusinessFileOID as OID,Pub_BusinessFileOID,BusinessKey,FilePath,FileName,FileType,FileSizeKb,Mark,Type,Version,SYS_CreatedBy",
			"pages": 1,
			"tag": "sel",
			"tb": "Pub_BusinessFile",
			"tol": 1000,
			"wh": {
				"Filter": "Pub_BusinessFile.BusinessKey in {oids}",
				"Param": {"oids": tableOID},
			}
		}
	]
		return request(sql)
	
}


/**
 * 
 * @param data 组件配置
 * @param fieldConfig 字段配置
 * @param callback 数据变动回调
 * @returns 
 */
function watchModel(data:CompConfig,fieldConfig:any,callback?:(val:any)=>[any[],any[]]){
  const main = toMain(data.api)
  //没有主数据源
  if(!main)return;
  //主键
  const guidKey = main.tb+'OID'
  watch(()=>data.data,(val)=>{
    const [raw,change] = callback?callback(val):[data.rawData,val]
    const diff = diffArrays(raw,change,guidKey)
    for(let tag in diff){
      for(let item of diff[tag]){
        for(let field in item){
          if(field!=guidKey){
            const fieldConfigItem = fieldConfig.find(e=>e.field==field)
            //显式绑定字段
            if(fieldConfigItem){
              const [tb,fieldBind] = fieldConfigItem.FieldSelect
              const model = data.model.getModel(tb)
              let cur = model[tag].find(e=>e[guidKey]==item[guidKey])
              if(!cur){
                cur = {}
                cur[guidKey] = item[guidKey]
                model[tag].push(cur)
              }
              cur[fieldBind] = item[field]
			  
			 /* handleRequest(tag, tb, cur) */
            }
            //主数据源隐式字段
            else {
              const model = data.model.getModel(toTb(main.tb))
              let cur = model[tag].find(e=>e[guidKey]==item[guidKey])
              if(!cur){
                cur = {}
                cur[guidKey] = item[guidKey]
                model[tag].push(cur)
              }
              const mainField = main.field.split(',').map(e=>{
                const match = e.match(/^(.*?)\s+as\s+|^[^.]*\.(.+)|(.+)/i)!;
                return match[1] ?? match[2] ?? match[3]
              })
              if(mainField.includes(field)){
                cur[field] = item[field]
              }
			  
            }

          }
		  
		  
        }
      }
    }
  },{deep:true})
}

/* function handleRequest(tag: string, tb: string, item: {}) {
  request([{
    tag,
    tb,
    field: [item]
  }]);
} */


/**默认组件配置 */
const defaultData = ({component,dataApi,extend}):CompConfig=>{
  const methods = {}
  const data:CompConfig = reactiveWithReadListener({
    guid:component.Dev_PageComponentOID,
    name:component.Component.toLowerCase(),
    title:component.Title
  },({key})=>{
    if(key in methods)return methods[key]
  })
  Object.defineProperty(data,'methods',{
    value:methods,
    writable:true
  })
  /**组件加载动画*/
  Object.defineProperty(data,'loading',{
    value:true,
    writable:true
  })
  /**组件数据源*/
  Object.defineProperty(data,'api',{
    value:deepFreeze(dataApi),
    writable: true
  })
  /**组件配置 */
  Object.defineProperty(data,'component',{
    value:deepFreeze(component),
    writable: true
  })
  /**组件请求 */
/* Object.defineProperty(data,'request',{
    value:getComponentData(data,extend).then(e=>{
      data.loading = false
      let colConfig;
      if(data.name=='grid')colConfig = data.config.columns
      else colConfig = data.config
      return DataPool({
        type:'DefaultModule',
        dataList:Object.keys(e).map((o)=>{
          e[o].Pub_DataAPI = data.api.find(u=>u.tbAlias==o)||data.api.find(u=>u.tb==o)
          return e[o]
        }),
        colConfig
      })
    }),
    writable: true
  }) */
  
Object.defineProperty(data, 'request', {
  value: getComponentData(data, extend).then(e => {
    data.loading = false;
    let colConfig = data.name == 'grid' ? data.config.columns : data.config;
    const dataList = Object.keys(e).map((tableAlias) => {
      // 安全拷贝数据，避免污染原始数据
      const tableData = { ...e[tableAlias] };
      const apiConfig = data.api.find(u => u.tbAlias == tableAlias) || data.api.find(u => u.tb == tableAlias);
      // 关键修复：对 Items 数组进行深拷贝，并保留所有原始字段
      if (tableData.Items && Array.isArray(tableData.Items)) {
        tableData.Items = tableData.Items.map(item => {
          // 创建每个数据项的完整副本
          const itemCopy = { ...item };
          return itemCopy;
        });
      }
      
      tableData.Pub_DataAPI = apiConfig;
      return tableData;
    });
    // 创建 DataPool 实例
    const dataPoolInstance = DataPool({
      type: 'DefaultModule',
      dataList: dataList,
      colConfig: colConfig
    });
    // 关键步骤：确保 DataPool 的构造函数传递数据给 DefaultModule
    // 如果 DataPool 构造函数有问题，我们需要手动传递数据
    if (dataPoolInstance.DefaultModule && dataList.length > 0) {
      // 直接调用 DefaultModule 的 Main 方法处理数据
      const processedData = dataPoolInstance.DefaultModule.Main({
        dataList: dataList,
        colConfig: colConfig
      });
      // 将处理后的数据挂载到 dataPoolInstance 上，便于后续访问
      dataPoolInstance.processedData = processedData;
    }
    return dataPoolInstance;
  }),
  writable: true
});
  
  /**组件数据模型 */
 Object.defineProperty(data,'model',{
    value:data.api.reduce((a,b)=>{
      a[b.Pub_DataAPIOID] = {add:[],upd:[],del:[]}
      Object.defineProperty(a[b.Pub_DataAPIOID],'api',{
        value:b,
        writable:true
      })
      return a
    },{}),
    writable: true
  })
	  
  
  
  /**查找模型函数 */
  Object.defineProperty(data.model,'getModel',{
    value:(value)=>{
      return getModel(data.model,{tbAlias:value})
      ||getModel(data.model,{tb:value})
      ||getModel(data.model,{tb_CN:value})
    }
  })
  return data
}

/**转换成组件数据 */
export default function(config):CompConfig{
  const data = defaultData(config)
  config.extend.component.push(data)
  return all[data.name]?all[data.name](data,config):data
}

/**处理表单|表格字段配置 */
function parseFormConfig(formConfig,fieldEvent,data){
  /**更正不标准的组件名称*/
  const type = {
    "normalInput": "input",
    "dateSelector": "date",
    "compTextarea": "textarea",
    "sliderSelector": "progress",
    "oneNodeSelector": "select",
    "radioSelector": "radio",
    "checkBoxSelector": "checkbox",
  }
  return formConfig.Dev_PageField.filter(e=>e.IsDisplay&&e.Dev_PageComponent_FK==data.guid).map(e=>{
    const obj:FieldConfig = {
      guid:e.Dev_PageFieldOID,
      label:e.FieldName,
      field:e.FieldName_En,
      type:type[e.WebControl]||e.WebControl,
    }
    //字段选择 as [数据源表名或别名,字段名称]
    Object.defineProperty(obj,'FieldSelect',{
      value:deepFreeze(jParse(e.FieldSelect)),
      writable:true
    })
    /**传入参数名获取值 */
    const config = (()=>{
      let config:any = []
      try{
        config = Object.values(jParse(e.Config).FormFieldTemplate.Property).flat() as any
      }catch(e){}
      return (param:string)=>config.find(o=>o.Param==param)?.Value
    })()
    //是否禁用
    if(e.IsEdit)obj.disabled = e.IsEdit;
    //提示信息
    if(e.InputPrompt)obj.placeholder = e.InputPrompt;
    //是否必填
    if(e.IsRequired)obj.required = e.IsRequired;
    //是否有定义事件
    if(fieldEvent[e.FieldName_En])obj.event = fieldEvent[e.FieldName_En];
    if(['select','radio','checkbox'].includes(obj.type)&&e.CodeTableID){
      obj.options = formConfig.Sys_CodeValue
      .filter(o=>o.CodeTableID==e.CodeTableID).map(({label,value})=>({label,value}))
    }
    //选择页和选人都用同一个组件
    else if(['chooseFrame','pickPeople'].includes(obj.type)){
      let path = {
        chooseFrame:`/pages/subPackages/autopage/index?Dev_PageConfigOID=${config('ChoosePageOID')}`,
        pickPeople:'/pages/subPackages/publicform/publicChoicePerson'
      }
      obj.config = {
        url:path[obj.type],
        storedValueField:config('StoredValueField'),
        returnValueField:config('ReturnValueField'),
      }
      obj.type = 'choosePage'
    }
    return obj
  })
}
const apiProp = ['sourceID','tag','alias','childAlias','onlyChild','tb','tbAlias','jo','field','oField','wh','groupBy','ha','hj','n_ob','pages','tol','fileList'] as const;
type DynamicSqlItem = Partial<Record<typeof apiProp[number], any>>
/**获取组件数据 */
async function getComponentData(data,extend){
  const operationOID = extend.operationOID;
    /* const sql = jParse(data.api) */
  const sql = jParse(data.api).filter((e:any)=>!!e)  // 先去掉 undefined/null
  // toMain 判空
  function toMain(api:any[]){ return api.find(e=>e && !e.Relation) }
  // 子数据源判空
  const child = sql.filter(e=>e && e.Relation==1)
  //父组件
  if(!data.component.MC_Key||data.component.MC_Key=='00000000-0000-0000-0000-000000000000'){
    const main = toMain(sql)
    if(!main||!operationOID)return;
    addWh(main,main.tb+'OID',operationOID)
  }
  //子组件
  else {
    //获取父组件
    const parentComponent = extend.component.find(e=>e.guid==data.component.MC_Key)
    //有父组件
    if(parentComponent){
      //父组件主数据源
      const parentApi = toMain(parentComponent.api)
      if(!parentApi)return;
      //父组件数据
      const parentData = await parentComponent.request
      //父组件主数据源OID
      const parentOID = parentData[0][data.component.MC_Field]
      //主数据源
      const main = toMain(sql)
      if(!main||!parentOID)return;
      addWh(main,data.component.SC_Field,parentOID)
      //子数据源
      const child = sql.filter(e=>e.Relation==1)
      for(let item of child){
        let tb = toTb(sql.find(e=>e.Pub_DataAPIOID==item.ParentOID))
        item.childAlias = [tb]
        addWh(item,item.R_ChildField,`${tb}.${item.R_MainField}`,true)
      }
    }
    //没有父组件
    else {

    }
  }
  return request(parseSql(sql))
}
/**返回别名或表名 */
function toTb(api){
  return api.tbAlias||api.tb
}
/**返回主数据源 */
function toMain(api:{[key:string]:any}[]){
  return api.find(e=>!e.Relation)
}
function getModel(model,{tb,tbAlias,tb_CN}:{tb?:string,tbAlias?:string,tb_CN?:string}){
  const contrast = Object.keys(model).reduce((a,b)=>((a[b] = 0),a),{})
  for(let key in model){
    tb&&model[key].api.tb==tb&&contrast[key]++
    tbAlias&&model[key].api.tbAlias==tbAlias&&contrast[key]++
    tb_CN&&model[key].api.tb_CN==tb_CN&&contrast[key]++
  }
  const max = Object.keys(contrast).reduce((a, b) => contrast[a] > contrast[b] ? a : b);
  return model[max]
}
/**深拷贝对象|字符串转对象 */
export function jParse(value,def:any = []){
  if(!value)return def;
  try{
    const str = typeof value=='object'?JSON.stringify(value):value
    return JSON.parse(str)
  }catch(e){
    return def
  }
}
/**处理出可请求的sql */
function parseSql(api:{[key:string]:any}[]):DynamicSqlItem[]{
  return api.map(item=>{
    let obj = {}
    for(let key in item){
      if(apiProp.includes(key as any)&&item[key]){
        obj[key] = item[key]
      }
    }
    return obj
  })
}
/**
 * 给wh增加条件
 * @param api 数据源
 * @param field 字段名
 * @param value 条件值
 * @param noParam 不需要参数
 */
function addWh(api,field:string,value,noParam?:boolean){
  const guid = noParam?value:generateUUID('_')
  if(typeof api.wh!='object'||!api.wh)api.wh = {Filter:'',Param:{}}
  if(api.wh.Filter)api.wh.Filter = ` (${api.wh.Filter}) AND ${field} in {${guid}} `
  else api.wh.Filter = `${field} in {${guid}} `
  if(!noParam)api.wh.Param[guid] = value

}

/**
 * 比较两个数组的差异（简化upd格式）
 * @param {Array} oldArr 旧数组
 * @param {Array} newArr 新数组
 * @param {String} [key='id'] 用于比较元素的键名，默认为'id'
 * @returns {Object} 返回包含add、upd、del三个数组的对象
 */
/* function diffArrays(oldArr = [], newArr = [], key = 'id') {
  const result = {
    add: [],   // 新增的元素
    upd: [] as any[],   // 更新的元素 {id: xx, 变更的键值对}
    del: []    // 删除的元素
  };

  const oldMap = new Map(oldArr.map(item => [item[key], item]));
  const newMap = new Map(newArr.map(item => [item[key], item]));

  // 找出新增的元素
  newArr.forEach(item => {
    if (!oldMap.has(item[key])) {
      result.add.push(item);
    }
  });

  // 找出更新的元素（只记录变化的字段）
  newArr.forEach(newItem => {
    const id = newItem[key];
    if (oldMap.has(id)) {
      const oldItem = oldMap.get(id)!;
      const changes = {};

      // 找出变化的字段
      Object.keys(newItem).forEach(k => {
        if (k !== key && newItem[k] !== oldItem[k]) {
          changes[k] = newItem[k]; // 只记录新值
        }
      });

      // 如果有变化的字段
      if (Object.keys(changes).length > 0) {
        result.upd.push({ [key]: id, ...changes });
      }
    }
  });

  // 找出删除的元素
  oldArr.forEach(item => {
    if (!newMap.has(item[key])) {
      result.del.push(item);
    }
  });

  return jParse(result);
} */


function diffArrays(oldArr = [], newArr = [], key = 'id') {
  const result = {
    add: [] as any[],   // 新增的元素（完整元素）
    upd: [] as any[],   // 更新的元素（包含主键和变化的字段）
    del: [] as any[]    // 删除的元素（只包含主键）
  };

  const oldMap = new Map(oldArr.map(item => [item[key], item]));
  const newMap = new Map(newArr.map(item => [item[key], item]));

  // 找出新增的元素（完整元素）
  newArr.forEach(item => {
    if (!oldMap.has(item[key])) {
      result.add.push(item);
    }
  });

  // 找出更新的元素（只记录变化的字段）
  newArr.forEach(newItem => {
    const id = newItem[key];
    const oldItem = oldMap.get(id);
    
    // 确保 oldItem 存在
    if (oldItem) {
      const changes = {};

      // 找出变化的字段（排除主键）
      Object.keys(newItem).forEach(k => {
        if (k === key) return;
        
        const newValue :any = newItem[k];
        const oldValue :any = oldItem[k];
        
        // 检查是否是 Promise（检查 then 方法）
        const isNewValuePromise = newValue && typeof newValue === 'object' && typeof newValue.then === 'function';
        const isOldValuePromise = oldValue && typeof oldValue === 'object' && typeof oldValue.then === 'function';
        
        // 如果一个是 Promise，一个是空对象，则认为没有变化
        if (
          (isNewValuePromise && 
           typeof oldValue === 'object' && oldValue !== null && 
           Object.keys(oldValue).length === 0) ||
          (isOldValuePromise && 
           typeof newValue === 'object' && newValue !== null && 
           Object.keys(newValue).length === 0)
        ) {
          return; // 跳过，认为没有变化
        }
        
        // 正常比较
        if (newValue !== oldValue) {
          changes[k] = newValue; // 记录新值
        }
      });

      // 如果有变化的字段
      if (Object.keys(changes).length > 0) {
        // 包含主键和变化的字段
        result.upd.push({ [key]: id, ...changes });
      }
    }
  });

  // 找出删除的元素（只包含主键）
  oldArr.forEach(item => {
    if (!newMap.has(item[key])) {
      // 只记录主键
      result.del.push({ [key]: item[key] });
    }
  });

  return jParse(result);
}
/**深度冻结对象 */
function deepFreeze(obj) {
  Object.freeze(obj);
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepFreeze(obj[key]);
    }
  }
  return obj;
}
/**带读取监听的 reactive*/
function reactiveWithReadListener(initialObj, onRead) {
  // 先用 Vue 的 reactive 包装
  const vueReactiveObj = reactive(initialObj);

  // 再包一层 Proxy 监听读取
  return new Proxy(vueReactiveObj, {
    get(target, key, receiver) {
      // 触发回调（可以在这里触发自定义事件）
      if (onRead) {
        const e = onRead({
          target,
          key,
          value: target[key]
        });
        if(e!==void 0)return e;
      }
      // 返回原始值（保持 Vue 的响应性）
      return Reflect.get(target, key, receiver);
   },
  });
}