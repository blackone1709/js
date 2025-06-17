document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginMessage = document.getElementById('loginMessage');
    loginMessage.textContent = '';

    try {
        const res = await fetch('http://localhost:5000/api/doctor/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const result = await res.json();
        if (result.success) {
            window.location.href = 'dk.html'; // Chuyển sang trang điều khiển
        } else {
            loginMessage.textContent = result.message || 'Đăng nhập thất bại!';
        }
    } catch (err) {
        loginMessage.textContent = 'Không thể kết nối máy chủ!';
    }
});

document.getElementById('registerDoctorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const full_name = document.getElementById('regFullName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    const res = await fetch('http://localhost:5000/api/doctor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, username, password })
    });
    const result = await res.json();
    document.getElementById('registerMessage').innerText = result.message || (result.success ? "Đăng ký thành công!" : "Đăng ký thất bại!");
});
document.getElementById('showRegisterBtn').onclick = function() {
    document.getElementById('registerModal').style.display = 'flex';
};
document.getElementById('closeRegisterBtn').onclick = function() {
    document.getElementById('registerModal').style.display = 'none';
};
// Đóng popup khi bấm ra ngoài
document.getElementById('registerModal').onclick = function(e) {
    if (e.target === this) this.style.display = 'none';
};
