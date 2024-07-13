const SibApiV3Sdk = require('@getbrevo/brevo');

async function sendMail(email, subject, body){
    try {
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = `${subject}`;
        sendSmtpEmail.htmlContent = `${body}`;
        sendSmtpEmail.sender = { email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME };
        sendSmtpEmail.to = [{ email: email, name: email }];

        // Send the email
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

        return { success: true };
    }
    catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Error sending email' };
    }
}

module.exports = sendMail; 