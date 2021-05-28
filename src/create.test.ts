import { readdir, readFile } from "fs/promises";
import * as path from "path";
import { dirSync, setGracefulCleanup } from "tmp";

import { createCommand } from "./create";

let tmpdir: string;

jest.mock("./log.ts", () => ({
  info: jest.fn(),
  fatal: jest.fn((msg) => {
    throw new Error(`fatal() called: ${msg}`);
  }),
}));

beforeAll(() => {
  setGracefulCleanup();
  tmpdir = dirSync({ unsafeCleanup: true }).name;
});

describe("createCommand", () => {
  it("creates a skeleton extension package", async () => {
    await createCommand({ name: "extension-test", cwd: tmpdir });

    const destDir = path.join(tmpdir, "extension-test");
    const contents = await readdir(destDir, { withFileTypes: true });

    const dirs = contents.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    const files = contents.filter((entry) => entry.isFile()).map((entry) => entry.name);

    expect(dirs).toHaveLength(1);
    expect(dirs).toContain("src");

    expect(files).toContain("CHANGELOG.md");
    expect(files).toContain("package.json");
    expect(files).toContain("README.md");
    expect(files).toContain("tsconfig.json");

    const packageJson = await readFile(path.join(destDir, "package.json"), { encoding: "utf8" });
    expect(packageJson.includes("${NAME}")).not.toBeTruthy();
    expect(packageJson.includes("extension-test"));
  });
});