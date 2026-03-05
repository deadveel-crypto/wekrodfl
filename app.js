// ========================================
// SPDTER Shop - Telegram Mini App
// ========================================

// Конфигурация
const CONFIG = {
    // Замените на ваш API токен CryptoBot (получить: @CryptoBot -> Crypto Pay -> Create App)
    CRYPTO_BOT_TOKEN: '538992:AAMmXcxfIIMfWfJedEGAumtE6zJ0bFufOzu',
    // URL вашего бэкенда для создания инвойсов
    BACKEND_URL: 'https://love333.tw1.su',
    // ID вашего бота для Stars
    BOT_USERNAME: 'erjguierjh9g34jgbot'
};

// Mock Telegram WebApp for local testing
if (!window.Telegram || !window.Telegram.WebApp) {
    window.Telegram = {
        WebApp: {
            ready: function() {},
            expand: function() {},
            enableClosingConfirmation: function() {},
            close: function() { console.log('App closed'); },
            colorScheme: 'dark',
            themeParams: {},
            initDataUnsafe: {
                user: {
                    id: 123456789,
                    first_name: 'Тестовый',
                    last_name: 'Пользователь',
                    username: 'test_user'
                }
            },
            HapticFeedback: {
                impactOccurred: function() {},
                notificationOccurred: function() {},
                selectionChanged: function() {}
            },
            BackButton: {
                onClick: function() {},
                show: function() {},
                hide: function() {}
            },
            sendData: function(data) { console.log('sendData:', data); },
            openInvoice: function(url, callback) {
                console.log('openInvoice:', url);
                if (callback) callback('paid');
            },
            openTelegramLink: function(url) {
                console.log('openTelegramLink:', url);
                window.open(url, '_blank');
            }
        }
    };
    console.log('DEV MODE: Telegram API mocked');
}

const tg = window.Telegram.WebApp;
tg.expand();

// Product Data
const products = {
    1: {
        id: 1,
        icon: '💀',
        title: 'ULTIMATE + STAND HELPER',
        subtitle: 'Лучший на данный момент эмулятор для игры в Standoff 2!',
        price: 1999,
        oldPrice: 3000,
        description: `ULTIMATE + STAND HELPER - ЛУЧШИЙ ЭМУЛЯТОР ДЛЯ КИБЕРСПОРТИВНОЙ ИГРЫ!

СЕНСА КАК В КС! НЕ ПРИВЯЗАНА К ГЕРЦОВКЕ МОНИТОРА!

В настройку входит:

• 4K RTX Графика
• Идеальная сенса
• Уменьшение отдачи
• Уменьшение тряски экрана
• Stable High FPS (360 UNLOCK)
• Ускоренная загрузка эмулятора
• Лучший кфг с хоткеями как в кс
• Кастомное WHITE оформление
• Оптимизация драйверов Windows
• PowerCFG, безопасно разгоняющий пк
• Оптимизация Windows (По выбору)

После покупки вы получаете инструкции по установке`
    },
    2: {
        id: 2,
        icon: '💻',
        title: 'SPDBLUE - Settings SO2',
        subtitle: 'Идеальный кастом по соотношению цена/качество!',
        price: 699,
        oldPrice: 1000,
        description: `SPDBLUE - Эмулятор для стабильной игры, без вылетов!

В настройку входит:

• Стабильный фпс
• Улучшенная сенса
• Плавная картинка при игре
• Ускоренная загрузка эмулятора
• Лучший cfg с хоткеями как в кс
• Кастомное черное оформление
• Оптимизация драйверов Windows
• PowerCFG
• Lite оптимизация Windows

После покупки вы получаете инструкции по установке`
    },
    3: {
        id: 3,
        icon: '⚡',
        title: 'SPD.Lite - Emulator SO2',
        subtitle: 'Кастомный бс БЕЗ ВЫЛЕТОВ со стабильным фпс!',
        price: 299,
        oldPrice: null,
        description: `SPDBLUE.lite - Эмулятор для стабильной игры, без вылетов!

В настройку входит:

• Стабильный фпс
• Сенса лучше, чем в бс 5, LD player
• Плавная картинка при игре
• Кастомное черное оформление

После покупки вы получаете инструкции по установке!`
    },
    4: {
        id: 4,
        icon: 'ITSU',
        title: 'Инвайт в клан ITSU',
        subtitle: 'Элитный клан для настоящих профессионалов SO2!',
        price: 299,
        oldPrice: null,
        isClan: true,
        durations: {
            week: { name: 'Неделя', price: 299 },
            month: { name: 'Месяц', price: 499 },
            forever: { name: 'Навсегда', price: 1499 }
        },
        description: `ЭЛИТНЫЙ КЛАН ITSU

Присоединяйся к одному из лучших кланов SO2!

• Топ клан сервера
• Профессиональные игроки
• Обучение от про-игроков
• Эксклюзивные привилегии
• Розыгрыши скинов
• VIP чат и каналы`
    }
};

// State
let cart = [];
let currentOrderData = null;

// Load cart from localStorage
try {
    const saved = localStorage.getItem('spdter_cart');
    if (saved) cart = JSON.parse(saved);
} catch (e) {
    cart = [];
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    initUser();
    initTabs();
    initProducts();
    initCart();
    initPayment();
    initCrypto();
    initDurationSelectors();
    updateCartBadge();
    
    console.log('App initialized!');
});

// User
function initUser() {
    var user = tg.initDataUnsafe && tg.initDataUnsafe.user;
    var profileName = document.getElementById('profileName');
    var avatarImg = document.getElementById('avatarImg');
    
    if (user) {
        profileName.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        avatarImg.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.first_name) + '&background=00D4AA&color=0A0A0F&size=120&bold=true';
    } else {
        profileName.textContent = 'Гость';
        avatarImg.src = 'https://ui-avatars.com/api/?name=G&background=00D4AA&color=0A0A0F&size=120&bold=true';
    }
    
    var ordersCount = document.getElementById('ordersCount');
    ordersCount.textContent = localStorage.getItem('spdter_orders_count') || '0';
}

// Tabs
function initTabs() {
    var tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tabId = this.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(function(c) {
                c.classList.remove('active');
            });
            
            this.classList.add('active');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

// Products
function initProducts() {
    document.querySelectorAll('.btn-details').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var productId = this.getAttribute('data-product-id');
            openProductModal(productId);
        });
    });
    
    document.querySelectorAll('.btn-cart').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var productId = this.getAttribute('data-product-id');
            addToCart(productId);
        });
    });
}

// Duration selectors
function initDurationSelectors() {
    var radios = document.querySelectorAll('input[name="duration-4"]');
    radios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            var duration = this.value;
            var price = products[4].durations[duration].price;
            document.getElementById('clanPrice').textContent = price + ' ₽';
        });
    });
}

// Product Modal
function openProductModal(productId) {
    var product = products[productId];
    if (!product) return;
    
    document.getElementById('modalIcon').textContent = product.icon;
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalPriceCurrent').textContent = product.price + ' ₽';
    
    var priceOld = document.getElementById('modalPriceOld');
    if (product.oldPrice) {
        priceOld.textContent = product.oldPrice + ' ₽';
        priceOld.style.display = 'inline';
    } else {
        priceOld.style.display = 'none';
    }
    
    document.getElementById('modalBody').innerHTML = '<p class="modal-description">' + product.description + '</p>';
    
    document.getElementById('modalBuyBtn').onclick = function() {
        addToCart(productId);
        closeProductModal();
    };
    
    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Cart
function initCart() {
    document.getElementById('cartBtn').addEventListener('click', function() {
        openCartModal();
    });
    
    document.getElementById('cartModalClose').addEventListener('click', closeCartModal);
    document.getElementById('modalClose').addEventListener('click', closeProductModal);
    
    document.getElementById('cartModal').addEventListener('click', function(e) {
        if (e.target === this) closeCartModal();
    });
    
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) closeProductModal();
    });
    
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        openPaymentModal();
    });
}

function openCartModal() {
    renderCart();
    document.getElementById('cartModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
    document.body.style.overflow = '';
}

function addToCart(productId) {
    var product = products[productId];
    if (!product) return;
    
    var price = product.price;
    var duration = null;
    var durationName = null;
    
    if (product.isClan) {
        var selected = document.querySelector('input[name="duration-' + productId + '"]:checked');
        if (selected) {
            duration = selected.value;
            price = product.durations[duration].price;
            durationName = product.durations[duration].name;
        }
    }
    
    cart.push({
        id: Date.now(),
        productId: parseInt(productId),
        title: product.title,
        icon: product.icon,
        price: price,
        duration: duration,
        durationName: durationName
    });
    
    saveCart();
    updateCartBadge();
    showToast('Товар добавлен в корзину');
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(function(item) {
        return item.id !== itemId;
    });
    saveCart();
    updateCartBadge();
    renderCart();
}

function saveCart() {
    localStorage.setItem('spdter_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    var badge = document.getElementById('cartBadge');
    badge.textContent = cart.length;
    if (cart.length > 0) {
        badge.classList.add('visible');
    } else {
        badge.classList.remove('visible');
    }
}

function renderCart() {
    var cartItems = document.getElementById('cartItems');
    var cartEmpty = document.getElementById('cartEmpty');
    var cartFooter = document.getElementById('cartFooter');
    var cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.classList.add('visible');
        cartFooter.classList.add('hidden');
        return;
    }
    
    cartEmpty.classList.remove('visible');
    cartFooter.classList.remove('hidden');
    
    var total = 0;
    var html = '';
    
    cart.forEach(function(item) {
        total += item.price;
        html += '<div class="cart-item">' +
            '<div class="cart-item-icon">' + item.icon + '</div>' +
            '<div class="cart-item-info">' +
                '<div class="cart-item-name">' + item.title + '</div>' +
                '<div class="cart-item-price">' + item.price + ' ₽</div>' +
                (item.durationName ? '<div class="cart-item-duration">' + item.durationName + '</div>' : '') +
            '</div>' +
            '<button class="cart-item-remove" onclick="removeFromCart(' + item.id + ')">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none">' +
                    '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
                '</svg>' +
            '</button>' +
        '</div>';
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = total + ' ₽';
}

function getCartTotal() {
    var total = 0;
    cart.forEach(function(item) {
        total += item.price;
    });
    return total;
}

// Payment
function initPayment() {
    document.getElementById('paymentModalClose').addEventListener('click', closePaymentModal);
    
    document.getElementById('paymentModal').addEventListener('click', function(e) {
        if (e.target === this) closePaymentModal();
    });
    
    document.getElementById('backToCart').addEventListener('click', function() {
        closePaymentModal();
        openCartModal();
    });
    
    // Telegram Stars
    document.getElementById('payTelegramStars').addEventListener('click', function() {
        payWithTelegramStars();
    });
    
    // Crypto Bot
    document.getElementById('payCryptoBot').addEventListener('click', function() {
        openCryptoModal();
    });
    
    // SBP (disabled)
    document.getElementById('paySBP').addEventListener('click', function() {
        showToast('Временно недоступно');
    });
}

function openPaymentModal() {
    if (cart.length === 0) return;
    
    var total = getCartTotal();
    document.getElementById('paymentAmount').textContent = total + ' ₽';
    
    // Сохраняем данные заказа
    currentOrderData = {
        items: cart.slice(),
        total: total,
        date: new Date().toISOString(),
        orderId: 'ORD-' + Date.now()
    };
    
    closeCartModal();
    document.getElementById('paymentModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// TELEGRAM STARS PAYMENT
// ========================================
function payWithTelegramStars() {
    if (!currentOrderData) return;
    
    showToast('Создаём счёт...');
    
    // Для работы Stars нужен бэкенд!
    // Отправляем данные на бэкенд для создания инвойса
    
    const invoiceData = {
        title: 'Заказ SPDTER Shop',
        description: currentOrderData.items.map(i => i.title).join(', '),
        payload: JSON.stringify({
            orderId: currentOrderData.orderId,
            items: currentOrderData.items.map(i => ({
                productId: i.productId,
                duration: i.duration
            }))
        }),
        // Цена в Stars (примерно 1.3 RUB = 1 Star)
        amount: Math.ceil(currentOrderData.total / 1.3),
        currency: 'XTR' // Telegram Stars
    };
    
    // Вариант 1: Если есть бэкенд - отправляем на него
    /*
    fetch(CONFIG.BACKEND_URL + '/create-stars-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
    })
    .then(r => r.json())
    .then(data => {
        if (data.invoiceLink) {
            tg.openInvoice(data.invoiceLink, function(status) {
                if (status === 'paid') {
                    completeOrder('stars');
                } else if (status === 'cancelled') {
                    showToast('Оплата отменена');
                }
            });
        }
    })
    .catch(err => {
        showToast('Ошибка создания счёта');
        console.error(err);
    });
    */
    
    // Вариант 2: Для демо - отправляем данные боту
    tg.sendData(JSON.stringify({
        action: 'create_stars_invoice',
        ...invoiceData
    }));
    
    showToast('Запрос отправлен боту');
    closePaymentModal();
}

// ========================================
// CRYPTO BOT PAYMENT
// ========================================
function initCrypto() {
    document.getElementById('cryptoModalClose').addEventListener('click', closeCryptoModal);
    
    document.getElementById('cryptoModal').addEventListener('click', function(e) {
        if (e.target === this) closeCryptoModal();
    });
    
    document.getElementById('backToPayment').addEventListener('click', function() {
        closeCryptoModal();
        openPaymentModal();
    });
    
    // Обработчики для выбора крипты
    document.querySelectorAll('.crypto-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var crypto = this.getAttribute('data-crypto');
            payWithCrypto(crypto);
        });
    });
}

function openCryptoModal() {
    closePaymentModal();
    document.getElementById('cryptoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCryptoModal() {
    document.getElementById('cryptoModal').classList.remove('active');
    document.body.style.overflow = '';
}

function payWithCrypto(cryptoAsset) {
    if (!currentOrderData) return;
    
    showToast('Создаём счёт ' + cryptoAsset + '...');
    
    // Конвертация RUB в USD (примерно)
    const amountUSD = (currentOrderData.total / 90).toFixed(2);
    
    const invoiceData = {
        asset: cryptoAsset,
        amount: amountUSD,
        description: 'Заказ SPDTER Shop #' + currentOrderData.orderId,
        hidden_message: 'Спасибо за покупку!',
        paid_btn_name: 'callback',
        paid_btn_url: 'https://t.me/' + CONFIG.BOT_USERNAME,
        payload: currentOrderData.orderId,
        // Время жизни инвойса в секундах (1 час)
        expires_in: 3600
    };
    
    // Отправляем запрос на бэкенд для создания инвойса CryptoBot
    /*
    fetch(CONFIG.BACKEND_URL + '/create-crypto-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
    })
    .then(r => r.json())
    .then(data => {
        if (data.pay_url) {
            // Открываем CryptoBot для оплаты
            tg.openTelegramLink(data.pay_url);
            closeCryptoModal();
            showToast('Переход к оплате...');
        }
    })
    .catch(err => {
        showToast('Ошибка создания счёта');
        console.error(err);
    });
    */
    
    // Для демо - показываем что делать
    console.log('CryptoBot Invoice Data:', invoiceData);
    
    // Отправляем данные боту для создания инвойса
    tg.sendData(JSON.stringify({
        action: 'create_crypto_invoice',
        ...invoiceData
    }));
    
    closeCryptoModal();
    showToast('Запрос отправлен боту');
}

// ========================================
// ORDER COMPLETION
// ========================================
function completeOrder(method) {
    if (!currentOrderData) return;
    
    currentOrderData.method = method;
    
    var orders = [];
    try {
        var saved = localStorage.getItem('spdter_orders');
        if (saved) orders = JSON.parse(saved);
    } catch (e) {}
    
    orders.push(currentOrderData);
    localStorage.setItem('spdter_orders', JSON.stringify(orders));
    localStorage.setItem('spdter_orders_count', orders.length.toString());
    
    cart = [];
    saveCart();
    updateCartBadge();
    
    document.getElementById('ordersCount').textContent = orders.length;
    showToast('Заказ #' + currentOrderData.orderId + ' оформлен!');
    
    currentOrderData = null;
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// Toast
function showToast(message) {
    var toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('visible');
    
    setTimeout(function() {
        toast.classList.remove('visible');
    }, 3000);
}

// Back button
document.getElementById('backBtn').addEventListener('click', function() {
    if (document.getElementById('cryptoModal').classList.contains('active')) {
        closeCryptoModal();
        openPaymentModal();
    } else if (document.getElementById('paymentModal').classList.contains('active')) {
        closePaymentModal();
        openCartModal();
    } else if (document.getElementById('productModal').classList.contains('active')) {
        closeProductModal();
    } else if (document.getElementById('cartModal').classList.contains('active')) {
        closeCartModal();
    }
});

// Make removeFromCart global
window.removeFromCart = removeFromCart;

console.log('Script loaded!');
