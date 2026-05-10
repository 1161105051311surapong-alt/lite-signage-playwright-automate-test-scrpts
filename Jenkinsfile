pipeline {
    agent any 

    stages {
        stage('Setup and Run Playwright') {
            steps {
                // ใช้คำสั่ง bat แบบหลายบรรทัด
                bat '''
                    :: 1. สร้างโฟลเดอร์เตรียมไว้ก่อนบน Windows
                    if not exist storage mkdir storage
                    if not exist playwright-report mkdir playwright-report
                    if not exist test-results mkdir test-results
                    
                    :: 2. ปลดล็อกสิทธิ์ Windows ให้ทุกคน (รวมถึง Docker) เขียนไฟล์ลงในโฟลเดอร์นี้ได้ 100%
                    icacls "%WORKSPACE%" /grant Everyone:(OI)(CI)F /T /C /Q
                    
                    :: 3. รัน Docker ตามปกติ
                    docker run --rm -u root -v "%WORKSPACE%":/app -w /app mcr.microsoft.com/playwright:v1.59.1-jammy /bin/bash -c "npm install --no-save && npx playwright test"
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
        }
    }
}