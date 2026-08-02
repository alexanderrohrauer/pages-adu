# ─────────────────────────────────────────────
# mcpdoc – LangChain AI MCP documentation server
# https://github.com/langchain-ai/mcpdoc
# ─────────────────────────────────────────────

FROM python:3.12-slim

# Install cURL
RUN apt-get update && apt-get install -y curl

# Install uv for fast Python package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install mcpdoc system-wide (still running as root here)
# mcpdoc pins "mcp[cli]>=1.4.1" with no upper bound; mcp 2.0.0 restructured
# the package (mcp.server.fastmcp moved/removed), breaking mcpdoc. Pin to
# the last compatible 1.x line until mcpdoc supports mcp 2.x.
RUN uv pip install --system mcpdoc "mcp[cli]<2"

# Drop to a non-root user for security
RUN useradd --create-home --shell /bin/bash mcpdoc
WORKDIR /app
RUN chown mcpdoc:mcpdoc /app
USER mcpdoc

# Default port used by mcpdoc SSE transport
EXPOSE 8082

# Add entrypoint
COPY --chmod=+x docker-entrypoint.sh /app

# ─────────────────────────────────────────────
# Configuration
#
# Docs sources can be set via:
#   1. Environment variables passed at runtime (see CMD below)
#   2. A YAML/JSON config file mounted at /app/config.yaml
#      and overriding CMD with:
#        --yaml /app/config.yaml
#
# Default: serves LangGraph + LangChain docs over SSE on port 8082.
# Override by passing your own args after the image name, e.g.:
#
#   docker run -p 8082:8082 mcpdoc \
#     --urls "MyDocs:https://example.com/llms.txt" \
#     --transport sse --port 8082 --host 0.0.0.0
# ─────────────────────────────────────────────

ENV MCPDOC_HOST=0.0.0.0
ENV MCPDOC_PORT=8082
ENV ADU_URL=http://adu:3000

ENTRYPOINT ["./docker-entrypoint.sh"]