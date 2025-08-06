const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class SMSService {
  async sendSMS(to, message, type = 'general') {
    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async sendAppointmentReminder(donorPhone, appointmentDate, venue) {
    const message = `Blood Donation Reminder: Your appointment is scheduled for ${appointmentDate} at ${venue}. Please arrive 15 minutes early. Thank you for saving lives!`;
    return await this.sendSMS(donorPhone, message, 'appointment');
  }

  async sendEligibilityUpdate(donorPhone, isEligible, nextDate = null) {
    let message;
    if (isEligible) {
      message = 'Good news! You are now eligible to donate blood. Visit our center or check upcoming campaigns.';
    } else {
      message = `You are currently not eligible to donate blood. ${nextDate ? `Next eligible date: ${nextDate}` : 'Please contact us for more information.'}`;
    }
    return await this.sendSMS(donorPhone, message, 'eligibility');
  }

  async sendCampaignInvitation(donorPhone, campaignTitle, date, venue) {
    const message = `Blood Donation Campaign: "${campaignTitle}" on ${date} at ${venue}. Your donation can save up to 3 lives! Register now.`;
    return await this.sendSMS(donorPhone, message, 'campaign');
  }

  async sendEmergencyRequest(recipientPhones, bloodType, hospitalName) {
    const message = `URGENT: ${bloodType} blood needed at ${hospitalName}. If you're eligible and available, please contact us immediately. Lives depend on you!`;
    
    const results = [];
    for (const phone of recipientPhones) {
      const result = await this.sendSMS(phone, message, 'emergency');
      results.push({ phone, ...result });
    }
    return results;
  }

  async sendLowStockAlert(staffPhones, bloodType, currentUnits) {
    const message = `LOW STOCK ALERT: ${bloodType} blood level is critically low (${currentUnits} units remaining). Immediate action required.`;
    
    const results = [];
    for (const phone of staffPhones) {
      const result = await this.sendSMS(phone, message, 'alert');
      results.push({ phone, ...result });
    }
    return results;
  }

  async sendExpiryAlert(staffPhones, bloodType, expiryDate, units) {
    const message = `EXPIRY ALERT: ${units} units of ${bloodType} blood will expire on ${expiryDate}. Please prioritize usage.`;
    
    const results = [];
    for (const phone of staffPhones) {
      const result = await this.sendSMS(phone, message, 'expiry');
      results.push({ phone, ...result });
    }
    return results;
  }

  async sendDonationThankYou(donorPhone, donorName, bloodType) {
    const message = `Thank you ${donorName} for your ${bloodType} blood donation! Your generosity will help save lives. Take care and stay hydrated.`;
    return await this.sendSMS(donorPhone, message, 'thanks');
  }

  async sendTestResults(donorPhone, donorName, results) {
    const message = `Hello ${donorName}, your blood test results are ready. ${results === 'clear' ? 'All tests passed successfully!' : 'Please contact us regarding your test results.'} Thank you for donating.`;
    return await this.sendSMS(donorPhone, message, 'results');
  }

  async getMessageStatus(messageId) {
    try {
      const message = await client.messages(messageId).fetch();
      return {
        success: true,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SMSService();