/**
 * 操作表格方法
 * @param data 
 * @returns 
 */
export default function(component){
  return {
    /* addGrid(data){
      console.log('表格新增',data);
    }, */
/* 	addGrid(data) {
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
	  if (data.title === '冲账明细') {
		  let BusinessKey :any;
		  if(data.data[0]){
		  			  BusinessKey = data.data[0].BusinessKey
		  }else{
		  			  BusinessKey = "ba997429-a36e-4d04-b515-09cf6e602ee4"
		  }
	    // 创建冲账明细的新数据行
	    const newRow = {
	      BusinessKey: BusinessKey,  // 业务键
	      EPC_DeductionsOID: generateOid(),  // 生成唯一的 OID
	      Timestamp: generateTimestamp()  // 时间戳
	    }; 
	    // 添加到 data.data 数组
	    data.data.push(newRow);
	  } else if (data.title === '费用报销明细') {
		  let Fee_Reimbursement_FK :any;
		  let Pub_Project_FK :any;
		  if(data.data[0]){
			  Fee_Reimbursement_FK = data.data[0].Fee_Reimbursement_FK
			  Pub_Project_FK = data.data[0].Pub_Project_FK
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
	    data.data.push(newRow);
		uni.showToast({
			title: '新增成功',
			icon: 'success'
		})
	  } else {
	    console.log('未识别的表格类型:', data.title);
		uni.showToast({
			title: '新增失败',
			icon: 'none'
		})
	  }
	}, */

    /**获取字段值 */
    getFieldValue(field){
      return component.data[0][field]
      // return data.value[field]
    },
    /**设置字段值 */
    setFieldValue(field,value){
      // data.value[field] = value
    }
  }
}