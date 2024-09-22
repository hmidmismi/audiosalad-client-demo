// src/app/page.tsx

import React from 'react';

// Function to get access token and refresh token with expiration info
async function getAudioSaladAccessToken(refreshToken: string, accessId: string) {
  const tokenUrl = 'https://newworldrecords.dashboard.audiosalad.com/client-api/access-token';

  console.log('Attempting to fetch access token...');
  console.log('Token URL:', tokenUrl);
  console.log('Using Access ID:', accessId);
  console.log('Using Refresh Token:', refreshToken);

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'X-Access-ID': accessId,            // Correct Access ID
        'Content-Type': 'application/json', // JSON Content Type
      },
      body: JSON.stringify({
        refresh_token: refreshToken,        // Passing refresh token in body
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Failed to retrieve access token, response body:', errorMessage);
      throw new Error(`Failed to retrieve access token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Access token response data:', data);

    // Calculate expiration dates
    const accessTokenExpiration = new Date(Date.now() + data.access_token_expires_in * 1000).toLocaleString();
    const refreshTokenExpiration = new Date(Date.now() + data.refresh_token_expires_in * 1000).toLocaleString();

    return {
      accessToken: data.access_token,
      accessTokenExpiresIn: accessTokenExpiration,
      refreshToken: data.refresh_token,
      refreshTokenExpiresIn: refreshTokenExpiration,
    };

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching tokens:', error.message);
      throw new Error(error.message);
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unknown error occurred');
    }
  }
}

export default async function HomePage() {
  const audioSaladAccessId = '951bc470cb692d120faa6794cc985d7c0123e39a';
  const audioSaladRefreshToken = '115db488f31b648dc3b587a49d3cf801e292a5ddc005481b24c7889d027fb09e82e1ef77c2a56ca4a67e12e81f1a0c450d265055b5284ce1b6d50f4aaaf62d1726fc3c1a6ca107f98df5b46acd3b177b';

  try {
    // Step 1: Get the access token with expiration info
    const { accessToken, accessTokenExpiresIn, refreshToken, refreshTokenExpiresIn } = await getAudioSaladAccessToken(audioSaladRefreshToken, audioSaladAccessId);

    return (
      <div>
        <h1>Tokens and Expiration Info</h1>
        <p><strong>Access Token:</strong> {accessToken}</p>
        <p><strong>Access Token Expires At:</strong> {accessTokenExpiresIn}</p>
        <p><strong>Refresh Token:</strong> {refreshToken}</p>
        <p><strong>Refresh Token Expires At:</strong> {refreshTokenExpiresIn}</p>
      </div>
    );

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching tokens:', error.message);
      return <div>Error fetching tokens: {error.message}</div>;
    } else {
      console.error('Unknown error:', error);
      return <div>An unknown error occurred.</div>;
    }
  }
}
