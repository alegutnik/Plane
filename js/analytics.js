/* ══════════════════════════════════════════════════════════════
   ANALYTICS — Meta Pixel + Google Analytics 4 + Microsoft Clarity
   ══════════════════════════════════════════════════════════════

   ШАГ 1. Вписать три ID ниже. Пустое значение = счётчик просто
   не запускается, сайт при этом работает как обычно.

     pixelId   — business.facebook.com → Events Manager → Data Sources
     ga4Id     — analytics.google.com  → Admin → Data streams (G-XXXXXXX)
     clarityId — clarity.microsoft.com → Settings → Setup

   ШАГ 2. Цены менять только в PRODUCTS ниже — они же используются
   и на кнопках, и на странице success.html.
   ══════════════════════════════════════════════════════════════ */

var ANALYTICS = {
  pixelId:   '1707079313742412',  // Сайт PLANE
  ga4Id:     'G-4X6089PNX5',      // Сайт PLANE
  clarityId: 'xsmu2j8nfw'         // Сайт PLANE
};

// Единый источник правды по товарам. Ключ используется в
// data-product="..." на кнопках и в success.html?p=<ключ>
//   name  — как товар называется в отчётах Pixel/GA4 (латиницей, без пробелов)
//   label — как он показывается покупателю на странице оплаты
var PRODUCTS = {
  comfort:  { name: 'COMFORT',      label: 'COMFORT',          value: 418, currency: 'EUR' },
  business: { name: 'BUSINESS',     label: 'BUSINESS',         value: 478, currency: 'EUR' },
  first:    { name: 'PERSHYI_KLAS', label: 'ПЕРШИЙ КЛАС',      value: 918, currency: 'EUR' },
  booking:  { name: 'BRON_888',     label: 'Бронювання місця', value: 888, currency: 'UAH' }
};

(function () {
  'use strict';

  var cfg = window.ANALYTICS || {};

  /* ── 1. Loaders ───────────────────────────────────────────── */

  if (cfg.pixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', cfg.pixelId);
    fbq('track', 'PageView');
  }

  if (cfg.ga4Id) {
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.ga4Id;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', cfg.ga4Id);
  }

  if (cfg.clarityId) {
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, 'clarity', 'script', cfg.clarityId);
  }

  /* ── 2. Event helpers ─────────────────────────────────────── */

  // Pixel и GA4 ждут разный формат, поэтому собираем полезную
  // нагрузку под каждый отдельно, из одного описания товара.
  function send(pixelEvent, ga4Event, key, product, extra) {
    var p = product || {};
    var opts = extra || {};

    if (window.fbq) {
      var fbPayload = {
        content_name: p.name,
        content_type: 'product',
        value: p.value,
        currency: p.currency
      };
      if (key) fbPayload.content_ids = [key];
      // eventID передаём только когда он есть — иначе fbq получает лишний аргумент
      if (opts.eventID) fbq('track', pixelEvent, fbPayload, { eventID: opts.eventID });
      else fbq('track', pixelEvent, fbPayload);
    }

    if (window.gtag) {
      var gaPayload = {
        currency: p.currency,
        value: p.value,
        items: [{
          item_id: key,
          item_name: p.name,
          price: p.value,
          quantity: 1
        }]
      };
      if (opts.transactionId) gaPayload.transaction_id = opts.transactionId;
      gtag('event', ga4Event, gaPayload);
    }
  }

  function sendSimple(pixelEvent, ga4Event, params) {
    if (window.fbq) fbq('track', pixelEvent, params || {});
    if (window.gtag) gtag('event', ga4Event, params || {});
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ── 3. Wiring (needs DOM) ────────────────────────────────── */

  function init() {
    var page = document.body.getAttribute('data-page');

    // 3a. Клик по кнопкам: оплата и контакты.
    // Один делегированный обработчик вместо onclick в разметке.
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-track]');
      if (!el) return;

      var type = el.getAttribute('data-track');

      if (type === 'checkout') {
        var key = el.getAttribute('data-product');
        var product = PRODUCTS[key];
        if (product) send('InitiateCheckout', 'begin_checkout', key, product);
      }

      if (type === 'contact') {
        sendSimple('Contact', 'contact', {
          method: el.getAttribute('data-method') || 'telegram'
        });
      }
    });

    // 3b. Просмотр тарифов — считаем только когда блок реально
    // появился на экране, а не при загрузке страницы. Тот же приём,
    // что и для анимаций в main.js.
    var tariffs = document.getElementById('tariffs');
    if (tariffs && 'IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          seen.unobserve(entry.target);
          sendSimple('ViewContent', 'view_item', {
            content_name: 'PLANE_TARIFFS',
            content_type: 'product_group'
          });
        });
      // threshold 0: срабатывает, как только верх блока показался на экране.
      // Долю площади здесь брать нельзя — блок тарифов в разы выше экрана
      // телефона, и любой порог вроде 0.3 не выполнится никогда.
      }, { threshold: 0 });
      seen.observe(tariffs);
    }

    // 3c. Страница успешной оплаты.
    if (page === 'success') handleSuccess();

    // 3d. Страница неуспешной оплаты.
    if (page === 'fail') {
      sendSimple('PaymentFailed', 'payment_failed', {
        content_name: (PRODUCTS[param('p')] || {}).name || 'UNKNOWN'
      });
    }
  }

  function handleSuccess() {
    var key = param('p');
    var product = PRODUCTS[key];
    var status = param('transactionStatus');
    var order = param('orderReference');

    // WayForPay может вернуть на success даже при неуспехе — тогда
    // показываем ошибку и покупку не засчитываем.
    var declined = status && status !== 'Approved';

    var okBlock = document.getElementById('state-success');
    var failBlock = document.getElementById('state-declined');

    if (declined) {
      if (okBlock) okBlock.hidden = true;
      if (failBlock) failBlock.hidden = false;
      sendSimple('PaymentFailed', 'payment_failed', {
        content_name: (product || {}).name || 'UNKNOWN'
      });
      return;
    }

    var lead = document.querySelector('.status-lead');

    if (!product) {
      // Товар неизвестен (параметр ?p= потерялся) — показываем обычное
      // «дякуємо» без строки с тарифом, чтобы не было прочерков.
      if (lead) lead.hidden = true;
      return;
    }

    // Подставляем в текст название тарифа и сумму.
    var nameEl = document.querySelector('[data-fill="product"]');
    var priceEl = document.querySelector('[data-fill="price"]');
    if (nameEl) nameEl.textContent = product.label || product.name;
    if (priceEl) {
      priceEl.textContent = product.currency === 'UAH'
        ? product.value + ' грн'
        : '€' + product.value;
    }

    // Защита от повторной отправки при обновлении страницы.
    var guard = 'purchase_' + (order || key);
    try {
      if (sessionStorage.getItem(guard)) return;
      sessionStorage.setItem(guard, '1');
    } catch (err) { /* приватный режим — просто продолжаем */ }

    send('Purchase', 'purchase', key, product, {
      eventID: order || undefined,
      transactionId: order || undefined
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
