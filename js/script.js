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

// Share: native share sheet where supported, clipboard copy everywhere else
const shareBtn = document.getElementById('shareBtn');
const shareNote = document.getElementById('shareNote');

function flashShareNote(message) {
  shareNote.textContent = message;
  clearTimeout(flashShareNote.timer);
  flashShareNote.timer = setTimeout(() => { shareNote.textContent = ''; }, 4000);
}

shareBtn.addEventListener('click', async () => {
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
