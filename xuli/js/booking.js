document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bookingForm");
  const messageDiv = document.getElementById("message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Lấy dữ liệu từ form
    const patient_name = form.querySelector('[name="patient_name"]')?.value.trim() || '';
    const phone = form.querySelector('[name="phone"]')?.value.trim() || '';
    const date = form.querySelector('[name="date"]')?.value || '';
    const note = form.querySelector('[name="note"]')?.value.trim() || '';
    const timeInput = form.querySelector('[name="time"]');
    const time = timeInput ? timeInput.value : '';

    const data = { patient_name, phone, date, time, note };

    // Hiển thị trạng thái "Đang gửi dữ liệu..."
    messageDiv.textContent = "Đang đặt lịch";
    messageDiv.style.color = "blue";

    try {
      // Gửi request đến backend Flask
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      // Hiển thị thông báo từ backend
      messageDiv.textContent = result.message;
      messageDiv.style.color = result.success ? "green" : "red";

      // Reset form và cập nhật danh sách nếu thành công
      if (result.success) {
        form.reset();
        fetchAppointments();
      }
    } catch (error) {
      // Xử lý lỗi kết nối
      messageDiv.textContent = "Lỗi kết nối đến server!";
      messageDiv.style.color = "red";
      console.error("Lỗi:", error);
    }
  });

  // Tải danh sách lịch hẹn khi trang vừa load
  fetchAppointments();
});

async function fetchAppointments() {
  try {
    const res = await fetch("http://localhost:5000/api/appointments");
    const result = await res.json();
    if (result.success) {
      renderAppointments(result.data);
    }
  } catch (e) {
    // Xử lý lỗi nếu cần
  }
}

function renderAppointments(list) {
  const container = document.getElementById("appointmentsList");
  if (!container) return;
  if (!list.length) {
    container.innerHTML = "<i>Chưa có lịch hẹn nào.</i>";
    return;
  }
  container.innerHTML = `
    <table border="1" cellpadding="6" style="width:100%;border-collapse:collapse;">
      <tr>
        <th>Họ tên</th>
        <th>Số điện thoại</th>
        <th>Ngày</th>
        <th>Giờ</th>
        <th>Ghi chú</th>
      </tr>
      ${list.map(a => `
        <tr>
          <td>${a.patient_name}</td>
          <td>${a.phone}</td>
          <td>${a.date}</td>
          <td>${a.time || ""}</td>
          <td>${a.note || ""}</td>
        </tr>
      `).join("")}
    </table>
  `;
}