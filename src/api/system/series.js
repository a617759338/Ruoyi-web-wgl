import request from '@/utils/request'

// 查询职系列表
export function listSeries(query) {
  return request({
    url: '/system/series/list',
    method: 'get',
    params: query
  })
}

// 查询职系详细
export function getSeries(seriesId) {
  return request({
    url: '/system/series/' + seriesId,
    method: 'get'
  })
}

// 新增职系
export function addSeries(data) {
  return request({
    url: '/system/series',
    method: 'post',
    data: data
  })
}

// 修改职系
export function updateSeries(data) {
  return request({
    url: '/system/series',
    method: 'put',
    data: data
  })
}

// 删除职系
export function delSeries(seriesIds) {
  return request({
    url: '/system/series/' + seriesIds,
    method: 'delete'
  })
}

// 下载导入模板 blob
export function downloadSeriesTemplate() {
  return request({
    url: '/system/series/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}

// 导出职系数据 blob
export function exportSeries(query) {
  return request({
    url: '/system/series/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
