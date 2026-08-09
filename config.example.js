module.exports = {
  // language=markdown
  coreUnitDescription: `
## Core System: Directus (CMS)
 
Directus is a headless CMS that exposes all content via a REST and
GraphQL API, which the generated frontend consumes. The ADU provisions
and configures Directus automatically — the user never interacts with
its admin UI directly unless they choose to.

### Authentication
- Directus is bootstrapped with an admin email and password generated
  by the ADU at provisioning time and stored as environment variables
  (injected via the deployment configuration).
- API access from the app service uses a static API token generated
  during provisioning, read exclusively from an environment variable
  (e.g. \`DIRECTUS_TOKEN\`). It must never be hard-coded in source files.

### SDK Usage
- All programmatic access to Directus from the generated frontend must
  use the official Directus SDK (\`@directus/sdk\`).
- The SDK must be initialized once (e.g. in a shared client module) and
  reused across the application.
- Example initialization pattern (TypeScript):

  \`\`\`ts
  import { createDirectus, rest, staticToken } from '@directus/sdk';

  const directus = createDirectus(process.env.DIRECTUS_URL!)
    .with(staticToken(process.env.DIRECTUS_TOKEN!))
    .with(rest());

  export default directus;
  \`\`\`
- The LLM must never construct raw \`fetch\` calls to the Directus REST
  API when the SDK covers the same operation.

### Data Modelling (Collections and Fields)
- Every content type required by an Artifact (e.g. blog posts, team
  members, hero sections) is represented as a Directus collection.
- Collections and fields are provisioned by the ADU via the Directus API
  immediately after the CMS service starts for the first time.
- After initial provisioning, the LLM can add, modify, or remove fields
  in response to user instructions by calling the Directus Fields API —
  no service restart is required.

### Persistence
- Directus stores its data in the database service (PostgreSQL by
  default; SQLite is acceptable for lightweight Artifacts).
- Uploaded media files (images, documents) are stored in a separate
  persistent volume.

### Service & Ports
- Runs as its own service, exposing port \`8055\` for both internal
  service-to-service communication and external admin UI access.
- Directus schema and content changes are always applied via its API
  at runtime and never require a service restart.
  `,
  networking: {
    internal: {
      cms: {
        name: "CMS",
        url: "http://pages-dev-directus-1:8055",
        notes:
          "The CMS is available from this address from the internal network",
      },
    },
    external: {
      cms: {
        name: "CMS",
        url: "http://localhost:8081/cms",
        notes:
          "The CMS is available from this address from the external network",
      },
    },
  },
  mcpServers: {
    cms: {
      type: "http",
      url: 'http://localhost:8081/cms/mcp"',
      headers: {
        Authorization: `Bearer ${process.env.DIRECTUS_MCP_TOKEN}`,
      },
    },
  },
  docsEndpoints: [
    {
      name: "No-Code System for websites",
      llms_txt: "http://host.docker.internal:3000/llms.txt",
    },
    { name: "Docker docs", llms_txt: "https://docs.docker.com/llms-full.txt" },
  ],
  codeQoS: {
    documentation: false,
    unitTests: false,
  },
  promptSuggestions: [
    "Create a landing-page for my café",
    "I want new visitors to immediately understand what we do — rework the hero section",
    "Make it easier for mobile users to get in touch — simplify the contact flow",
    "Increase trust for first-time visitors — add social proof near the pricing section",
  ],
};
