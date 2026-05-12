#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"
IMAGE_NAME="$(docker_e2e_resolve_image "NexisClaw-onboard-e2e" NEXISCLAW_ONBOARD_E2E_IMAGE)"
NEXISCLAW_TEST_STATE_FUNCTION_B64="$(docker_e2e_test_state_function_b64)"

docker_e2e_build_or_reuse "$IMAGE_NAME" onboard

echo "Running onboarding E2E..."
docker_e2e_run_with_harness -t \
  -e "NEXISCLAW_TEST_STATE_FUNCTION_B64=$NEXISCLAW_TEST_STATE_FUNCTION_B64" \
  "$IMAGE_NAME" bash scripts/e2e/lib/onboard/scenario.sh

echo "E2E complete."
