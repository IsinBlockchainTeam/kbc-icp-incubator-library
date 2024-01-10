GCLOUD_PULL_USERNAME=$1
GCLOUD_PULL_PASSWORD=$2

ROOT_DIR=$PWD
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

echo "--------- GCP: STOP CONTAINERS ---------"
cd $SCRIPT_DIR
docker compose -f docker-compose-prod.yml --env-file .env down || { echo "Compose Down FAILED"; exit 1; }
echo "--------- GCP: LOGIN ---------"
docker login gitlab-core.supsi.ch:5050 -u $GCLOUD_PULL_USERNAME -p $GCLOUD_PULL_PASSWORD || { echo "Login FAILED"; exit 1; }
echo "--------- GCP: CLEAR IMAGES AND VOLUMES ---------"
docker system prune -f --volumes || { echo "Prune FAILED"; exit 1; }
echo "--------- GCP: SETTING UP GLOBAL NETWORK ---------"
docker network inspect bc-coffee-net >/dev/null 2>&1 || docker network create bc-coffee-net || { echo "Network FAILED"; exit 1; }
echo "--------- GCP: PULL IMAGES ---------"
docker compose -f docker-compose-prod.yml --env-file .env pull || { echo "Compose Pull FAILED"; exit 1; }
echo "--------- GCP: START CONTAINERS ---------"
docker compose -f docker-compose-prod.yml --env-file .env up -d --build || { echo "Compose Up FAILED"; exit 1; }
