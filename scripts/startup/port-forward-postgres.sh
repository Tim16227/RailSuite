#!/bin/bash

set -e

echo "port-forward postgres..."

kubectl port-forward service/postgres 5432:5432 -n railsuite
