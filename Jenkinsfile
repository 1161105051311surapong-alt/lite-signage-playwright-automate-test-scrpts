pipeline {
    agent any 

    stages {
        stage('Setup and Run Playwright') {
            steps {
                // อัปเดตเวอร์ชัน Playwright เป็น v1.59.1-jammy ให้ตรงกับโค้ด
                bat 'docker run --rm -v "%WORKSPACE%":/app -w /app mcr.microsoft.com/playwright:v1.59.1-jammy /bin/bash -c "npm install --no-save && npx playwright test"'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
        }
    }
}