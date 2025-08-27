import CryptoJS from 'crypto-js';

export class AuthUtils {
  static generateSessionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generatePin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static hashPin(pin: string, salt: string): string {
    return CryptoJS.SHA256(pin + salt).toString();
  }

  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }

  static validateSessionCode(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code);
  }

  static validatePin(pin: string): boolean {
    return /^\d{4}$/.test(pin);
  }

  static generateDeviceId(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  static encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  static decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static generateOneTimeToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return CryptoJS.SHA256(timestamp + random).toString().substring(0, 32);
  }

  static isTokenExpired(token: string, expirationTime: number): boolean {
    return Date.now() > expirationTime;
  }
}