#!/bin/bash
set -euo pipefail

meteor build "../build" --architecture "os.linux.x86_64" --server-only --verbose
