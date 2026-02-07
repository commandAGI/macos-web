#!/usr/bin/env bash
#
# capture-reference.sh - Capture real macOS app window screenshots as reference images
#
# Captures window-specific screenshots of real macOS apps using screencapture -l
# with CGWindowIDs obtained via the Quartz Python API. These reference images are
# used for visual comparison against the web-simulated macOS apps.
#
# Requirements:
#   - macOS Sonoma (14.x) or later
#   - Python 3 with PyObjC (pre-installed on macOS)
#   - Screen Recording permission granted to Terminal (System Settings > Privacy)
#
# Usage:
#   ./scripts/capture-reference.sh                    # Capture all apps
#   ./scripts/capture-reference.sh finder safari      # Capture specific apps
#   ./scripts/capture-reference.sh --list             # List available app names
#
# Output: screenshots/reference/{appname}-default.png
#

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$PROJECT_DIR/screenshots/reference"

# How long to wait after opening an app (seconds)
OPEN_WAIT=3
# How long to wait after bringing app to front / navigating (seconds)
ACTIVATE_WAIT=1

# ---------------------------------------------------------------------------
# App definitions
#
# Each entry: "key|display_name|bundle_hint"
#   key          - lowercase identifier, used for filename and CLI arg
#   display_name - the exact app name as macOS knows it (for `open -a` and process name)
#   bundle_hint  - optional secondary process name to search for in window list
# ---------------------------------------------------------------------------

declare -a APP_DEFS=(
  "finder|Finder|Finder"
  "safari|Safari|Safari"
  "terminal|Terminal|Terminal"
  "notes|Notes|Notes"
  "messages|Messages|Messages"
  "mail|Mail|Mail"
  "photos|Photos|Photos"
  "music|Music|Music"
  "maps|Maps|Maps"
  "system-settings|System Settings|System Settings"
  "facetime|FaceTime|FaceTime"
  "reminders|Reminders|Reminders"
  "news|News|News"
  "podcasts|Podcasts|Podcasts"
  "tv|TV|TV"
  "contacts|Contacts|Contacts"
  "keynote|Keynote|Keynote"
  "calculator|Calculator|Calculator"
  "calendar|Calendar|Calendar"
)

# Extract just the keys for validation
declare -a ALL_KEYS=()
for def in "${APP_DEFS[@]}"; do
  IFS='|' read -r key _ _ <<< "$def"
  ALL_KEYS+=("$key")
done

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log() {
  echo "[capture] $*"
}

warn() {
  echo "[capture] WARNING: $*" >&2
}

error() {
  echo "[capture] ERROR: $*" >&2
}

# Print usage info
usage() {
  cat <<USAGE
Usage: $(basename "$0") [OPTIONS] [app1] [app2] ...

Capture real macOS app window screenshots as reference images.

Options:
  --list    List all available app names
  --help    Show this help message

Available apps:
  ${ALL_KEYS[*]}

Examples:
  $(basename "$0")                          # Capture all apps
  $(basename "$0") finder safari terminal   # Capture specific apps
USAGE
}

# Get CGWindowID for a given process name.
# Returns the window ID of the first on-screen, normal window for that process.
# Falls back to any on-screen window if no "normal" window is found.
get_window_id() {
  local process_name="$1"
  python3 -c "
import Quartz

def get_wid(owner_name):
    # Get all on-screen windows
    windows = Quartz.CGWindowListCopyWindowInfo(
        Quartz.kCGWindowListOptionOnScreenOnly | Quartz.kCGWindowListExcludeDesktopElements,
        Quartz.kCGNullWindowID
    )
    if windows is None:
        return None

    # First pass: look for a standard window (layer 0, has a name, reasonable size)
    best = None
    for w in windows:
        if w.get('kCGWindowOwnerName', '') == owner_name:
            layer = w.get('kCGWindowLayer', -1)
            bounds = w.get('kCGWindowBounds', {})
            width = bounds.get('Width', 0)
            height = bounds.get('Height', 0)
            # Skip tiny windows (status bar items, etc.) and non-standard layers
            if layer == 0 and width > 100 and height > 100:
                wid = w.get('kCGWindowNumber')
                if wid:
                    return wid
            # Track any window as fallback
            if best is None and w.get('kCGWindowNumber'):
                wid = w.get('kCGWindowNumber')
                bounds = w.get('kCGWindowBounds', {})
                if bounds.get('Width', 0) > 50 and bounds.get('Height', 0) > 50:
                    best = wid

    return best

wid = get_wid('$process_name')
if wid:
    print(wid)
else:
    print('')
" 2>/dev/null
}

# Capture a window screenshot given its CGWindowID
capture_window() {
  local wid="$1"
  local output_path="$2"

  if [[ -z "$wid" ]]; then
    warn "No window ID provided, skipping capture"
    return 1
  fi

  # screencapture -l takes CGWindowID (no space between -l and ID)
  # -o removes the window shadow
  screencapture -l"$wid" -o "$output_path" 2>/dev/null
  return $?
}

# Bring an app to front
activate_app() {
  local app_name="$1"
  osascript -e "tell application \"$app_name\" to activate" 2>/dev/null || true
  sleep "$ACTIVATE_WAIT"
}

# Close front window of an app (without quitting)
close_front_window() {
  local app_name="$1"
  osascript -e "
    tell application \"$app_name\"
      try
        close front window
      end try
    end tell
  " 2>/dev/null || true
}

# ---------------------------------------------------------------------------
# Per-app setup scripts (run before capturing)
# ---------------------------------------------------------------------------

setup_finder() {
  # Open a new Finder window pointed at Home, set to list view
  osascript <<'APPLESCRIPT'
    tell application "Finder"
      activate
      -- Close existing windows to get a clean state
      close every window
      delay 0.5
      -- Open home folder
      set homeFolder to path to home folder
      make new Finder window to homeFolder
      delay 0.5
      -- Set to list view
      tell front Finder window
        set current view to list view
        -- Resize for a nice reference screenshot
        set bounds to {100, 100, 900, 650}
      end tell
      delay 0.5
    end tell
APPLESCRIPT
  sleep 1
}

setup_safari() {
  # Open Safari with a new window showing the Start Page
  osascript <<'APPLESCRIPT'
    tell application "Safari"
      activate
      delay 1
      -- Make a new window (Start Page)
      if (count of windows) = 0 then
        make new document
      end if
      delay 0.5
    end tell
APPLESCRIPT
  sleep 1
}

setup_terminal() {
  # Open a fresh Terminal window
  osascript <<'APPLESCRIPT'
    tell application "Terminal"
      activate
      delay 0.5
      -- Open a new window with default profile
      do script ""
      delay 1
    end tell
APPLESCRIPT
  sleep 1
}

setup_notes() {
  open -a "Notes"
  sleep "$OPEN_WAIT"
  activate_app "Notes"
}

setup_messages() {
  open -a "Messages"
  sleep "$OPEN_WAIT"
  activate_app "Messages"
}

setup_mail() {
  open -a "Mail"
  sleep "$OPEN_WAIT"
  activate_app "Mail"
}

setup_photos() {
  open -a "Photos"
  sleep "$OPEN_WAIT"
  activate_app "Photos"
}

setup_music() {
  # Open Music and navigate to Listen Now
  osascript <<'APPLESCRIPT'
    tell application "Music"
      activate
      delay 2
    end tell
    -- Music doesn't have great AppleScript for navigation,
    -- so we just let it open to its default view (usually Listen Now)
APPLESCRIPT
  sleep 1
}

setup_maps() {
  open -a "Maps"
  sleep "$OPEN_WAIT"
  activate_app "Maps"
}

setup_system_settings() {
  # Open System Settings directly to the Appearance pane
  open "x-apple.systempreferences:com.apple.Appearance-Settings.extension"
  sleep "$OPEN_WAIT"
  # Ensure it's frontmost
  osascript -e 'tell application "System Settings" to activate' 2>/dev/null || true
  sleep 2
}

setup_facetime() {
  open -a "FaceTime"
  sleep "$OPEN_WAIT"
  activate_app "FaceTime"
}

setup_reminders() {
  open -a "Reminders"
  sleep "$OPEN_WAIT"
  activate_app "Reminders"
}

setup_news() {
  open -a "News"
  sleep "$OPEN_WAIT"
  activate_app "News"
}

setup_podcasts() {
  open -a "Podcasts"
  sleep "$OPEN_WAIT"
  activate_app "Podcasts"
}

setup_tv() {
  open -a "TV"
  sleep "$OPEN_WAIT"
  activate_app "TV"
}

setup_contacts() {
  open -a "Contacts"
  sleep "$OPEN_WAIT"
  activate_app "Contacts"
}

setup_keynote() {
  # Open Keynote - it may show a template chooser or a blank presentation
  open -a "Keynote"
  sleep "$OPEN_WAIT"
  activate_app "Keynote"
  # Try to create a new blank presentation if the chooser is shown
  osascript <<'APPLESCRIPT' 2>/dev/null || true
    tell application "Keynote"
      activate
      delay 1
    end tell
    -- If there's a template chooser, press Escape and try making a blank doc
    tell application "System Events"
      tell process "Keynote"
        try
          -- Look for "New Document" button or just let whatever is showing be captured
          delay 0.5
        end try
      end tell
    end tell
APPLESCRIPT
  sleep 1
}

setup_calculator() {
  open -a "Calculator"
  sleep "$OPEN_WAIT"
  activate_app "Calculator"
}

setup_calendar() {
  open -a "Calendar"
  sleep "$OPEN_WAIT"
  activate_app "Calendar"
}

# Dispatch to the correct setup function for an app key
run_setup() {
  local key="$1"
  case "$key" in
    finder)           setup_finder ;;
    safari)           setup_safari ;;
    terminal)         setup_terminal ;;
    notes)            setup_notes ;;
    messages)         setup_messages ;;
    mail)             setup_mail ;;
    photos)           setup_photos ;;
    music)            setup_music ;;
    maps)             setup_maps ;;
    system-settings)  setup_system_settings ;;
    facetime)         setup_facetime ;;
    reminders)        setup_reminders ;;
    news)             setup_news ;;
    podcasts)         setup_podcasts ;;
    tv)               setup_tv ;;
    contacts)         setup_contacts ;;
    keynote)          setup_keynote ;;
    calculator)       setup_calculator ;;
    calendar)         setup_calendar ;;
    *)
      warn "No setup function for '$key', using generic open"
      ;;
  esac
}

# Get the display name for an app key
get_display_name() {
  local target_key="$1"
  for def in "${APP_DEFS[@]}"; do
    IFS='|' read -r key display_name _ <<< "$def"
    if [[ "$key" == "$target_key" ]]; then
      echo "$display_name"
      return
    fi
  done
  echo "$target_key"
}

# Get the process name to search for in the window list
get_process_name() {
  local target_key="$1"
  for def in "${APP_DEFS[@]}"; do
    IFS='|' read -r key _ process_name <<< "$def"
    if [[ "$key" == "$target_key" ]]; then
      echo "$process_name"
      return
    fi
  done
  echo "$target_key"
}

# ---------------------------------------------------------------------------
# Capture a single app
# ---------------------------------------------------------------------------

capture_app() {
  local key="$1"
  local display_name
  local process_name
  local wid
  local output_path

  display_name="$(get_display_name "$key")"
  process_name="$(get_process_name "$key")"
  output_path="$OUTPUT_DIR/${key}-default.png"

  log "--- Capturing: $display_name ($key) ---"

  # 1. Check if the app exists on this system
  if ! mdfind "kMDItemCFBundleIdentifier == '*'" -name "$display_name" &>/dev/null; then
    # mdfind might not find everything, so just try to open it
    true
  fi

  # 2. Run the app-specific setup (opens, navigates, activates)
  log "  Opening $display_name..."
  run_setup "$key"

  # 3. Bring to front one more time to be sure
  activate_app "$display_name"
  sleep 1

  # 4. Get the CGWindowID
  log "  Finding window ID for process '$process_name'..."
  wid="$(get_window_id "$process_name")"

  if [[ -z "$wid" ]]; then
    warn "  Could not find window for '$process_name'. Skipping."
    return 1
  fi

  log "  Window ID: $wid"

  # 5. Capture the window
  log "  Capturing screenshot..."
  if capture_window "$wid" "$output_path"; then
    log "  Saved: $output_path"
  else
    error "  screencapture failed for $display_name"
    return 1
  fi

  # 6. Close the window (not quit the app) - skip for Finder and Calculator
  #    Finder always has windows; Calculator is a single-window app
  case "$key" in
    finder)
      # Close the Finder window we opened
      osascript -e 'tell application "Finder" to close front window' 2>/dev/null || true
      ;;
    calculator)
      # Don't close Calculator - it quits when you close its window
      osascript -e 'tell application "Calculator" to quit' 2>/dev/null || true
      ;;
    terminal)
      # Close the Terminal window we opened
      osascript <<'APPLESCRIPT' 2>/dev/null || true
        tell application "Terminal"
          close front window
        end tell
APPLESCRIPT
      ;;
    system-settings)
      osascript -e 'tell application "System Settings" to quit' 2>/dev/null || true
      ;;
    *)
      close_front_window "$display_name"
      ;;
  esac

  sleep 0.5
  log "  Done with $display_name"
  return 0
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  local apps_to_capture=()
  local succeeded=0
  local failed=0
  local skipped=0

  # Parse arguments
  if [[ $# -eq 0 ]]; then
    # Capture all apps
    apps_to_capture=("${ALL_KEYS[@]}")
  else
    for arg in "$@"; do
      case "$arg" in
        --list)
          echo "Available apps:"
          for key in "${ALL_KEYS[@]}"; do
            echo "  $key"
          done
          exit 0
          ;;
        --help|-h)
          usage
          exit 0
          ;;
        *)
          # Validate app name
          local found=false
          for valid_key in "${ALL_KEYS[@]}"; do
            if [[ "$arg" == "$valid_key" ]]; then
              found=true
              break
            fi
          done
          if $found; then
            apps_to_capture+=("$arg")
          else
            error "Unknown app: '$arg'"
            echo "Available apps: ${ALL_KEYS[*]}"
            exit 1
          fi
          ;;
      esac
    done
  fi

  if [[ ${#apps_to_capture[@]} -eq 0 ]]; then
    error "No apps to capture."
    usage
    exit 1
  fi

  # Check platform
  if [[ "$(uname)" != "Darwin" ]]; then
    error "This script only runs on macOS."
    exit 1
  fi

  # Check for Screen Recording permission (heuristic: try a test capture)
  log "Checking Screen Recording permission..."
  local test_file
  test_file="$(mktemp /tmp/screencapture-test-XXXXXX.png)"
  if ! screencapture -x "$test_file" 2>/dev/null; then
    warn "screencapture may not have Screen Recording permission."
    warn "Grant permission in: System Settings > Privacy & Security > Screen Recording > Terminal"
  fi
  rm -f "$test_file"

  # Create output directory
  mkdir -p "$OUTPUT_DIR"
  log "Output directory: $OUTPUT_DIR"
  log "Apps to capture: ${apps_to_capture[*]}"
  log ""

  # Capture each app
  local total=${#apps_to_capture[@]}
  local i=0

  for key in "${apps_to_capture[@]}"; do
    i=$((i + 1))
    log "[$i/$total] Processing: $key"

    if capture_app "$key"; then
      succeeded=$((succeeded + 1))
    else
      failed=$((failed + 1))
    fi

    log ""
  done

  # Summary
  log "======================================="
  log "Capture complete!"
  log "  Succeeded: $succeeded"
  log "  Failed:    $failed"
  log "  Total:     $total"
  log "  Output:    $OUTPUT_DIR/"
  log "======================================="

  if [[ $failed -gt 0 ]]; then
    exit 1
  fi
}

main "$@"
