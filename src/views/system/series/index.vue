<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="职系编码" prop="seriesCode">
        <el-input
          v-model="queryParams.seriesCode"
          placeholder="请输入职系编码"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="职系名称" prop="seriesName">
        <el-input
          v-model="queryParams.seriesName"
          placeholder="请输入职系名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 200px">
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:series:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Upload" @click="openImportDialog" v-hasPermi="['system:series:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:series:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="seriesList"
      border
    >
      <el-table-column prop="seriesCode" label="职系编码" width="140" />
      <el-table-column prop="seriesName" label="职系名称" width="220" />
      <el-table-column prop="sortNum" label="排序" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:series:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:series:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <div v-if="open">
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
        <el-form ref="seriesRef" :model="form" :rules="rules" label-width="90px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="职系编码" prop="seriesCode">
                <el-input
                  v-model="form.seriesCode"
                  placeholder="如 M / T / S / F / O"
                  :disabled="!!form.seriesId"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="职系名称" prop="seriesName">
                <el-input v-model="form.seriesName" placeholder="例如：技术研发职系" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="排序" prop="sortNum">
                <el-input-number v-model="form.sortNum" controls-position="right" :min="0" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in sys_normal_disable"
                    :key="dict.value"
                    :value="dict.value"
                  >{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <!-- 导入弹窗 -->
    <el-dialog title="导入职系数据" v-model="importVisible" width="480px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx,.xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的职系数据
            <el-link type="primary" @click="downloadTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitUpload">确 定</el-button>
          <el-button @click="importVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Series">
import { listSeries, getSeries, delSeries, addSeries, updateSeries, downloadSeriesTemplate, exportSeries } from "@/api/system/series"
import { ref, getCurrentInstance } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from "@/utils/auth"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const seriesList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref("")
const refreshTable = ref(true)

const seriesRef = ref(null)
const uploadRef = ref(null)

const form = ref({
  seriesId: undefined,
  seriesCode: undefined,
  seriesName: undefined,
  sortNum: 0,
  status: "0",
  remark: undefined
})
const queryParams = ref({
  seriesCode: undefined,
  seriesName: undefined,
  status: undefined
})

const rules = ref({
  seriesCode: [
    { required: true, message: "职系编码不能为空", trigger: "blur" },
    { pattern: /^[A-Za-z0-9_]{1,20}$/, message: "编码只能字母数字下划线", trigger: "blur" }
  ],
  seriesName: [{ required: true, message: "职系名称不能为空", trigger: "blur" }],
  sortNum: [{ required: true, message: "排序不能为空", trigger: "blur" }]
})

// 上传配置
const importVisible = ref(false)
const upload = ref({
  url: import.meta.env.VITE_APP_BASE_API + '/system/series/importData',
  headers: { Authorization: "Bearer " + getToken() },
  isUploading: false,
  updateSupport: false
})

function handleQuery() {
  getList()
}
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 获取列表
function getList() {
  loading.value = true
  listSeries(queryParams.value).then(res => {
    seriesList.value = res.data || []
    loading.value = false
  })
}

// 重置弹窗表单
function reset() {
  form.value = {
    seriesId: undefined,
    seriesCode: undefined,
    seriesName: undefined,
    sortNum: 0,
    status: "0",
    remark: undefined
  }
}

// 新增
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加职系"
}

// 修改回显
async function handleUpdate(row) {
  reset()
  const res = await getSeries(row.seriesId)
  form.value = { ...res.data }
  open.value = true
  title.value = "修改职系"
  seriesRef.value?.clearValidate()
}

// 关闭弹窗
function cancel() {
  open.value = false
  reset()
  seriesRef.value?.clearValidate()
}

// 提交表单
async function submitForm() {
  try {
    await seriesRef.value.validate()
  } catch (err) {
    return
  }
  if (form.value.seriesId) {
    updateSeries(form.value).then(() => {
      proxy.$modal.msgSuccess("修改成功")
      open.value = false
      getList()
    })
  } else {
    addSeries(form.value).then(() => {
      proxy.$modal.msgSuccess("新增成功")
      open.value = false
      getList()
    })
  }
}

// 删除
function handleDelete(row) {
  proxy.$modal.confirm(`确认删除职系【${row.seriesName}】？`).then(() => {
    return delSeries(row.seriesId)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  })
}

// ==========导入相关==========
function openImportDialog() {
  importVisible.value = true
  upload.value.isUploading = false
  uploadRef.value?.clearFiles()
}

function handleFileUploadProgress() {
  upload.value.isUploading = true
}

function handleFileSuccess(res) {
  upload.value.isUploading = false
  importVisible.value = false
  proxy.$alert(res.msg, "导入结果", { dangerouslyUseHTMLString: true })
  getList()
}

function submitUpload() {
  uploadRef.value.submit()
}

/** 下载模板 blob */
function downloadTemplate() {
  downloadSeriesTemplate().then(res => {
    const blob = new Blob([res])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '职系数据模板.xlsx'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  })
}

/** 导出 */
function handleExport() {
  exportSeries({ ...queryParams.value }).then(res => {
    const blob = new Blob([res])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `职系数据_${new Date().getTime()}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  })
}

getList()
</script>
