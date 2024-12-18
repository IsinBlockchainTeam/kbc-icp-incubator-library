#!/bin/bash

# Function to display usage instructions
usage() {
    echo "Usage: $0 [local|ic]"
    echo "  local: Run against a local canister deployment"
    echo "  ic: Run against a canister deployed on the Internet Computer"
    exit 1
}

# Check if an argument is provided
if [ $# -ne 1 ]; then
    usage
fi

# Validate the environment argument
ENVIRONMENT="$1"
if [[ "$ENVIRONMENT" != "local" && "$ENVIRONMENT" != "ic" ]]; then
    usage
fi

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

PRODUCT_CATEGORIES=(
  "Arabica"
  "Robusta"
  "Liberica"
  "Excelsa"
  "Blend"
)

cd "$BASE_DIR/ts-canisters"

# Determine the appropriate dfx command based on environment
if [ "$ENVIRONMENT" == "local" ]; then
    CANISTER_CALL="dfx canister call"
elif [ "$ENVIRONMENT" == "ic" ]; then
    CANISTER_CALL="dfx canister --network ic call"
fi

echo "Starting category creation process for $ENVIRONMENT environment..."
echo "-----------------------------------"
for category in "${PRODUCT_CATEGORIES[@]}"; do
  echo "Creating product category: $category"
  $CANISTER_CALL entity_manager createProductCategory "(\"$category\")"
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created category"
  else
    echo "✗ Error creating category"
  fi
    echo "-----------------------------------"
done
echo "Category creation process completed"
