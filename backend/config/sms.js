const twilio = require('twilio');

class SMSConfig {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.serviceSid = process.env.TWILIO_SERVICE_SID;
    this.client = null;
    this.isEnabled = this.validateConfig();
  }

  validateConfig() {
    if (!this.accountSid || !this.authToken || !this.phoneNumber) {
      console.warn('⚠️  SMS service not configured. Missing Twilio credentials.');
      return false;
    }

    try {
      this.client = twilio(this.accountSid, this.authToken);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Twilio client:', error.message);
      return false;
    }
  }

  getClient() {
    if (!this.isEnabled) {
      throw new Error('SMS service is not properly configured');
    }
    return this.client;
  }

  async testConnection() {
    if (!this.isEnabled) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const account = await this.client.api.accounts(this.accountSid).fetch();
      return {
        success: true,
        status: account.status,
        accountSid: account.sid,
        friendlyName: account.friendlyName
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validatePhoneNumber(phoneNumber) {
    if (!this.isEnabled) {
      throw new Error('SMS service not configured');
    }

    try {
      const lookup = await this.client.lookups.v1.phoneNumbers(phoneNumber).fetch();
      return {
        valid: true,
        phoneNumber: lookup.phoneNumber,
        countryCode: lookup.countryCode,
        nationalFormat: lookup.nationalFormat
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Sri Lankan phone number formatting
    if (cleaned.startsWith('0')) {
      return '+94' + cleaned.substring(1);
    }
    if (cleaned.startsWith('94')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('+94')) {
      return cleaned;
    }
    
    // Default to Sri Lankan format
    return '+94' + cleaned;
  }

  async sendSMS(to, message, options = {}) {
    if (!this.isEnabled) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const formattedNumber = this.formatPhoneNumber(to);
      
      const messageOptions = {
        body: message,
        from: this.phoneNumber,
        to: formattedNumber,
        ...options
      };

      if (this.serviceSid) {
        messageOptions.messagingServiceSid = this.serviceSid;
        delete messageOptions.from;
      }

      const result = await this.client.messages.create(messageOptions);

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        body: result.body,
        dateSent: result.dateSent,
        price: result.price,
        priceUnit: result.priceUnit
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        moreInfo: error.moreInfo
      };
    }
  }

  async getMessageStatus(messageId) {
    if (!this.isEnabled) {
      throw new Error('SMS service not configured');
    }

    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        dateSent: message.dateSent,
        price: message.price,
        priceUnit: message.priceUnit
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAccountBalance() {
    if (!this.isEnabled) {
      throw new Error('SMS service not configured');
    }

    try {
      const balance = await this.client.balance.fetch();
      return {
        success: true,
        balance: balance.balance,
        currency: balance.currency,
        accountSid: balance.accountSid
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBulkSMS(recipients, message, options = {}) {
    if (!this.isEnabled) {
      throw new Error('SMS service not configured');
    }

    const results = [];
    const batchSize = options.batchSize || 10;
    const delay = options.delay || 1000; // 1 second delay between batches

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(recipient => 
        this.sendSMS(recipient, message, options)
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map((result, index) => ({
          recipient: batch[index],
          ...result.value
        })));

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error('Bulk SMS batch error:', error);
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      total: recipients.length,
      successful,
      failed,
      results
    };
  }

  getDeliveryStatus(status) {
    const statusMap = {
      'queued': 'Queued for delivery',
      'failed': 'Failed to send',
      'sent': 'Sent to carrier',
      'received': 'Received by carrier',
      'delivered': 'Delivered to recipient',
      'undelivered': 'Failed to deliver',
      'partially_delivered': 'Partially delivered'
    };

    return statusMap[status] || 'Unknown status';
  }

  estimateCost(messageCount, messageLength = 160) {
    // Basic cost estimation (actual costs may vary)
    const segmentCount = Math.ceil(messageLength / 160);
    const totalSegments = messageCount * segmentCount;
    
    // Approximate cost per SMS segment (varies by region)
    const costPerSegment = 0.0075; // USD
    
    return {
      messageCount,
      segmentCount,
      totalSegments,
      estimatedCost: totalSegments * costPerSegment,
      currency: 'USD'
    };
  }

  createWebhookUrl(baseUrl) {
    return `${baseUrl}/api/webhooks/sms-status`;
  }

  validateWebhookSignature(signature, url, body) {
    if (!this.authToken) {
      throw new Error('Auth token not configured');
    }

    const expectedSignature = twilio.webhook.validateRequest(
      this.authToken,
      signature,
      url,
      body
    );

    return expectedSignature;
  }
}

module.exports = new SMSConfig();