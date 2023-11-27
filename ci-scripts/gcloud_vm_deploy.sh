GCLOUD_PULL_USERNAME=$1
GCLOUD_PULL_PASSWORD=$2


echo "--------- GCP: STOP CONTAINERS ---------"
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD:$PWD:shared" -w="$PWD" docker/compose:debian-1.29.2 -f docker-compose-prod.yml down
echo "--------- GCP: LOGIN ---------"
docker login gitlab-core.supsi.ch:5050 -u $GCLOUD_PULL_USERNAME -p $GCLOUD_PULL_PASSWORD
echo "--------- GCP: PULL IMAGES ---------"
docker pull gitlab-core.supsi.ch:5050/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffe-trading-management/blockchain-node
echo "--------- GCP: CLEAR IMAGES AND VOLUMES ---------"
docker system prune -f --volumes
echo "--------- GCP: START CONTAINERS ---------"
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD:$PWD:shared" -w="$PWD" \
     docker/compose:debian-1.29.2 -f docker-compose-prod.yml --env-file .env up -d --build
