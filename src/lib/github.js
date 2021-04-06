import { graphql } from "https://cdn.skypack.dev/@octokit/graphql";
import gql from "gql-tag";

export async function githubApi(cachedOnly = false) {
  const options = { useCachedRetry: true, parameters: { scope: "repo" } };
  if (cachedOnly) {
    options["reAuth"] = false;
  }

  const authData = await aha.auth("github", options);

  return graphql.defaults({
    headers: {
      authorization: `token ${authData.token}`,
    },
  });
}

export function withGitHubApi(callback) {
  return githubApi(false).then((api) => callback(api));
}

/**
 * @param {string} url
 */
const repoFromUrl = (url) => new URL(url).pathname.split("/").slice(1, 3);
/**
 * @param {string} url
 */
const prNumberFromUrl = (url) => Number(new URL(url).pathname.split("/")[4]);

const PrForLinkFragment = gql`
  {
    id
    number
    title
    url
    state
    merged
  }
`;

const GetStatus = gql`
  query GetStatus($name: String!, $owner: String!, $number: Int!) {
    repository(name: $name, owner: $owner) {
      pullRequest(number: $number) {
        commits(last: 1) {
          nodes {
            commit {
              statusCheckRollup {
                state
              }
              status {
                contexts {
                  context
                  description
                  targetUrl
                  avatarUrl
                  state
                  isRequired(pullRequestNumber: $number)
                }
              }
            }
          }
        }
      }
    }
  }
`;

/** @typedef {'EXPECTED'|'ERROR'|'FAILURE'|'SUCCESS'|'PENDING'} StatusState */

/**
 * @typedef Context
 * @prop {string} context
 * @prop {string} description
 * @prop {string} targetUrl
 * @prop {StatusState} state
 * @prop {boolean} isRequired
 */

/**
 * @typedef CommitStatus
 * @prop {{state: StatusState} | null} statusCheckRollup
 * @prop {{contexts: Context[]} | null} status
 */

/**
 * @param {*} api
 * @param {*} pr
 * @returns {Promise<CommitStatus>}
 */
export async function fetchPrStatus(api, pr) {
  const [owner, name] = repoFromUrl(pr.url);
  const {
    repository: { pullRequest },
  } = await api(GetStatus, {
    owner,
    name,
    number: Number(pr.id),
  });

  return pullRequest.commits.nodes[0].commit;
}

const SearchForPr = gql`
  query searchForPr($searchQuery: String!) {
    search(query: $searchQuery, type: ISSUE, first: 20) {
      edges {
        node {
          __typename
          ... on PullRequest ${PrForLinkFragment}
        }
      }
    }
  }
`;

/**
 *
 * @param {*} api
 * @param {string} searchQuery
 * @returns
 */
export async function searchForPr(api, searchQuery) {
  const { search } = await api(SearchForPr, { searchQuery });
  return search;
}

const GetPr = gql`
  query GetPr($name: String!, $owner: String!, $number: Int!) {
    repository(name: $name, owner: $owner) {
      pullRequest(number: $number) {
        __typename
        ... on PullRequest ${PrForLinkFragment}
      }
    }
  }
`;

/**
 * @param {*} api
 * @param {string} url
 */
export async function getPrByUrl(api, url) {
  const [owner, name] = repoFromUrl(url);
  const number = prNumberFromUrl(url);

  const {
    repository: { pullRequest },
  } = await api(GetPr, { owner, name, number });

  return pullRequest;
}