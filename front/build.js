require("esbuild").build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "build/bundle.js",
  minify: true,
  sourcemap: true,
  target: ["chrome80", "firefox80", "safari11", "edge16"],
  watch: Boolean(process.env.NODE_WATCH),
});
