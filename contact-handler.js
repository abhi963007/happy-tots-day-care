// WhatsApp API endpoint
const WHATSAPP_API = 'https://api.whatsapp.com/send';

// WhatsApp phone numbers (without +)
const WHATSAPP_NUMBERS = ['917306364765', '919072783958'];

// Function to send WhatsApp message
async function sendWhatsAppMessage(phoneNumber, message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `${WHATSAPP_API}?phone=${phoneNumber}&text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
}

// Function to handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wf-form-Contact-Us-Form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const name = formData.get('Contact-Us-Name');
            const age = formData.get('Contact-Us-Age');
            const email = formData.get('Contact-Us-Email');
            
            // Create message
            const message = `New Contact Form Submission:\n\n` +
                           `Name: ${name}\n` +
                           `Child Age: ${age}\n` +
                           `Email: ${email}`;
            
            // Send message to all WhatsApp numbers
            WHATSAPP_NUMBERS.forEach(phone => {
                sendWhatsAppMessage(phone, message);
            });
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            form.reset();
        });
    }
});
