// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Preselect the gig when someone books from a specific service card
const eventType = document.getElementById('eventType');

document.querySelectorAll('[data-gig]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const gig = trigger.dataset.gig;
    const match = [...eventType.options].some(opt => opt.value === gig);
    if (!match) return;

    eventType.value = gig;
    // Nudge any listeners (and browser autofill styling) that the value changed.
    eventType.dispatchEvent(new Event('change', { bubbles: true }));

    eventType.classList.add('prefilled');
    setTimeout(() => eventType.classList.remove('prefilled'), 1600);
  });
});

// Touch: let the whole card toggle its own detail panel.
// There's no hover on a phone, so the tappable area should be generous.
// The <summary> stays the real control — this just widens the target.
const isTouch = window.matchMedia('(hover: none)').matches;

document.querySelectorAll('.product').forEach(card => {
  const details = card.querySelector('details.product-more');
  if (!details) return;

  // Mirror open state onto the card so it can be styled, whether it was
  // opened by the summary, the keyboard, or a tap anywhere on the card.
  details.addEventListener('toggle', () => {
    card.classList.toggle('is-open', details.open);
  });

  // On touch there's no hover, so the whole card is the tap target.
  if (isTouch) {
    card.addEventListener('click', (e) => {
      // Don't hijack real links, and don't fight summary's native toggle.
      if (e.target.closest('a') || e.target.closest('summary')) return;
      details.open = !details.open;
    });
  }
});

// Date field: open the native calendar from anywhere in the field, not just
// the little icon. Also stop anyone booking a date that has already passed.
const dateInput = document.querySelector('#contactForm input[type="date"]');

if (dateInput) {
  const today = new Date();
  const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  dateInput.min = local.toISOString().split('T')[0];

  if (typeof dateInput.showPicker === 'function') {
    dateInput.addEventListener('click', () => {
      // showPicker throws if it isn't treated as a user gesture; ignore that.
      try { dateInput.showPicker(); } catch (err) { /* fall back to native icon */ }
    });
  }
}

// Share: native share sheet where supported, clipboard copy everywhere else
const shareBtn = document.getElementById('shareBtn');
const shareNote = document.getElementById('shareNote');

function flashShareNote(message) {
  if (!shareNote) return;
  shareNote.textContent = message;
  clearTimeout(flashShareNote.timer);
  flashShareNote.timer = setTimeout(() => { shareNote.textContent = ''; }, 4000);
}

if (shareBtn) shareBtn.addEventListener('click', async () => {
  const url = window.location.href;
  const shareData = {
    title: document.title,
    text: 'Check out Drew — live piano, every song by request.',
    url
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // User dismissed the share sheet — not an error worth surfacing.
      if (err && err.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    flashShareNote('Link copied — paste it to a friend.');
  } catch (err) {
    flashShareNote(url);
  }
});

// Contact form submission (Formspree-compatible AJAX)
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

// Falls back to the email address listed in the contact details, so there's
// only one place to update it.
function fallbackEmail() {
  const link = document.querySelector('.contact-details a[href^="mailto:"]');
  const address = link && link.getAttribute('href').replace('mailto:', '').trim();
  return address ? `Something went wrong — please email ${address} directly.`
                 : 'Something went wrong. Please reach out directly instead.';
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  formNote.textContent = 'Sending…';

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      formNote.textContent = 'Thanks — got it. I’ll get back to you soon.';
      contactForm.reset();
    } else {
      formNote.textContent = fallbackEmail();
    }
  } catch (err) {
    formNote.textContent = fallbackEmail();
  } finally {
    submitBtn.disabled = false;
  }
});
