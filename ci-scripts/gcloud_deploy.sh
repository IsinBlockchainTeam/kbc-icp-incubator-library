#!/bin/bash

PROJECT_FOLDER='blockchain_node'

echo "--------- COFFEE TRADING BLOCKCHAIN DEPLOY (Deployer Container) ---------"
gcloud auth activate-service-account ci-cd-pipeline@coffe-trading.iam.gserviceaccount.com --key-file=gcloud_auth.json --project=coffe-trading
gcloud config set compute/zone "europe-west6-a"
gcloud config set project coffe-trading
#gcloud compute instances start coffe-trading-instance
gcloud compute ssh ci-cd-pipeline@coffe-trading-instance --quiet --command="mkdir -p ~/$PROJECT_FOLDER"
gcloud compute scp .env gcloud_vm_deploy.sh docker-compose-prod.yml ci-cd-pipeline@coffe-trading-instance:~/$PROJECT_FOLDER --quiet
gcloud compute ssh ci-cd-pipeline@coffe-trading-instance --quiet \
  --command="chmod +x ~/$PROJECT_FOLDER/gcloud_vm_deploy.sh && sh ~/$PROJECT_FOLDER/gcloud_vm_deploy.sh $GCLOUD_PULL_USERNAME $GCLOUD_PULL_PASSWORD"
