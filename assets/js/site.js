(() => {
  const body = document.body;
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      body.classList.toggle('menu-open', open);
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
      body.classList.remove('menu-open');
    }));
  }

  const rail = document.querySelector('.contact-rail');
  const railToggle = document.querySelector('.rail-toggle');
  if (rail && railToggle) railToggle.addEventListener('click', () => rail.classList.toggle('collapsed'));

  const form = document.querySelector('[data-enquiry-form]');
  if (form) form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Website enquiry: ${data.get('service') || 'Legal matter'}`);
    const bodyText = [
      `Name: ${data.get('name') || ''}`,
      `Telephone: ${data.get('telephone') || ''}`,
      `Email: ${data.get('email') || ''}`,
      `Service: ${data.get('service') || ''}`,
      '',
      data.get('enquiry') || ''
    ].join('\n');
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Opening your email application…';
    window.location.href = `mailto:bobderekmayakalegal@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  });
})();
