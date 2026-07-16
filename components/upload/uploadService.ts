import SparkMD5 from 'spark-md5'
import { http_request, getEncrypt } from '@/api/api.js'
import { getUrlType } from '@/utils/instrumentType.js'
import { useModulesStore } from '@/store/modules/autoPage.ts'
import { deepClone } from '@/utils/index.ts'

const CHUNK_SIZE = 5 * 1024 * 1024

function safeGetUrlType(): string {
  try { return getUrlType() || '' } catch { return '' }
}

function getUploadUrl(): string {
  return safeGetUrlType() + '/api/sysFile/fileSave'
}

function getSign(): string {
  const AccessToken = uni.getStorageSync('AccessToken')
  const timestamp = String(new Date().getTime())
  return getEncrypt(AccessToken + '＆' + timestamp)
}

export interface UploadConfig {
  Mark?: any
  Type?: string
  BusinessDataTable?: string
  DestinationFolder?: string
}

export interface UploadResult {
  FilePath: string
}

export function createInfo(file: { name: string, size: number }, oid: string, config: UploadConfig, tb: string) {
  return [
    {
      OID: oid,
      [tb + 'OID']: oid,
      FileName: file.name,
      FileType: file.name.substring(file.name.lastIndexOf('.') + 1).toLocaleLowerCase(),
      FileSize: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
      FileSizeKb: (file.size / 1024).toFixed(2),
      Mark: config.Mark || null,
      Type: config.Type
    },
    { Id: oid, Fp: 'FilePath', Bf: config.DestinationFolder }
  ]
}

export async function calculateHash(file: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunkSize = CHUNK_SIZE
    const chunks = Math.ceil(file.size / chunkSize)
    const spark = new SparkMD5.ArrayBuffer()
    let currentChunk = 0
    const fileReader = new FileReader()
    fileReader.onload = function (e: any) {
      spark.append(e.target.result)
      currentChunk++
      if (currentChunk < chunks) {
        loadNext()
      } else {
        const hash = spark.end()
        resolve(hash)
      }
    }
    fileReader.onerror = function () {
      reject('文件读取失败')
    }
    function loadNext() {
      const start = currentChunk * chunkSize
      const end = Math.min(file.size, start + chunkSize)
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }
    loadNext()
  })
}

export function createFormData(file: any, i: number, hash: string, oid: string, count: number) {
  const start = i * CHUNK_SIZE
  const end = Math.min(file.size, start + CHUNK_SIZE)
  const formData = new FormData()
  formData.append('id', oid)
  formData.append('HashId', hash)
  formData.append('index', String(i))
  formData.append('count', count)
  formData.append('bs', file.slice(start, end))
  formData.append('sf', file.name.match(/\.[^.]+$/)?.[0])
  return formData
}

export async function uploadChunk(formData: FormData): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', getUploadUrl())
    xhr.setRequestHeader('sign', getSign())
    xhr.setRequestHeader('Authorization', 'Bearer ' + uni.getStorageSync('Access-Token'))
    xhr.setRequestHeader('X-Authorization', 'Bearer ' + uni.getStorageSync('X-Access-Token'))
    xhr.onload = function () {
      const response = JSON.parse(xhr.responseText)
      if (response.code == '1000') {
        resolve(response.data)
      } else {
        reject(response)
      }
    }
    xhr.onerror = function () {
      reject('网络错误')
    }
    xhr.send(formData)
  })
}

export async function uploadByUniUploadFile(filePath: string, oid: string, hash: string, fileName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: getUploadUrl(),
      filePath: filePath,
      name: 'bs',
      formData: {
        id: oid,
        HashId: hash,
        index: '0',
        count: '1',
        sf: fileName.match(/\.[^.]+$/)?.[0]
      },
      header: {
        sign: getSign(),
        Authorization: 'Bearer ' + uni.getStorageSync('Access-Token'),
        'X-Authorization': 'Bearer ' + uni.getStorageSync('X-Access-Token')
      },
      success: (res) => {
        const response = JSON.parse(res.data)
        if (response.code == '1000') {
          resolve(response.data)
        } else {
          reject(response)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export async function fetch(body: any, url = ''): Promise<any> {
  return http_request('', body, url)
}

export async function getFilePath(tb: string, oid: string): Promise<string> {
  const res = await fetch({ json: [{ tag: 'sel', tb: tb, field: 'FilePath', wh: { Filter: tb + 'OID = {oid}', Param: { oid } } }] })
  let path = ''
  if (res && typeof res === 'object') {
    path = res?.fileData?.[tb]?.Items?.[0]?.FilePath ||
           res?.[tb]?.Items?.[0]?.FilePath ||
           res?.fileData?.Items?.[0]?.FilePath ||
           res?.Items?.[0]?.FilePath || ''
  }
  if (path && path.indexOf('/') !== 0 && path.indexOf('http') !== 0) {
    path = '/' + path
  }
  return path
}

export async function deleteFile(tb: string, oid: string, filePath: string): Promise<void> {
  await fetch({
    json: [{
      tag: 'del',
      tb: tb,
      wh: { Filter: tb + 'OID = {oid}', Param: { oid } },
      fileList: [{ Fp: filePath }]
    }]
  })
}

export async function uploadFile(
  raw: any,
  oid: string,
  config: UploadConfig,
  tb: string,
  onProgress: (p: number) => void
): Promise<string> {
  const module = useModulesStore()
  const info = createInfo({ name: raw.name, size: raw.size }, oid, config, tb)
  module.addCurrentData(tb, deepClone(info[0]), false)
  module.addFileData(tb, info[1], false)

  let hash: string
  // #ifdef H5
    hash = await calculateHash(raw)
    const chunkCount = Math.ceil(raw.size / CHUNK_SIZE)
    const schedule = 100 / chunkCount
    for (let i = 0; i < chunkCount; i++) {
      await uploadChunk(createFormData(raw, i, hash, oid, chunkCount))
      onProgress(Math.round((i + 1) * schedule))
    }
  // #endif
  // #ifndef H5
    hash = oid
    await uploadByUniUploadFile(raw.path || raw.tempFilePath, oid, hash, raw.name)
    onProgress(100)
  // #endif

  return await getFilePath(tb, oid)
}