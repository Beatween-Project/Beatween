pipeline {
  agent any
  environment {
    DEPLOY_DIR = '/home/ubuntu/deployment'
    VITE_KAKAO_CLIENT_ID    = credentials('kakao-client-id')
    VITE_KAKAO_REDIRECT_URI = credentials('kakao-redirect-uri')
    VITE_APP_BASE_URL       = credentials('app-base-url')
    VITE_API_BASE_URL       = credentials('api-base-url')
    VITE_BROKER_URL         = credentials('broker-url')
  }
  stages {
    stage('Checkout') {
        steps { 
            checkout scm
        }
    }

    stage('Build Static') {
        steps {
            dir('frontend') {

                // 프론트엔드 프로젝트 루트에 .env 파일 생성
                writeFile file: '.env', text: """\
                    VITE_KAKAO_CLIENT_ID=${env.VITE_KAKAO_CLIENT_ID}
                    VITE_KAKAO_REDIRECT_URI=${env.VITE_KAKAO_REDIRECT_URI}
                    VITE_APP_BASE_URL=${env.VITE_APP_BASE_URL}
                    VITE_API_BASE_URL=${env.VITE_API_BASE_URL}
                    VITE_BROKER_URL=${env.VITE_BROKER_URL}
                """

                script {
                    // node:20 이미지를 받아 임시 컨테이너 안에서 실행
                    docker.image('node:20').inside('-u 0:0') {
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                }
            }
        }
    }

    stage('Sync to EC2') {
        steps {
            sh '''
                # 1) 기존 정적 파일 완전 삭제
                rm -rf $DEPLOY_DIR/frontend/dist
                rm -rf $DEPLOY_DIR/frontend/server.conf

                # 2) 디렉터리 재생성
                mkdir -p $DEPLOY_DIR/frontend

                # 3) 최신 파일 복사
                cp -R frontend/dist $DEPLOY_DIR/frontend/dist
                cp    frontend/server.conf $DEPLOY_DIR/frontend/server.conf

                chmod -R a+rX $DEPLOY_DIR/frontend/dist
            '''
        }
    }

    stage('Deploy Frontend') {
        steps {
            sh '''
                cd /home/ubuntu/deployment
                docker compose up -d --force-recreate react-nginx
            '''
        }
    }
  }
}
