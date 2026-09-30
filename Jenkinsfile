// Gitee Go 流水线定义（仓库根目录 Jenkinsfile）
// ───────────────────────────────────────────────────────────────────────────
// 启用方式：Gitee 仓库「DevOps → Gitee Go」开启 → 绑定本仓库与根目录 Jenkinsfile。
// 构建节点需 Node.js >= 18（推荐 20）：在 Gitee Go 构建环境选 nodejs 标签/版本。
// 触发：push 到 master 即自动跑 测试 → 构建 → 推送 dist 到 pages 分支。
//
// ⚠️ 必须配置（Gitee Go 流水线设置里加「保密变量 / Secret」）：
//   变量名 GITEE_TOKEN = 你的 Gitee 私人令牌（scope 勾 projects，用于回推 pages 分支）
//   令牌生成：https://gitee.com/profile/personal_access_tokens
//
// ⚠️ Gitee Pages 免费版限制：推完 pages 分支后仍需在「设置 → Pages」点一次「更新」才生效
//   （免费版不支持 API 自动重新部署，报「非付费 pages，不允许部署」）。
//   若你开通了付费 Pages，下方「发布」阶段会自动调用 API 触发，无需手动点击。
// ───────────────────────────────────────────────────────────────────────────
pipeline {
    agent {
        node {
            label 'nodejs'
        }
    }
    environment {
        // 由 Gitee Go 保密变量注入；不要在仓库里写明文
        GITEE_TOKEN = "${env.GITEE_TOKEN}"
        GITEE_REPO  = 'yongyuwang/chuyuedeliuyao'
    }
    stages {
        stage('安装依赖') {
            steps {
                sh 'npm install --strict-ssl=false'
            }
        }
        stage('单元测试') {
            steps {
                // Vitest 22 项：锁死纳甲/六亲/世应/空亡/六冲六合/精确历法/变卦阴阳
                sh 'npm test'
            }
        }
        stage('构建产物') {
            steps {
                // 产出 dist/，base 已设为 './' 适配 Gitee Pages 子路径
                sh 'npm run build'
            }
        }
        stage('推送静态产物到 pages 分支') {
            steps {
                sh '''
                    set -e
                    git config --global user.email "1911667323@qq.com"
                    git config --global user.name "yongyuwang"
                    git config --global --add safe.directory '*'

                    rm -rf /tmp/guan-pages
                    git clone --branch pages "https://oauth2:${GITEE_TOKEN}@gitee.com/${GITEE_REPO}.git" /tmp/guan-pages

                    cd /tmp/guan-pages
                    # 清空旧产物（保留 .git）
                    find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +
                    cp -r ${WORKSPACE}/dist/* .

                    git add -A
                    if git diff --cached --quiet; then
                        echo "no changes, skip commit"
                    else
                        git commit -m "ci: auto deploy ${GIT_COMMIT:-latest}"
                        git push origin pages
                        echo "✅ 已推送新产物到 pages 分支"
                    fi
                '''
            }
        }
        stage('发布到 Gitee Pages') {
            // 付费 Pages 用户：自动触发重新部署；免费版会失败并提示手动点「更新」
            steps {
                sh '''
                    echo "尝试调用 Gitee Pages 构建 API（免费版会失败，属正常）..."
                    curl -s -X POST "https://gitee.com/api/v5/repos/${GITEE_REPO}/pages/builds" \
                        -H "Authorization: token ${GITEE_TOKEN}" \
                        -H "Content-Type: application/json" \
                        -d '{"branch":"pages","source":"pages"}' \
                        || true
                    echo "-----------------------------------------------"
                    echo "若上面返回 403/非付费提示：请到 Gitee 网页 → 设置 → Pages → 点「更新」手动发布。"
                    echo "若返回 200/created：付费 Pages 已自动重新部署，无需手动操作。"
                    echo "-----------------------------------------------"
                '''
            }
        }
    }
    post {
        success {
            echo '✅ CI 通过：测试 + 构建 + 推送 pages 分支完成'
        }
        failure {
            echo '❌ CI 失败：请查看上方日志（多为 Node 版本 <18 或 GITEE_TOKEN 未配置）'
        }
    }
}
