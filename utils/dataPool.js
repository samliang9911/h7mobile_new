export function ToTreeData(data, MPvalue, Dispose = to => to) {//此方法处理展示组件为【树表】的数据
	var value = [];//存放处理好的数据
	if (data) {
		var array = JSON.parse(JSON.stringify(data));
		//第二步- - - - - - - - - - - - - - - - 把newDataShowData处理成展示的数据value- - - - - - - - - - - - - - - - - - - - - - - - - - 
		if (array.length != 0) {
			var LineField = Object.keys(array[0])[0];//行字段
			var FatherField = Object.keys(array[0])[1];//父字段
			if (MPvalue && MPvalue.Line) LineField = MPvalue.Line;
			if (MPvalue && MPvalue.Father) FatherField = MPvalue.Father;
		}
		for (let i = 0; i < array.length; i++) {
			if (array[i][FatherField] == '00000000-0000-0000-0000-000000000000' || array[i][FatherField] == "" || !array[i][FatherField]) {
				const children = loop(array[i], array)
				if(children)value.push(children);
			}
		}
		//第三步- - - - - - - - - - - - - - - - 被上面处理数据时调用- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 	
		function loop(parentData, data) {//循环找出树内子集push给children数组	
			var OID = parentData[LineField];
			for (var i = 0; i < data.length; i++) {
				var parentOID = data[i][FatherField];
				if (parentOID == OID) {
					if (!parentData['children']) parentData['children'] = [];
					const children = loop(data[i], data)
          if(children)parentData['children'].push(children);
					
				}
			}
      const result = Dispose(parentData)
			return typeof result!='boolean'&&!result?parentData:result
		}
	}
	return value;//把处理好的数据返回出去
}