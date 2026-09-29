// Gitee Go 流水线定义（仓库根目录 Jenkinsfile）
// 启用方式：Gitee 仓库「DevOps → Gitee Go」中开启，绑定本仓库与 Jenkinsfile 即可。
// 构建节点需 Node.js >= 18（推荐 20）：在 Gitee Go 的构建环境里选择 nodejs 标签/版本。
// 说明：Gitee Go 会在触发时自动检出代码，无需手动 checkout scm。
pipeline {
    agent {
        node {
            label 'nodejs'
        }
    }
    stages {
        stage('安装依赖') {
            steps {
                sh 'npm install --strict-ssl=false'
            }
        }
        stage('单元测试') {
            steps {
                // Vitest 21 项：锁死纳甲/六亲/世应/空亡/六冲六合/精确历法正确性
                sh 'npm test'
            }
        }
        stage('构建产物') {
            steps {
                // 产出 dist/，供 Gitee Pages 部署
                sh 'npm run build'
            }
        }
    }
}
