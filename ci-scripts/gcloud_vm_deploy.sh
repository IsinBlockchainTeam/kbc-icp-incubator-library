GCLOUD_PULL_USERNAME=$1
GCLOUD_PULL_PASSWORD=$2

ROOT_DIR=$PWD
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

echo "--------- GCP: STOP CONTAINERS ---------"
cd $SCRIPT_DIR
docker compose -f docker-compose-prod.yml --env-file .env down
echo "--------- GCP: LOGIN ---------"
docker login gitlab-core.supsi.ch:5050 -u $GCLOUD_PULL_USERNAME -p $GCLOUD_PULL_PASSWORD
echo "--------- GCP: CLEAR IMAGES AND VOLUMES ---------"
docker system prune -f --volumes
echo "--------- GCP: SETTING UP GLOBAL NETWORK ---------"
docker network inspect bc-coffee-net >/dev/null 2>&1 || docker network create bc-coffee-net
echo "--------- GCP: PULL IMAGES ---------"
docker compose -f docker-compose-prod.yml --env-file .env pull
echo "--------- GCP: START CONTAINERS ---------"
docker compose -f docker-compose-prod.yml --env-file .env up -d --build
