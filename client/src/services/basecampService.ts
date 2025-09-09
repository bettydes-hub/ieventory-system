import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

export interface BasecampUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
}

export interface BasecampAuthResponse {
  user: BasecampUser;
  token: string;
}

class BasecampService {
  private baseURL = API_BASE_URL;

  /**
   * Initiate Basecamp OAuth2 login
   * This will redirect the user to Basecamp's authorization page
   */
  async initiateLogin(): Promise<void> {
    const authUrl = `${this.baseURL}/api/auth/basecamp`;
    window.location.href = authUrl;
  }

  /**
   * Handle Basecamp OAuth2 callback
   * This is called after the user returns from Basecamp
   */
  async handleCallback(code: string, state?: string): Promise<BasecampAuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/basecamp/callback`, {
        code,
        state,
      });

      return response.data;
    } catch (error) {
      console.error('Basecamp callback error:', error);
      throw new Error('Failed to complete Basecamp authentication');
    }
  }

  /**
   * Get Basecamp user profile
   */
  async getUserProfile(accessToken: string): Promise<BasecampUser> {
    try {
      const response = await axios.get(`${this.baseURL}/api/auth/basecamp/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching Basecamp profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Refresh Basecamp access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/basecamp/refresh`, {
        refreshToken,
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing Basecamp token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Logout from Basecamp
   */
  async logout(accessToken: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/api/auth/basecamp/logout`, {
        accessToken,
      });
    } catch (error) {
      console.error('Error logging out from Basecamp:', error);
      // Don't throw error for logout failures
    }
  }

  /**
   * Check if current URL contains Basecamp callback parameters
   */
  isCallbackUrl(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') && urlParams.has('state');
  }

  /**
   * Extract callback parameters from URL
   */
  getCallbackParams(): { code: string; state: string } | null {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      return { code, state };
    }

    return null;
  }

  /**
   * Clear callback parameters from URL
   */
  clearCallbackParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState({}, document.title, url.toString());
  }
}

export const basecampService = new BasecampService();
