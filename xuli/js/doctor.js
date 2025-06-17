document.addEventListener('DOMContentLoaded', loadDoctors);

async function loadDoctors() {
    try {
        const res = await fetch('http://localhost:5000/api/doctors', { credentials: 'include' });
        const result = await res.json();
        const tbody = document.querySelector('#doctorsTable tbody');
        tbody.innerHTML = result.data.map(doctor => `
            <tr data-id="${doctor.id}">
                <td class="doctor-name">${doctor.full_name || ''}</td>
                <td class="doctor-phone">${doctor.phone || ''}</td>
                <td class="doctor-hours">${doctor.working_hours || ''}</td>
                <td>
                    <button onclick="enableEditDoctor(${doctor.id})">Sửa</button>
                    <button onclick="deleteDoctor(${doctor.id})">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Lỗi tải danh sách bác sĩ:', error);
    }
}
document.getElementById('addDoctorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fullName = document.getElementById('newFullName').value;
    const phone = document.getElementById('newPhone').value;
    const working_hours = document.getElementById('newWorkingHours').value;

    await fetch('http://localhost:5000/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ full_name: fullName, phone, working_hours })
    });

    this.reset();
    loadDoctors();
});


window.enableEditDoctor = function(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) {
        alert('Không tìm thấy dòng bác sĩ!');
        return;
    }
    const nameCell = row.querySelector('.doctor-name');
    const phoneCell = row.querySelector('.doctor-phone');
    const hoursCell = row.querySelector('.doctor-hours');
    if (!nameCell || !phoneCell || !hoursCell) {
        alert('Không tìm thấy thông tin bác sĩ!');
        return;
    }
    const name = nameCell.innerText;
    const phone = phoneCell.innerText;
    const hours = hoursCell.innerText;

    nameCell.innerHTML = `<input class="edit-fullname" value="${name}">`;
    phoneCell.innerHTML = `<input class="edit-phone" value="${phone}">`;
    hoursCell.innerHTML = `<input class="edit-hours" value="${hours}">`;
    row.querySelector('td:last-child').innerHTML = `
        <button onclick="updateDoctor(${id})">Lưu</button>
        <button onclick="loadDoctors()">Hủy</button>
    `;
};

window.updateDoctor = async function(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const full_name = row.querySelector('.edit-fullname').value;
    const phone = row.querySelector('.edit-phone').value;
    const working_hours = row.querySelector('.edit-hours').value;
    await fetch(`http://localhost:5000/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ full_name, phone, working_hours })
    });
    loadDoctors();
};
window.deleteDoctor = async function(id) {
    if (confirm('Bạn có chắc muốn xóa bác sĩ này?')) {
        await fetch(`http://localhost:5000/api/doctors/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        loadDoctors();
    }
}