<template>
  <el-dialog
      title="选择人员"
      v-model="visible"
      width="900px"
      append-to-body
      destroy-on-close
  >
    <el-row :gutter="20">
      <splitpanes :horizontal="false" class="default-theme">
        <!-- 左侧部门树 -->
        <pane size="18">
          <el-input
              v-model="deptName"
              placeholder="搜索部门"
              clearable
              prefix-icon="Search"
              style="margin-bottom: 10px"
          />
          <el-tree
              :data="deptOptions"
              :props="{ label: 'label', children: 'children' }"
              :filter-node-method="filterNode"
              ref="deptTreeRef"
              node-key="id"
              highlight-current
              default-expand-all
              @node-click="handleNodeClick"
          />
        </pane>

        <!-- 右侧用户列表 -->
        <pane size="82">
          <el-form :model="queryParams" :inline="true" label-width="68px">
            <el-form-item label="用户名称">
              <el-input
                  v-model="queryParams.userName"
                  placeholder="姓名"
                  clearable
                  style="width: 200px"
                  @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="工号">
              <el-input
                  v-model="queryParams.workCode"
                  placeholder="工号"
                  clearable
                  style="width: 200px"
                  @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table
              v-loading="loading"
              :data="userList"
              @selection-change="handleSelectionChange"
              height="360"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="用户工号" prop="workCode" />
            <el-table-column label="用户名称" prop="userName" />
            <el-table-column label="昵称" prop="nickName" />
            <el-table-column label="部门" prop="dept.deptName" />
          </el-table>

          <pagination
              v-show="total > 0"
              :total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              @pagination="getUserList"
          />
        </pane>
      </splitpanes>
    </el-row>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelect">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="UserSelect">
import {ref, reactive, watch, onMounted} from 'vue'
import {Splitpanes, Pane} from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import {listUser, deptTreeSelect} from "@/api/system/user"

const {proxy} = getCurrentInstance()

// 父组件控制显示
const visible = defineModel()

// 选中回调
const emit = defineEmits(['change'])

// 部门树
const deptName = ref('')
const deptOptions = ref([])
const deptTreeRef = ref(null)

// 用户列表
const userList = ref([])
const loading = ref(false)
const total = ref(0)
const selectedUsers = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  workCode: undefined,
  deptId: undefined,
})

// 部门筛选
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

watch(deptName, (val) => {
  deptTreeRef.value?.filter(val)
})

// 点击部门
const handleNodeClick = (data) => {
  queryParams.deptId = data.id
  queryParams.pageNum = 1
  getUserList()
}

// 获取部门树
const getDeptTree = () => {
  deptTreeSelect().then(res => {
    deptOptions.value = res.data
  })
}

// 查询用户
const getUserList = () => {
  loading.value = true
  listUser({...queryParams}).then(res => {
    userList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getUserList()
}

// 选择用户
const handleSelectionChange = (val) => {
  selectedUsers.value = val
}

// 确认选择
const confirmSelect = () => {
  // 工号：(1001,1002)
  const workCodes = selectedUsers.value.map(u => u.workCode || u.userId)
  const workCodeStr = workCodes.length ? `${workCodes.join(',')}` : ''

  // 显示名：张三,李四
  const userNames = selectedUsers.value.map(u => u.userName || u.nickName)
  const userNameStr = userNames.join(',')

  // 返回给父页面
  emit('change', {
    workCodeStr,    // 提交后台 (1001,1002)
    userNameStr,    // 显示用 张三,李四
    selectedUsers: selectedUsers.value
  })

  visible.value = false
}

// 重置
const resetQuery = () => {
  queryParams.userName = undefined
  queryParams.workCode = undefined
  queryParams.deptId = undefined
  deptName.value = ''
  queryParams.pageNum = 1
  getUserList()
}

onMounted(() => {
  getDeptTree()
  getUserList()
})
</script>

<style scoped>
:deep(.splitpanes) {
  height: 420px;
  border: 1px solid #ebeef5;
}
</style>
