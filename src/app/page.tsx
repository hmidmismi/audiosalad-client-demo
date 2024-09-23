// src/app/page.tsx

import React from 'react';

// Retrieve refresh token and access ID from the environment variables
const currentRefreshToken = process.env.AUDIOSALAD_REFRESH_TOKEN || '';
const audioSaladAccessId = process.env.AUDIOSALAD_ACCESS_ID || '';

let currentAccessToken = ''; // Store the current access token
let accessTokenExpiration = 0; // Timestamp for the expiration of the access token

// Function to get a new access token using the refresh token
async function refreshAccessToken(refreshToken: string, accessId: string) {
  const tokenUrl = 'https://newworldrecords.dashboard.audiosalad.com/client-api/access-token';

  console.log('Refreshing access token...');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'X-Access-ID': accessId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refreshToken,  // Use the refresh token only once
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    console.error('Failed to refresh access token:', errorMessage);
    throw new Error(`Failed to refresh access token: ${response.statusText}`);
  }

  const data = await response.json();

  // Store the new access token and update the expiration time
  currentAccessToken = data.access_token;
  accessTokenExpiration = Date.now() + data.access_token_expires_in * 1000;

  // You can log the new refresh token for updating in the .env file manually
  console.log('New access token:', currentAccessToken);
  console.log('Access Token Expiry:', new Date(accessTokenExpiration).toLocaleString());
  console.log('New refresh token:', data.refresh_token);

  return {
    accessToken: data.access_token,
    accessTokenExpiresIn: new Date(accessTokenExpiration).toLocaleString(),
    refreshToken: data.refresh_token,  // IMPORTANT: You should manually update your .env with this token
    refreshTokenExpiresIn: new Date(Date.now() + data.refresh_token_expires_in * 1000).toLocaleString(),
  };
}

// Function to get the current valid access token (refreshing if necessary)
async function getValidAccessToken(accessId: string) {
  const currentTime = Date.now();

  // Check if the current access token has expired or is about to expire (within 1 minute)
  if (!currentAccessToken || currentTime > accessTokenExpiration - 60000) {
    console.log('Access token is expired or close to expiring. Refreshing...');
    const tokenData = await refreshAccessToken(currentRefreshToken, accessId);
    return tokenData;
  }

  console.log('Using existing access token:', currentAccessToken);
  return {
    accessToken: currentAccessToken,
    accessTokenExpiresIn: new Date(accessTokenExpiration).toLocaleString(),
    refreshToken: currentRefreshToken,
    refreshTokenExpiresIn: new Date(Date.now() + 86400 * 1000).toLocaleString(),  // Assuming refresh token is valid for 24 hours
  };
}

// Function to fetch release IDs
async function fetchReleaseIds(accessId: string) {
  const tokenData = await getValidAccessToken(accessId);  // Ensure we have a valid access token

  const releaseIdsUrl = 'https://newworldrecords.dashboard.audiosalad.com/client-api/release-ids';
  const response = await fetch(`${releaseIdsUrl}?modified_start=2020-01-01T00:00:00Z&modified_end=${new Date().toISOString()}`, {
    method: 'GET',
    headers: {
      'X-Access-ID': accessId,
      'Authorization': `Bearer ${tokenData.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    console.error('Error fetching release IDs:', errorMessage);
    throw new Error(`Error fetching release IDs: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Fetched release IDs:', data);
  return data;
}

export default async function HomePage() {
  try {
    const releaseIds = await fetchReleaseIds(audioSaladAccessId);
    const tokenData = await getValidAccessToken(audioSaladAccessId);  // Ensure we have a valid access token

    return (
      <div>
        <h2>Tokens and Expiration</h2>
        <p><strong>Access Token:</strong> {tokenData.accessToken}</p>
        <p><strong>Access Token Expires At:</strong> {tokenData.accessTokenExpiresIn}</p>
        <p><strong>Refresh Token:</strong> {tokenData.refreshToken}</p>
        <p><strong>Refresh Token Expires At:</strong> {tokenData.refreshTokenExpiresIn}</p>

        <h2>Release IDs</h2>
        <ul>
          {releaseIds.map((releaseId: string) => (
            <li key={releaseId}>{releaseId}</li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching release IDs or tokens:', error.message);
      return <div>Error fetching release IDs or tokens: {error.message}</div>;
    } else {
      console.error('Unknown error:', error);
      return <div>An unknown error occurred.</div>;
    }
  }
}
