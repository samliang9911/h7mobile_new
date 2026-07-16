import {ref} from 'vue'
/**
 * 解析自定义代码 (支持js代码、函数、箭头表达式)
 * @param {string} code  自定义代码
 * @param {...any} param 参数
 */
export function ParseFuntionCode(code, ...param) {
  return code?(function () {
    // 简单去除注释（支持 // 和 /* */）
    const cleanCode = code
      .replace(/\/\/.*$/gm, '')                 // 去掉单行注释
      .replace(/\/\*[\s\S]*?\*\//gm, '')        // 去掉多行注释
      .trim();
    //判断是否是函数
    let isFunc = /^(async\s+)?function\s*\w*\s*\([^)]*\)\s*\{|\(?[\w\s,]*\)?\s*=>\s*(\{?.+\}?)$/.test(cleanCode.trim())
    let func = isFunc?eval(`(${cleanCode})`) : 
    eval(`(function(${(this?.['_paramLabel']||[]).join()}){${cleanCode}})`);
    return func.call((this), ...param)
  }).call((this)):code
}
/** 根据时间戳返回随机的UUID
 * @returns {string} 随机生成的UUID
 */
export function generateUUID(symbol='-') {
  var d = new Date().getTime() //Timestamp
  var d2 = 0
  return `xxxxxxxx${symbol}xxxx${symbol}4xxx${symbol}yxxx${symbol}xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16
      if (d > 0) {
          r = (d + r) % 16 | 0
          d = Math.floor(d / 16)
      } else {
          r = (d2 + r) % 16 | 0
          d2 = Math.floor(d2 / 16)
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function useDefer(maxCount){ 
  const frameCount = ref(0)
  function updateFrameCount(){
    setTimeout(()=>{
      frameCount.value++
      if(frameCount.value<=maxCount)updateFrameCount()
    })
  }
  updateFrameCount()
  return function defer(n){
    return frameCount.value>=n
  }
}

/**
 * 深拷贝一个对象
 * @param {object|Array} obj
 * @returns
 */
export function deepClone(obj) {
  let objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === 'object') {
    for (let key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        objClone[key] = deepClone(obj[key]);
      } else {
        objClone[key] = obj[key]
      }
    }
  }
  return objClone;
}
