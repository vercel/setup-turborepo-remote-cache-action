# setup-turborepo-remote-cache-action

GitHub Action to setup Turborepo CLI
[Remote Caching](https://vercel.com/docs/monorepos/remote-caching) in GitHub
Workflows.

## Usage

In order to use this action, you need to

1. create a Turborepo CLI OIDC policy on your team for the GitHub Workflow(s)
   you want to enable caching on
2. add this action to your GitHub Workflow(s), before calling Turborepo CLI

### 1. Create a Turborepo CLI OIDC policy

On vercel.com,

1. go to your team's Settings → Build and Deployment → OIDC Policies for CLI
   Access
2. click "Add" next to "Turborepo CLI Policies"
3. fill out the form, providing a policy name, choosing a GitHub account and
   repository
     - You can optionally restrict to a workflow or branch, and customize the
       audience

<img width="320" src="https://github.com/vercel/setup-turborepo-remote-cache-action/blob/main/images/add-turbo-oidc-policy.png">

### 2. Add this action to your GitHub Workflow(s)

First, make sure your workflow has the `id-token: write` permission:

```yaml
permissions:
  contents: read
  id-token: write
```

Then, call the action before invoking Turborepo CLI:

```yaml
- uses: vercel/setup-turborepo-remote-cache-action@v1
  with:
    team: my-team

- run: turbo build
```

You can tell it's working if the action succeeds and Turborepo CLI logs

```
   • Remote caching enabled
```

## Inputs

### `team`

**Required.** The Vercel team ID or slug you want to use Remote Caching with.

### `audience`

**Optional.** A custom audience to include in your GitHub OIDC token's `aud`
claim. This must match your Vercel team's Turborepo CLI OIDC policy.

### `policy`

**Optional.** The ID of the Turborepo CLI OIDC policy to use. Set this when
more than one of your team's policies could match the GitHub OIDC token, so
that the token exchange can pick the intended policy unambiguously.

## How it works

1. You create a Turborepo CLI OIDC policy on your team, which recognizes GitHub
   OIDC tokens belonging to your GitHub Workflow(s)
2. Then, this action generates a GitHub OIDC token, exchanges it for a
   short-lived Turborepo CLI access token
3. Finally, this action sets the `TURBO_TEAM` and `TURBO_TOKEN` environment
   variables, so that subsequent calls to Turborepo CLI have Remote Caching
   enabled

## License

[MIT](https://github.com/vercel/setup-turborepo-remote-cache-action/blob/main/LICENSE)
