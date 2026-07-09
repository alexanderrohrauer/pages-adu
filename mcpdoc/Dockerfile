# ─────────────────────────────────────────────
# mcpdoc – LangChain AI MCP documentation server
# https://github.com/langchain-ai/mcpdoc
# ─────────────────────────────────────────────

FROM python:3.12-slim

# Install uv for fast Python package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install mcpdoc system-wide (still running as root here)
RUN uv pip install --system mcpdoc

# Drop to a non-root user for security
RUN useradd --create-home --shell /bin/bash mcpdoc
WORKDIR /app
RUN chown mcpdoc:mcpdoc /app
USER mcpdoc

# Default port used by mcpdoc SSE transport
EXPOSE 8082

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

ENTRYPOINT ["mcpdoc"]
CMD [ \
  "--yaml", "/config.yml", \
  "--transport", "sse", \
  "--port", "8082", \
  "--host", "0.0.0.0" \
]