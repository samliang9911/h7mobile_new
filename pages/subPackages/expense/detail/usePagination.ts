import { ref } from 'vue'
import { getDetailSingle } from '@/api/expense'

/**
 * 通用分页逻辑封装
 * 每个表格独立维护自己的分页状态
 */
export function usePagination(tableCount : number) {
	// 每个表格的分页状态
	const pages = ref<number[]>(Array(tableCount).fill(1))
	const loading = ref<boolean[]>(Array(tableCount).fill(false))
	const finished = ref<boolean[]>(Array(tableCount).fill(false))
	const data = ref<any[][]>(Array(tableCount).fill([]).map(() => []))

	// 加载某个表格的下一页数据
	async function loadMore(index : number) {
		if (loading.value[index] || finished.value[index]) return
		loading.value[index] = true

		const res = await getDetailSingle(index, pages.value[index])
		if (res.length) {
			data.value[index].push(...res)
			pages.value[index]++
		} else {
			finished.value[index] = true
		}

		loading.value[index] = false
	}

	return {
		pages,
		loading,
		finished,
		data,
		loadMore
	}
}