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
nx generate @nrwl/react:application redux-thunk --e2eTestRunner=none --style=css --no-interactive --dry-run

# generate a redux slice
nx g @nrwl/react:redux --project=redux-thunk books --dry-run

# create a react lib
nx generate @nrwl/react:lib redux-fundamental-demo --e2eTestRunner=none --style=css --no-interactive --dry-run

```
