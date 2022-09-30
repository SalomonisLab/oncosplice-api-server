Example Jenkins file for different stages of CI/CD 

pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}


In our case it could be as simple as this (as a bash script):

#!/bin/bash

rm -rf ./node_modules/.cache && node server.js $*
