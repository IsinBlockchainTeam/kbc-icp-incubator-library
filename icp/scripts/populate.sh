#!/bin/bash

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

echo "Starting category creation process..."
echo "-----------------------------------"
for category in "${PRODUCT_CATEGORIES[@]}"; do
  echo "Creating product category: $category"
  dfx canister call entity_manager createProductCategory "(\"$category\")" &>/dev/null
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created category"
  else
    echo "✗ Error creating category"
  fi
    echo "-----------------------------------"
done
echo "Category creation process completed"
