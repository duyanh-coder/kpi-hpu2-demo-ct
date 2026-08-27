export const dashboardFieldCompletion = [
  { field: "Đào tạo", total: 12, completed: 8, inProgress: 3, delayed: 1, rate: 67 },
  { field: "Quản trị", total: 9, completed: 6, inProgress: 2, delayed: 1, rate: 67 },
  { field: "Chuyển đổi số", total: 8, completed: 5, inProgress: 2, delayed: 1, rate: 63 },
  { field: "Bảo đảm chất lượng", total: 7, completed: 5, inProgress: 2, delayed: 0, rate: 71 },
  { field: "Khoa học & ĐMST", total: 6, completed: 3, inProgress: 3, delayed: 0, rate: 50 },
  { field: "Hợp tác & phục vụ", total: 5, completed: 2, inProgress: 2, delayed: 1, rate: 40 },
];

export const dashboardMultidimensional = [
  { key: "Tiến độ", value: 72 },
  { key: "Chất lượng", value: 78 },
  { key: "Đúng hạn", value: 69 },
  { key: "Minh chứng", value: 74 },
  { key: "Phối hợp", value: 81 },
  { key: "KPI", value: 66 },
];

export const dashboardKpiWatch = [
  { code: "ĐT01", name: "Chuẩn đầu ra và chương trình đào tạo", field: "Đào tạo", target: "100%", actual: "78%", progress: 78, status: "Đang thực hiện" },
  { code: "QT01", name: "Kế hoạch triển khai KPI cấp đơn vị", field: "Quản trị", target: "100%", actual: "72%", progress: 72, status: "Đang thực hiện" },
  { code: "QT04", name: "Chuẩn hóa nhiệm vụ theo nguyên tắc 6 rõ", field: "Quản trị", target: "100%", actual: "65%", progress: 65, status: "Cần theo dõi" },
  { code: "CĐS05", name: "Số hóa và kết nối dữ liệu dùng chung", field: "Chuyển đổi số", target: "90%", actual: "72%", progress: 72, status: "Đang thực hiện" },
  { code: "CĐS07", name: "Tỷ lệ tài khoản định danh số", field: "Chuyển đổi số", target: "95%", actual: "100%", progress: 100, status: "Hoàn thành" },
  { code: "ĐBCL07", name: "Chuẩn hóa dữ liệu và minh chứng", field: "Bảo đảm chất lượng", target: "100%", actual: "84%", progress: 84, status: "Đang thực hiện" },
  { code: "HT05", name: "Mô hình hợp tác Trường – Địa phương", field: "Hợp tác & phục vụ", target: "01 mô hình", actual: "35%", progress: 35, status: "Chậm tiến độ" },
];
