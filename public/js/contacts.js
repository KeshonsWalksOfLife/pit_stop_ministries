(function () {
    const category = document.getElementById('category');
    const alertBox = document.getElementById('crisis-alert');

    if (category && alertBox) {
        const syncCrisisAlert = () => {
            const isCrisis = category.value === 'Suicidal / Emergency';
            alertBox.hidden = !isCrisis;
            if (isCrisis) {
                alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        };
        syncCrisisAlert();
        category.addEventListener('change', syncCrisisAlert);
    }

    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
})();
