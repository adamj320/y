// Choose a fresh group of project photos on each page load.
const projectGrid = document.querySelector('.project-gallery .project-grid');
if (projectGrid) {
  const projectPhotos = Array.from(projectGrid.querySelectorAll('.project-photo'));
  const selectionKey = 'mahoney-project-gallery-selection';
  const selectionSize = Math.min(10, projectPhotos.length);
  let previousSelection = [];
  try {
    const savedSelection = JSON.parse(localStorage.getItem(selectionKey) || '[]');
    if (Array.isArray(savedSelection)) previousSelection = savedSelection;
  } catch (_) { /* Keep the gallery usable when storage is unavailable. */ }

  const randomizedPool = projectPhotos.slice();
  for (let index = randomizedPool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [randomizedPool[index], randomizedPool[swapIndex]] = [randomizedPool[swapIndex], randomizedPool[index]];
  }
  const selectedPhotos = randomizedPool.slice(0, selectionSize);
  const selectedNames = selectedPhotos.map((photo) => photo.querySelector('img')?.getAttribute('src') || '').sort();
  const sameSelection = selectedNames.length === previousSelection.length
    && selectedNames.every((src, index) => src === previousSelection[index]);
  if (sameSelection && selectedPhotos.length) {
    const newPhoto = randomizedPool.find((photo) => !selectedPhotos.includes(photo));
    if (newPhoto) selectedPhotos[selectedPhotos.length - 1] = newPhoto;
  }

  for (let index = selectedPhotos.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [selectedPhotos[index], selectedPhotos[swapIndex]] = [selectedPhotos[swapIndex], selectedPhotos[index]];
  }
  selectedPhotos.forEach((photo) => photo.classList.remove('project-photo-featured'));
  if (selectedPhotos[0]) selectedPhotos[0].classList.add('project-photo-featured');
  projectGrid.replaceChildren(...selectedPhotos);
  try {
    localStorage.setItem(selectionKey, JSON.stringify(selectedPhotos.map((photo) => photo.querySelector('img')?.getAttribute('src') || '').sort()));
  } catch (_) { /* A random group still displays for this page load. */ }
}

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    navigation.classList.toggle('open', !open);
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('open');
    });
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const scheduleForm = document.querySelector('#schedule-form');
if (scheduleForm) {
  const serviceRequest = scheduleForm.querySelector('select[name="service"]');
  document.querySelectorAll('[data-book-service]').forEach((link) => {
    link.addEventListener('click', () => {
      if (serviceRequest) serviceRequest.value = link.dataset.bookService;
    });
  });
  const dateInput = scheduleForm.querySelector('input[name="date"]');

  if (dateInput) {
    const today = new Date();
    dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  scheduleForm.addEventListener('submit', (event) => {
    const nameInput = scheduleForm.querySelector('input[name="name"]');
    const phoneInput = scheduleForm.querySelector('input[name="phone"]');
    const emailInput = scheduleForm.querySelector('input[name="email"]');
    const townInput = scheduleForm.querySelector('input[name="location"]');
    const dateField = scheduleForm.querySelector('input[name="date"]');
    const timeField = scheduleForm.querySelector('select[name="time"]');
    const serviceField = scheduleForm.querySelector('select[name="service"]');
    const detailsField = scheduleForm.querySelector('textarea[name="details"]');
    const namePattern = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'’.-]*(?:\s+[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'’.-]*){0,3}$/;
    const phonePattern = /^(?:\+?1[\s().-]*)?(?:[2-9]\d{2})[\s().-]*(?:[2-9]\d{2})[\s().-]*\d{4}$/;
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const townPattern = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F .'-]{1,78}$/;
    const zipPattern = /^\d{5}(?:-?\d{4})?$/;
    const isPlaceholder = (value) => /^(?:test|testing|tester|asdf|qwerty|yourname|yourtown|name|none|na|n\/a)+$/i.test(value.toLowerCase().replace(/[^a-z0-9/]/g, ''));

    if (nameInput) nameInput.value = nameInput.value.trim().replace(/\s+/g, ' ');
    if (phoneInput) phoneInput.value = phoneInput.value.trim();
    if (emailInput) emailInput.value = emailInput.value.trim();
    if (townInput) townInput.value = townInput.value.trim().replace(/\s+/g, ' ');
    if (detailsField) detailsField.value = detailsField.value.trim();

    if (nameInput) {
      const nameValue = nameInput.value;
      const nameIsRepeated = /^(.)\1{3,}$/i.test(nameValue.replace(/\s/g, ''));
      nameInput.setCustomValidity(namePattern.test(nameValue) && !isPlaceholder(nameValue) && !nameIsRepeated ? '' : 'Enter your real name using letters; placeholder names like "test" are not accepted.');
    }
    if (phoneInput) {
      const digits = phoneInput.value.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
      const repeatedDigits = /^(\d)\1+$/.test(digits);
      const repeatedGroups = /^(\d{2})\1{4,}$/.test(digits) || /^(\d{3})\1{2,}\d?$/.test(digits);
      const sequence = /^(?:0123456789|1234567890|9876543210|0987654321)$/.test(digits);
      const validPhone = phonePattern.test(phoneInput.value) && digits.length === 10 && !repeatedDigits && !repeatedGroups && !sequence;
      phoneInput.setCustomValidity(validPhone ? '' : 'Enter a valid 10-digit U.S. phone number. Repeated or placeholder numbers are not accepted.');
    }
    if (emailInput) {
      const emailValue = emailInput.value;
      const [emailName = '', emailDomain = ''] = emailValue.split('@');
      const exampleDomain = /(^|\.)example\.(?:com|net|org)$/i.test(emailDomain) || /^(?:test|invalid)\./i.test(emailDomain);
      const validEmail = emailPattern.test(emailValue) && !isPlaceholder(emailName) && !exampleDomain;
      emailInput.setCustomValidity(validEmail ? '' : 'Enter a real email address; test and example addresses are not accepted.');
    }
    if (townInput) {
      const location = townInput.value;
      const validLocation = (zipPattern.test(location) || townPattern.test(location)) && !isPlaceholder(location);
      townInput.setCustomValidity(validLocation ? '' : 'Enter a town name or a 5-digit ZIP code (ZIP+4 is also accepted).');
    }
    if (dateField) dateField.setCustomValidity(/^\d{4}-\d{2}-\d{2}$/.test(dateField.value) && (!dateField.min || dateField.value >= dateField.min) ? '' : 'Choose a valid date today or later.');
    if (timeField) timeField.setCustomValidity(/^(Morning|Afternoon|Evening|Flexible)$/.test(timeField.value) ? '' : 'Choose a time preference.');
    if (serviceField) serviceField.setCustomValidity(/^(Plumbing repair|Drain cleaning|Commercial plumbing|Installation or remodel|Water heater|Boiler or heating|Ductless mini-splits|Pipe repair, PEX or copper|Other)$/.test(serviceField.value) ? '' : 'Choose a service from the list.');
    if (detailsField) {
      const details = detailsField.value;
      const validDetails = !details || (details.length >= 8 && details.length <= 1200 && /[A-Za-z\u00C0-\u024F]{3}/.test(details) && !isPlaceholder(details) && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(details));
      detailsField.setCustomValidity(validDetails ? '' : 'Add at least 8 meaningful characters, or leave project details blank.');
    }
    if (!scheduleForm.reportValidity()) event.preventDefault();
  });
}

const reviewTrack = document.querySelector('#review-track');
if (reviewTrack) {
  document.querySelectorAll('[data-review-direction]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.reviewDirection);
      reviewTrack.scrollBy({ left: direction * reviewTrack.clientWidth * 0.85, behavior: 'smooth' });
    });
  });
}

const faqDetails = document.querySelectorAll('.faq-list details');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
faqDetails.forEach((details) => {
  const summary = details.querySelector('summary');
  const answer = details.querySelector('.faq-answer');
  if (!summary || !answer) return;

  summary.addEventListener('click', (event) => {
    event.preventDefault();
    if (details.open) {
      if (reduceMotion) {
        details.open = false;
        details.classList.remove('is-expanded', 'is-closing');
        return;
      }
      details.classList.add('is-closing');
      details.classList.remove('is-expanded');
      let finished = false;
      const finishClose = () => {
        if (finished) return;
        finished = true;
        details.open = false;
        details.classList.remove('is-expanded', 'is-closing');
      };
      answer.addEventListener('transitionend', (transitionEvent) => {
        if (transitionEvent.propertyName === 'grid-template-rows') finishClose();
      }, { once: true });
      window.setTimeout(finishClose, 260);
      return;
    }

    details.open = true;
    if (reduceMotion) {
      details.classList.add('is-expanded');
      return;
    }
    details.classList.add('is-closing');
    void answer.offsetHeight;
    requestAnimationFrame(() => {
      details.classList.remove('is-closing');
      details.classList.add('is-expanded');
    });
  });
});
// Site-wide color theme preference.
(() => {
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;
  const readTheme = () => {
    try {
      const savedTheme = localStorage.getItem('mahoney-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    } catch (_) { /* Fall through to the device preference. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const applyTheme = (theme, save = false, animate = false) => {
    if (animate) {
      document.documentElement.classList.add('theme-transitioning');
      window.setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 240);
    }
    document.documentElement.dataset.theme = theme;
    toggles.forEach((button) => {
      const dark = theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.classList.toggle('is-dark', dark);
    });
    if (save) {
      try { localStorage.setItem('mahoney-theme', theme); } catch (_) { /* Theme still works for this page. */ }
    }
  };
  applyTheme(readTheme());
  toggles.forEach((button) => button.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true, true);
  }));
})();

// Pause the brand ticker when it is offscreen to avoid needless animation work.
const brandMarquee = document.querySelector('.brand-marquee-track');
if (brandMarquee && 'IntersectionObserver' in window) {
  const marqueeObserver = new IntersectionObserver(([entry]) => {
    brandMarquee.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
  });
  marqueeObserver.observe(brandMarquee);
}
