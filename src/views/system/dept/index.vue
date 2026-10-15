<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="部门名称" prop="deptName">
        <el-input
            v-model="queryParams.deptName"
            placeholder="请输入部门名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable style="width: 200px">
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
            v-hasPermi="['system:dept:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="Sort"
            @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="deptList"
        row-key="deptId"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="deptName" label="部门名称" width="260"></el-table-column>
      <el-table-column prop="orderNum" label="排序" width="200"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']">新增</el-button>
          <el-button v-if="scope.row.parentId != 0" link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 外层v-if 完全销毁弹窗DOM，解决缓存旧数据 -->
    <div v-if="open">
      <el-dialog :title="title" v-model="open" width="700px" append-to-body>
        <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="24" v-if="form.parentId !== 0">
              <el-form-item label="上级部门" prop="parentId">
                <el-tree-select
                    v-model="form.parentId"
                    :data="deptOptions"
                    :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                    value-key="deptId"
                    placeholder="选择上级部门"
                    check-strictly
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门名称" prop="deptName">
                <el-input v-model="form.deptName" placeholder="请输入部门名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示排序" prop="orderNum">
                <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
              </el-form-item>
            </el-col>


            <!-- 部门助理 -->
            <el-col :span="12">
              <el-form-item label="部门助理" prop="assistant">
                <el-input
                    v-model="form.assistantText"
                    placeholder="点击选择"
                    readonly
                    @click="openUserSelect('assistant')"
                >
                  <template #append>
                    <el-button @click.stop="openUserSelect('assistant')">
                      <el-icon><User /></el-icon>选择
                    </el-button>
                    <!-- 增加 margin-left 拉开按钮间距 -->
                    <el-button type="danger" plain size="small" style="margin-left: 6px;" @click.stop="clearPerson('assistant')">清空</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <!-- 部门经理 -->
            <el-col :span="12">
              <el-form-item label="部门经理" prop="manager">
                <el-input
                    v-model="form.managerText"
                    placeholder="点击选择"
                    readonly
                    @click="openUserSelect('manager')"
                >
                  <template #append>
                    <el-button @click.stop="openUserSelect('manager')">
                      <el-icon><User /></el-icon>选择
                    </el-button>
                    <el-button type="danger" plain size="small" style="margin-left: 6px;" @click.stop="clearPerson('manager')">清空</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <!-- 部门总监 -->
            <el-col :span="12">
              <el-form-item label="部门总监" prop="director">
                <el-input
                    v-model="form.directorText"
                    placeholder="点击选择"
                    readonly
                    @click="openUserSelect('director')"
                >
                  <template #append>
                    <el-button @click.stop="openUserSelect('director')">
                      <el-icon><User /></el-icon>选择
                    </el-button>
                    <el-button type="danger" plain size="small" style="margin-left: 6px;" @click.stop="clearPerson('director')">清空</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <!-- 分管领导 -->
            <el-col :span="12">
              <el-form-item label="分管领导" prop="leader">
                <el-input
                    v-model="form.leaderText"
                    placeholder="点击选择"
                    readonly
                    @click="openUserSelect('leader')"
                >
                  <template #append>
                    <el-button @click.stop="openUserSelect('leader')">
                      <el-icon><User /></el-icon>选择
                    </el-button>
                    <el-button type="danger" plain size="small" style="margin-left: 6px;" @click.stop="clearPerson('leader')">清空</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>


            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门状态">
                <el-radio-group v-model="form.status">
                  <el-radio
                      v-for="dict in sys_normal_disable"
                      :key="dict.value"
                      :value="dict.value"
                  >{{ dict.label }}</el-radio>
                </el-radio-group>
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

    <!-- 人员选择组件 -->
    <UserSelect v-model="userSelectVisible" @change="handleUserSelected" />
  </div>
</template>

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept"
import { listUser } from "@/api/system/user"
import UserSelect from '@/components/UserSelect/index.vue'
import { nextTick, getCurrentInstance, ref } from 'vue'
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

// =========【变量定义，全部放在最顶部！！】=========
const deptList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref("")
const deptOptions = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)
const userList = ref([])
const userSelectVisible = ref(false)
const currentTarget = ref('')

// 真实业务数据源，隔离el‑form副作用
const tempForm = ref({})
// 表单ref
const deptRef = ref(null)

// form仅用于页面展示 + el‑form校验
const form = ref({
  deptId: undefined,
  parentId: undefined,
  deptName: undefined,
  orderNum: 0,
  assistant: undefined,
  manager: undefined,
  director: undefined,
  leader: undefined,
  assistantText: "",
  managerText: "",
  directorText: "",
  leaderText: "",
  phone: undefined,
  email: undefined,
  status: "0"
})

const queryParams = ref({ deptName: undefined, status: undefined })

// 【重要】删除 parentId required:true，根部门 parentId=0不会校验报错
const rules = ref({
  deptName: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
  orderNum: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phone: [{ pattern: /^1[3|4|5|6|7|8|9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
})

// ========= 工具函数 =========
// 获取全部用户
async function getAllUserList() {
  try {
    const res = await listUser({ pageNum: 1, pageSize: 1000 })
    userList.value = res.rows || []
  } catch (e) {
    userList.value = []
  }
}

// 打开人员选择弹窗
const openUserSelect = (target) => {
  currentTarget.value = target
  userSelectVisible.value = true
}


// 解析UserSelect返回数据
function normalizeUserSelectResult(res) {
  if (res && !Array.isArray(res) && (res.workCodeStr !== undefined || res.nickNameStr !== undefined)) {
    return {
      workCodes: res.workCodeStr ? String(res.workCodeStr).split(',').filter(Boolean) : [],
      nickNames: res.nickNameStr ? String(res.nickNameStr).split(',').filter(Boolean) : []
    }
  }
  if (Array.isArray(res) && res.length > 0 && typeof res[0] === 'object') {
    return {
      workCodes: res.map(u => u.workCode || u.userId || '').filter(Boolean).map(String),
      nickNames: res.map(u => u.nickName || u.userName || '').filter(Boolean)
    }
  }
  if (Array.isArray(res)) {
    const workCodes = res.map(String).filter(Boolean)
    const nickNames = workCodes.map(code => {
      const user = userList.value.find(u => String(u.workCode) === code || String(u.userId) === code)
      return user ? (user.nickName || user.userName) : code
    })
    return { workCodes, nickNames }
  }
  if (typeof res === 'string' || typeof res === 'number') {
    const workCodes = String(res).split(',').filter(Boolean)
    const nickNames = workCodes.map(code => {
      const user = userList.value.find(u => String(u.workCode) === code || String(u.userId) === code)
      return user ? (user.nickName || user.userName) : code
    })
    return { workCodes, nickNames }
  }
  return { workCodes: [], nickNames: [] }
}

// 人员选择回调：只修改tempForm，form只同步展示文本
const handleUserSelected = (res) => {
  const target = currentTarget.value
  if (!target) return

  console.log("res原始数组=", res)
  const { workCodes, nickNames } = normalizeUserSelectResult(res)
  console.log("workCodes", workCodes, "nickNames", nickNames)

  const codeStr = workCodes.join(',')
  const nameStr = nickNames.join(',')

  tempForm.value[target] = codeStr
  tempForm.value[target + 'Text'] = nameStr

  form.value = {
    ...form.value,
    [target + 'Text']: nameStr
  }
  console.log('tempForm', JSON.parse(JSON.stringify(tempForm.value)))
}






// 重置表单
function reset() {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    assistant: undefined,
    manager: undefined,
    director: undefined,
    leader: undefined,
    assistantText: "",
    managerText: "",
    directorText: "",
    leaderText: "",
    phone: undefined,
    email: undefined,
    status: "0"
  }
  tempForm.value = { ...form.value }
}


/**
 * 直接清空某一个人员项，不需要打开人员选择弹窗
 * @param {string} target 目标字段 assistant / manager / director / leader
 */
function clearPerson(target) {
  tempForm.value[target] = ""
  tempForm.value[target + 'Text'] = ""
  // 整体拷贝触发视图刷新
  form.value = {
    ...form.value,
    [target + 'Text']: tempForm.value[target + 'Text']
  }
  console.log(`clearPerson ${target}`, JSON.parse(JSON.stringify(tempForm.value)))
}


// 关闭弹窗重置
function cancel() {
  open.value = false
  reset()
  deptRef.value?.clearValidate()
}

function handleQuery() { getList() }
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 获取部门树列表
function getList() {
  loading.value = true
  listDept(queryParams.value).then(res => {
    deptList.value = proxy.handleTree(res.data, "deptId")
    loading.value = false
  })
}

// 新增部门
async function handleAdd(row) {
  reset()
  await getAllUserList()
  const res = await listDept()
  deptOptions.value = proxy.handleTree(res.data, "deptId")
  const initObj = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    assistant: undefined,
    manager: undefined,
    director: undefined,
    leader: undefined,
    assistantText: "",
    managerText: "",
    directorText: "",
    leaderText: "",
    phone: undefined,
    email: undefined,
    status: "0"
  }
  if (row) {
    initObj.parentId = row.deptId
  }
  form.value = { ...initObj }
  tempForm.value = { ...initObj }

  open.value = true
  title.value = "添加部门"
}

// 展开折叠
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => refreshTable.value = true)
}

// 修改回显
async function handleUpdate(row) {
  reset()
  await getAllUserList()
  const [deptOptRes, deptInfoRes] = await Promise.all([
    listDeptExcludeChild(row.deptId),
    getDept(row.deptId)
  ])
  deptOptions.value = proxy.handleTree(deptOptRes.data, "deptId")
  const dataInfo = deptInfoRes.data

  await nextTick()
  const temp = {
    ...dataInfo,
    assistantText: parseWorkCodeToName(dataInfo.assistant, userList.value),
    managerText: parseWorkCodeToName(dataInfo.manager, userList.value),
    directorText: parseWorkCodeToName(dataInfo.director, userList.value),
    leaderText: parseWorkCodeToName(dataInfo.leader, userList.value),
  }
  form.value = { ...temp }
  tempForm.value = { ...temp }

  open.value = true
  title.value = "修改部门"
  await nextTick()
  deptRef.value?.clearValidate()
}

// 工号转姓名
function parseWorkCodeToName(workCodeStr, users) {
  if (!workCodeStr) return ""
  const codes = String(workCodeStr).replace(/[()]/g, "").split(",").filter(Boolean)
  return users
      .filter(u => codes.includes(String(u.workCode)) || codes.includes(String(u.userId)))
      .map(u => u.nickName || u.userName)
      .join(",")
}

// 提交表单
async function submitForm() {
  // 点击按钮瞬间快照【真实业务数据源tempForm】
  const formSnapshot = JSON.parse(JSON.stringify(tempForm.value))
  console.log("【点击确定瞬间原始快照 tempForm】", formSnapshot)

  try {
    await deptRef.value.validate()
    console.log("✅表单校验通过")
  } catch (err) {
    console.log("❌表单校验失败，err=", err)
    return
  }

  const submitData = { ...formSnapshot }
  // 删除前端展示文本字段，不要传给后端
  delete submitData.assistantText
  delete submitData.managerText
  delete submitData.directorText
  delete submitData.leaderText
  console.log("【最终提交payload】submitData = ", submitData)

  if (submitData.deptId) {
    updateDept(submitData).then(() => {
      proxy.$modal.msgSuccess("修改成功")
      open.value = false
      getList()
    })
  } else {
    addDept(submitData).then(() => {
      proxy.$modal.msgSuccess("新增成功")
      open.value = false
      getList()
    })
  }
}

// 删除部门
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除"' + row.deptName + '"？').then(() => {
    return delDept(row.deptId)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  })
}

// 初始化
getList()
</script>
