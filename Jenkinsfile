pipeline {
    agent any 

    stages {
        stage('Setup and Run Playwright') {
            steps {
                // เติม --no-save เพื่อป้องกัน Docker (Linux) พยายามแก้ไขไฟล์ของ Windows
                bat 'docker run --rm -v "%WORKSPACE%":/app -w /app mcr.microsoft.com/playwright:v1.40.0-jammy /bin/bash -c "npm install --no-save && npx playwright test"'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
        }
    }
}