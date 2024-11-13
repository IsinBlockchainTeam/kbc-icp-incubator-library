#!/bin/bash

function force_quit_iterm_tabs() {
    osascript <<EOF
tell application "iTerm"
    tell current window
        close every tab
    end tell
end tell
EOF
}

function quit_iterm() {
    osascript <<EOF
tell application "iTerm"
    quit
end tell
EOF
}

echo "Stopping local environment..."

dfx stop

force_quit_iterm_tabs

quit_iterm

echo "Stopping local environment... Done"