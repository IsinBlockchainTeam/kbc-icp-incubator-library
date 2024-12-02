cd "$(dirname "$0")"
cd ../rust-canisters
dfx canister create --all
dfx build --all
dfx generate

cd ../ts-canisters
set -o allexport
source .env.custom
source .env
set +o allexport && dfx deploy
dfx generate
