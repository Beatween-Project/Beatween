pipeline {
  agent any

  environment {
    BRANCH       = "${env.BRANCH_NAME}"
    COMPOSE_FILE = '/home/ubuntu/deployment/docker-compose.yml'
  }

  stages {
    stage('Clean Workspace') {
        steps {
          cleanWs()
        }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build JAR') {
      steps {
        sh 'chmod +x gradlew'
        sh './gradlew clean bootJar'
      }
    }

    stage('Copy JAR to deploy dir') {
      steps {
        sh 'cp build/libs/*.jar ${WORKSPACE}/app.jar'
      }
    }

    stage('Prepare .env') {
      steps {
        sh 'cp /home/ubuntu/deployment/.env ${WORKSPACE}/.env'
      }
    }

// docker-compose.yml의 fastapi 서비스에 .env 파일이 있으므로
// docker compose가 그 .env 파일을 못 찾는 오류를 해결하기 위해 fastapi/.env 파일을 jenkins 내부로 복사
    stage('Prepare FastAPI .env') {
        steps {
          sh '''
            mkdir -p ${WORKSPACE}/fastapi
            cp /home/ubuntu/deployment/fastapi/.env ${WORKSPACE}/fastapi/.env
          '''
        }
      }

    stage('Build Docker Image') {
      steps {
        sh """
          docker-compose \
            -f ${COMPOSE_FILE} \
            --project-directory ${WORKSPACE} \
            build spring-boot
        """
      }
    }

    stage('Clean Previous') {
      steps {
        sh """
          docker rm -f spring-boot || true
          docker network prune -f || true
        """
      }
    }

    stage('Deploy Backend') {
      steps {
        sh '''
          cd /home/ubuntu/deployment
          docker compose up -d --force-recreate --remove-orphans spring-boot
         '''
      }
    }
  }

  post {
    success {
      echo "✔️ [${BRANCH}] 배포 성공"
    }
    failure {
      echo "❌ [${BRANCH}] 배포 실패"
    }
  }
}
