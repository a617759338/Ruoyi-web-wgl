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

    <!-- 添加或修改部门对话框 -->
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

          <!-- 👇 已改为人员多选选择器 -->
          <el-col :span="12">
            <el-form-item label="部门助理" prop="assistant">
              <el-input
                  v-model="form.assistantText"
                  placeholder="点击选择"
                  readonly
                  @click="openUserSelect('assistant')"
              >
                <template #append>
                  <el-button @click="openUserSelect('assistant')">
                    <el-icon><User /></el-icon>选择
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="部门经理" prop="manager">
              <el-input
                  v-model="form.managerText"
                  placeholder="点击选择"
                  readonly
                  @click="openUserSelect('manager')"
              >
                <template #append>
                  <el-button @click="openUserSelect('manager')">
                    <el-icon><User /></el-icon>选择
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="部门总监" prop="director">
              <el-input
                  v-model="form.directorText"
                  placeholder="点击选择"
                  readonly
                  @click="openUserSelect('director')"
              >
                <template #append>
                  <el-button @click="openUserSelect('director')">
                    <el-icon><User /></el-icon>选择
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="分管领导" prop="leader">
              <el-input
                  v-model="form.leaderText"
                  placeholder="点击选择"
                  readonly
                  @click="openUserSelect('leader')"
              >
                <template #append>
                  <el-button @click="openUserSelect('leader')">
                    <el-icon><User /></el-icon>选择
                  </el-button>
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
    <UserSelect v-model="userSelectVisible" @change="handleUserSelected" />
  </div>
</template>
<!-- 人员选择组件 -->

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept"
import { listUser } from "@/api/system/user"
import UserSelect from '@/components/UserSelect/index.vue'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

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

const data = reactive({
  form: {},
  queryParams: { deptName: undefined, status: undefined },
  rules: {
    parentId: [{ required: true, message: "上级部门不能为空", trigger: "blur" }],
    deptName: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
    orderNum: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
    email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
  },
})

const { queryParams, form, rules } = toRefs(data)

// 获取部门列表
function getList() {
  loading.value = true
  listDept(queryParams.value).then(res => {
    deptList.value = proxy.handleTree(res.data, "deptId")
    loading.value = false
  })
}

// 获取全部用户（用于编辑回显）
function getAllUserList() {
  listUser({ pageNum: 1, pageSize: 1000 }).then(res => {
    userList.value = res.rows
  })
}

// 打开人员选择
const openUserSelect = (target) => {
  currentTarget.value = target
  userSelectVisible.value = true
}

// 选择完成
const handleUserSelected = (res) => {
  const target = currentTarget.value
  form.value[target] = res.workCodeStr
  form.value[target + 'Text'] = res.userNameStr
}

// 重置表单
function reset() {
  form.value = {
    deptId: undefined, parentId: undefined, deptName: undefined, orderNum: 0,
    assistant: undefined, manager: undefined, director: undefined, leader: undefined,
    assistantText: "", managerText: "", directorText: "", leaderText: "",
    phone: undefined, email: undefined, status: "0"
  }
}

// 取消
function cancel() {
  open.value = false
  reset()
}

// 搜索
function handleQuery() { getList() }
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 新增
function handleAdd(row) {
  reset()
  listDept().then(res => {
    deptOptions.value = proxy.handleTree(res.data, "deptId")
  })
  if (row) {
    form.value.parentId = row.deptId
  }
  open.value = true
  title.value = "添加部门"
}

// 展开/折叠
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => refreshTable.value = true)
}

// 修改（✅ 修复回显）
function handleUpdate(row) {
  reset()
  listDeptExcludeChild(row.deptId).then(res => {
    deptOptions.value = proxy.handleTree(res.data, "deptId")
  })
  getDept(row.deptId).then(res => {
    form.value = res.data

    // ✅ 关键：把 (工号,工号) 转成 姓名,姓名
    const users = userList.value
    form.value.assistantText = parseWorkCodeToName(form.value.assistant, users)
    form.value.managerText = parseWorkCodeToName(form.value.manager, users)
    form.value.directorText = parseWorkCodeToName(form.value.director, users)
    form.value.leaderText = parseWorkCodeToName(form.value.leader, users)

    open.value = true
    title.value = "修改部门"
  })
}

// ✅ 核心工具方法：工号串 → 姓名
function parseWorkCodeToName(workCodeStr, userList) {
  if (!workCodeStr) return ""
  const codes = workCodeStr.replace(/[()]/g, "").split(",")
  return userList
      .filter(u => codes.includes(u.workCode || u.userId + ""))
      .map(u => u.userName || u.nickName)
      .join(",")
}

// 提交
function submitForm() {
  proxy.$refs.deptRef.validate(valid => {
    if (!valid) return
    if (form.value.deptId) {
      updateDept(form.value).then(() => {
        proxy.$modal.msgSuccess("修改成功")
        open.value = false
        getList()
      })
    } else {
      addDept(form.value).then(() => {
        proxy.$modal.msgSuccess("新增成功")
        open.value = false
        getList()
      })
    }
  })
}

// 删除
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
getAllUserList() // ✅ 加载用户用于回显
</script>
