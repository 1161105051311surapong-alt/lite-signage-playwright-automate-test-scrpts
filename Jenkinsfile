pipeline {
    // ให้ Jenkins ทำงานบน Windows ของเราไปเลย (ไม่ต้องใช้ agent docker แบบเก่า)
    agent any 

    stages {
        stage('Setup and Run Playwright') {
            steps {
                // ใช้คำสั่ง bat (Windows CMD) เพื่อสั่งรัน Docker ด้วยตัวเอง
                // -v "%WORKSPACE%":/app คือการจำลองโฟลเดอร์โปรเจคจาก Windows เข้าไปใน Linux
                bat 'docker run --rm -v "%WORKSPACE%":/app -w /app mcr.microsoft.com/playwright:v1.40.0-jammy /bin/bash -c "npm install && npx playwright test"'
            }
        }
    }

    post {
        always {
            // ดึงไฟล์ Report กลับมาแสดงผลใน Jenkins
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
        }
    }
}