import { IDENTIFIER } from "../extension";

const regex = /\/[^\/]+\/[^\/]+\/pull\/\d+/;

export async function validPrUrl(urlString: string) {
  try {
    const serverUrl = await aha.settings.get(`${IDENTIFIER}.serverUrl`);
    const origin = !serverUrl ? "https://github.com" : serverUrl;
    const url = new URL(urlString);

    // This needs to match PRs from potentially different origins
    return url.origin === origin && regex.test(url.pathname);
  } catch (err) {
    return false;
  }
}
