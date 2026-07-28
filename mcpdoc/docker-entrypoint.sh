#!/bin/sh
curl --output "$HOME/config.json" "$ADU_URL/docs-config.json" &&
mcpdoc --json "$HOME/config.json" --transport sse --host "$MCPDOC_HOST" --port "$MCPDOC_PORT"