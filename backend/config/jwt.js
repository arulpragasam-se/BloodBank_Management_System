const jwt = require('jsonwebtoken');

class JWTConfig {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access_secret_key_2024';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_2024';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    this.issuer = process.env.JWT_ISSUER || 'blood-bank-management';
  }

  generateAccessToken(payload) {
    try {
      const tokenPayload = {
        ...payload,
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(tokenPayload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: this.issuer,
        algorithm: 'HS256'
      });
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  generateRefreshToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(tokenPayload, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry,
        issuer: this.issuer,
        algorithm: 'HS256'
      });
    } catch (error) {
      throw new Error(`Refresh token generation failed: ${error.message}`);
    }
  }

  generateTokenPair(payload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: this.accessTokenExpiry
    };
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: this.issuer,
        algorithms: ['HS256']
      });

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return {
        valid: true,
        decoded,
        expired: false
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          expired: true,
          error: 'Token expired'
        };
      }

      return {
        valid: false,
        expired: false,
        error: error.message
      };
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: this.issuer,
        algorithms: ['HS256']
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return {
        valid: true,
        decoded,
        expired: false
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          expired: true,
          error: 'Refresh token expired'
        };
      }

      return {
        valid: false,
        expired: false,
        error: error.message
      };
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      throw new Error(`Token decode failed: ${error.message}`);
    }
  }

  getTokenExpiry(token) {
    try {
      const decoded = this.decodeToken(token);
      return new Date(decoded.payload.exp * 1000);
    } catch (error) {
      throw new Error(`Cannot get token expiry: ${error.message}`);
    }
  }

  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  refreshAccessToken(refreshToken) {
    try {
      const verification = this.verifyRefreshToken(refreshToken);
      
      if (!verification.valid) {
        throw new Error(verification.error);
      }

      const payload = {
        userId: verification.decoded.userId,
        email: verification.decoded.email,
        role: verification.decoded.role
      };

      return this.generateAccessToken(payload);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  blacklistToken(token) {
    // In production, implement token blacklisting with Redis
    // For now, we'll just validate the token structure
    try {
      const decoded = this.decodeToken(token);
      return {
        success: true,
        tokenId: decoded.payload.jti || decoded.payload.iat,
        message: 'Token marked for blacklist'
      };
    } catch (error) {
      throw new Error(`Blacklist operation failed: ${error.message}`);
    }
  }

  generateResetToken(email) {
    try {
      const payload = {
        email,
        type: 'reset',
        iat: Math.floor(Date.now() / 1000)
      };

      return jwt.sign(payload, this.accessTokenSecret, {
        expiresIn: '1h',
        issuer: this.issuer,
        algorithm: 'HS256'
      });
    } catch (error) {
      throw new Error(`Reset token generation failed: ${error.message}`);
    }
  }

  verifyResetToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: this.issuer,
        algorithms: ['HS256']
      });

      if (decoded.type !== 'reset') {
        throw new Error('Invalid reset token');
      }

      return {
        valid: true,
        email: decoded.email
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = new JWTConfig();