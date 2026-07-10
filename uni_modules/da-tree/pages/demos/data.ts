export const basicTreeData = [
  {
    id: '1',
    name: '总经办',
    children: [
      {
        id: '2',
        name: '行政中心',
        sort: 1,
        children: [
          {
            id: '21',
            name: '行政部',
            sort: 2,
          },
          {
            id: '22',
            name: '财务部',
            append: '(禁用)',
            disabled: true,
            sort: 1,
          },
          {
            id: '23',
            name: '人力资源部',
            sort: 3,
            children: [
              {
                id: '231',
                name: '人力资源一部',
                append: '(无下级)',
                leaf: true,
              },
              {
                id: '232',
                name: '人力资源二部',
                children: [],
              },
              {
                id: '233',
                name: '人力资源三部',
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: '3',
        name: '技术中心',
        children: [
          {
            id: '31',
            name: '研发部',
            children: [
              {
                id: '311',
                name: '硬件研发组',
              },
              {
                id: '312',
                name: '软件研发组',
              },
            ],
          },
          {
            id: '32',
            name: '设计部',
            children: [
              {
                id: '321',
                name: 'UI设计组',
              },
              {
                id: '322',
                name: '商品美工组',
              },
              {
                id: '323',
                name: '包装设计组',
              },
            ],
          },
          {
            id: '33',
            name: '测试部',
            children: [
              {
                id: '331',
                name: '硬件测试组',
                disabled: true,
              },
              {
                id: '332',
                name: '软件测试组',
              },
            ],
          },
        ],
      },
      {
        id: '4',
        name: '运营中心',
        disabled: true,
        append: '(禁用)',
        children: [
          {
            id: '41',
            name: '品牌部',
            append: '(被禁用)',
          },
          {
            id: '42',
            name: '咨询部',
            append: '(被禁用)',
          },
          {
            id: '43',
            name: '渠道部',
            append: '(被禁用)',
          },
          {
            id: '44',
            name: '销售部',
            append: '(被禁用)',
          },
        ],
      },
      {
        id: '5',
        name: '营销中心',
        children: [
          {
            id: '51',
            name: '信息采编部',
          },
          {
            id: '52',
            name: '营销策划部',
          },
          {
            id: '53',
            name: '网络公关部',
          },
        ],
      },
    ],
  },
  {
    id: '1-1',
    name: '总经办2',
    children: [
      {
        id: '2-1',
        name: '行政中心2',
      },
      {
        id: '3-1',
        name: '技术中心2',
      },
      {
        id: '4-1',
        name: '运营中心2',
      },
      {
        id: '5-1',
        name: '营销中心2',
      },
    ],
  },
]

export function deepClone(originData) {
  const type = Object.prototype.toString.call(originData)
  let data
  if (type === '[object Array]') {
    data = []
    for (let i = 0; i < originData.length; i++) {
      data.push(deepClone(originData[i]))
    }
  } else if (type === '[object Object]') {
    data = {}
    for (const prop in originData) {
      // eslint-disable-next-line no-prototype-builtins
      if (originData.hasOwnProperty(prop)) {
        // 非继承属性
        data[prop] = deepClone(originData[prop])
      }
    }
  } else {
    data = originData
  }
  return data
}

/**
 * 模拟创建一个接口数据
 */
export function GetApiData(key) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟返回空数据
      if (key.indexOf('-') > -1) {
        return resolve(null)
      }

      // 展开研发部，会自动去重下方重复的内容
      const yfb = key === '31' ? [
        {
          id: '311',
          name: '硬件研发组',
        },
        {
          id: '312',
          name: '软件研发组',
        },
      ] : []

      return resolve([
        {
          id: `${key}-1`,
          name: `动态数据X${key}-1`,
          append: '',
          leaf: true, // 存在 leaf 字段，代表无下级节点，无展开图标
          sort: 1,
        },
        {
          id: `${key}-2`,
          name: `动态数据X${key}-2`,
          append: '',
          children: [], // children 为空数组，有展开图标
          sort: 3,
        },
        {
          id: `${key}-3`,
          name: `动态数据X${key}-3`,
          append: '',
          children: null, // children字段为null或undefined，也有展开图标
          // 你可以通过 isLeafFn 来自行处理是否应该显示下级，具体请看示例10
          sort: 5,
        },
        ...yfb,
      ])
    }, 2000)
  })
}
