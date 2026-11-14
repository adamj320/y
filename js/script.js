// Choose a fresh group of project photos on each page load.
const projectGrid = document.querySelector('.project-gallery .project-grid');
if (projectGrid) {
  const projectPhotos = Array.from(projectGrid.querySelectorAll('.project-photo'));
  const selectionKey = 'mahoney-project-gallery-selection';
  const selectionSize = Math.min(12, projectPhotos.length);
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
    const namePattern = /^[A-Za-z\u00C0-\u00FF][A-Za-z\u00C0-\u00FF .'-]{1,79}$/;
    const phonePattern = /^\+?[0-9(). -]{7,20}$/;
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const townPattern = /^[A-Za-z\u00C0-\u00FF0-9 .'-]{2,80}$/;

    if (nameInput) nameInput.setCustomValidity(namePattern.test(nameInput.value.trim()) ? '' : 'Enter a valid name using letters, spaces, apostrophes, or hyphens.');
    if (phoneInput) {
      const digits = phoneInput.value.replace(/\D/g, '').length;
      phoneInput.setCustomValidity(phonePattern.test(phoneInput.value.trim()) && digits >= 10 && digits <= 15 ? '' : 'Enter a phone number with 10 to 15 digits.');
    }
    if (emailInput) emailInput.setCustomValidity(emailPattern.test(emailInput.value.trim()) ? '' : 'Enter a valid email address.');
    if (townInput) townInput.setCustomValidity(townPattern.test(townInput.value.trim()) ? '' : 'Enter your town or ZIP code.');
    if (dateField) dateField.setCustomValidity(/^\d{4}-\d{2}-\d{2}$/.test(dateField.value) && (!dateField.min || dateField.value >= dateField.min) ? '' : 'Choose a valid date today or later.');
    if (timeField) timeField.setCustomValidity(/^(Morning|Afternoon|Evening|Flexible)$/.test(timeField.value) ? '' : 'Choose a time preference.');
    if (serviceField) serviceField.setCustomValidity(/^(Plumbing repair|Drain cleaning|Commercial plumbing|Installation or remodel|Water heater|Boiler or heating|Ductless mini-splits|Pipe repair, PEX or copper|Other)$/.test(serviceField.value) ? '' : 'Choose a service from the list.');
    if (detailsField) detailsField.setCustomValidity(detailsField.value.length <= 1200 && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(detailsField.value) ? '' : 'Use up to 1,200 characters without control characters.');
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
