pipeline {
    agent any 

    stages {
        stage('Setup and Run Playwright') {
            steps {
                bat '''
                    :: 1. Prepare Windows Folders
                    if not exist storage mkdir storage
                    if not exist playwright-report mkdir playwright-report
                    if not exist test-results mkdir test-results
                    
                    :: 2. Grant Windows Folder Permissions
                    icacls "%WORKSPACE%" /grant Everyone:(OI)(CI)F /T /C /Q
                    
                    :: 3. Run Playwright in Docker (Headless Mode)
                    docker run --rm -u root --ipc=host -e CI=true -v "%WORKSPACE%":/app -w /app mcr.microsoft.com/playwright:v1.59.1-jammy /bin/bash -c "npm install --no-save && npx playwright test"
                '''
            }
        }
    }

    post {
        always {
            // เก็บไฟล์ Report ไว้บน Jenkins
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
        }
        success {
            // ส่งแจ้งเตือน Success พร้อมลิงก์ไปที่หน้า Artifacts ของ Build นั้นๆ
            bat 'curl -H "Content-Type: application/json" -d "{\\"content\\": \\"✅ **[SUCCESS]** Playwright tests passed!\\n📊 **Report:** %BUILD_URL%artifact/playwright-report/index.html\\"}" https://discord.com/api/webhooks/1502971451991392307/K2GKkPiEmiPYw0OWOSpd3zbDIeBajZnsIC5stzBc3-LyZnzXA651jx3gARjoXO6YzTJq'
        }
        failure {
            // ส่งแจ้งเตือน Failed พร้อมลิงก์ Report ให้รีบกดมาดู
            bat 'curl -H "Content-Type: application/json" -d "{\\"content\\": \\"❌ **[FAILED]** Playwright tests failed!\\n📊 **Check Report ASAP:** %BUILD_URL%artifact/playwright-report/index.html\\"}" https://discord.com/api/webhooks/1502971451991392307/K2GKkPiEmiPYw0OWOSpd3zbDIeBajZnsIC5stzBc3-LyZnzXA651jx3gARjoXO6YzTJq'
        }
    }
}


























// pipeline {
//     agent any 

//     stages {
//         stage('Setup and Run Playwright') {
//             steps {
//                 bat '''
//                     :: 1. สร้างโฟลเดอร์เตรียมไว้ก่อนบน Windows
//                     if not exist storage mkdir storage
//                     if not exist playwright-report mkdir playwright-report
//                     if not exist test-results mkdir test-results
                    
//                     :: 2. ปลดล็อกสิทธิ์ Windows ให้ทุกคน (รวมถึง Docker)
//                     icacls "%WORKSPACE%" /grant Everyone:(OI)(CI)F /T /C /Q
                    
//                     :: 3. รัน Docker (โหมดล่องหน)
//                     docker run --rm -u root --ipc=host -e CI=true -v "%WORKSPACE%":/app -w /app mcr.microsoft.com/playwright:v1.59.1-jammy /bin/bash -c "npm install --no-save && npx playwright test"
//                 '''
//             }
//         }
//     }

//     post {
//         always {
//             // เก็บ Report ไว้ดูบนเว็บ Jenkins เสมอ
//             archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
//         }
//         success {
//             // ส่งเข้า Discord เมื่อเทสผ่านทุกข้อ (แก้ URL ด้านหลังสุด)
//             bat 'curl -H "Content-Type: application/json" -d "{\\"content\\": \\"✅ **[SUCCESS]** เย้! รันเทส Playwright ผ่านฉลุยทุกข้อ เข้าไปดู Report ได้ที่ Jenkins เลย!\\"}" https://discord.com/api/webhooks/1502971451991392307/K2GKkPiEmiPYw0OWOSpd3zbDIeBajZnsIC5stzBc3-LyZnzXA651jx3gARjoXO6YzTJq'
//         }
//         failure {
//             // ส่งเข้า Discord เมื่อมีเทสพัง (แก้ URL ด้านหลังสุด)
//             bat 'curl -H "Content-Type: application/json" -d "{\\"content\\": \\"❌ **[FAILED]** แย่แล้ว! มีเทสพัง รีบเข้าไปตรวจสอบ Report ด่วน!\\"}" https://discord.com/api/webhooks/1502971451991392307/K2GKkPiEmiPYw0OWOSpd3zbDIeBajZnsIC5stzBc3-LyZnzXA651jx3gARjoXO6YzTJq'
//         }
//     }
// }





// pipeline {
//     agent any 

//     stages {
//         stage('Setup and Run Playwright') {
//             steps {
//                 bat '''
//                     :: 1. สร้างโฟลเดอร์เตรียมไว้ก่อนบน Windows
//                     if not exist storage mkdir storage
//                     if not exist playwright-report mkdir playwright-report
//                     if not exist test-results mkdir test-results
                    
//                     :: 2. ปลดล็อกสิทธิ์ Windows ให้ทุกคน (รวมถึง Docker)
//                     icacls "%WORKSPACE%" /grant Everyone:(OI)(CI)F /T /C /Q
                    
//                     :: 3. รัน Docker (เพิ่ม --ipc=host เพื่อแก้ปัญหาค้าง และใส่ CI=true)
//                     docker run --rm -u root --ipc=host -e CI=true -v "%WORKSPACE%":/app -w /app mcr.microsoft.com/playwright:v1.59.1-jammy /bin/bash -c "npm install --no-save && npx playwright test"
//                 '''
//             }
//         }
//     }

//     post {
//         always {
//             archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
//         }
//     }
// }