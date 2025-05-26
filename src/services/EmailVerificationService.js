import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api.config';

// Keys for storing verification data (para fallback local)
const VERIFICATION_CODES_KEY = 'verification_codes';
const VERIFIED_EMAILS_KEY = 'verified_emails';

// API Base URL desde la configuración centralizada
const API_BASE_URL = apiConfig.API_BASE_URL;

// EmailJS configuration (se mantiene para fallback)
const EMAILJS_SERVICE_ID = 'service_613gaq1';
const EMAILJS_TEMPLATE_ID = 'template_trylgmd';
const EMAILJS_PUBLIC_KEY = 'rmvTtVQhx4smZDjgs';

class EmailVerificationService {
  // Generate a random 4-digit verification code
  static generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Store a verification code for an email
  static async storeVerificationCode(email, code) {
    try {
      // Intentar guardar el código en el backend
      const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/store-code`, { 
        email, 
        code 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error storing verification code in backend:', error);
      
      // Fallback local
      try {
        // Get existing verification codes
        const existingCodesStr = await AsyncStorage.getItem(VERIFICATION_CODES_KEY);
        const existingCodes = existingCodesStr ? JSON.parse(existingCodesStr) : {};
        
        // Add new code with expiration time (24 hours from now)
        existingCodes[email] = {
          code,
          expiresAt: new Date().getTime() + 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        };
        
        // Save updated codes
        await AsyncStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(existingCodes));
        
        console.log(`Verification code stored locally for ${email}: ${code}`);
        return true;
      } catch (localError) {
        console.error('Local fallback error:', localError);
        return false;
      }
    }
  }

  // Verify a code for an email
  static async verifyCode(email, code) {
    try {
      // Intentar verificar el código en el backend
      const response = await axios.post(`${API_BASE_URL}/auth/verify-code`, { 
        email, 
        code 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error verifying code with backend:', error);
      
      // Fallback local
      try {
        // Get stored verification codes
        const codesStr = await AsyncStorage.getItem(VERIFICATION_CODES_KEY);
        if (!codesStr) return false;
        
        const codes = JSON.parse(codesStr);
        const storedData = codes[email];
        
        // Check if there's a code for this email and it hasn't expired
        if (!storedData || new Date().getTime() > storedData.expiresAt) {
          return false;
        }
        
        // Check if the code matches
        if (storedData.code !== code) {
          return false;
        }
        
        // Code is valid, mark email as verified
        await this.markEmailAsVerified(email);
        
        // Remove the used verification code
        delete codes[email];
        await AsyncStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes));
        
        return true;
      } catch (localError) {
        console.error('Local fallback error:', localError);
        return false;
      }
    }
  }

  // Mark an email as verified
  static async markEmailAsVerified(email) {
    try {
      // Intentar marcar email como verificado en el backend
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { 
        email 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error marking email as verified in backend:', error);
      
      // Fallback local
      try {
        const verifiedEmailsStr = await AsyncStorage.getItem(VERIFIED_EMAILS_KEY);
        const verifiedEmails = verifiedEmailsStr ? JSON.parse(verifiedEmailsStr) : [];
        
        if (!verifiedEmails.includes(email)) {
          verifiedEmails.push(email);
          await AsyncStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify(verifiedEmails));
        }
        
        return true;
      } catch (localError) {
        console.error('Local fallback error:', localError);
        return false;
      }
    }
  }

  // Check if an email is verified
  static async isEmailVerified(email) {
    try {
      // Intentar verificar el estado del email en el backend
      const response = await axios.get(`${API_BASE_URL}/auth/email-verified?email=${email}`);
      return response.data && response.data.verified;
    } catch (error) {
      console.error('Error checking if email is verified with backend:', error);
      
      // Fallback local
      try {
        const verifiedEmailsStr = await AsyncStorage.getItem(VERIFIED_EMAILS_KEY);
        if (!verifiedEmailsStr) return false;
        
        const verifiedEmails = JSON.parse(verifiedEmailsStr);
        return verifiedEmails.includes(email);
      } catch (localError) {
        console.error('Local fallback error:', localError);
        return false;
      }
    }
  }

  // Send verification email using EmailJS API directly
  static async sendVerificationEmail(email, code) {
    try {
      // Intentar enviar el correo a través del backend
      const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/send-verification`, { 
        email, 
        code 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error sending email through backend:', error);
      
      // Fallback usando EmailJS directamente (como estaba antes)
      try {
        // For React Native, we need to use a direct HTTP request
        const url = 'https://api.emailjs.com/api/v1.0/email/send';
        const data = {
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            from_name: 'CulinaryDelight App',
            from_email: 'verification@culinarydelight.app',
            to_email: email,
            message: `Tu código de verificación es: ${code}. Este código expirará en 24 horas.`
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.status === 200) {
          console.log('Email successfully sent through EmailJS!');
          return true;
        } else {
          console.error('Failed to send email through EmailJS:', response.statusText);
          return false;
        }
      } catch (localError) {
        console.error('Local fallback error:', localError);
        return false;
      }
    }
  }

  // Handle the full verification flow: generate code, store it, send email
  static async startVerification(email) {
    try {
      // Intentar iniciar verificación desde el backend (generará y enviará código)
      const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/start-verification`, { 
        email 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error starting verification from backend:', error);
      
      // Fallback local
      try {
        const code = this.generateVerificationCode();
        console.log(`Generated local verification code for ${email}: ${code}`);
        
        const stored = await this.storeVerificationCode(email, code);
        
        if (stored) {
          return await this.sendVerificationEmail(email, code);
        }
        
        return false;
      } catch (localError) {
        console.error('Local fallback error:', localError);
        return false;
      }
    }
  }
}

export default EmailVerificationService;