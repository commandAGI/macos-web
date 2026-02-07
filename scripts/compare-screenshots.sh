#!/usr/bin/env bash
#
# compare-screenshots.sh - Compare reference and simulated app screenshots side by side
#
# Opens both the real macOS reference screenshot and the web-simulated screenshot
# for a given app, allowing visual comparison using macOS Preview.
#
# Usage:
#   ./scripts/compare-screenshots.sh <app-name>
#   ./scripts/compare-screenshots.sh finder
#   ./scripts/compare-screenshots.sh safari
#   ./scripts/compare-screenshots.sh --list          # List available comparisons
#   ./scripts/compare-screenshots.sh --all           # Open all available pairs
#
# Both images open in Preview side by side for manual visual comparison.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REFERENCE_DIR="$PROJECT_DIR/screenshots/reference"
SIMULATED_DIR="$PROJECT_DIR/screenshots"

# All supported app keys (must match capture-reference.sh and screenshot-apps.ts naming)
ALL_APPS=(
  finder safari terminal notes messages mail
  photos music maps system-settings facetime
  reminders news podcasts tv contacts keynote
  calculator calendar
)

# Map from our key to the simulated screenshot filename pattern.
# The simulated screenshots use a numbered prefix like "01-finder-default.png".
# We search for the pattern "*-{key}-default.png" in the simulated dir.
find_simulated() {
  local key="$1"
  # Handle the system-settings vs system-preferences naming difference
  local search_key="$key"
  if [[ "$key" == "system-settings" ]]; then
    search_key="system-preferences"
  fi

  # Find the simulated screenshot matching *-{key}-default.png
  local match
  match="$(find "$SIMULATED_DIR" -maxdepth 1 -name "*-${search_key}-default.png" -type f 2>/dev/null | head -1)"
  echo "$match"
}

find_reference() {
  local key="$1"
  local path="$REFERENCE_DIR/${key}-default.png"
  if [[ -f "$path" ]]; then
    echo "$path"
  else
    echo ""
  fi
}

usage() {
  cat <<USAGE
Usage: $(basename "$0") [OPTIONS] <app-name>

Compare reference (real macOS) and simulated (web) screenshots side by side.

Options:
  --list    List all apps with available screenshot pairs
  --all     Open all available comparison pairs
  --help    Show this help message

Available apps:
  ${ALL_APPS[*]}

Examples:
  $(basename "$0") finder           # Compare Finder screenshots
  $(basename "$0") safari           # Compare Safari screenshots
  $(basename "$0") --list           # See which comparisons are available
  $(basename "$0") --all            # Open all available pairs
USAGE
}

list_available() {
  echo "Available screenshot comparisons:"
  echo ""
  printf "  %-20s %-12s %-12s\n" "APP" "REFERENCE" "SIMULATED"
  printf "  %-20s %-12s %-12s\n" "---" "---------" "---------"

  for key in "${ALL_APPS[@]}"; do
    local ref sim ref_status sim_status
    ref="$(find_reference "$key")"
    sim="$(find_simulated "$key")"

    if [[ -n "$ref" ]]; then
      ref_status="YES"
    else
      ref_status="missing"
    fi

    if [[ -n "$sim" ]]; then
      sim_status="YES"
    else
      sim_status="missing"
    fi

    printf "  %-20s %-12s %-12s\n" "$key" "$ref_status" "$sim_status"
  done

  echo ""
  echo "Run './scripts/capture-reference.sh' to generate reference screenshots."
  echo "Run 'npx tsx scripts/screenshot-apps.ts' to generate simulated screenshots."
}

compare_app() {
  local key="$1"
  local ref sim

  ref="$(find_reference "$key")"
  sim="$(find_simulated "$key")"

  if [[ -z "$ref" && -z "$sim" ]]; then
    echo "No screenshots found for '$key'."
    echo "  Reference: $REFERENCE_DIR/${key}-default.png (missing)"
    echo "  Simulated: no matching file in $SIMULATED_DIR/ (missing)"
    return 1
  fi

  local files_to_open=()

  if [[ -n "$ref" ]]; then
    echo "  Reference: $ref"
    files_to_open+=("$ref")
  else
    echo "  Reference: MISSING ($REFERENCE_DIR/${key}-default.png)"
    echo "    Run './scripts/capture-reference.sh $key' to capture it."
  fi

  if [[ -n "$sim" ]]; then
    echo "  Simulated: $sim"
    files_to_open+=("$sim")
  else
    echo "  Simulated: MISSING"
    echo "    Run 'npx tsx scripts/screenshot-apps.ts $key' to capture it."
  fi

  if [[ ${#files_to_open[@]} -gt 0 ]]; then
    echo "  Opening in Preview..."
    open -a "Preview" "${files_to_open[@]}"
  fi

  return 0
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    --list)
      list_available
      exit 0
      ;;
    --all)
      echo "Opening all available comparison pairs..."
      echo ""
      local opened=0
      for key in "${ALL_APPS[@]}"; do
        local ref sim
        ref="$(find_reference "$key")"
        sim="$(find_simulated "$key")"
        if [[ -n "$ref" || -n "$sim" ]]; then
          echo "[$key]"
          compare_app "$key"
          opened=$((opened + 1))
          echo ""
        fi
      done
      if [[ $opened -eq 0 ]]; then
        echo "No screenshots found. Run capture scripts first."
        exit 1
      fi
      echo "Opened $opened comparison(s)."
      exit 0
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      # Validate app name
      local found=false
      for valid_key in "${ALL_APPS[@]}"; do
        if [[ "$1" == "$valid_key" ]]; then
          found=true
          break
        fi
      done

      if ! $found; then
        echo "Unknown app: '$1'"
        echo "Available apps: ${ALL_APPS[*]}"
        exit 1
      fi

      echo "Comparing: $1"
      compare_app "$1"
      ;;
  esac
}

main "$@"
