const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `"Blood Bank Management" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  async sendWelcomeEmail(userEmail, userName, role) {
    const subject = 'Welcome to Blood Bank Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Welcome to Blood Bank Management System</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for joining our Blood Bank Management System as a <strong>${role}</strong>.</p>
        <p>You can now access your dashboard and start using our services.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Complete your profile information</li>
            <li>Explore available features in your dashboard</li>
            <li>Contact support if you need assistance</li>
          </ul>
        </div>
        <p>Thank you for being part of our life-saving mission!</p>
        <p>Best regards,<br>Blood Bank Management Team</p>
      </div>
    `;
    return await this.sendEmail(userEmail, subject, html);
  }

  async sendAppointmentConfirmation(donorEmail, donorName, appointmentDate, venue, campaignTitle = null) {
    const subject = 'Blood Donation Appointment Confirmation';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Appointment Confirmation</h2>
        <p>Dear ${donorName},</p>
        <p>Your blood donation appointment has been confirmed!</p>
        <div style="background-color: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Appointment Details:</h3>
          <p><strong>Date & Time:</strong> ${appointmentDate}</p>
          <p><strong>Venue:</strong> ${venue}</p>
          ${campaignTitle ? `<p><strong>Campaign:</strong> ${campaignTitle}</p>` : ''}
        </div>
        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h4>Important Reminders:</h4>
          <ul>
            <li>Please arrive 15 minutes early</li>
            <li>Bring a valid ID</li>
            <li>Eat a healthy meal before donating</li>
            <li>Stay hydrated</li>
            <li>Get adequate rest the night before</li>
          </ul>
        </div>
        <p>Thank you for your generous donation!</p>
        <p>Best regards,<br>Blood Bank Management Team</p>
      </div>
    `;
    return await this.sendEmail(donorEmail, subject, html);
  }

  async sendCampaignInvitation(donorEmail, donorName, campaignTitle, date, venue, description) {
    const subject = `Invitation: ${campaignTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">${campaignTitle}</h2>
        <p>Dear ${donorName},</p>
        <p>You're invited to participate in our upcoming blood donation campaign!</p>
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Campaign Details:</h3>
          <p><strong>Campaign:</strong> ${campaignTitle}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Venue:</strong> ${venue}</p>
          <p><strong>Description:</strong> ${description}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/campaigns" 
             style="background-color: #d32f2f; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Register for Campaign
          </a>
        </div>
        <p>Your donation can save up to 3 lives. Thank you for making a difference!</p>
        <p>Best regards,<br>Blood Bank Management Team</p>
      </div>
    `;
    return await this.sendEmail(donorEmail, subject, html);
  }

  async sendTestResults(donorEmail, donorName, testResults, donationDate) {
    const subject = 'Blood Test Results Available';
    const allClear = Object.values(testResults).every(result => result === 'negative');
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Blood Test Results</h2>
        <p>Dear ${donorName},</p>
        <p>Your blood test results for the donation on ${donationDate} are now available.</p>
        <div style="background-color: ${allClear ? '#e8f5e8' : '#fff3cd'}; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Test Results:</h3>
          <p><strong>HIV:</strong> ${testResults.hiv}</p>
          <p><strong>Hepatitis B:</strong> ${testResults.hepatitisB}</p>
          <p><strong>Hepatitis C:</strong> ${testResults.hepatitisC}</p>
          <p><strong>Syphilis:</strong> ${testResults.syphilis}</p>
        </div>
        ${allClear ? 
          '<p style="color: #2e7d32;"><strong>Great news! All tests came back negative and your blood is safe for transfusion.</strong></p>' :
          '<p style="color: #f57c00;"><strong>Please contact our medical team to discuss your results.</strong></p>'
        }
        <p>Thank you for your donation and for helping save lives!</p>
        <p>Best regards,<br>Blood Bank Management Team</p>
      </div>
    `;
    return await this.sendEmail(donorEmail, subject, html);
  }

  async sendBloodRequestNotification(hospitalEmail, requestDetails) {
    const subject = `Blood Request ${requestDetails.status.toUpperCase()}: ${requestDetails.bloodType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Blood Request Update</h2>
        <p>Dear Hospital Team,</p>
        <p>Your blood request has been <strong>${requestDetails.status}</strong>.</p>
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Request Details:</h3>
          <p><strong>Blood Type:</strong> ${requestDetails.bloodType}</p>
          <p><strong>Units Requested:</strong> ${requestDetails.unitsRequired}</p>
          <p><strong>Urgency:</strong> ${requestDetails.urgencyLevel}</p>
          <p><strong>Required By:</strong> ${requestDetails.requiredBy}</p>
          <p><strong>Status:</strong> ${requestDetails.status}</p>
          ${requestDetails.notes ? `<p><strong>Notes:</strong> ${requestDetails.notes}</p>` : ''}
        </div>
        <p>Please contact us if you have any questions.</p>
        <p>Best regards,<br>Blood Bank Management Team</p>
      </div>
    `;
    return await this.sendEmail(hospitalEmail, subject, html);
  }

  async sendLowStockAlert(adminEmails, bloodType, currentUnits, minimumThreshold) {
    const subject = `URGENT: Low Stock Alert - ${bloodType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">🚨 LOW STOCK ALERT</h2>
        <div style="background-color: #ffebee; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 5px solid #d32f2f;">
          <h3>Critical Stock Level Detected</h3>
          <p><strong>Blood Type:</strong> ${bloodType}</p>
          <p><strong>Current Stock:</strong> ${currentUnits} units</p>
          <p><strong>Minimum Threshold:</strong> ${minimumThreshold} units</p>
        </div>
        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h4>Immediate Actions Required:</h4>
          <ul>
            <li>Contact eligible donors for emergency donations</li>
            <li>Coordinate with other blood banks for transfers</li>
            <li>Review pending requests for this blood type</li>
            <li>Initiate emergency campaign if necessary</li>
          </ul>
        </div>
        <p>Please take immediate action to address this critical shortage.</p>
        <p>Blood Bank Management System</p>
      </div>
    `;

    const results = [];
    for (const email of adminEmails) {
      const result = await this.sendEmail(email, subject, html);
      results.push({ email, ...result });
    }
    return results;
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connected successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();