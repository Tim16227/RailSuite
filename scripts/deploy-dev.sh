#!/bin/bash

set -e

echo "Deploye RailSuite Dev Umgebung..."

kubectl apply -k infra/k8s/overlays/dev

echo "Deployment erfolgreich abgeschlossen."