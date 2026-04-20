const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

//  Must Wrap In An Async Function To Use Await
async function sendContactEmail({ name, email, category, message }) {
    const result = await brevo.transactionalEmails.sendTransacEmail({
        subject: `[Pitt Stop] ${category} from ${name}`,
        textContent: `You have received a new contact form submission.
        Name: ${name}
        Email: ${email}
        Category: ${category}
        Message: ${message}`,

        sender: { name: "Pitt Stop Ministries", email: "pastorq@thepittstopministries.org" },
        to: [{ email: "pastorq@thepittstopministries.org" }],
        replyTo: { email, name }
    });
    console.log('Email sent successfully:', result);
    return result;
}

module.exports = { sendContactEmail };