// hotel-booking-js.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('booking-form');
    const checkInDate = document.getElementById('check-in');
    const checkOutDate = document.getElementById('check-out');
    const roomTypeSelect = document.getElementById('room-type');
    const submitButton = document.querySelector('button[type="submit"]');

    // 設置日期輸入框的最小值為今天
    const today = new Date().toISOString().split('T')[0];
    checkInDate.min = today;
    checkOutDate.min = today;

    // 當入住日期改變時，設置退房日期的最小值
    checkInDate.addEventListener('change', function() {
        checkOutDate.min = this.value;
        if (checkOutDate.value && new Date(checkOutDate.value) <= new Date(this.value)) {
            checkOutDate.value = '';
        }
    });

    // 加載房間類型
    loadRoomTypes();

    // 表單提交處理
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (validateForm()) {
            submitBooking();
        }
    });

    function validateForm() {
        // 檢查所有必填字段是否已填寫
        const requiredFields = form.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                showError(`請填寫 ${field.previousElementSibling.textContent}`);
                field.focus();
                return false;
            }
        }

        // 檢查日期
        if (new Date(checkInDate.value) >= new Date(checkOutDate.value)) {
            showError('退房日期必須在入住日期之後');
            checkOutDate.focus();
            return false;
        }

        // 驗證電子郵件格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailInput = document.getElementById('email');
        if (!emailRegex.test(emailInput.value)) {
            showError('請輸入有效的電子郵件地址');
            emailInput.focus();
            return false;
        }

        // 驗證電話號碼格式（簡單驗證，假設為台灣手機號碼）
        const phoneRegex = /^09\d{8}$/;
        const phoneInput = document.getElementById('phone');
        if (!phoneRegex.test(phoneInput.value)) {
            showError('請輸入有效的手機號碼（格式：09xxxxxxxx）');
            phoneInput.focus();
            return false;
        }

        return true;
    }

    // 自動填充房型（如果從房間頁面跳轉）
    const urlParams = new URLSearchParams(window.location.search);
    const roomType = urlParams.get('room');
    if (roomType) {
        roomTypeSelect.value = roomType;
    }

    function loadRoomTypes() {
        fetch(`${CONFIG.API_URL}/api/rooms`)
            .then(response => response.json())
            .then(rooms => {
                roomTypeSelect.innerHTML = '';
                rooms.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room._id;
                    option.textContent = `${room.type} - $${room.price}/晚`;
                    roomTypeSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('加載房間類型失敗:', error);
                showError('無法加載房間類型，請稍後再試。');
            });
    }

    function submitBooking() {
        const bookingData = {
            roomId: roomTypeSelect.value,
            checkInDate: checkInDate.value,
            checkOutDate: checkOutDate.value,
            guestName: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        submitButton.disabled = true;
        submitButton.textContent = '提交中...';

        fetch(`${CONFIG.API_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('訂房請求失敗');
            }
            return response.json();
        })
        .then(data => {
            showSuccess('訂房成功！我們會盡快與您聯繫確認詳情。');
            setTimeout(() => {
                window.location.href = 'confirmation.html';
            }, 2000);
        })
        .catch(error => {
            console.error('訂房失敗:', error);
            showError('訂房失敗，請稍後再試或聯繫客服。');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = '確認訂房';
        });
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        form.insertBefore(successDiv, form.firstChild);
    }
});