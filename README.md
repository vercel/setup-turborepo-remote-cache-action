# turbo-token-action

GitHub Action to exchange a GitHub OIDC token for a `turbo` CLI access token.
Enables Remote Caching in GitHub Workflows, without requiring a personal access
token.

## Usage

In order to use this action, you need to

1. create a `turbo` CLI OIDC policy on your team for the GitHub Workflow(s) you
   want to enable caching on
2. add this action to your GitHub Workflow(s), before calling `turbo`

### 1. Create a `turbo` CLI OIDC policy

On vercel.com,

1. go to your team's Settings → Build and Deployment → OIDC Policies for CLI
   Access
2. click "Add" next to "Turborepo CLI Policies"
3. fill out the form, providing a policy name, choosing a GitHub account and
   repository
     - You can optionally restrict to a workflow or branch, and customize the
       audience

<img width="320" src="https://github.com/vercel/turbo-token-action/blob/main/images/add-turbo-oidc-policy.png?raw=true">

### 2. Add this action to your GitHub Workflow(s)

First, make sure your workflow has the `id-token: write` permission:

```yaml
permissions:
  contents: read
  id-token: write
```

Then, call the action before invoking `turbo`:

```yaml
- uses: vercel/turbo-token-action@v1
  with:
    team-id: team_123…

- run: turbo build
```

You can tell it's working if the action succeeds and `turbo` logs

```
   • Remote caching enabled
```

## Inputs

### `team-id`

**Required.** The Vercel team ID you want to use Remote Caching with.

### `audience`

**Optional.** A custom audience to include in your GitHub OIDC token's `aud`
claim. This must match your Vercel team's `turbo` OIDC policy.

## How it works

1. You create a `turbo` CLI OIDC policy on your team, which recognizes GitHub
   OIDC tokens belonging to your GitHub Workflow(s)
2. Then, this action generates a GitHub OIDC token, exchanges it for a
   short-lived `turbo` CLI access token
3. Finally, this action sets the `TURBO_TEAM` and `TURBO_TOKEN` environment
   variables, so that subsequent calls to `turbo` have Remote Caching enabled

## License

[MIT](https://github.com/vercel/turbo-token-action/blob/main/LICENSE?raw=true)
