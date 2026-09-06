#!/bin/bash

set -e

echo "port-forward keycloak..."

kubectl port-forward service/keycloak 8081:8080 -n railsuite
