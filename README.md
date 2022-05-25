# HowTo Redux

## Appendix I. Setup monorepo using nx

```sh
# create workspace
yarn create nx-workspace howto-redux \
  nxCloud=false \
  packageManager=yarn \
  preset=ts

# add plugins
yarn add -D @nrwl/react

# create a react app
nx generate @nrwl/react:application redux-basic --e2eTestRunner=none --style=css --no-interactive --dry-run

```
