class TokenManager {
    static setToken(token, expiresInSeconds) {
        const expiry = Date.now() + expiresInSeconds * 1000;
        sessionStorage.setItem('jwtToken', token);
        sessionStorage.setItem('jwtTokenExpiry', expiry.toString());
    }

    static getToken() {
        const token = sessionStorage.getItem('jwtToken');
        const expiry = parseInt(sessionStorage.getItem('jwtTokenExpiry'));

        if (!token || !expiry || Date.now() > expiry) {
            this.clearToken();
            return null;
        }

        return token;
    }

    static isLoggedIn() {
        return !!this.getToken();
    }

    static clearToken() {
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('jwtTokenExpiry');
    }

    static removeToken() {
        this.clearToken();
    }
    
    static getRoles() {
    const token = this.getToken();
    if (!token) return [];

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.roles || [];
    } catch (error) {
        console.error('Error decoding token roles:', error);
        return [];
    }
}
static getUserInfo() {
    const token = this.getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            email: payload.sub || '',
            role: payload.roles?.[0] || ''
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

}
