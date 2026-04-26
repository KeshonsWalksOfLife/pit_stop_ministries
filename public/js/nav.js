const hamburgerMenu = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

function clickListen() {
    const isOpen = navLinks.classList.toggle("open");
    hamburgerMenu.setAttribute('aria-expanded', isOpen);
}

hamburgerMenu.addEventListener('click', clickListen);