export async function loadConfig() {
  return (await import("../config/config.js")).default;
}
