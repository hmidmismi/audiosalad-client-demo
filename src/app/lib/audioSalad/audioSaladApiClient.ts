/* eslint-disable prefer-const */

/* eslint-disable prefer-const */

// src/app/lib/audioSalad/audioSaladApiClient.ts

import { getAudioSaladAccessToken } from './audioSaladAuthClient';

// Simulate storing refresh token in memory for now
let dashboardRefreshToken = 'b2c1712a940d12239c4af895e1d0ffdb97e6fce7ede26e9f055b88079444a0daa86177289c81d70dcae52dd91c957e52d341070b9bebb3e218c7ceaee10c5e4594d7b052f38780ba7d4065e81b7f0342';  // Initial one-time refresh token from the dashboard
let currentRefreshToken = dashboardRefreshToken; // Start with dashboard token, will be replaced

export async function audioSaladApiClient(endpoint: string, options: RequestInit = {}) {
  const audioSaladBaseUrl = 'https://newworldrecords.dashboard.audiosalad.com/client-api';
  const audioSaladAccessId = '951bc470cb692d120faa6794cc985d7c0123e39a';

  console.log('Starting API client request...');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Using Refresh Token: ${currentRefreshToken}`);

  try {
    // Step 1: Use the current refresh token (initially from dashboard, later updated) and get an access token
    const { accessToken, refreshToken } = await getAudioSaladAccessToken(currentRefreshToken, audioSaladAccessId);

    console.log('Access token fetched successfully:', accessToken);
    console.log('New refresh token:', refreshToken);

    // Step 2: After the first request, update the refresh token for future requests
    currentRefreshToken = refreshToken;

    // Step 3: Make the authenticated API request with the access token
    const response = await fetch(`${audioSaladBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,  // Use the new access token
        'X-Access-ID': audioSaladAccessId,       // Use the access ID
        'Content-Type': 'application/json',
        ...options.headers,  // Include any additional headers
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching data:', errorText);
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Data fetched successfully:', responseData);

    return responseData;

  } catch (error) {
    console.error('Error during API client request:', error);
    throw error;
  }
}
