import {
  REVOKE_URL,
  TURBO_APP_ID,
  errorDetail,
  getState,
  log,
  mask,
  request,
  warn,
} from './lib.mjs';

function revocationFailed(detail) {
  warn(
    `Failed to revoke the Turborepo access token (${detail}). It will remain valid until it expires.`,
  );
}

async function post() {
  const accessToken = getState('accessToken');
  if (!accessToken) return;
  mask(accessToken);

  const response = await request(REVOKE_URL, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: TURBO_APP_ID,
      token: accessToken,
      token_type_hint: 'access_token',
    }),
  });

  if (!response.ok) {
    revocationFailed(await errorDetail(response));
    return;
  }

  log('Revoked the Turborepo access token.');
}

post().catch((error) =>
  revocationFailed(error instanceof Error ? error.message : error),
);
