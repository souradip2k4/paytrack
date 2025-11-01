#!/usr/bin/env bash

is_root() {
    # Get the absolute path to the Git root.
    # The 2>/dev/null suppresses the "fatal: not a git repository" error message.
    GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

    # Check if the command succeeded (we are in a repo) AND 
    # if the Git root path matches the current working directory ($PWD).
    if [ $? -eq 0 ] && [ "$GIT_ROOT" = "$PWD" ]; then
        return 0
    else
        return 1
    fi
}
