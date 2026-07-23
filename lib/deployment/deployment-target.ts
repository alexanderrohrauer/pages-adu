import { Artifact } from "@/lib/db/schema";

export interface ISandboxDeploymentTarget {
  initArtifact(artifact: Artifact): Promise<void>;
  buildArtifact(artifact: Artifact): Promise<void>; // docker compose build (only npm install - source code is mounted then and started with "npm run dev")
  startArtifact(artifact: Artifact): Promise<void>; // docker compose up
  stopArtifact(artifact: Artifact): Promise<void>; // docker compose down
  restartArtifact(artifact: Artifact): Promise<void>; // docker compose restart
}
