# At-home candidate, 3 October 2026

This directory is a provenance record. It is not the publication guarantee.

The published conference report still comes from the pinned wllama replay in [`../../models/wllama.json`](../../models/wllama.json). A normal `vp build` does not call Ollama. Do not run `vp run sensemaker:regenerate` if you want to keep the checked-in `generated/` files. That command writes both locales.

## What we ran

Two local Ollama models, loaded together, on the Rhodes House Polis snapshot `39b1eed77ad2caed03c11d38b7f5730b5008f9df14e4c7617dc3b2854b740db0`.

| Role      | Tag              | What it can do                                                                       |
| --------- | ---------------- | ------------------------------------------------------------------------------------ |
| Narrative | `granite4.2:30b` | Chat and JSON. Wrote the English narrative.                                          |
| Judgment  | `clef:latest`    | Decision only, via `POST /v1/systemone`. Classified comments. It cannot write prose. |

The full identity, decoding settings, token counts, and file hashes are in [`record.json`](record.json).

Granite's one English completion is [`granite-en.raw.json`](granite-en.raw.json). Parsed and canonicalised, it matches `generated/narrative.en.json` (`35aae6d3d65355e0823efaae72256bee9e89143eade410e49975de57b401f767`), including the citation order the validator requires. A later rerun with the same seed, temperature 0, and top-k 1 produced that same raw completion again. zh-TW was not generated. The commit hook pretty-printed the raw file after the first hash was recorded, so compare a new run to the hash in `record.json`, not to the formatted file.

Clef has no seed. It scores the choices you give it. A rerun of these eight judgments matched, including the probabilities.

Clef's eight judgments are [`clef-judgments.json`](clef-judgments.json). Care comments stayed in care. Benefits and government-service comments went to government. The unfair-treatment comment landed in `other`.

## Try it at home

Ollama 0.35.1 or later. Clef will not load on an older server.

```bash
ollama pull granite4.2:30b
ollama pull clef
cd sensemaker
bun provenance/try-candidate.mjs en
bun provenance/try-clef.mjs
```

`try-candidate.mjs` calls the same evidence, prompt, schema, and decoding settings as the checked-in generator, then validates. It prints the result and does not write `generated/`. Pass `zh-TW` to try Mandarin. Set `SENSEMAKER_MODEL` to use another installed chat model.

`try-clef.mjs` asks the same two questions of the first eight English statements. It also only prints.

On a 128 GB machine these two models fit together (about 20 GB and 23 GB loaded). A 100 GB-class model does not fit beside Clef there. Unload it before the trial:

```bash
curl http://127.0.0.1:11434/api/generate \
  -d '{"model":"qwen3.8-flash-next:125b-mlx","keep_alive":0,"prompt":""}'
```
