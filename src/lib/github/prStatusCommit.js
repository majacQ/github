/**
 * @param {import('./queries').PrWithStatus} pr
 */
export function prStatusCommit(pr) {
  return pr.commits.nodes[0].commit;
}
