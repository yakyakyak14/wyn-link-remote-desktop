#!/bin/bash

# WYN Link Android Keystore Generation Script
# This script generates the release keystore for signing the APK

echo "Generating WYN Link Android Release Keystore..."

# Create the keystore directory if it doesn't exist
mkdir -p app

# Generate the keystore
keytool -genkeypair \
    -v \
    -storetype PKCS12 \
    -keystore app/wynlink-release-key.keystore \
    -alias wynlinkaccess \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass help4all \
    -keypass help4all \
    -dname "CN=Hope Ukpai, OU=WYN Tech, O=WYN, L=Abuja, ST=Federal Capital Territory, C=NG"

echo "Keystore generated successfully!"
echo "Location: android/app/wynlink-release-key.keystore"
echo "Alias: wynlinkaccess"
echo "Store Password: help4all"
echo "Key Password: help4all"
echo ""
echo "To build release APK, run:"
echo "cd android && ./gradlew assembleRelease"