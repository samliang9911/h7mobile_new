/**
 * 文件类型表 + 辏助函数（移动端上传组件用）
 * 业务对齐 PC 端 creatpage：src/utils/index.js 的 BasicTypeList / getTypeList / getFileType
 * 以及 getFileIconUrl（与本项目 fileView.js 中的实现逐字一致；此处内联以避免跨端组件
 * 直接 import H5-only 的 fileView.js，该模块在顶层引用了 DOM/jQuery/layer）。
 */

/** 基本文件类型表：key = 类型分类，value = 扩展名（小写、去重） */
export const BasicTypeList: Record<string, string[]> = {
  /** PDF */
  pdf: ['pdf'],
  /** 文本/文档（对齐 A：office 文档归在 text，getFileType 反查时 text 先于 office 命中） */
  text: ['txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  /** 图片 */
  image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'heic', 'heif', 'tif', 'tiff', 'psd', 'raw', 'cr2', 'nef', 'orf', 'sr2', 'arw'],
  /** 音频 */
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'ape', 'amr', 'aiff', 'opus', 'mid', 'midi'],
  /** 视频 */
  video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg', '3gp', '3g2', 'rm', 'rmvb', 'asf', 'f4v', 'mts', 'm2ts'],
  /** 字体 */
  font: ['otf', 'ttf', 'woff', 'woff2'],
  /** 磁盘镜像 */
  disk: ['ccd', 'dmg', 'iso', 'mdf', 'vdi', 'vhd', 'vmdk', 'wim'],
  /** 代码 */
  code: ['c', 'cpp', 'cs', 'css', 'go', 'h', 'html', 'java', 'js', 'json', 'kt', 'php', 'py', 'rb', 'rs', 'vue', 'xml', 'yml'],
  /** 可执行 */
  executable: ['apk', 'bat', 'exe', 'jar', 'ps1', 'sh'],
  /** 安装包 */
  package: ['deb', 'msi', 'pkg', 'rpm'],
  /** 压缩 */
  compressed: ['7z', 'bz2', 'cab', 'gz', 'rar', 'tar', 'xz', 'zst', 'zip'],

  /** 3D 模型（对齐 A，model3d 共 18 种） */
  model3d: ['3dm', '3ds', '3mf', 'amf', 'bim', 'brep', 'dae', 'fbx', 'fcstd', 'gltf', 'ifc', 'iges', 'step', 'stl', 'obj', 'off', 'ply', 'wrl'],
  /** CAD */
  cad: ['dwg', 'dxf'],
  /** OFFICE 文档 */
  office: ['doc', 'docx', 'dot', 'dotx', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'pptm', 'mdb', 'accdb', 'pst', 'ost', 'one', 'pub', 'vsd', 'vsdx']
}

/** 获取文件类型列表；传 type 返回对应数组（无则空数组），不传返回全表 */
export function getTypeList(type = ''): string[] | Record<string, string[]> {
  if (type) return BasicTypeList[type] || []
  return BasicTypeList
}

/** 根据文件名/路径/扩展名返回类型分类（无匹配返回 ''）。对齐 A：按 key 插入顺序首个命中 */
export function getFileType(name: string): string {
  if (!name) return ''
  const ext = name.split('.').pop()!.toLowerCase()
  for (const type in BasicTypeList) if (BasicTypeList[type].includes(ext)) return type
  return ''
}

/** 是否为图片扩展名 */
export function isImageExt(ext: string): boolean {
  return BasicTypeList.image.includes(String(ext || '').toLowerCase())
}

/**
 * 根据 Pub_FileConfig 行计算选择器过滤规则（对齐 A 的 accept 逻辑）。
 * image→image/*、video→video/*、model3d→model3d 扩展名、WJ/空→AllowTypes 或不限。
 * @returns extension 用于 uni.chooseFile 的 extension 过滤；mime 仅作语义参考
 */
export function buildAccept(config: any): { extension: string[]; mime: string } {
  const Type = config?.Type
  if (Type === 'image') return { extension: BasicTypeList.image, mime: 'image/*' }
  if (Type === 'video') return { extension: BasicTypeList.video, mime: 'video/*' }
  if (Type === 'model3d') return { extension: BasicTypeList.model3d, mime: '' }
  // WJ / 空：AllowTypes 优先；未配置则不限制
  const allow = config?.AllowTypes
  if (allow !== undefined && allow !== null && allow !== '' && allow !== 'null') {
    const ext = String(allow).split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    return { extension: ext, mime: '' }
  }
  return { extension: [], mime: '*/*' }
}

/**
 * 返回文件扩展名对应的图标 URL（相对路径）；图片类型返回 false（由调用方走缩略图）。
 * 与 creatpage src/utils/index.js getFileIconUrl 及本项目 fileView.js 逐字一致。
 */
export function getFileIconUrl(fileExtension: string): string | false {
  const ext = String(fileExtension || '').toLowerCase()
  if (ext === 'png' || ext === 'jpg' || ext === 'gif' || ext === 'jpeg' || ext === 'bmp' || ext === 'webp') {
    return false
  } else if (ext === 'mp3' || ext === 'mpeg' || ext === 'mp4' || ext === 'ogg' || ext === 'wav' || ext === 'webm') {
    return '/Images/img_fileType/VIDEO.png'
  } else if (ext === 'pdf') {
    return '/Images/img_fileType/PDF.png'
  } else if (ext === 'doc' || ext === 'docx') {
    return '/Images/img_fileType/WORD.png'
  } else if (ext === 'xls' || ext === 'xlsx') {
    return '/Images/img_fileType/ECEL.png'
  } else if (ext === 'ppt' || ext === 'pptx') {
    return '/Images/img_fileType/PPT.png'
  } else if (ext === 'zip' || ext === 'rar') {
    return '/Images/img_fileType/ZIP.png'
  } else if (ext === 'txt') {
    return '/Images/img_fileType/TET.png'
  } else if (ext === 'csv') {
    return '/Images/img_fileType/CSV.png'
  } else if (ext === 'dwg') {
    return '/Images/img_fileType/PUB.png'
  } else if (ext === 'xmind') {
    return '/Images/img_fileType/XMIND.png'
  } else if (ext === 'md') {
    return '/Images/img_fileType/MD.png'
  } else if (['3dm', '3ds', '3mf', 'amf', 'bim', 'brep', 'dae', 'fbx', 'fcstd', 'gltf', 'ifc', 'iges', 'step', 'stl', 'obj', 'off', 'ply', 'wrl'].includes(ext)) {
    return '/Images/img_fileType/3D.png'
  } else {
    return '/Images/img_fileType/none.png'
  }
}
