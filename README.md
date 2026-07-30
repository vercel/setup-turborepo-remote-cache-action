# setup-turborepo-remote-cache-action

GitHub Action to setup Turborepo CLI
[Remote Caching](https://vercel.com/docs/monorepos/remote-caching) in GitHub
Workflows.

This documentation is also available at
[Use Remote Caching from external CI/CD](https://vercel.com/docs/monorepos/remote-caching/external-ci-cd).

## Usage

In order to use this action, you need to

1. create a Turborepo CLI OIDC policy on your team for the GitHub Workflow(s)
   you want to enable caching on
2. add a `TURBO_TEAM` repository variable to your GitHub repository
3. add this action to your GitHub Workflow(s), before calling Turborepo CLI

### 1. Create a Turborepo CLI OIDC policy

On vercel.com, go to your team's Settings → Build and Deployment →
[OIDC Policies for CLI Access](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fsettings%2Fbuild-and-deployment%23oidc-cli-policies&title=OIDC+Policies+for+CLI+Access),
and click "Add" next to "Turborepo CLI Policies". You can also
[open the add-policy form directly](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fsettings%2Fbuild-and-deployment%3FaddOidcPolicy%3Dturborepo-cli&title=Add+a+Turborepo+CLI+OIDC+Policy).

Fill out the form, providing a policy name, choosing a GitHub account and
repository. You can optionally restrict to a workflow or branch, and customize
the audience.

### 2. Add a `TURBO_TEAM` repository variable

Create a repository variable called `TURBO_TEAM` set to your team slug or ID,
which can be found on your team's General settings page on vercel.com. With the
[GitHub CLI](https://cli.github.com/):

```bash
gh variable set TURBO_TEAM --body "your-team-slug"
```

Or add it through the GitHub UI under Settings → Secrets and variables → Actions,
on the
[Variables tab](https://docs.github.com/en/actions/learn-github-actions/variables#creating-configuration-variables-for-a-repository).

> Using a repository variable rather than a secret keeps GitHub Actions from
> censoring your team name in log output.

### 3. Add this action to your GitHub Workflow(s)

First, make sure your workflow has the `id-token: write` permission:

```yaml
permissions:
  contents: read
  id-token: write
```

Then, call the action before invoking Turborepo CLI:

```yaml
- uses: vercel/setup-turborepo-remote-cache-action@v1.0.0
  with:
    team: ${{ vars.TURBO_TEAM }}

- run: turbo build
```

You can tell it's working if the action succeeds and Turborepo CLI logs

```
   • Remote caching enabled
```

> If more than one of your team's OIDC policies could match this workflow, you
> will receive an error. Pass the policy ID with the `policy` input to
> disambiguate.

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
