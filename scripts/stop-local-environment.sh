#!/bin/bash

OS_TYPE=$(uname)

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
echo "Remove hardhat local network..."
kill -9 $(lsof -t -i:8545)
echo "Remove ngrok open tunnel..."
kill -9 $(lsof -t -i:4040)

if [[ "$OS_TYPE" == "Linux" ]]; then
  echo -e "\nSimply close the terminal window to stop the local environment and all its related sub-processes."
else
  force_quit_iterm_tabs
  quit_iterm
  echo "Stopping local environment... Done"
fi

