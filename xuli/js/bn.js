let allPatients = []; // Lưu toàn bộ danh sách để lọc

document.addEventListener('DOMContentLoaded', async function() {
    await loadPatients();

    // Thêm sự kiện tìm kiếm theo SĐT
    const searchInput = document.getElementById('searchPhone');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const keyword = searchInput.value.trim();
            if (!keyword) {
                renderPatients(allPatients);
            } else {
                const filtered = allPatients.filter(p => p.phone.includes(keyword));
                renderPatients(filtered);
            }
        });
    }
});

async function loadPatients() {
    const res = await fetch('http://localhost:5000/api/patients', { credentials: 'include' });
    const result = await res.json();
    allPatients = result.data; // Lưu lại để tìm kiếm
    renderPatients(allPatients);
}

function renderPatients(list) {
    const tbody = document.querySelector('#patientsTable tbody');
    tbody.innerHTML = list.map(p => `
        <tr data-id="${p.id}">
            <td class="name-cell">${p.name}</td>
            <td class="phone-cell">${p.phone}</td>
            <td class="note-cell">${p.note || ''}</td>
            <td>
                <button onclick="enableEdit(${p.id})">Sửa</button>
                <button onclick="deletePatient(${p.id})">Xóa</button>
                <button onclick="showRecords(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Hồ sơ khám</button>
            </td>
        </tr>
    `).join('');
}

window.enableEdit = function(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const nameCell = row.querySelector('.name-cell');
    const phoneCell = row.querySelector('.phone-cell');
    const noteCell = row.querySelector('.note-cell');

    const name = nameCell.innerText;
    const phone = phoneCell.innerText;
    const note = noteCell.innerText;

    nameCell.innerHTML = `<input class="edit-name" data-id="${id}" value="${name}">`;
    phoneCell.innerHTML = `<input class="edit-phone" data-id="${id}" value="${phone}">`;
    noteCell.innerHTML = `<input class="edit-note" data-id="${id}" value="${note}">`;

    const actionCell = row.querySelector('td:last-child');
    actionCell.innerHTML = `
        <button onclick="updatePatient(${id})">Lưu</button>
        <button onclick="loadPatients()">Hủy</button>
    `;
}

window.updatePatient = async function(id) {
    const name = document.querySelector(`.edit-name[data-id="${id}"]`).value;
    const phone = document.querySelector(`.edit-phone[data-id="${id}"]`).value;
    const note = document.querySelector(`.edit-note[data-id="${id}"]`).value;

    await fetch(`http://localhost:5000/api/patient/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, phone, note })
    });

    loadPatients();
}

window.deletePatient = async function(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        await fetch(`http://localhost:5000/api/patient/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        loadPatients();
    }
}

document.getElementById('addPatientForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('newName').value.trim();
    const phone = document.getElementById('newPhone').value.trim();
    const note = document.getElementById('newNote').value.trim();

    if (!name || !phone) {
        alert('Vui lòng nhập đầy đủ họ tên và SĐT!');
        return;
    }

    await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, phone, note })
    });

    this.reset();
    loadPatients();
});

// Hồ sơ khám bệnh & toa thuốc
window.showRecords = async function(patientId, patientName) {
    document.getElementById('recordsModal').style.display = 'block';
    document.getElementById('modalTitle').innerText = 'Hồ sơ khám bệnh: ' + patientName;
    loadRecords(patientId);

    document.getElementById('addRecordForm').onsubmit = async function(e) {
        e.preventDefault();
        await fetch(`http://localhost:5000/api/patient/${patientId}/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                date: document.getElementById('recordDate').value,
                diagnosis: document.getElementById('diagnosis').value,
                note: document.getElementById('recordNote').value
            })
        });
        loadRecords(patientId);
        this.reset();
    }
}
window.loadRecords = async function(patientId) {
    const res = await fetch(`http://localhost:5000/api/patient/${patientId}/records`, { credentials: 'include' });
    const result = await res.json();
    document.getElementById('recordsList').innerHTML = result.data.map(r => `
        <div style="border-bottom:1px solid #eee; margin-bottom:10px;" id="record_${r.id}">
            <b>Ngày:</b> ${r.date} <br>
            <b>Chẩn đoán:</b> ${r.diagnosis} <br>
            <b>Ghi chú:</b> ${r.note}
            <br>
            <button onclick="showPrescriptions(${r.id})">Xem toa thuốc</button>
            <div id="prescriptionsWrap_${r.id}"></div>
        </div>
    `).join('');
}

window.showPrescriptions = async function(medicalRecordId) {
    // Hiển thị danh sách toa thuốc
    const res = await fetch(`http://localhost:5000/api/medical_record/${medicalRecordId}/prescriptions`);
    const result = await res.json();
    const wrap = document.getElementById(`prescriptionsWrap_${medicalRecordId}`);
    wrap.innerHTML = `
        <div>
            <h4>Toa thuốc</h4>
            <div>
                ${
                    result.data.length
                    ? `<table border="1" cellpadding="6">
                        <tr>
                            <th>Ghi chú</th>
                            <th>Thời gian dùng</th>
                            <th>Tần suất</th>
                            <th>Liều lượng</th>
                        </tr>
                        ${result.data.map(p => `
                            <tr>
                                <td>${p.note || ''}</td>
                                <td>${p.duration || ''}</td>
                                <td>${p.frequency || ''}</td>
                                <td>${p.dosage || ''}</td>
                            </tr>
                        `).join('')}
                    </table>`
                    : '<p>Chưa có toa thuốc nào.</p>'
                }
            </div>
            <form onsubmit="return addPrescription(event, ${medicalRecordId})" style="margin-top:10px;">
                <input type="text" name="note" placeholder="Ghi chú" required>
                <input type="text" name="duration" placeholder="Thời gian dùng" required>
                <input type="text" name="frequency" placeholder="Tần suất" required>
                <input type="text" name="dosage" placeholder="Liều lượng" required>
                <button type="submit">Thêm toa thuốc</button>
            </form>
        </div>
    `;
}
window.addPrescription = async function(e, medicalRecordId) {
    e.preventDefault();
    const form = e.target;
    const note = form.note.value;
    const duration = form.duration.value;
    const frequency = form.frequency.value;
    const dosage = form.dosage.value;
    await fetch(`http://localhost:5000/api/medical_record/${medicalRecordId}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, duration, frequency, dosage })
    });
    form.reset();
    showPrescriptions(medicalRecordId);
    return false;
}

window.closeRecordsModal = function() {
    document.getElementById('recordsModal').style.display = 'none';
}

let sortPatientAsc = true;
const nameHeader = document.getElementById('sortByName');
if (nameHeader) {
    nameHeader.addEventListener('click', function() {
        sortPatientAsc = !sortPatientAsc;
        let sorted = [...allPatients];
        sorted.sort((a, b) => sortPatientAsc
            ? a.name.localeCompare(b.name, 'vi')
            : b.name.localeCompare(a.name, 'vi'));
        renderPatients(sorted);
    });
}
async function exportPatientsPDF() {
    const res = await fetch('http://localhost:5000/api/patients', { credentials: 'include' });
    const result = await res.json();

    if (!result.success) {
        alert('Không thể lấy dữ liệu bệnh nhân!');
        return;
    }

    const data = result.data;

    const content = [
        { text: 'BÁO CÁO DANH SÁCH BỆNH NHÂN', style: 'header', alignment: 'center' },
        '\n'
    ];

    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        content.push({ text: `STT: ${i + 1}`, bold: true });
        content.push(`Họ tên: ${p.name}`);
        content.push(`SĐT: ${p.phone}`);
        content.push(`Ghi chú: ${p.note || 'Không có'}`);

        let records = [];
        try {
            const recRes = await fetch(`http://localhost:5000/api/patient/${p.id}/records`, { credentials: 'include' });
            const recResult = await recRes.json();
            if (recResult.success) records = recResult.data;
        } catch (e) {}

        if (records.length > 0) {
            content.push({ text: 'Hồ sơ khám:', bold: true });
            const rows = [['Ngày', 'Chẩn đoán', 'Toa thuốc', 'Ghi chú']];
            for (const r of records) {
                rows.push([
                    new Date(r.date).toLocaleDateString(),
                    r.diagnosis,
                    r.prescription || '',
                    r.note || ''
                ]);
            }
            content.push({
                table: {
                    widths: ['20%', '*', '*', '*'],
                    body: rows
                },
                margin: [0, 0, 0, 10]
            });
        } else {
            content.push('Hồ sơ khám: Không có\n');
        }

        content.push('\n');
    }

    const docDefinition = {
        content: content,
        defaultStyle: {
            font: 'Roboto'
        },
        styles: {
            header: {
                fontSize: 16,
                bold: true
            }
        }
    };

    pdfMake.createPdf(docDefinition).download('bao_cao_benh_nhan.pdf');
}

let currentMedicalRecordId = null; // Gán id hồ sơ khám khi mở chi tiết

// Lấy danh sách toa thuốc
async function loadPrescriptions(medicalRecordId) {
    currentMedicalRecordId = medicalRecordId;
    const res = await fetch(`http://localhost:5000/api/medical_record/${medicalRecordId}/prescriptions`);
    const result = await res.json();
    const listDiv = document.getElementById(`prescriptionsList_${medicalRecordId}`);
    if (!listDiv) return;
    if (!result.data.length) {
        listDiv.innerHTML = '<p>Chưa có toa thuốc nào.</p>';
        return;
    }
    listDiv.innerHTML = `
        <table border="1" cellpadding="6">
            <tr>
                <th>Ghi chú</th>
                <th>Thời gian dùng</th>
                <th>Tần suất</th>
                <th>Liều lượng</th>
            </tr>
            ${result.data.map(p => `
                <tr>
                    <td>${p.note || ''}</td>
                    <td>${p.duration || ''}</td>
                    <td>${p.frequency || ''}</td>
                    <td>${p.dosage || ''}</td>
                </tr>
            `).join('')}
        </table>
    `;
}
