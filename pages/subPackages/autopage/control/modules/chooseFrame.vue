<template>
	<view @click="chooseFrame">
		<text>{{ config }}</text>
	</view>
</template>
<script setup lang="ts">
	const data = defineModel()
	const { config } = defineProps<{
		config : {
			reduce : any
			/**选择页主键 */
			guid : string,
			/**存值字段 */
			store : string[],
			/**返回值字段 */
			return : string[]
		}
	}>()
	const chooseFrame = () => {
		// uni.navigateTo({
		//   url: '/pages/subPackages/publicform/publicChoicePerson',
		// })
		uni.navigateTo({
			url: `/pages/subPackages/publicform/publicChoicePerson`,
			events: {
				ChoicePerson([{ Name }]) {
					data.value = Name
					// console.log(data);
				}
			},
			success(res) {
				console.log(res);

				//回显数据中必须包含主键OID
				// let echo = item.xuanrenArr.filter(f => f.checked).map(e=> ({...e,OID:e.ExecutorOID}) );
				// res.eventChannel.emit('echoChoicePerson', echo)
			}
		});
	}
</script>
<style scoped>
	view {
		min-height: 30rpx;
		width: 100%;
	}

	text {
		font-size: 26rpx;
	}
</style>