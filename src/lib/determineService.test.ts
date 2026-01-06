import { determineService } from "./determineService";

jest.mock("../extension", () => ({
  IDENTIFIER: "aha-develop.github",
}));

const settingsGet = jest.fn();
(global as any).aha = {
  settings: {
    get: settingsGet,
  },
};

describe("determineService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return github when useEnterprise is false", async () => {
    settingsGet.mockResolvedValue(false);

    const result = await determineService();

    expect(settingsGet).toHaveBeenCalledWith("aha-develop.github.useEnterprise");
    expect(result).toBe("github");
  });

  it("should return github when useEnterprise is undefined", async () => {
    settingsGet.mockResolvedValue(undefined);

    const result = await determineService();

    expect(settingsGet).toHaveBeenCalledWith("aha-develop.github.useEnterprise");
    expect(result).toBe("github");
  });

  it("should return github_enterprise when useEnterprise is true", async () => {
    settingsGet.mockResolvedValue(true);

    const result = await determineService();

    expect(settingsGet).toHaveBeenCalledWith("aha-develop.github.useEnterprise");
    expect(result).toBe("github_enterprise");
  });
});
