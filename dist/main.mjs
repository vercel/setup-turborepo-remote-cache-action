import {
  TOKEN_URL,
  TURBO_APP_ID,
  booleanInput,
  errorDetail,
  exportVariable,
  fail,
  input,
  log,
  mask,
  request,
  saveState,
} from './lib.mjs';

async function getIdToken(audience) {
  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

  if (!requestUrl || !requestToken) {
    fail(
      'OIDC environment variables are missing. The calling job needs "permissions: id-token: write".',
    );
  }

  const url = new URL(requestUrl);
  if (audience) url.searchParams.set('audience', audience);

  const response = await request(url, {
    headers: { authorization: `bearer ${requestToken}` },
  });
  if (!response.ok) {
    fail(
      `Failed to obtain GitHub OIDC ID token (${await errorDetail(response)})`,
    );
  }

  const { value } = await response.json();
  if (!value) fail('GitHub OIDC ID token response did not include a token');

  mask(value);
  return value;
}

async function exchangeIdToken(idToken, team, policy) {
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    client_id: TURBO_APP_ID,
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
    requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    team_id_or_slug: team,
    subject_token: idToken,
  });
  if (policy) body.set('policy_id', policy);

  const response = await request(TOKEN_URL, { method: 'POST', body });
  if (!response.ok) {
    fail(
      `Failed to exchange OIDC token for Vercel access token (${await errorDetail(response)})`,
    );
  }

  const { access_token: accessToken } = await response.json();
  if (!accessToken) {
    fail('Vercel token exchange response did not include an access token');
  }

  mask(accessToken);
  return accessToken;
}

async function main() {
  const team = input('team');
  if (!team) fail('Input "team" is required');
  const revoke = booleanInput('revoke', true);

  const idToken = await getIdToken(input('audience'));
  const accessToken = await exchangeIdToken(idToken, team, input('policy'));

  exportVariable('TURBO_TOKEN', accessToken);
  exportVariable('TURBO_TEAM', team);

  if (revoke) {
    saveState('accessToken', accessToken);
  } else {
    log(
      'Revocation is disabled; the access token will remain valid until it expires.',
    );
  }
}

main().catch((error) => fail(error instanceof Error ? error.message : error));
