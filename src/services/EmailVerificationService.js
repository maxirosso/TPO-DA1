import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storing verification data
const VERIFICATION_CODES_KEY = 'verification_codes';
const VERIFIED_EMAILS_KEY = 'verified_emails';

// EmailJS configuration
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
      
      console.log(`Verification code stored for ${email}: ${code}`);
      return true;
    } catch (error) {
      console.error('Error storing verification code:', error);
      return false;
    }
  }

  // Verify a code for an email
  static async verifyCode(email, code) {
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
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  }

  // Mark an email as verified
  static async markEmailAsVerified(email) {
    try {
      const verifiedEmailsStr = await AsyncStorage.getItem(VERIFIED_EMAILS_KEY);
      const verifiedEmails = verifiedEmailsStr ? JSON.parse(verifiedEmailsStr) : [];
      
      if (!verifiedEmails.includes(email)) {
        verifiedEmails.push(email);
        await AsyncStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify(verifiedEmails));
      }
      
      return true;
    } catch (error) {
      console.error('Error marking email as verified:', error);
      return false;
    }
  }

  // Check if an email is verified
  static async isEmailVerified(email) {
    try {
      const verifiedEmailsStr = await AsyncStorage.getItem(VERIFIED_EMAILS_KEY);
      if (!verifiedEmailsStr) return false;
      
      const verifiedEmails = JSON.parse(verifiedEmailsStr);
      return verifiedEmails.includes(email);
    } catch (error) {
      console.error('Error checking if email is verified:', error);
      return false;
    }
  }

  // Send verification email using EmailJS API directly
  static async sendVerificationEmail(email, code) {
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
        console.log('Email successfully sent!');
        return true;
      } else {
        console.error('Failed to send email:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Handle the full verification flow: generate code, store it, send email
  static async startVerification(email) {
    try {
      const code = this.generateVerificationCode();
      const stored = await this.storeVerificationCode(email, code);
      
      if (stored) {
        return await this.sendVerificationEmail(email, code);
      }
      
      return false;
    } catch (error) {
      console.error('Error starting verification process:', error);
      return false;
    }
  }
}

export default EmailVerificationService;