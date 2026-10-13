# Pixel Perfect

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixel-perfect-view-6203.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ac3e1ee8-dcc1-4380-97a0-aaa346fe1d86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Frontend performance

Route components are split automatically by TanStack Router. Run `npm run build` to
build the app, or `npm run analyze` to build and emit a client bundle treemap at
`.output/public/bundle-stats.html`.

If you replace or add source photography in `src/assets`, run
`npm run optimize:images` to regenerate the responsive WebP files in `public/images`
before building.

## Production deployment

Cloudflare Workers is the recommended autoscaling deployment target; see the
[deployment and scaling guide](./docs/deployment.md) for deployment, Supavisor
pooling guidance, health checks, and the optional Docker/nginx path.
