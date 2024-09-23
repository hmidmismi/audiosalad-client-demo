// src/app/page.tsx

import React from 'react';

// Simulate storing refresh token and access token in memory
let currentRefreshToken = '3b974d28c50c04eff1465648e3b0eae4c04794d2d4e7d20028b60cb7e8d6f3e15c4255a9a52de2c156cc78e8248d0bfc9500d1c6ab836b285bc43585145c80a93cf30bc530e1e05000b6a9ba6346081a';  // Initially fetched from dashboard
let currentAccessToken = '';  // Empty initially, fetched dynamically later
let accessTokenExpiration = 0;  // Timestamp of expiration

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
      refresh_token: refreshToken,  // Use the current refresh token
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    console.error('Failed to refresh access token:', errorMessage);
    throw new Error(`Failed to refresh access token: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('New access token:', data.access_token);
  console.log('New refresh token:', data.refresh_token);

  // Store the new access token and refresh token
  currentAccessToken = data.access_token;
  currentRefreshToken = data.refresh_token;

  // Calculate and store the expiration time of the new access token
  accessTokenExpiration = Date.now() + data.access_token_expires_in * 1000;

  // Print tokens and expiration info
  console.log('Access Token Expiry:', new Date(accessTokenExpiration).toLocaleString());
  console.log('New Refresh Token Expiry:', new Date(Date.now() + data.refresh_token_expires_in * 1000).toLocaleString());

  return {
    accessToken: data.access_token,
    accessTokenExpiresIn: new Date(accessTokenExpiration).toLocaleString(),
    refreshToken: data.refresh_token,
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
  const audioSaladAccessId = '951bc470cb692d120faa6794cc985d7c0123e39a';

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

        <h1>Release IDs</h1>
        <ul>
          {releaseIds.map((releaseId: string) => (
            <li key={releaseId}>{releaseId}</li>
          ))}
        </ul>


      </div>
    );
  } catch (error) {
    console.error('Error fetching release IDs:', error.message);
    return <div>Error fetching release IDs: {error.message}</div>;
  }
}
