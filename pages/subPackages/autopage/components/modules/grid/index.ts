import { h } from 'vue'
import form from './form/index.vue'
import list from './list/index.vue'
export { default as useMethods } from './methods'
const all = { form, list }
export default {
	props: ['config', 'data', 'title'],
	setup(props) {
		const mode = props.config?.mode || 'form'
		const columns = props.config?.columns || []
		return () => h(all[mode], {
			title: props.title,
			columns,
			edit: props.config?.edit,
			count: props.config?.count,
			modelValue: props.data
		})
	}
}