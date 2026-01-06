import { IDENTIFIER } from "../extension";

export async function determineService() {
  const useEnterprise = await aha.settings.get(`${IDENTIFIER}.useEnterprise`);

  if (useEnterprise) {
    return "github_enterprise";
  } else {
    return "github";
  }
}
