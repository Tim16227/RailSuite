#!/bin/bash

# Einstellungen anpassen
NAMESPACE="railsuite"
REALM_NAME="railsuite"
EXPORT_DIR="/tmp/keycloak-export"
LOCAL_DEST="infra/k8s/overlays/dev/keycloak"

# 1. Keycloak Pod ermitteln
POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=keycloak -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$POD_NAME" ]; then
  POD_NAME=$(kubectl get pods -n "$NAMESPACE" --no-headers | grep keycloak | awk '{print $1}' | head -n 1)
fi

if [ -z "$POD_NAME" ]; then
  echo "Fehler: Kein Keycloak Pod im Namespace '$NAMESPACE' gefunden!"
  exit 1
fi

echo "Gefundener Pod: $POD_NAME"

# 2. Export-Verzeichnis im Pod bereinigen und vorbereiten
kubectl exec -n "$NAMESPACE" "$POD_NAME" -- rm -rf "$EXPORT_DIR"
kubectl exec -n "$NAMESPACE" "$POD_NAME" -- mkdir -p "$EXPORT_DIR"

# 3. Export ausführen
echo "Starte Export für Realm '$REALM_NAME'..."
if ! kubectl exec -n "$NAMESPACE" "$POD_NAME" -- /opt/keycloak/bin/kc.sh export \
  --realm "$REALM_NAME" \
  --dir "$EXPORT_DIR" \
  --users realm_file; then
  echo "Fehler: Keycloak-Export fehlgeschlagen!"
  exit 1
fi

# 4. Datei lokal sichern (Windows/Git Bash sicherer Workaround)
mkdir -p "$LOCAL_DEST"
EXPORTED_FILE=$(kubectl exec -n "$NAMESPACE" "$POD_NAME" -- ls "$EXPORT_DIR" | grep "$REALM_NAME" || true)

if [ -z "$EXPORTED_FILE" ]; then
  echo "Fehler: Keine Export-Datei im Container gefunden."
  exit 1
fi

echo "Lese Datei $EXPORTED_FILE aus dem Container..."
# Nutzt cat im Container und leitet den Stream lokal in die Datei um (umgeht kubectl cp Fehler)
kubectl exec -n "$NAMESPACE" "$POD_NAME" -- cat "$EXPORT_DIR/$EXPORTED_FILE" > "$LOCAL_DEST/railsuite-realm.json"

# Interne Aufräumarbeit im Pod
kubectl exec -n "$NAMESPACE" "$POD_NAME" -- rm -rf "$EXPORT_DIR"

echo ""
echo "================================="
echo "Export erfolgreich abgeschlossen"
echo "================================="
echo "Datei erfolgreich lokal gespeichert unter: $LOCAL_DEST/railsuite-realm.json"
