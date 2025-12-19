import { authedGraphql } from "./api";

jest.mock("../../extension", () => ({
  IDENTIFIER: "aha-develop.github",
}));

const settingsGet = jest.fn();
(global as any).aha = {
  settings: {
    get: settingsGet,
  },
};

global.fetch = jest.fn();

describe("authedGraphql", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("toFetch", () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ }),
      });

    })
    const mockToken = "test-token-123";
    const mockQuery = `graphQL Query`;
    const mockVariables = { login: "testuser" };
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${mockToken}`,
    };
    const body = JSON.stringify({
      query: mockQuery,
      variables: mockVariables,
    });

    it("should make a GraphQL request to github.com API by default", async () => {
      settingsGet.mockResolvedValue(undefined);

      const gqlFetch = authedGraphql(mockToken);
      await gqlFetch(mockQuery, mockVariables);

      expect(fetch).toHaveBeenCalledWith("https://api.github.com/graphql", {
        method: "POST",
        headers: headers,
        body: body,
      });
    });

    it("should make a GraphQL request to github.com API when serverUrl is explicitly set to github.com", async () => {
      settingsGet.mockResolvedValue("https://github.com");

      const gqlFetch = authedGraphql(mockToken);
      await gqlFetch(mockQuery, mockVariables);

      expect(fetch).toHaveBeenCalledWith("https://api.github.com/graphql", {
        method: "POST",
        headers: headers,
        body: body,
      });
    });

    it("should make a GraphQL request to GitHub Enterprise server", async () => {
      const enterpriseUrl = "https://github.enterprise.com";
      settingsGet.mockResolvedValue(enterpriseUrl);

      const gqlFetch = authedGraphql(mockToken);
      await gqlFetch(mockQuery, mockVariables);

      expect(fetch).toHaveBeenCalledWith(
        `${enterpriseUrl}/api/graphql`,
        {
          method: "POST",
          headers: headers,
          body: body,
        }
      );
    });

    it("should throw an error when the response is not ok", async () => {
      settingsGet.mockResolvedValue(undefined);
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const gqlFetch = authedGraphql(mockToken);

      await expect(gqlFetch(mockQuery, mockVariables)).rejects.toThrow(
        "401 Unauthorized"
      );
    });
  });
});
