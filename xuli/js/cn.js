document.addEventListener('DOMContentLoaded', async () => {
    await loadAppointments();

    // Xử lý logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('http://localhost:5000/api/doctor/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = 'login.html';
        });
    }
});

let appointments = [];

async function loadAppointments() {
    try {
        const response = await fetch('http://localhost:5000/api/appointments', {
            credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
            appointments = result.data;
            renderAppointments(appointments);
        }
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        renderAppointments([]);
    }
}

function renderAppointments(list) {
    const tbody = document.querySelector('#appointmentsTable tbody');
    if (!tbody) return;
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chưa có lịch hẹn nào</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(a => `
        <tr data-id="${a.id}">
            <td data-label="Tên bệnh nhân">${a.patient_name}</td>
            <td data-label="SĐT">${a.phone}</td>
            <td data-label="Ngày">${a.date}</td>
            <td data-label="Giờ">${formatTimeForInput(a.time)}</td>
            <td data-label="Ghi chú">${a.note || ''}</td>
            <td data-label="Hành động">
                <button onclick="enableEditAppointment(${a.id})">Sửa</button>
                <button onclick="deleteAppointment(${a.id})">Xóa</button>
            </td>
        </tr>
    `).join('');
}

let sortState = { column: null, asc: true };

function sortAppointments(type) {
    if (sortState.column === type) {
        sortState.asc = !sortState.asc; // Đảo chiều nếu bấm lại cùng cột
    } else {
        sortState.column = type;
        sortState.asc = true; // Mặc định tăng dần khi đổi cột
    }
    let sorted = [...appointments];
    if (type === 'name') {
        sorted.sort((a, b) => sortState.asc
            ? a.patient_name.localeCompare(b.patient_name, 'vi')
            : b.patient_name.localeCompare(a.patient_name, 'vi'));
    } else if (type === 'date') {
        sorted.sort((a, b) => sortState.asc
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date));
    }
    renderAppointments(sorted);
}

// Sắp xếp khi click vào tiêu đề cột
window.setupSortHeaders = function() {
    const nameHeader = document.getElementById('sortByName');
    const dateHeader = document.getElementById('sortByDate');
    if (nameHeader) nameHeader.onclick = () => sortAppointments('name');
    if (dateHeader) dateHeader.onclick = () => sortAppointments('date');
};
document.addEventListener('DOMContentLoaded', window.setupSortHeaders);

window.enableEditAppointment = function(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) {
        alert('Không tìm thấy dòng lịch hẹn!');
        return;
    }
 
    const cells = row.querySelectorAll('td');
    const [name, phone, date, time, note] = Array.from(cells).map(td => td.innerText);

    cells[0].innerHTML = `<input class="edit-name" value="${name}">`;
    cells[1].innerHTML = `<input class="edit-phone" value="${phone}">`;
    cells[2].innerHTML = `<input class="edit-date" type="date" value="${formatDateForInput(date)}">`;
    cells[3].innerHTML = `<input class="edit-time" type="time" value="${formatTimeForInput(time)}">`;
    cells[4].innerHTML = `<input class="edit-note" value="${note}">`;
    cells[5].innerHTML = `
        <button onclick="updateAppointment(${id})">Lưu</button>
        <button onclick="loadAppointments()">Hủy</button>
    `;
};

window.updateAppointment = async function(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const name = row.querySelector('.edit-name').value;
    const phone = row.querySelector('.edit-phone').value;
    const date = row.querySelector('.edit-date').value;
    const time = row.querySelector('.edit-time').value;
    const note = row.querySelector('.edit-note').value;

    try {
        const res = await fetch(`http://localhost:5000/api/appointment/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ patient_name: name, phone, date, time, note })
        });
        const result = await res.json();
        if (result.success) {
            loadAppointments();
        } else {
            alert(result.message || "Cập nhật thất bại!");
        }
    } catch (err) {
        alert("Lỗi kết nối server!");
    }
};
window.deleteAppointment = async function(id) {
    if (confirm('Bạn có chắc muốn xóa lịch hẹn này?')) {
        await fetch(`http://localhost:5000/api/appointment/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        loadAppointments();
    }
};
function formatTimeForInput(timeStr) {
    if (!timeStr) return '';
    // Nếu là "HH:mm:ss" hoặc "H:mm:ss", chỉ lấy HH:mm
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
        // Đảm bảo HH và mm luôn có 2 chữ số
        const hh = parts[0].padStart(2, '0');
        const mm = parts[1].padStart(2, '0');
        return `${hh}:${mm}`;
    }
    return '';
}
function formatDateForInput(dateStr) {
    const d = new Date(dateStr);
    // Lấy yyyy-mm-dd
    return d.toISOString().slice(0, 10);
}
