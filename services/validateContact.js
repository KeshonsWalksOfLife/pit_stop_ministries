const ALLOWED_CATEGORIES = [
    'Prayer Request',
    'Booking / Speaking',
    'Marriage / Officiate',
    'General Questions',
    'Compliments / Testimonials',
    'Suicidal / Emergency'
];

function validateContact(body) {
    const { name, email, category, message } = body;

    const errors = {};

    const values = { name, email, category, message };

    //  Name Error Check
    if (typeof name !== 'string' || name.trim().length < 1) {
        errors.name = "Name is required.";
    } else if (name.trim().length > 100) {
        errors.name = "Name must be under 100 characters, please try again.";
    }

    //  Email Error Check
    if (typeof email !== 'string' || email.trim().length < 6) {
        errors.email = "Email is required.";
    } else if (email.trim().length > 254) {
        errors.email = "Email must be under 254 characters, please try again."
    }

    if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category)) {
        errors.category = "Please choose a valid category.";
    }

    if (typeof message !== 'string' || message.trim().length < 10) {
        errors.message = "Message must be at least 10 characters."
    } else if (message.trim().length > 2000) {
        errors.message = "Message must be under 2000 characters, please try again."
    }

    return { errors, values };

}

module.exports = { validateContact };