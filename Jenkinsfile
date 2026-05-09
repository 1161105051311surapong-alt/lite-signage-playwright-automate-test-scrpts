pipeline {
    agent {
        docker {
            // ใช้ Official Image ของ Playwright ที่มี Node.js และ Browser มาให้ครบจบในตัว
            image 'mcr.microsoft.com/playwright:v1.40.0-jammy'
            args '-u root:root' // ป้องกันปัญหาเรื่อง Permission สิทธิ์การใช้งานไฟล์
        }
    }
    
    stages {
        stage('Checkout Source Code') {
            steps {
                // ดึงโค้ดล่าสุดจาก GitHub
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                // ติดตั้งแพ็คเกจต่างๆ ตามที่ระบุใน package.json
                sh 'npm install'
            }
        }
        
        stage('Run Playwright Tests') {
            steps {
                // รันคำสั่งเทสของ Playwright
                sh 'npx playwright test'
            }
        }
    }
    
    post {
        always {
            // เมื่อเทสจบ (ไม่ว่าจะผ่านหรือพัง) ให้นำ Report ที่ Playwright สร้างไว้มาเก็บใน Jenkins
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
        }
    }
}