pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/harenit/jenkins.git'
            }
        }

        stage('Compile') {
            steps {
                bat 'javac Addition.java'
            }
        }

        stage('Execute') {
            steps {
                bat 'java Addition'
            }
        }
    }

    post {
        success {
            echo 'Program executed successfully'
        }
        failure {
            echo 'Program execution failed'
        }
        always {
            echo 'Pipeline completed'
        }
    }
}