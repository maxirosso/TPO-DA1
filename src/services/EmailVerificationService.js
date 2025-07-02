import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api.config';

const VERIFICATION_CODES_KEY = 'verification_codes';
const VERIFIED_EMAILS_KEY = 'verified_emails';

const API_BASE_URL = apiConfig.API_BASE_URL;

const EMAILJS_SERVICE_ID = 'service_613gaq1';
const EMAILJS_TEMPLATE_ID = 'template_trylgmd';
const EMAILJS_PUBLIC_KEY = 'rmvTtVQhx4smZDjgs';

class EmailVerificationService {
  static generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static async storeVerificationCode(email, code) {
    try {
      const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/store-code`, { 
        email, 
        code 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error al guardar la verificacion del codigo en el backend:', error);
      
      try {
        const existingCodesStr = await AsyncStorage.getItem(VERIFICATION_CODES_KEY);
        const existingCodes = existingCodesStr ? JSON.parse(existingCodesStr) : {};
        
        existingCodes[email] = {
          code,
          expiresAt: new Date().getTime() + 24 * 60 * 60 * 1000 
        };
        
        await AsyncStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(existingCodes));
        
        console.log(`Codigo de verificacion guardado localmente para ${email}: ${code}`);
        return true;
      } catch (localError) {
        console.error('Local error:', localError);
        return false;
      }
    }
  }

  static async verifyCode(email, code) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-code`, { 
        email, 
        code 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error de codigo de verificacion del backend:', error);
      
      try {
        const codesStr = await AsyncStorage.getItem(VERIFICATION_CODES_KEY);
        if (!codesStr) return false;
        
        const codes = JSON.parse(codesStr);
        const storedData = codes[email];
        
        if (!storedData || new Date().getTime() > storedData.expiresAt) {
          return false;
        }
        
        if (storedData.code !== code) {
          return false;
        }
        
        await this.markEmailAsVerified(email);
        
        delete codes[email];
        await AsyncStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes));
        
        return true;
      } catch (localError) {
        console.error('Local error:', localError);
        return false;
      }
    }
  }

  static async markEmailAsVerified(email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { 
        email 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error al marcar el email como verificado en el backend:', error);
      
      try {
        const verifiedEmailsStr = await AsyncStorage.getItem(VERIFIED_EMAILS_KEY);
        const verifiedEmails = verifiedEmailsStr ? JSON.parse(verifiedEmailsStr) : [];
        
        if (!verifiedEmails.includes(email)) {
          verifiedEmails.push(email);
          await AsyncStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify(verifiedEmails));
        }
        
        return true;
      } catch (localError) {
        console.error('Local error:', localError);
        return false;
      }
    }
  }

  static async isEmailVerified(email) {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/email-verified?email=${email}`);
      return response.data && response.data.verified;
    } catch (error) {
      console.error('Error al chequear si el email es validado con el backend:', error);
      
      try {
        const verifiedEmailsStr = await AsyncStorage.getItem(VERIFIED_EMAILS_KEY);
        if (!verifiedEmailsStr) return false;
        
        const verifiedEmails = JSON.parse(verifiedEmailsStr);
        return verifiedEmails.includes(email);
      } catch (localError) {
        console.error('Local error:', localError);
        return false;
      }
    }
  }

  static async sendVerificationEmail(email, code) {
    try {
      const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/send-verification`, { 
        email, 
        code 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error al enviar el email a traves backend:', error);
      
      try {
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
          console.log('Email enviado exitosamente!');
          return true;
        } else {
          console.error('Error al enviar el email:', response.statusText);
          return false;
        }
      } catch (localError) {
        console.error('Local error:', localError);
        return false;
      }
    }
  }

  static async startVerification(email) {
    try {
      const response = await axios.post(`${apiConfig.API_BASE_URL}/auth/start-verification`, { 
        email 
      });
      return response.data && response.data.success;
    } catch (error) {
      console.error('Error al comenzar la verificacion desde el backend:', error);
      
      try {
        const code = this.generateVerificationCode();
        console.log(`Generando codigo local de verificacion para  ${email}: ${code}`);
        
        const stored = await this.storeVerificationCode(email, code);
        
        if (stored) {
          return await this.sendVerificationEmail(email, code);
        }
        
        return false;
      } catch (localError) {
        console.error('Local error:', localError);
        return false;
      }
    }
  }
}

export default EmailVerificationService;