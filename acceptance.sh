#!/bin/bash

NODE=$(which node)

if diff -q <($NODE run.js < input) expect >/dev/null; then
    echo "Output matches expectations"
else
    echo "Output does not match expectations"
    diff -y <($NODE run.js < input) expect
fi
