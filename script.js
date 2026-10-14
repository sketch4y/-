/* ============================================================
   Кругозор — интерактив лендинга
   ============================================================ */
(function () {
  'use strict';

  var PHONE_RAW = '79610166815'; // номер для WhatsApp
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Текущий год в подвале ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  function toggleMenu() {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  if (burger && nav) {
    burger.addEventListener('click', toggleMenu);

    // Закрываем меню при клике по ссылке
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // Закрываем при клике вне меню
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });

    // Закрываем по Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Сбрасываем состояние при переходе на десктоп
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  /* ---------- Тень шапки при прокрутке ---------- */
  var header = document.getElementById('header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  /* ---------- Кнопка «наверх» ---------- */
  var toTop = document.getElementById('toTop');
  function onScrollToTop() {
    if (!toTop) return;
    if (window.scrollY > 520) toTop.removeAttribute('hidden');
    else toTop.setAttribute('hidden', '');
  }
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Плавная прокрутка по якорям ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;

    var target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    var headerH = header ? header.offsetHeight : 0;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 14;

    window.scrollTo({ top: top < 0 ? 0 : top, behavior: REDUCED ? 'auto' : 'smooth' });

    // Обновляем hash без прыжка
    if (history.pushState) history.pushState(null, '', id);

    // Фокус для доступности
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- Анимации появления при прокрутке ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (REDUCED || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement
          ? Array.prototype.slice.call(el.parentElement.children).filter(function (n) {
              return n.classList && n.classList.contains('reveal');
            })
          : [];
        var idx = siblings.indexOf(el);
        var delay = idx > 0 ? Math.min(idx, 5) * 90 : 0;

        setTimeout(function () { el.classList.add('is-visible'); }, delay);
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Фильтрация программ ---------- */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var programCards = Array.prototype.slice.call(document.querySelectorAll('.card--program'));
  var filterNote = document.getElementById('filterNote');

  var CATEGORY_LABEL = {
    all: 'все программы',
    story: 'сказки',
    creative: 'творчество',
    science: 'эксперименты'
  };

  function applyFilter(category) {
    var visible = 0;

    programCards.forEach(function (card) {
      var match = category === 'all' || card.dataset.category === category;
      card.classList.toggle('is-hidden', !match);
      if (match) visible++;
    });

    if (filterNote) {
      if (category === 'all') {
        filterNote.textContent = 'Показаны все программы: ' + visible + '.';
      } else if (visible === 0) {
        filterNote.textContent = 'В этой категории пока нет программ.';
      } else {
        filterNote.textContent =
          'Категория «' + CATEGORY_LABEL[category] + '»: найдено ' + visible + '.';
      }
    }
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.dataset.filter || 'all');
    });
  });

  /* ---------- Выбор программы -> подстановка в форму ---------- */
  var programSelect = document.getElementById('program');
  var form = document.getElementById('requestForm');

  function selectProgram(name) {
    if (!programSelect) return;

    var found = false;
    Array.prototype.forEach.call(programSelect.options, function (opt) {
      if (opt.value === name) { opt.selected = true; found = true; }
    });

    if (!found) {
      var extra = document.createElement('option');
      extra.value = name;
      extra.textContent = name;
      extra.selected = true;
      programSelect.appendChild(extra);
    }

    if (form) {
      var headerH = header ? header.offsetHeight : 0;
      var top = form.getBoundingClientRect().top + window.pageYOffset - headerH - 20;
      window.scrollTo({ top: top < 0 ? 0 : top, behavior: REDUCED ? 'auto' : 'smooth' });

      // Мягко подсвечиваем форму
      form.animate(
        [
          { boxShadow: '0 0 0 0 rgba(255, 205, 61, .0)' },
          { boxShadow: '0 0 0 14px rgba(255, 205, 61, .45)' },
          { boxShadow: '0 0 0 0 rgba(255, 205, 61, .0)' }
        ],
        { duration: REDUCED ? 1 : 1100, easing: 'ease-out' }
      );
    }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.js-choose');
    if (!btn) return;
    selectProgram(btn.dataset.program || '');
  });

  /* ---------- Валидация формы ---------- */
  var nameInput = document.getElementById('name');
  var phoneInput = document.getElementById('phone');
  var commentInput = document.getElementById('comment');

  function setError(input, message) {
    if (!input) return;
    var field = input.closest('.field');
    var errorEl = document.getElementById(input.id + 'Error');
    if (field) field.classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(input) {
    if (!input) return;
    var field = input.closest('.field');
    var errorEl = document.getElementById(input.id + 'Error');
    if (field) field.classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
  }

  function isValidName(value) {
    var v = value.trim();
    if (v.length < 2) return false;
    // буквы (в т.ч. кириллица), пробел, дефис, апостроф
    return /^[A-Za-zА-Яа-яЁё\s\-']+$/.test(v);
  }

  function isValidPhone(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) return true;
    if (digits.length === 10) return true;
    return false;
  }

  // Маска-подсказка набора номера
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      if (this.closest('.field').classList.contains('has-error')) {
        if (isValidPhone(this.value)) clearError(this);
      }
    });
  }

  if (nameInput) {
    nameInput.addEventListener('input', function () {
      if (this.closest('.field').classList.contains('has-error') && isValidName(this.value)) {
        clearError(this);
      }
    });
  }

  function validateForm() {
    var ok = true;
    clearError(nameInput);
    clearError(phoneInput);

    if (!nameInput || !isValidName(nameInput.value)) {
      setError(nameInput, 'Пожалуйста, укажите имя (минимум 2 буквы).');
      ok = false;
    }

    if (!phoneInput || !isValidPhone(phoneInput.value)) {
      setError(phoneInput, 'Укажите корректный номер телефона.');
      ok = false;
    }

    if (!ok && nameInput && !isValidName(nameInput.value)) {
      nameInput.focus();
    } else if (!ok && phoneInput) {
      phoneInput.focus();
    }

    return ok;
  }

  /* ---------- Отправка заявки в WhatsApp ---------- */
  function buildMessage(data) {
    var lines = [
      'Здравствуйте! Заявка с сайта «Кругозор».',
      '',
      'Имя: ' + data.name,
      'Телефон: ' + data.phone
    ];

    if (data.program) lines.push('Программа: ' + data.program);
    if (data.comment) lines.push('Комментарий: ' + data.comment);

    lines.push('');
    lines.push('Отправлено с сайта детского центра «Кругозор».');

    return lines.join('\n');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateForm()) return;

      var data = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        program: programSelect ? programSelect.value : '',
        comment: commentInput ? commentInput.value.trim() : ''
      };

      var text = encodeURIComponent(buildMessage(data));
      var url = 'https://wa.me/' + PHONE_RAW + '?text=' + text;

      var win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
    });
  }

  /* ---------- Стартовое состояние фильтра ---------- */
  applyFilter('all');

  /* ---------- Скролл-обработчики ---------- */
  function onScroll() {
    onScrollHeader();
    onScrollToTop();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

})();