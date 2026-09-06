#!/bin/bash

# Einstellungen anpassen
NAMESPACE="railsuite"
REALM_NAME="railsuite"
IMPORT_DIR="/tmp/keycloak-import"
LOCAL_SRC="infra/k8s/overlays/dev/keycloak/railsuite-realm.json"

# Pruefen, ob die lokale Export-Datei existiert
if [ ! -f "$LOCAL_SRC" ]; then
  echo "Fehler: Lokale Datei '$LOCAL_SRC' wurde nicht gefunden!"
  exit 1
fi

# 1. Keycloak Pod ermitteln
POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=keycloak -o jsonpath='{.items.metadata.name}' 2>/dev/null)

if [ -z "$POD_NAME" ]; then
  POD_NAME=$(kubectl get pods -n "$NAMESPACE" --no-headers | grep keycloak | awk '{print $1}' | head -n 1)
fi

if [ -z "$POD_NAME" ]; then
  echo "Fehler: Kein laufender Keycloak Pod im Namespace '$NAMESPACE' gefunden!"
  exit 1
fi

echo "Gefundener Ziel-Pod: $POD_NAME"

# 2. Import-Verzeichnis im Pod vorbereiten
kubectl exec -n "$NAMESPACE" "$POD_NAME" -- rm -rf "$IMPORT_DIR"
kubectl exec -n "$NAMESPACE" "$POD_NAME" -- mkdir -p "$IMPORT_DIR"

# 3. Lokale JSON-Datei in den Container kopieren (Git Bash sicherer Stream)
echo "Kopiere lokale JSON-Datei in den Container..."
kubectl exec -i -n "$NAMESPACE" "$POD_NAME" -- bash -c "cat > $IMPORT_DIR/railsuite-realm.json" < "$LOCAL_SRC"

# 4. Import-Befehl im Container ausfuehren
echo "Starte Import-Prozess im Container für Realm '$REALM_NAME'..."
echo "Hinweis: Bestehende Realms mit gleichem Namen werden hierbei aktualisiert/ueberschrieben."

if kubectl exec -n "$NAMESPACE" "$POD_NAME" -- /opt/keycloak/bin/kc.sh import \
  --file "$IMPORT_DIR/railsuite-realm.json"; then
  echo ""
  echo "================================="
  echo "Import erfolgreich abgeschlossen"
  echo "================================="
else
  echo ""
  echo "Fehler: Der Keycloak-Import ist fehlgeschlagen!"
  # Aufraeumen, um keine Dateileichen zu hinterlassen
  kubectl exec -n "$NAMESPACE" "$POD_NAME" -- rm -rf "$IMPORT_DIR"
  exit 1
fi

# 5. Aufräumarbeit im Pod
kubectl exec -n "$NAMESPACE" "$POD_NAME" -- rm -rf "$IMPORT_DIR"
