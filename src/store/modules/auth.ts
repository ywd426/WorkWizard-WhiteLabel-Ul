import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserManager } from "oidc-client-ts";
/**
 * Authentication state interface
 */

interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  tenant_id?: string;
  role?: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  tokenExpiry: number | null; // Unix timestamp for expiration
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  resources: any[] | null;
  tenantId: string | null; // Current tenant ID
  role: string | null; // User role
}

/**
 * Authentication service configuration interface
 */
export interface AuthServiceConfig {
  apiBaseUrl: string;
  tenantMiddlewareUrl: string;
  tokenRefreshThreshold?: number; // milliseconds, default 5 minutes
  storageKey?: string;
}

/**
 * Options for handling POST form submissions
 */
export interface PostFormHandlerOptions {
  /**
   * Callback function after successful processing
   */
  onSuccess?: () => void;

  /**
   * Error callback function
   */
  onError?: (error: Error) => void;

  /**
   * Whether to automatically redirect to home page after processing
   * @default true
   */
  redirectToHome?: boolean;

  /**
   * Redirect URL, defaults to '/'
   * @default '/'
   */
  redirectUrl?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(null);
  const refreshTokenValue = ref<string | null>(null);
  const idToken = ref<string | null>(null);
  const tokenExpiry = ref<number | null>(null);
  const isAuthenticated = ref<boolean>(false);
  const userInfo = ref(null);
  const resources = ref<any[] | null>(null);
  const tenantId = ref<string | null>(null);
  const role = ref<string | null>(null);

  // Configuration
  const API_BASE_URL = ref(import.meta.env.VITE_API_BASE_URL);
  const TOKEN_REFRESH_THRESHOLD = ref(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD);
  const STORAGE_KEY = ref(import.meta.env.VITE_STORAGE_KEY);

  // Timer ID for auto-refresh
  let refreshTimerId: number | null = null;

  // Computed
  const authState = computed<AuthState>(() => ({
    accessToken: accessToken.value,
    refreshToken: refreshTokenValue.value,
    idToken: idToken.value,
    tokenExpiry: tokenExpiry.value,
    isAuthenticated: isAuthenticated.value,
    userInfo: userInfo.value,
    resources: resources.value,
    tenantId: tenantId.value,
    role: role.value
  }));

  // Methods
  const init = async (forceRefresh = false): Promise<void> => {
    console.log('Initializing authentication service...');
    console.log('Current page URL:', window.location.href);

    // 1. Load auth data from local storage
    loadFromStorage();
    console.log('Auth status after loading from storage:', isAuthenticated.value ? 'Authenticated' : 'Not authenticated');

    // 2. Check URL for token info
    const urlTokens = extractURLTokens();
    if (urlTokens?.accessToken) {
      console.log('Found token info in URL params, updating auth status');
      setAuthData(urlTokens);
    }

    // 3. If authenticated, check token validity and fetch data
    if (!isAuthenticated.value) return;

    if (isTokenExpiringSoon()) {
      console.log('Token is about to expire, trying to refresh');
      await refreshToken();
    } else {
      console.log('Token is valid, setting up auto-refresh timer');
      scheduleTokenRefresh();
    }

    await fetchRequiredData(forceRefresh);
  };

  const fetchRequiredData = async (forceRefresh: boolean): Promise<void> => {
    try {
      if (forceRefresh || !userInfo.value) {
        await fetchUserInfo();
      }
      if (forceRefresh || !resources.value) {
        await fetchResources();
      }
    } catch (err) {
      console.error('Failed to fetch required data:', err);
    }
  };

  const loadFromStorage = (): void => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY.value);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        Object.assign(authState.value, parsedData);

        if (tokenExpiry.value && tokenExpiry.value < Date.now()) {
          console.log('Stored token has expired, login required');
          logout();
        }
      }
    } catch (error) {
      console.error('Failed to load auth data from storage:', error);
    }
  };

  const saveToStorage = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY.value, JSON.stringify(authState.value));
    } catch (error) {
      console.error('Failed to save auth data to storage:', error);
    }
  };

  const setAuthData = (data: Partial<AuthState>): void => {
    Object.assign(authState.value, data);
    isAuthenticated.value = !!accessToken.value;
    saveToStorage();
    scheduleTokenRefresh();
  };

  const isTokenExpiringSoon = (): boolean => {
    if (!tokenExpiry.value) return false;
    return tokenExpiry.value - Date.now() < TOKEN_REFRESH_THRESHOLD.value;
  };

  const scheduleTokenRefresh = (): void => {
    if (refreshTimerId !== null) {
      clearTimeout(refreshTimerId);
      refreshTimerId = null;
    }

    if (!tokenExpiry.value || tokenExpiry.value < Date.now()) {
      return;
    }

    const timeUntilRefresh = Math.max(0, tokenExpiry.value - Date.now() - TOKEN_REFRESH_THRESHOLD.value);

    console.log(`Token will refresh in ${timeUntilRefresh / 1000} seconds`);

    refreshTimerId = window.setTimeout(async () => {
      console.log('Executing automatic token refresh');
      await refreshToken();
    }, timeUntilRefresh);
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!refreshTokenValue.value) {
        console.error('No refresh token available');
        return false;
      }

      console.log('Starting token refresh...');

      if (!import.meta.env.VITE_COGNITO_CLIENT_Id || !import.meta.env.VITE_COGNITO_REGION) {
        console.error('Incomplete Cognito configuration');
        return false;
      }

      const region =
        typeof import.meta.env.VITE_COGNITO_REGION === 'string'
          ? import.meta.env.VITE_COGNITO_REGION.replace('YOUR_COGNITO_REGION', 'us-east-1')
          : 'us-east-1';

      const cognitoTokenEndpoint = `https://cognito-idp.${region}.amazonaws.com/`;

      const response = await fetch(cognitoTokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          ClientId: import.meta.env.VITE_COGNITO_CLIENT_Id,
          AuthParameters: {
            REFRESH_TOKEN: refreshTokenValue.value
          }
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      setAuthData({
        accessToken: data.AuthenticationResult.AccessToken,
        idToken: data.AuthenticationResult.IdToken,
        refreshToken: refreshTokenValue.value,
        tokenExpiry: Date.now() + data.AuthenticationResult.ExpiresIn * 1000
      });

      console.log('Token refresh successful');
      scheduleTokenRefresh();

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);

      if (error instanceof Error && (error.message.includes('invalid_grant') || error.message.includes('401'))) {
        console.warn('Token refresh failed, login required');
        logout();
      }

      return false;
    }
  };

  const processUserInfo = (userInfoData: any): void => {
    userInfo.value = userInfoData;

    const extractedTenantId = userInfoData.tenant_id ?? userInfoData.tenantId ?? userInfoData.TenantId ?? null;
    if (extractedTenantId && !tenantId.value) {
      tenantId.value = extractedTenantId;
    }

    const extractedRole = userInfoData.role ?? userInfoData.Role ?? userInfoData.userRole ?? userInfoData.user_role ?? null;
    if (extractedRole && !role.value) {
      role.value = extractedRole;
    }

    saveToStorage();
  };

  const getUserInfoUrl = (): string => {
    if (import.meta.env.MODE === 'development' && !API_BASE_URL.value.startsWith('/aws-api')) {
      return `/aws-api/users/me`;
    }
    if (API_BASE_URL.value.startsWith('/')) {
      return `${window.location.origin}${API_BASE_URL.value}/users/me`;
    }
    return `${API_BASE_URL.value}/users/me`;
  };

  const handleUserInfoError = async (error: unknown): Promise<any> => {
    console.error('Failed to fetch user info:', error);

    if (error instanceof Error && error.message.includes('401')) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        return fetchUserInfo();
      }
    }

    throw error;
  };

  const fetchUserInfo = async (): Promise<any> => {
    try {
      if (!accessToken.value) {
        throw new Error('Unauthorized, cannot fetch user info');
      }

      console.log('Fetching user info...');
      const userUrl = getUserInfoUrl();

      const response = await fetch(userUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
      }

      const userInfoData = await response.json();
      processUserInfo(userInfoData);
      return userInfoData;
    } catch (error) {
      return handleUserInfoError(error);
    }
  };

  const getResourcesUrl = (): string => {
    if (import.meta.env.MODE === 'development') {
      return `/aws-api/resources`;
    }

    let baseUrl: string;
    if (API_BASE_URL.value.startsWith('/')) {
      baseUrl = `${window.location.origin}${API_BASE_URL.value}`;
    } else {
      baseUrl = API_BASE_URL.value;
    }
    return `${baseUrl}/resources`;
  };

  const handleResourcesError = async (error: unknown): Promise<any[]> => {
    console.error('Failed to fetch resources:', error);

    if (error instanceof Error && error.message.includes('401')) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        return fetchResources();
      }
    }

    throw error;
  };

  const fetchResources = async (): Promise<any[]> => {
    try {
      if (!accessToken.value) {
        throw new Error('Unauthorized, cannot fetch resources');
      }

      console.log('Fetching resources...');
      const url = getResourcesUrl();

      const params = new URLSearchParams();
      if (tenantId.value) {
        params.append('tenant_id', tenantId.value);
      }

      const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json'
      };

      if (role.value) {
        headers['Role'] = role.value;
      }

      if (tenantId.value) {
        headers['tenantId'] = tenantId.value;
      }

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
      }

      const resourcesData = await response.json();
      resources.value = resourcesData;
      saveToStorage();

      return resourcesData;
    } catch (error) {
      return handleResourcesError(error);
    }
  };

  const logout = async () => {
    accessToken.value = null;
    refreshTokenValue.value = null;
    idToken.value = null;
    tokenExpiry.value = null;
    isAuthenticated.value = false;
    userInfo.value = null;
    resources.value = null;
    tenantId.value = null;
    role.value = null;

    localStorage.removeItem(STORAGE_KEY.value);

    if (refreshTimerId !== null) {
      clearTimeout(refreshTimerId);
      refreshTimerId = null;
    }
    // const targetURL = window.location.origin + import.meta.env.VITE_APP_CONTEXT_PATH+"/index";
    var targetURL = import.meta.env.VITE_APP_CONTEXT_PATH
    if(import.meta.env.VITE_APP_CONTEXT_PATH=='/'){
      targetURL = window.location.origin + import.meta.env.VITE_APP_CONTEXT_PATH;
    }else{
      targetURL = window.location.origin + import.meta.env.VITE_APP_CONTEXT_PATH+"/";
    }
    


    await userManager.clearStaleState();
    await userManager.removeUser();

    const logoutUrl = `${import.meta.env.VITE_COGNITO_DOMAIN}/logout?client_id=${import.meta.env.VITE_COGNITO_CLIENT_Id}&logout_uri=${encodeURIComponent(targetURL)}&id_token_hint=${idToken.value}`;
    window.location.href = logoutUrl;
  };

  const extractURLTokens = (): Partial<AuthState> | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);

      const accessToken = urlParams.get('accessToken') || urlParams.get('token');
      const refreshToken = urlParams.get('refreshToken');
      const idToken = urlParams.get('idToken');
      const expiresIn = urlParams.get('expires_in');
      const tenantId = urlParams.get('tenant_id');
      const role = urlParams.get('role');

      if (accessToken) {
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.warn('Failed to remove token parameters from URL:', err);
        }

        const tokenExpiry = expiresIn ? Date.now() + Number(expiresIn) * 1000 : Date.now() + 3600 * 1000;

        return {
          accessToken,
          refreshToken: refreshToken || null,
          idToken: idToken || null,
          tokenExpiry,
          isAuthenticated: true,
          tenantId: tenantId || null,
          role: role || null
        };
      }
    } catch (error) {
      console.error('Failed to extract token from URL:', error);
    }

    return null;
  };

  const handlePostFormData = (formData: FormData): void => {
    try {
      const getFormValue = (key: string): string | null => {
        const value = formData.get(key);
        return value ? String(value) : null;
      };

      const accessToken = getFormValue('access_token') || getFormValue('token') || getFormValue('accessToken');

      const refreshToken = getFormValue('refresh_token') || getFormValue('refreshToken');

      const idToken = getFormValue('id_token') || getFormValue('idToken');

      const expiresIn = getFormValue('expires_in') || getFormValue('expiresIn');

      const tenantId = getFormValue('tenant_id') || getFormValue('tenantId');

      const role = getFormValue('role');

      saveTokenData({accessToken, refreshToken, idToken, expiresIn, tenantId, role})
    } catch (error) {
      console.error('Failed to process POST form data:', error);
      throw error;
    }
  };

  const handleTokenFromObj = (obj) => {
    const accessToken = obj['access_token'] ?? obj['token'] ?? obj['accessToken'];

    const refreshToken = obj['refresh_token'] ?? obj['refreshToken'];

    const idToken = obj['id_token'] ?? obj['idToken'];

    const expiresIn = obj['expires_in'] ?? obj['expiresIn'];

    const tenantId = obj['tenant_id'] ?? obj['tenantId'];

    const role = obj['role'];

    saveTokenData({accessToken, refreshToken, idToken, expiresIn, tenantId, role})
  }

  const saveTokenData = (data) => {
    const {accessToken, refreshToken, idToken, expiresIn, tenantId, role} = data;

    if (accessToken) {
      const tokenExpiry = expiresIn ? Date.now() + Number(expiresIn) * 1000 : Date.now() + 3600 * 1000;

      setAuthData({
        accessToken,
        refreshToken: refreshToken ?? null,
        idToken: idToken ?? null,
        tokenExpiry,
        isAuthenticated: true,
        tenantId: tenantId ?? null,
        role: role ?? null
      });
    } else {
      throw new Error('No valid access token found in POST form');
    }
  }

  const normalizeUrl = (url: string): string => {
    if (url.includes('www.nexusiqtech.com')) {
      try {
        const urlObj = new URL(url);
        const pathWithParams = urlObj.pathname + urlObj.search;
        return `/aws-api${pathWithParams.replace('/am-api/v1', '')}`;
      } catch (e) {
        console.error('URL conversion failed, using original URL:', e);
        return url;
      }
    }

    if (!url.startsWith('http') && !url.startsWith('//')) {
      if (url.startsWith('/')) {
        return `${window.location.origin}${url}`;
      }

      let baseUrl: string;
      if (API_BASE_URL.value.includes('nexusdemo.foxxusa.com')) {
        baseUrl = '/aws-api';
      } else if (API_BASE_URL.value.startsWith('/')) {
        baseUrl = `${window.location.origin}${API_BASE_URL.value}`;
      } else {
        baseUrl = API_BASE_URL.value;
      }
      return `${baseUrl}/${url.replace(/^\//, '')}`;
    }

    return url;
  };

  const createRequestHeaders = (options: RequestInit): Headers => {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken.value}`);

    if (role.value) {
      headers.set('Role', role.value);
    }

    if (tenantId.value) {
      headers.set('tenantId', tenantId.value);
    }

    return headers;
  };

  const appendTenantIdToUrl = (url: string): string => {
    if (tenantId.value && !url.includes('tenant_id=')) {
      const urlObj = new URL(url);
      urlObj.searchParams.append('tenant_id', tenantId.value);
      return urlObj.toString();
    }
    return url;
  };

  const handleUnauthorizedResponse = async (response: Response, url: string, options: RequestInit, headers: Headers): Promise<any> => {
    const refreshSuccess = await refreshToken();
    if (refreshSuccess) {
      headers.set('Authorization', `Bearer ${accessToken.value}`);

      const retryResponse = await fetch(url, {
        ...options,
        headers
      });

      if (!retryResponse.ok) {
        throw new Error(`Retry request failed: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      return await retryResponse.json();
    }
    throw new Error('Authentication failed, please login again');
  };

  const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
      if (!accessToken.value) {
        throw new Error('Unauthorized, cannot make request');
      }

      if (isTokenExpiringSoon()) {
        await refreshToken();
      }

      const normalizedUrl = normalizeUrl(url);
      const headers = createRequestHeaders(options);
      const finalUrl = appendTenantIdToUrl(normalizedUrl);

      const response = await fetch(finalUrl, {
        ...options,
        headers
      });

      if (response.status === 401) {
        return await handleUnauthorizedResponse(response, finalUrl, options, headers);
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error('Request failed:', error);

      if (error instanceof Error && error.message.includes('401') && !error.message.includes('Authentication failed, please login again')) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          return request<T>(url, options);
        }
      }

      throw error;
    }
  };

  const cognitoAuthConfig = {
    authority: import.meta.env.VITE_COGNITO_AUTHORITY,
    client_id: import.meta.env.VITE_COGNITO_CLIENT_Id,
    redirect_uri: import.meta.env.VITE_COGNITO_CALLBACK,
    response_type: "code",
    scope: import.meta.env.VITE_COGNITO_SCOPE
  };

  // create a UserManager instance
  const userManager = new UserManager({
    ...cognitoAuthConfig,
  });

  return {
    // State
    accessToken,
    refreshToken: refreshTokenValue,
    idToken,
    tokenExpiry,
    isAuthenticated,
    userInfo,
    resources,
    tenantId,
    role,
    userManager,

    // Computed
    authState,

    // Methods
    init,
    logout,
    refreshAuthToken: refreshToken,
    fetchUserInfo,
    fetchResources,
    request,
    handlePostFormData,
    extractURLTokens,
    isTokenExpiringSoon,
    handleTokenFromObj
  };
});

export default useAuthStore;
