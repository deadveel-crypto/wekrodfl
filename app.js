// ========================================
// SPDTER Shop - Telegram Mini App
// ========================================

// Проверка Telegram WebApp
if (!window.Telegram || !window.Telegram.WebApp) {
    window.Telegram = {
        WebApp: {
            ready: function() {},
            expand: function() {},
            close: function() { console.log('App closed'); },
            sendData: function(data) { 
                console.log('sendData:', data);
                alert('Данные отправлены боту: ' + data);
            },
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
                notificationOccurred: function() {}
            }
        }
    };
    console.log('DEV MODE: Telegram API mocked');
}

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ========================================
// ДАННЫЕ ТОВАРОВ
// ========================================
const products = {
    1: {
        id: 1,
        icon: '💀',
        title: 'ULTIMATE + STAND HELPER',
        subtitle: 'Лучший эмулятор для SO2!',
        price: 1999,
        oldPrice: 3000,
        description: `ULTIMATE + STAND HELPER

• 4K RTX Графика
• Идеальная сенса
• Stable High FPS (360 UNLOCK)
• Кастомное WHITE оформление
• Оптимизация Windows`
    },
    2: {
        id: 2,
        icon: '💻',
        title: 'SPDBLUE - Settings SO2',
        subtitle: 'Идеальный кастом!',
        price: 699,
        oldPrice: 1000,
        description: `SPDBLUE - Эмулятор без вылетов!

• Стабильный фпс
• Улучшенная сенса
• Плавная картинка
• Кастомное оформление`
    },
    3: {
        id: 3,
        icon: '⚡',
        title: 'SPD.Lite - Emulator SO2',
        subtitle: 'Бс БЕЗ ВЫЛЕТОВ!',
        price: 299,
        oldPrice: null,
        description: `SPDBLUE.lite - Стабильная игра!

• Стабильный фпс
• Улучшенная сенса
• Плавная картинка`
    },
    4: {
        id: 4,
        icon: 'ITSU',
        title: 'Инвайт в клан ITSU',
        subtitle: 'Элитный клан SO2!',
        price: 299,
        oldPrice: null,
        isClan: true,
        durations: {
            week: { name: 'Неделя', price: 299 },
            month: { name: 'Месяц', price: 499 },
            forever: { name: 'Навсегда', price: 1499 }
        },
        description: `ЭЛИТНЫЙ КЛАН ITSU

• Топ клан сервера
• Профессиональные игроки
• Эксклюзивные привилегии`
    }
};

// ========================================
// СОСТОЯНИЕ
// ========================================
let cart = [];
let currentOrderData = null;

// Загрузка корзины
try {
    const saved = localStorage.getItem('spdter_cart');
    if (saved) cart = JSON.parse(saved);
} catch (e) {
    cart = [];
}

// ========================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initUser();
    initTabs();
    initProducts();
    initCart();
    initPayment();
    initCrypto();
    initDurationSelectors();
    updateCartBadge();
});

// ========================================
// ПОЛЬЗОВАТЕЛЬ
// ========================================
function initUser() {
    const user = tg.initDataUnsafe && tg.initDataUnsafe.user;
    const profileName = document.getElementById('profileName');
    const avatarImg = document.getElementById('avatarImg');
    
    if (user) {
        profileName.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        avatarImg.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.first_name) + '&background=00D4AA&color=0A0A0F&size=120&bold=true';
    } else {
        profileName.textContent = 'Гость';
        avatarImg.src = 'https://ui-avatars.com/api/?name=G&background=00D4AA&color=0A0A0F&size=120&bold=true';
    }
    
    document.getElementById('ordersCount').textContent = localStorage.getItem('spdter_orders_count') || '0';
}

// ========================================
// ТАБЫ
// ========================================
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

// ========================================
// ТОВАРЫ
// ========================================
function initProducts() {
    document.querySelectorAll('.btn-details').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openProductModal(this.getAttribute('data-product-id'));
        });
    });
    
    document.querySelectorAll('.btn-cart').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            addToCart(this.getAttribute('data-product-id'));
        });
    });
}

function initDurationSelectors() {
    document.querySelectorAll('input[name="duration-4"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            const price = products[4].durations[this.value].price;
            document.getElementById('clanPrice').textContent = price + ' ₽';
        });
    });
}

// ========================================
// МОДАЛКА ТОВАРА
// ========================================
function openProductModal(productId) {
    const product = products[productId];
    if (!product) return;
    
    document.getElementById('modalIcon').textContent = product.icon;
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalPriceCurrent').textContent = product.price + ' ₽';
    
    const priceOld = document.getElementById('modalPriceOld');
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

// ========================================
// КОРЗИНА
// ========================================
function initCart() {
    document.getElementById('cartBtn').addEventListener('click', openCartModal);
    document.getElementById('cartModalClose').addEventListener('click', closeCartModal);
    document.getElementById('modalClose').addEventListener('click', closeProductModal);
    
    document.getElementById('cartModal').addEventListener('click', function(e) {
        if (e.target === this) closeCartModal();
    });
    
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) closeProductModal();
    });
    
    document.getElementById('checkoutBtn').addEventListener('click', openPaymentModal);
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
    const product = products[productId];
    if (!product) return;
    
    let price = product.price;
    let duration = null;
    let durationName = null;
    
    if (product.isClan) {
        const selected = document.querySelector('input[name="duration-' + productId + '"]:checked');
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
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartBadge();
    renderCart();
}

function saveCart() {
    localStorage.setItem('spdter_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    badge.textContent = cart.length;
    badge.classList.toggle('visible', cart.length > 0);
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.classList.add('visible');
        cartFooter.classList.add('hidden');
        return;
    }
    
    cartEmpty.classList.remove('visible');
    cartFooter.classList.remove('hidden');
    
    let total = 0;
    let html = '';
    
    cart.forEach(function(item) {
        total += item.price;
        html += `
            <div class="cart-item">
                <div class="cart-item-icon">${item.icon}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.title}</div>
                    <div class="cart-item-price">${item.price} ₽</div>
                    ${item.durationName ? `<div class="cart-item-duration">${item.durationName}</div>` : ''}
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = total + ' ₽';
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price, 0);
}

// ========================================
// ОПЛАТА
// ========================================
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
    document.getElementById('payTelegramStars').addEventListener('click', payWithStars);
    
    // Crypto Bot
    document.getElementById('payCryptoBot').addEventListener('click', openCryptoModal);
    
    // СБП (недоступно)
    document.getElementById('paySBP').addEventListener('click', function() {
        showToast('Временно недоступно');
    });
}

function openPaymentModal() {
    if (cart.length === 0) return;
    
    const total = getCartTotal();
    document.getElementById('paymentAmount').textContent = total + ' ₽';
    
    // Сохраняем данные заказа
    currentOrderData = {
        order_id: 'ORD-' + Date.now(),
        items: cart.map(item => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            duration: item.duration
        })),
        total_rub: total,
        created_at: new Date().toISOString()
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
// ОПЛАТА TELEGRAM STARS
// ========================================
function payWithStars() {
    if (!currentOrderData) return;
    
    showToast('Создаём счёт...');
    
    // Конвертация RUB в Stars (примерно 1 Star ≈ 1.3-1.5 RUB)
    const starsAmount = Math.ceil(currentOrderData.total_rub / 1.3);
    
    // Отправляем данные боту
    const paymentData = {
        action: 'pay_stars',
        order_id: currentOrderData.order_id,
        items: currentOrderData.items,
        stars_amount: starsAmount,
        total_rub: currentOrderData.total_rub
    };
    
    console.log('Отправка данных боту:', paymentData);
    
    // Отправляем через Telegram WebApp
    tg.sendData(JSON.stringify(paymentData));
    
    // Очищаем корзину
    cart = [];
    saveCart();
    updateCartBadge();
    
    closePaymentModal();
    showToast('Счёт отправлен в чат!');
    
    // Закрываем Mini App через 1.5 сек
    setTimeout(function() {
        tg.close();
    }, 1500);
}

// ========================================
// ОПЛАТА CRYPTO
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
    
    // Обработчики выбора криптовалюты
    document.querySelectorAll('.crypto-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
            payWithCrypto(this.getAttribute('data-crypto'));
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

function payWithCrypto(asset) {
    if (!currentOrderData) return;
    
    showToast('Создаём счёт ' + asset + '...');
    
    // Конвертация RUB в USD (примерно 1 USD ≈ 90-95 RUB)
    const amountUSD = (currentOrderData.total_rub / 92).toFixed(2);
    
    // Отправляем данные боту
    const paymentData = {
        action: 'pay_crypto',
        order_id: currentOrderData.order_id,
        items: currentOrderData.items,
        amount: amountUSD,
        asset: asset,
        total_rub: currentOrderData.total_rub
    };
    
    console.log('Отправка данных боту:', paymentData);
    
    // Отправляем через Telegram WebApp
    tg.sendData(JSON.stringify(paymentData));
    
    // Очищаем корзину
    cart = [];
    saveCart();
    updateCartBadge();
    
    closeCryptoModal();
    showToast('Счёт отправлен в чат!');
    
    // Закрываем Mini App через 1.5 сек
    setTimeout(function() {
        tg.close();
    }, 1500);
}

// ========================================
// TOAST УВЕДОМЛЕНИЕ
// ========================================
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('visible');
    
    setTimeout(function() {
        toast.classList.remove('visible');
    }, 3000);
}

// ========================================
// КНОПКА НАЗАД
// ========================================
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

// Глобальная функция для удаления из корзины
window.removeFromCart = removeFromCart;

console.log('SPDTER Shop loaded!');
