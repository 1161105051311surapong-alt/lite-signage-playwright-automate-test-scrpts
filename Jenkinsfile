pipeline {
    agent any 

    stages {
        stage('Setup and Run Playwright') {
            steps {
                // -u root บังคับสิทธิ์สูงสุด
                // สร้างโฟลเดอร์ storage, report ล่วงหน้าและให้สิทธิ์ 777 ป้องกันการพังตอนจบ
                bat 'docker run --rm -u root -v "%WORKSPACE%":/app -w /app mcr.microsoft.com/playwright:v1.59.1-jammy /bin/bash -c "mkdir -p storage playwright-report test-results && chmod 777 storage playwright-report test-results && npm install --no-save && npx playwright test"'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
        }
    }
}