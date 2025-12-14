#!/usr/bin/env bash

# Require environment variables to be set.
# If any of the variables are not set, exits with an error
# after logging all required (but missing) variables.
require_envs() {
    is_missing_vars=0
    if [[ -z "$@" ]]; then
        echo "Usage: require_envs <variable1> <variable2>..." >&2
        exit 1
    fi
    for var in "$@"; do
        if [[ -z "${!var}" ]]; then
            echo "ERROR: Required environment variable '$var' is not set." >&2
            is_missing_vars=1
        fi
    done
    if [[ "$missing_vars" -eq 1 ]]; then
        exit 1 
    fi
}