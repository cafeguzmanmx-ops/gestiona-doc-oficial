#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000/api}"

echo "Enviando solicitud de demo de prueba a: $API_URL/contacto/solicitar-demo"

curl -fsS -X POST "$API_URL/contacto/solicitar-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "municipioName":"Municipio Prospecto de Prueba",
    "state":"Veracruz",
    "contactName":"Contacto Comercial Demo",
    "position":"Secretaría del Ayuntamiento",
    "email":"prospecto.demo@gestionadoc.mx",
    "phone":"5500000000",
    "estimatedUsers":15,
    "message":"Queremos conocer el flujo de recepción, turnado y seguimiento de oficios.",
    "source":"script-smoke-test"
  }'

echo
echo "OK: solicitud de demo enviada."
