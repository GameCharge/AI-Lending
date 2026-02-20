document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const nav = document.getElementById('main-nav');
  const burgerBtn = document.getElementById('burger-btn');
  const navOverlay = document.getElementById('nav-overlay');

  // Мобильное меню
  function toggleMenu() {
      const isActive = nav.classList.contains('active');
      burgerBtn.classList.toggle('active', !isActive);
      nav.classList.toggle('active', !isActive);
      if (navOverlay) navOverlay.classList.toggle('active', !isActive);
      document.body.style.overflow = !isActive ? 'hidden' : '';
  }

  if (burgerBtn && nav) {
      burgerBtn.addEventListener('click', toggleMenu);

      nav.querySelectorAll('.nav__link').forEach(link => {
          link.addEventListener('click', () => {
              burgerBtn.classList.remove('active');
              nav.classList.remove('active');
              if (navOverlay) navOverlay.classList.remove('active');
              document.body.style.overflow = '';
          });
      });

      if (navOverlay) {
          navOverlay.addEventListener('click', () => {
              burgerBtn.classList.remove('active');
              nav.classList.remove('active');
              navOverlay.classList.remove('active');
              document.body.style.overflow = '';
          });
      }
  }

  // Изменение шапки при скролле
  window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
          header.style.padding = '10px 0';
          header.style.background = 'rgba(5, 5, 5, 0.95)';
          header.style.backdropFilter = 'blur(12px)';
      } else {
          header.style.padding = '20px 0';
          header.style.background = 'rgba(5, 5, 5, 0.8)';
          header.style.backdropFilter = 'blur(0)';
      }
  });

  // Плавный скролл к секциям
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          if (href === '#') return;
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
  });

  // Появление секций при скролле
  const observerOptions = { threshold: 0.15 };
  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
          if (entry.isIntersecting) {
              entry.target.classList.add('animate-visible');
              const children = entry.target.querySelectorAll('.animate-child');
              children.forEach((child, i) => {
                  child.style.transitionDelay = `${i * 0.1}s`;
              });
              observer.unobserve(entry.target);
          }
      });
  }, observerOptions);

  document.querySelectorAll('.animate-in').forEach((el) => observer.observe(el));

  // Отправка формы лида
  const form = document.getElementById('lead-form');
  const toast = document.getElementById('form-toast');
  const submitBtn = document.getElementById('submit-btn');

  if (form && toast) {
      form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const data = Object.fromEntries(formData);

          submitBtn.disabled = true;
          submitBtn.textContent = 'Отправка...';

          try {
              const response = await fetch('/api/lead', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams(data),
              });

              const result = await response.json().catch(() => ({}));

              if (response.ok) {
                  showToast(toast, result.message || 'Заявка успешно отправлена!', 'success');
                  form.reset();
              } else {
                  const errMsg = Array.isArray(result.detail)
                      ? result.detail.map((d) => d.msg || d.loc?.join('.')).join(', ')
                      : result.detail?.msg || result.detail || 'Ошибка отправки';
                  showToast(toast, errMsg, 'error');
              }
          } catch (err) {
              showToast(toast, 'Ошибка сети. Проверьте подключение.', 'error');
          } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Оставить заявку';
          }
      });
  }

  // Карусель отзывов с кликами и свайпами
  const carousel = document.querySelector('.reviews__carousel');
  const track = document.querySelector('.reviews__carousel-wrapper');
  const slides = document.querySelectorAll('.review-card');
  const dots = document.querySelectorAll('.reviews__dots .dot');
  const prevBtn = document.querySelector('.slider-arrow--prev');
  const nextBtn = document.querySelector('.slider-arrow--next');

  if (carousel && track && slides.length) {
      let index = 1;
      let touchStartX = 0;
      let touchEndX = 0;

      function update() {
          const trackW = track.offsetWidth;
          if (trackW <= 0) return;

          const isMobile = window.innerWidth <= 768;
          const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

          let cardW, offset;
          const GAP = 20;

          if (isMobile) {
              cardW = trackW * 0.85;
              const sideMargin = (trackW - cardW) / 2;
              offset = index * (cardW + GAP) - sideMargin;
          } else if (isTablet) {
              cardW = (trackW - GAP) / 2;
              offset = (index === 0) ? 0 : (index === slides.length - 1) ? (slides.length - 2) * (cardW + GAP) : (index - 0.5) * (cardW + GAP);
          } else {
              cardW = (trackW - 2 * GAP) / 3;
              offset = index * (cardW + GAP) - (trackW - cardW) / 2;
              const maxOffset = (slides.length * (cardW + GAP)) - trackW - GAP;
              if (offset < 0) offset = 0;
              if (offset > maxOffset) offset = maxOffset;
          }

          slides.forEach((s, i) => {
              s.style.width = `${cardW}px`;
              s.style.minWidth = `${cardW}px`;
              s.classList.toggle('review-card--active', i === index);
          });

          carousel.style.transform = `translateX(${-offset}px)`;
          dots.forEach((d, i) => d.classList.toggle('dot--active', i === index));
      }

      function goTo(i) {
        index = Math.max(0, Math.min(i, slides.length - 1));
        carousel.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        update();
    }

      track.addEventListener('touchstart', (e) => { 
          touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        carousel.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) goTo(index + 1);
            else goTo(index - 1);
        } else {
            goTo(index); 
        }
    }, { passive: true });

      // Кнопки и клики
      slides.forEach((card, i) => {
          card.style.cursor = 'pointer';
          card.addEventListener('click', () => goTo(i));
      });

      prevBtn?.addEventListener('click', () => goTo(index - 1));
      nextBtn?.addEventListener('click', () => goTo(index + 1));
      dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

      window.addEventListener('resize', update);
      setTimeout(update, 100);
  }
});

function showToast(container, message, type = 'success') {
  container.textContent = message;
  container.className = `toast toast--${type} toast--show`;
  setTimeout(() => container.classList.remove('toast--show'), 4000);
}