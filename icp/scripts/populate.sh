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

CANISTER_NAME="entity_manager"

# DEFINITION OF ENTITIES TO POPULATE
PRODUCT_CATEGORIES=(
  "Arabica"
  "Robusta"
  "Liberica"
  "Excelsa"
  "Blend"
)
PROCESS_TYPES=(
  "28 - Trading|default"
  "33 - Collecting|default"
  "37 - Manufacturing|default"
  "137 - Splitting/shaving/sorting|coffee"
  "38 - Harvesting|coffee"
  "137 - Splitting/shaving/sorting|cotton"
  "38 - Harvesting|cotton"
  "113 - Finishing/Branding|cotton"
)
SUSTAINABILITY_CRITERIA=(
  "Use of chemicals"
  "Origin"
  "Social/environmental performance"
)
ASSESSMENT_STANDARDS=(
    "B CORP|Social/environmental performance|https://www.bcorporation.net/en-us/standards|https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Certified_B_Corporation_B_Corp_Logo_2022_Black_RGB.svg/220px-Certified_B_Corporation_B_Corp_Logo_2022_Black_RGB.svg.png|default"
    "EU Ecolabel|Social/environmental performance|https://environment.ec.europa.eu/topics/circular-economy/eu-ecolabel-home_en|https://upload.wikimedia.org/wikipedia/en/thumb/3/34/EU_Ecolabel_logo.svg/220px-EU_Ecolabel_logo.svg.png|default"
    "FSLM Facility Social Labor Module|Social/environmental performance|https://howtohigg.org/higg-fslm-verification-program/|https://qltysys.com/wp-content/uploads/2020/12/HI_Logo_WHT.png|default"
    "ISO9001|Origin|https://www.iso.org/iso-9001-quality-management.html|https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/ISO_9001-2015.svg/595px-ISO_9001-2015.svg.png?20200218083857|default"
    "AEO FULL|Origin|https://www.adm.gov.it/portale/ee/trader/aeo-authorized-economic-operator|https://thyracont-vacuum.com/wp-content/uploads/2018/07/aeo-logo-farbe.jpg|default"
    "EOV|Use of chemicals|https://www.landtomarket.com/eov|https://savory.global/wp-content/uploads/2021/02/Screen-Shot-2021-02-18-at-2.50.38-PM-768x829.png|default"
    "Supplier to Zero|Use of chemicals|https://www.implementation-hub.org/supplier-to-zero|https://uploads-ssl.webflow.com/5c6a740b46b3672a86f5552b/5ed68bd87b5de42ebccd0fb7_flp.png|coffee"
    "RFA - Rain Forest Alliance|Social/environmental performance|https://www.rainforest-alliance.org/|https://www.wwf.ch/sites/default/files/styles/guide_item_image_labels/public/2023-06/logo-rainforest-alliance-people-nature_c.jpg|coffee"
    "Haelixa DNA origin standard|Origin|https://www.haelixa.com/|https://res-5.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco/itcxeonqx6revolmtvhz|cotton"
    "Supplier to Zero|Use of chemicals|https://www.implementation-hub.org/supplier-to-zero|https://uploads-ssl.webflow.com/5c6a740b46b3672a86f5552b/5ed68bd87b5de42ebccd0fb7_flp.png|cotton"
)
ASSESSMENT_ASSURANCE_LEVELS=(
  "Reviewed by peer members"
  "Self assessed"
  "Self declaration / Not verified"
  "Verified by second party"
  "Certified (Third Party)"
)
FIATS=(
  "CHF"
  "USD"
  "EUR"
)
UNITS=(
  "KGM - Kilograms|default"
  "BG - Bags|coffee"
  "H87 - Pieces|coffee"
  "MTK - Square meters|cotton"
  "MT - Meters|cotton"
)

cd "$BASE_DIR/ts-canisters"

# Determine the appropriate dfx command based on environment
if [ "$ENVIRONMENT" == "local" ]; then
    CANISTER_CALL="dfx canister call"
elif [ "$ENVIRONMENT" == "ic" ]; then
    CANISTER_CALL="dfx canister --network ic call"
fi

# START POPULATION PROCESS...
echo "Starting category creation process for $ENVIRONMENT environment..."
echo -e "\n\n------------------------ PRODUCT CATEGORIES ------------------------"
for category in "${PRODUCT_CATEGORIES[@]}"; do
  echo "Creating product category: $category"
  $CANISTER_CALL $CANISTER_NAME createProductCategory "(\"$category\")"
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created category"
  else
    echo "✗ Error creating category"
  fi
    echo "--------------------------------------------------------------------"
done
echo "Categories creation process completed"


echo -e "\n\n---------------------- PROCESS TYPES -------------------------------"
for process_type in "${PROCESS_TYPES[@]}"; do
  name=$(echo "$process_type" | cut -d'|' -f1)
  industrialSector=$(echo "$process_type" | cut -d'|' -f2)
  echo "Creating process type: $name (Sector: $industrialSector)"
  $CANISTER_CALL $CANISTER_NAME addProcessType "(\"$name\", \"$industrialSector\")"
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created process type"
  else
    echo "✗ Error creating process type"
  fi
    echo "--------------------------------------------------------------------"
done
echo "Process types creation process completed"


echo -e "\n\n------------------- SUSTAINABILITY CRITERIA ------------------------"
for sustainability_criteria in "${SUSTAINABILITY_CRITERIA[@]}"; do
  echo "Creating sustainability criteria: $sustainability_criteria"
  $CANISTER_CALL $CANISTER_NAME addSustainabilityCriteria "(\"$sustainability_criteria\", \"default\")"
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created sustainability criteria"
  else
    echo "✗ Error creating sustainability criteria"
  fi
    echo "--------------------------------------------------------------------"
done
echo "Sustainability criteria creation process completed"

echo -e "\n\n---------------- ASSESSMENT REFERENCE STANDARD ---------------------"
for assessment_standard in "${ASSESSMENT_STANDARDS[@]}"; do
  name=$(echo "$assessment_standard" | cut -d'|' -f1)
  sustainabilityCriteria=$(echo "$assessment_standard" | cut -d'|' -f2)
  siteUrl=$(echo "$assessment_standard" | cut -d'|' -f3)
  logoUrl=$(echo "$assessment_standard" | cut -d'|' -f4)
  industrialSector=$(echo "$assessment_standard" | cut -d'|' -f5)
  echo "Creating assessment reference standard: $name (Sector: $industrialSector)"
  $CANISTER_CALL $CANISTER_NAME addAssessmentReferenceStandard "(\"$name\", \"$sustainabilityCriteria\", \"$logoUrl\", \"$siteUrl\", \"$industrialSector\")"
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created assessment reference standard"
  else
    echo "✗ Error creating assessment referece standard"
  fi
    echo "--------------------------------------------------------------------"
done
echo "Assessment reference standard creation process completed"

echo -e "\n\n------------------ ASSESSMENT ASSURANCE LEVEL ----------------------"
for assessment_assurance_level in "${ASSESSMENT_ASSURANCE_LEVELS[@]}"; do
  echo "Creating assessment assurance level: $assessment_assurance_level"
  $CANISTER_CALL $CANISTER_NAME addAssessmentAssuranceLevel "(\"$assessment_assurance_level\", \"default\")"
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created assessment assurance level"
  else
    echo "✗ Error creating assessment assurance level"
  fi
    echo "--------------------------------------------------------------------"
done
echo "Assessment assurance level creation process completed"

echo -e "\n\n----------------------------- FIAT ---------------------------------"
for fiat in "${FIATS[@]}"; do
  echo "Creating assessment assurance level: $fiat"
  $CANISTER_CALL $CANISTER_NAME addFiat "(\"$fiat\", \"default\")"
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created fiat"
  else
    echo "✗ Error creating fiat"
  fi
    echo "--------------------------------------------------------------------"
done
echo "Fiat creation process completed"

echo -e "\n\n----------------------------- UNIT ---------------------------------"
for unit in "${UNITS[@]}"; do
  name=$(echo "$unit" | cut -d'|' -f1)
  industrialSector=$(echo "$unit" | cut -d'|' -f2)
  echo "Creating unit: $name (Sector: $industrialSector)"
  $CANISTER_CALL $CANISTER_NAME addUnit "(\"$name\", \"$industrialSector\")"
  if [ $? -eq 0 ]; then
    echo "✓ Successfully created unit"
  else
    echo "✗ Error creating unit"
  fi
    echo "--------------------------------------------------------------------"
done
echo "Unit creation process completed"
