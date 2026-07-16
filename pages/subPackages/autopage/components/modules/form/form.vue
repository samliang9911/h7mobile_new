<template>
  <up-form labelPosition="top" :model="data" :rules="rules" labelWidth="auto">
    <up-form-item v-for="item in config" :label="item.label" :key="item.guid" :prop="item.field"
      :borderBottom="borderBottom({ type: item.type, disabled: item.disabled })">
      <control v-model="data[item.field]" :form-data="data" v-bind="item" @onChangeBefore="e => onChangeBefore(e, item)"
        @onPageOpenBefore="onPageOpenBefore(item)" />
    </up-form-item>

    <upload v-model="annexFiles" :config="uploadConfig" :onUpload="onUploadHandler" :onDelete="handleDelete" />
  </up-form>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import control from '../../../control'
import { FieldConfig } from '@/api/autopage/indexTypes'
import { ParseFuntionCode } from '@/utils'
import { uploadFile, deleteFile } from '@/components/upload/uploadService.ts'
import { useModulesStore } from '@/store/modules/autoPage.ts'
import upload from '@/components/upload/upload.vue'

const module = useModulesStore()

const data = defineModel<Record<string, any>>({ default: () => ({}) })

const { config } = defineProps<{ config: FieldConfig[] }>()

const annexConfigRow = computed(() => data.value?.annexConfig?.[2])
const uploadConfig = computed(() => annexConfigRow.value || { Name: '附件', Type: 'image', QuantityLimit: 0, LimitSize: 100 })
const onUploadHandler = computed(() => (annexConfigRow.value ? handleUpload : undefined))
const tb = computed(() => annexConfigRow.value?.BusinessDataTable || 'Pub_BusinessFile')
const annexFiles = computed<any[]>({
  get: () => data.value?.annex || [],
  set: (v: any[]) => { if (data.value) data.value.annex = v }
})
watch(() => data.value, v => { if (v && !Array.isArray(v.annex)) v.annex = [] }, { immediate: true })

const rules = computed(() =>
  config
    .filter(e => e.required)
    .reduce((acc, item) => {
      data.value[item.field] ??= ''
      acc[item.field] = {
        type: 'string',
        required: true,
        message: `请填写${item.label}`,
        trigger: ['blur', 'change']
      }
      return acc
    }, {})
)

const borderBottom = ({ type, disabled }: { type: string; disabled: boolean }) =>
  !(['textarea'].includes(type) || (['input', 'inputNumber'].includes(type) && disabled))

const onChangeBefore = (e: any, item: FieldConfig) => {
  let change = true
  const value = item.event?.onChangeBefore && ParseFuntionCode.call(
    { _paramLabel: ['fieldInfo', 'data'] },
    item.event.onChangeBefore,
    item,
    e.data
  )
  if (item.event?.onChangeBefore && !value) change = false
  e.callback(change)
}

const onPageOpenBefore = (e: FieldConfig) => {
  e.event?.onPageOpenBefore && ParseFuntionCode.call(
    { _paramLabel: ['fieldInfo'] },
    e.event.onPageOpenBefore,
    { urlParams: {}, selectedData: [], layerOptions: {} }
  )
}

async function handleUpload(raw: any, oid: string, onProgress: (p: number) => void) {
  return await uploadFile(raw, oid, annexConfigRow.value || {}, tb.value, onProgress)
}

async function handleDelete(oid: string, filePath: string) {
  await deleteFile(tb.value, oid, filePath)
  module.removeCurrentData(tb.value, oid)
  module.removeFileData(tb.value, oid)
}
</script>
<style lang="less" scoped>
.u-form {
  padding-top: 10px;
}

.u-form-item {
  margin-bottom: 20px;

  &>:deep(.u-form-item__body) {
    padding: 0;
  }
}

:deep(.u-form-item__body__left__content__label) {
  font-size: 14px;
}
</style>