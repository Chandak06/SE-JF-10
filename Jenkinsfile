// CSMQ-6 - Harshit Chandak / PES2UG24CS185
// Requires a Node.js 24 agent and Pipeline, Git, GitHub and JUnit plugins.
def npmCommand(String command) {
    if (isUnix()) {
        sh "npm ${command}"
    } else {
        bat "call npm.cmd ${command}"
    }
}

pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }
    triggers {
        githubPush()
        // Supported fallback for a private/local Jenkins without an inbound webhook.
        pollSCM('H/5 * * * *')
    }
    environment {
        CI = 'true'
        MONGOMS_DOWNLOAD_DIR = "${WORKSPACE}/.cache/mongodb-binaries"
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Install dependencies') {
            steps { script { npmCommand('ci') } }
        }
        stage('Type check') {
            steps { script { npmCommand('run typecheck') } }
        }
        stage('Build backend') {
            steps { script { npmCommand('run build') } }
        }
        stage('Backend unit and MongoDB integration tests') {
            steps { script { npmCommand('run test:ci') } }
        }
        stage('Frontend when integrated') {
            when { expression { fileExists('frontend/package.json') } }
            steps {
                dir('frontend') {
                    script {
                        npmCommand('ci')
                        npmCommand('run test:ci')
                        npmCommand('run build')
                    }
                }
            }
        }
    }
    post {
        always {
            junit testResults: 'reports/junit.xml', allowEmptyResults: true
            archiveArtifacts artifacts: 'coverage/**,reports/**', allowEmptyArchive: true
        }
        success {
            archiveArtifacts artifacts: 'dist/**', fingerprint: true
        }
    }
}
