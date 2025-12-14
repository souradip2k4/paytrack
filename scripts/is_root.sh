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

git_root() {
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        return 1
    fi
    git rev-parse --show-toplevel
}

only_allow_git_root() {
    GIT_ROOT=$(git_root)
    if [ $? -ne 0 ]; then
        echo "ERROR: Not inside a Git working tree."
        exit 1
    fi
    echo "INFO: Git root: $GIT_ROOT"
    return 0
}