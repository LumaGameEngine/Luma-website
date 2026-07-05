// stripe.js - Luma Engine Payment Integration

// Stripe public key (replace with your actual key)
const STRIPE_PUBLIC_KEY = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX';

// Initialize Stripe
const stripe = Stripe(STRIPE_PUBLIC_KEY);

document.addEventListener('DOMContentLoaded', function() {
    const donateButtons = document.querySelectorAll('.donation-preset, #donateButton');
    const donationSlider = document.getElementById('donationSlider');
    const donationDisplay = document.getElementById('donationDisplay');
    
    // Get current donation amount
    function getDonationAmount() {
        if (donationSlider) {
            return parseInt(donationSlider.value);
        }
        return 10;
    }
    
    // Handle donation button clicks
    donateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            let amount = getDonationAmount();
            if (this.dataset.amount) {
                amount = parseInt(this.dataset.amount);
            }
            
            // Create a checkout session
            fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'usd',
                    success_url: window.location.origin + '/success.html',
                    cancel_url: window.location.origin + '/cancel.html',
                }),
            })
            .then(response => response.json())
            .then(data => {
                // Redirect to Stripe Checkout
                return stripe.redirectToCheckout({ sessionId: data.id });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Something went wrong. Please try again.');
            });
        });
    });
    
    // PayPal button (placeholder)
    const paypalButton = document.querySelector('.fab.fa-paypal')?.closest('a');
    if (paypalButton) {
        paypalButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('PayPal integration coming soon!');
        });
    }
    
    // GitHub Sponsors button (placeholder)
    const githubSponsorButton = document.querySelector('.fab.fa-github')?.closest('a');
    if (githubSponsorButton && githubSponsorButton.textContent.includes('Sponsors')) {
        githubSponsorButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://github.com/sponsors/LumaGameEngine', '_blank');
        });
    }
});

// Checkout success/failure handlers
function handleCheckoutResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
        // Verify payment status
        fetch('/verify-checkout-session?session_id=' + sessionId)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'complete') {
                    document.getElementById('checkout-message').innerHTML = `
                        <div class="text-center">
                            <i class="fas fa-check-circle text-green-400 text-6xl mb-4"></i>
                            <h2 class="text-2xl font-bold text-white">Thank You! ❤️</h2>
                            <p class="text-luma-textMuted mt-2">Your support means the world to us.</p>
                            <p class="text-luma-textMuted text-sm mt-1">You will receive a confirmation email shortly.</p>
                            <a href="index.html" class="inline-block mt-6 bg-gradient-to-r from-luma-pink to-luma-purple text-white font-semibold px-6 py-3 rounded-xl shadow-neon-pink hover:shadow-neon-pink/50 transition-all duration-300 hover:scale-105">
                                Back to Home
                            </a>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error verifying payment:', error);
            });
    }
}

// Run on page load
if (document.getElementById('checkout-message')) {
    handleCheckoutResult();
}