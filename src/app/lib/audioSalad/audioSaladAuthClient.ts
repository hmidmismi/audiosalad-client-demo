// src/app/lib/audioSalad/audioSaladAuthClient.ts

export async function getAudioSaladAccessToken(refreshToken: string, accessId: string) {
  const tokenUrl = 'https://newworldrecords.dashboard.audiosalad.com/client-api/access-token';

  console.log('Attempting to fetch access token...');
  console.log('Token URL:', tokenUrl);
  console.log('Using Access ID:', accessId);
  console.log('Using Refresh Token:', refreshToken);

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'X-Access-ID': accessId,            // Correctly adding the Access ID header
        'Content-Type': 'application/json', // Correct Content-Type header
      },
      body: JSON.stringify({
        refresh_token: refreshToken,        // Sending the current refresh token
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Failed to retrieve access token, response body:', errorMessage);
      throw new Error(`Client failed to retrieve access token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Access token response:', data);

    // Return the new access token and the new refresh token from the response
    return {
      accessToken: data.access_token,
      accessTokenExpiresIn: data.access_token_expires_in,
      refreshToken: data.refresh_token,  // Use this new refresh token going forward
      refreshTokenExpiresIn: data.refresh_token_expires_in,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during fetch:', error.message);
      throw new Error(error.message);
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unknown error occurred');
    }
  }
}
