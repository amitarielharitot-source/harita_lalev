# חריטה ללב — Harita LaLev

Landing page and inquiry API for personalized laser-engraved gifts in Hebrew.

## Files
- `dist/index.html`: responsive Hebrew landing page with a live text-on-board preview.
- `worker/index.mjs`: request handling and D1 database inquiry storage.
- `worker/build.mjs`: bundles page and optional campaign media into a worker.
- `.openai/hosting.json`: environment metadata and D1 binding name.

## Building
Node.js is required. From repository root:

```sh
node worker/build.mjs
```

The build outputs `dist/server/index.js`. The optional original campaign assets
`worker/media/launch.jpg` and `worker/media/materials.mp4` have not yet
been imported into this repository. These assets are not referenced by the
current landing page, which loads its cutting-board photo from Pexels.

## Deployment notes
The request API depends on a runtime D1 binding named `DB`. Static hosting
by itself will not make the inquiry form functional. Configure the worker
and D1 binding before taking customer requests.

The request endpoint stores inquiries in the database; the code in this
backup does not independently send notification or acknowledgement emails.

Do not commit access tokens or API secrets. Use deployment environment
variables for secrets.

Source: reconstructed from the November 22, 2026 site backup.
