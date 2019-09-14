#!/usr/bin/env deno --allow-write
import * as path from "./vendor/https/deno.land/std/fs/path.ts";
import { Modules } from "./mod.ts";

async function ensure(modules: Modules) {
  const encoder = new TextEncoder();
  for (const [k, v] of Object.entries(modules)) {
    const url = new URL(k);
    const { protocol, hostname, pathname } = url;
    const scheme = protocol.slice(0, protocol.length - 1);
    const dir = path.join("./vendor", scheme, hostname, pathname);
    const writeLinkFile = async (mod: string) => {
      const modFile = `${dir}${mod}`;
      const modDir = path.dirname(modFile);
      await Deno.mkdir(modDir, true);
      const specifier = `${k}${v.version}${mod}`;
      const link = `export * from "${specifier}";`;
      const f = await Deno.open(modFile, "w");
      await Deno.write(f.rid, encoder.encode(link)).finally(() => f.close());
      console.log(`Linked: ${specifier}`);
    };
    await Promise.all(v.modules.map(writeLinkFile));
  }
}
import(`${Deno.cwd()}/modules.ts`).then(async modules => {
  await ensure(modules.default);
});