import { getCurrentInstance } from 'vue'
export function getRect(select): Promise<UniApp.NodeInfo> {
  return new Promise((res) => {
    const { proxy } = getCurrentInstance()!
    uni.createSelectorQuery().in(proxy)
      .select(select)
      .boundingClientRect(rect => {
        // @ts-ignore
        res(rect)
      }).exec();
  })
}