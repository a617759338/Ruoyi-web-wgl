<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>深圳市瑞能实业股份有限公司</h2>
        <p>
          深圳市瑞能实业股份有限公司（以下简称“瑞能实业”）是一家专注于新能源测试设备、电池检测系统、储能系统及智能装备研发、生产、销售与服务于一体的高新技术企业。公司致力于为全球新能源行业提供领先的测试与智能制造解决方案。
        </p>
        <p>
          瑞能实业深耕电池测试领域多年，产品广泛应用于锂电池、动力电池、储能电池、消费类电池等测试场景，服务客户覆盖国内外众多知名新能源企业、科研院所及检测机构。
        </p>
        <p>
          <b>公司名称:</b> <span>深圳市瑞能实业股份有限公司</span>
        </p>
        <p>
          <el-tag type="danger">新能源测试与智能制造</el-tag>
          <el-tag type="success" style="margin-left: 8px">高新技术企业</el-tag>
        </p>
        <p>
          <el-button
              type="primary"
              icon="Cloudy"
              plain
              @click="goTarget('https://www.repower.com.cn')"
          >访问官网</el-button
          >
          <el-button
              icon="HomeFilled"
              plain
              @click="goTarget('https://www.repower.com.cn')"
          >了解更多</el-button
          >
        </p>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h2>业务板块</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>核心业务</h4>
            <ul>
              <li>电池测试系统</li>
              <li>储能系统</li>
              <li>智能装备</li>
              <li>检测服务</li>
              <li>新能源解决方案</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>应用领域</h4>
            <ul>
              <li>动力电池</li>
              <li>储能电池</li>
              <li>消费类电池</li>
              <li>科研院所</li>
              <li>检测机构</li>
              <li>...</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>联系信息</span>
            </div>
          </template>
          <div class="body">
            <p>
              <i class="el-icon-s-promotion"></i> 官网：<el-link
                href="https://www.repower.com.cn"
                target="_blank"
            >https://www.repower.com.cn</el-link
            >
            </p>
            <p>
              <i class="el-icon-user-solid"></i> 公司：深圳市瑞能实业股份有限公司
            </p>
            <p>
              <i class="el-icon-chat-dot-round"></i> 地址：广东省深圳市
            </p>
            <p>
              <i class="el-icon-money"></i> 邮箱：<a href="javascript:;"
            >service@repower.com.cn</a
            >
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>公司简介</span>
            </div>
          </template>
          <div class="body">
            <p>
              深圳市瑞能实业股份有限公司专注于新能源测试设备、电池检测系统、储能系统及智能装备的研发、生产、销售与服务。
            </p>
            <p>
              公司产品广泛应用于锂电池、动力电池、储能电池、消费类电池等测试场景，服务客户覆盖国内外众多知名新能源企业、科研院所及检测机构。
            </p>
            <p>
              瑞能实业坚持以技术创新为核心，持续为全球新能源行业提供领先的测试与智能制造解决方案。
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>企业文化</span>
            </div>
          </template>
          <div class="body">
            <p><b>愿景：</b>成为全球领先的新能源测试与智能制造解决方案提供商。</p>
            <p><b>使命：</b>以技术创新推动新能源产业高质量发展。</p>
            <p><b>价值观：</b>客户至上、创新驱动、合作共赢、诚信担当。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('3.6.6')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>