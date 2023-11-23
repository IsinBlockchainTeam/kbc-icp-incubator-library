#!/bin/bash


echo "--------- COFFEE TRADING BLOCKCHAIN DEPLOY (Deployer Container) ---------"
gcloud auth activate-service-account ci-cd-pipeline@coffe-trading.iam.gserviceaccount.com --key-file=gcloud_auth.json --project=coffe-trading
gcloud config set compute/zone "europe-west6-a"
gcloud config set project coffe-trading
#gcloud compute instances start coffe-trading-instance
gcloud compute scp .env.compose gcloud_vm_deploy.sh docker-compose-prod.yml ci-cd-pipeline@coffe-trading-instance:~ --quiet
gcloud compute ssh ci-cd-pipeline@coffe-trading-instance --quiet \
  --command="chmod +x gcloud_vm_deploy.sh && sh gcloud_vm_deploy.sh $GCLOUD_PULL_USERNAME $GCLOUD_PULL_PASSWORD"
