export interface WorkPlanItem {
  code: string;
  name: string;
  chuTri: string;
  han: string;
  phoiHop: string;
  dvt: string;
  chiTieuKH: number | string;
  soLieuTT: number | string;
  tyLeDat: number;
  loai: 'Chung' | 'Riêng';
}

export interface WorkPlanTask {
  code: string;
  name: string;
  orgUnitId: string;
  children: WorkPlanItem[];
}

type RowItem = [string, string, string, string, number | string, number | string, 'Chung' | 'Riêng'];

function computeRatio(kh: number | string, tt: number | string): number {
  const k = typeof kh === 'number' ? kh : parseFloat(String(kh).replace(/[^0-9.]/g, ''));
  const t = typeof tt === 'number' ? tt : parseFloat(String(tt).replace(/[^0-9.]/g, ''));
  if (Number.isNaN(k) || Number.isNaN(t) || k === 0) return 0;
  return t / k;
}

function items(dvt: string, ...rows: RowItem[]): WorkPlanItem[] {
  return rows.map(([code, name, chuTri, phoiHop, chiTieuKH, soLieuTT, loai]) => {
    const m = chuTri.match(/Hạn:\s*([0-9-]+)/);
    return {
      code,
      name,
      chuTri: chuTri.replace(/\(.*/, '').replace('Chủ trì:', '').trim(),
      han: m ? m[1] : '',
      phoiHop,
      dvt,
      chiTieuKH,
      soLieuTT,
      tyLeDat: computeRatio(chiTieuKH, soLieuTT),
      loai,
    };
  });
}

export const WORK_PLAN: WorkPlanTask[] = [
  {
    code: '1',
    name: 'Rà soát chuẩn đầu ra các CTĐT theo hướng bổ sung năng lực số, AI, ĐMST',
    orgUnitId: 'u101',
    children: items('%',
      ['ĐT-01.1', 'Thành lập tổ công tác rà soát CĐR cho 15 CTĐT chính quy', 'Chủ trì: Trần Văn A (Hạn: 2026-08-10)', 'Các khoa đào tạo (13 khoa)', 1, 1, 'Chung'],
      ['ĐT-01.2', 'Xây dựng khung tiêu chuẩn năng lực số, AI làm căn cứ cập nhật', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-15)', 'Các khoa đào tạo (13 khoa)', 1, 1, 'Chung'],
      ['ĐT-01.3', 'Thu thập và tổng hợp báo cáo đề xuất sửa đổi từ 13 khoa đào tạo', 'Chủ trì: Lê Văn C (Hạn: 2026-08-25)', 'Các khoa đào tạo (13 khoa)', 1, 0.85, 'Chung'],
      ['ĐT-01.4', 'Trình Hội đồng Khoa học phê duyệt danh mục CTĐT tích hợp số', 'Chủ trì: Trần Văn A (Hạn: 2026-08-30)', 'Các khoa đào tạo (13 khoa)', 1, 0, 'Chung'],
    ),
  },
  {
    code: '2',
    name: 'Rà soát, cập nhật đề cương chi tiết học phần học kỳ I hướng tích hợp công nghệ số',
    orgUnitId: 'u101',
    children: items('bộ',
      ['ĐT-02.1', 'Ban hành văn bản hướng dẫn các khoa cập nhật đề cương HK1', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-08)', 'Các khoa đào tạo, Trung tâm CNTT', 1, 1, 'Chung'],
      ['ĐT-02.2', 'Kiểm duyệt đề cương học phần tích hợp AI, kỹ năng số', 'Chủ trì: Lê Văn C (Hạn: 2026-08-20)', 'Các khoa đào tạo, Trung tâm CNTT', 120, 96, 'Riêng'],
      ['ĐT-02.3', 'Đồng bộ đề cương chi tiết đã duyệt lên cổng thông tin', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-25)', 'Các khoa đào tạo, Trung tâm CNTT', 120, 96, 'Chung'],
    ),
  },
  {
    code: '3',
    name: 'Xác định danh mục học phần triển khai trên hệ thống LMS học kỳ I',
    orgUnitId: 'u303',
    children: items('lớp',
      ['ĐT-03.1', 'Trích xuất danh sách lớp học phần HK1 mở trực tiếp', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-10)', 'Trung tâm CNTT, SIS/LMS', 1, 1, 'Chung'],
      ['ĐT-03.2', 'Khởi tạo lớp học phần ảo và phân quyền giảng viên trên LMS', 'Chủ trì: Hoàng Văn E (Hạn: 2026-08-15)', 'Trung tâm CNTT, SIS/LMS', 1, 1, 'Chung'],
      ['ĐT-03.3', 'Hỗ trợ giảng viên tải học liệu số tiêu chuẩn lên hệ thống', 'Chủ trì: Hoàng Văn E (Hạn: 2026-08-25)', 'Trung tâm CNTT, SIS/LMS', 150, 132, 'Riêng'],
    ),
  },
  {
    code: '4',
    name: 'Xét tuyển và tiếp nhận học sinh, sinh viên khóa mới K52 nhập học',
    orgUnitId: 'u101',
    children: items('lượt',
      ['ĐT-04.1', 'Cấu hình cổng nhập học trực tuyến K52 trên phần mềm', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-05)', 'Phòng TCCB, Trung tâm CNTT', 1, 1, 'Chung'],
      ['ĐT-04.2', 'Tích hợp cổng thanh toán trực tuyến lệ phí nhập học', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-12)', 'Phòng TCCB, Trung tâm CNTT', 1, 1, 'Chung'],
      ['ĐT-04.3', 'Hỗ trợ kỹ thuật và giải quyết vướng mắc nhập học số', 'Chủ trì: Hoàng Văn E (Hạn: 2026-08-20)', 'Phòng TCCB, Trung tâm CNTT', 200, 178, 'Riêng'],
      ['ĐT-04.4', 'Tổng hợp và đối soát số liệu nhập học thực tế', 'Chủ trì: Trần Văn A (Hạn: 2026-08-28)', 'Phòng TCCB, Trung tâm CNTT', 1, 1, 'Chung'],
    ),
  },
  {
    code: '5',
    name: 'Xét tuyển nghiên cứu sinh K16 đợt 2',
    orgUnitId: 'u101',
    children: items('lượt',
      ['ĐT-05.1', 'Tiếp nhận hồ sơ dự tuyển NCS K16 trực tuyến', 'Chủ trì: Lê Văn C (Hạn: 2026-08-10)', 'Các khoa, Trung tâm Khảo thí & ĐBCLGD', 60, 60, 'Chung'],
      ['ĐT-05.2', 'Thành lập Hội đồng xét tuyển chuyên môn cho từng ngành', 'Chủ trì: Trần Văn A (Hạn: 2026-08-15)', 'Các khoa, Trung tâm Khảo thí & ĐBCLGD', 6, 6, 'Chung'],
      ['ĐT-05.3', 'Tổ chức bảo vệ đề cương nghiên cứu và tổng hợp kết quả', 'Chủ trì: Lê Văn C (Hạn: 2026-08-25)', 'Các khoa, Trung tâm Khảo thí & ĐBCLGD', 42, 40, 'Chung'],
    ),
  },
  {
    code: '6',
    name: 'Nghiên cứu sinh K16 đợt 2 nhập học thực tế',
    orgUnitId: 'u101',
    children: items('lượt',
      ['ĐT-06.1', 'Hướng dẫn làm thủ tục nhập học và đóng học phí trực tuyến', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-26)', 'Phòng TCCB, Trung tâm CNTT', 40, 36, 'Riêng'],
      ['ĐT-06.2', 'Thu nhận hồ sơ gốc và bàn giao cho Phòng TCCB', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-30)', 'Phòng TCCB, Trung tâm CNTT', 40, 36, 'Chung'],
    ),
  },
  {
    code: '7',
    name: 'Thông báo tuyển sinh đào tạo trình độ tiến sĩ K16 đợt 3',
    orgUnitId: 'u101',
    children: items('văn bản',
      ['ĐT-07.1', 'Xây dựng dự thảo thông báo tuyển sinh TS K16 đợt 3', 'Chủ trì: Lê Văn C (Hạn: 2026-08-15)', 'Các khoa, Trung tâm Truyền thông', 1, 1, 'Chung'],
      ['ĐT-07.2', 'Trình BGH phê duyệt và phát hành thông báo chính thức', 'Chủ trì: Trần Văn A (Hạn: 2026-08-20)', 'Các khoa, Trung tâm Truyền thông', 1, 1, 'Chung'],
    ),
  },
  {
    code: '8',
    name: 'Xét tốt nghiệp cho SV ĐH hệ chính quy đợt tháng 8',
    orgUnitId: 'u401',
    children: items('lượt',
      ['ĐT-08.1', 'Chạy công cụ tự động quét điều kiện tốt nghiệp của sinh viên', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-10)', 'Các khoa đào tạo, Trung tâm Khảo thí & ĐBCLGD', 1, 1, 'Chung'],
      ['ĐT-08.2', 'Đối soát chuẩn đầu ra ngoại ngữ, tin học với tổ chức cấp chứng chỉ', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-15)', 'Các khoa đào tạo, Trung tâm Khảo thí & ĐBCLGD', 850, 812, 'Chung'],
      ['ĐT-08.3', 'Trình Hội đồng xét tốt nghiệp thông qua quyết định chính thức', 'Chủ trì: Trần Văn A (Hạn: 2026-08-20)', 'Các khoa đào tạo, Trung tâm Khảo thí & ĐBCLGD', 1, 1, 'Chung'],
    ),
  },
  {
    code: '9',
    name: 'Xét tốt nghiệp cho học viên cao học đợt tháng 8',
    orgUnitId: 'u401',
    children: items('lượt',
      ['ĐT-09.1', 'Thu nhận và thẩm định hồ sơ luận văn/đề án thạc sĩ', 'Chủ trì: Lê Văn C (Hạn: 2026-08-12)', 'Các khoa, Trung tâm Khảo thí & ĐBCLGD', 120, 110, 'Chung'],
      ['ĐT-09.2', 'Tổ chức chấm luận văn thạc sĩ và tổng hợp điểm số', 'Chủ trì: Trần Văn A (Hạn: 2026-08-22)', 'Các khoa, Trung tâm Khảo thí & ĐBCLGD', 110, 110, 'Riêng'],
      ['ĐT-09.3', 'Lập tờ trình công nhận tốt nghiệp và cấp bằng thạc sĩ', 'Chủ trì: Lê Văn C (Hạn: 2026-08-28)', 'Các khoa, Trung tâm Khảo thí & ĐBCLGD', 110, 0, 'Chung'],
    ),
  },
  {
    code: '10',
    name: 'Triển khai kế hoạch công tác kiến tập, thực tập sư phạm (TTSP), thực tập chuyên ngành',
    orgUnitId: 'u101',
    children: items('lượt',
      ['ĐT-10.1', 'Xây dựng kế hoạch khung TTSP và liên hệ các trường phổ thông', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-15)', 'Các trường phổ thông, các khoa đào tạo', 12, 12, 'Chung'],
      ['ĐT-10.2', 'Tổ chức phân đoàn thực tập và phân công giảng viên hướng dẫn', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-22)', 'Các trường phổ thông, các khoa đào tạo', 60, 58, 'Chung'],
      ['ĐT-10.3', 'Ban hành tài liệu hướng dẫn sinh viên rèn luyện nghiệp vụ sư phạm', 'Chủ trì: Lê Văn C (Hạn: 2026-08-28)', 'Các trường phổ thông, các khoa đào tạo', 1, 1, 'Riêng'],
    ),
  },
  {
    code: '11',
    name: 'Xét kết quả học tập học kỳ 2 năm học 2025-2026',
    orgUnitId: 'u101',
    children: items('lượt',
      ['ĐT-11.1', 'Đôn đốc các bộ môn hoàn thành nhập điểm học kỳ 2 trên hệ thống', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-05)', 'Các bộ môn, Trung tâm CNTT', 1, 1, 'Chung'],
      ['ĐT-11.2', 'Chạy tính năng tự động tính điểm trung bình học kỳ và tích lũy', 'Chủ trì: Hoàng Văn E (Hạn: 2026-08-10)', 'Các bộ môn, Trung tâm CNTT', 1, 1, 'Chung'],
      ['ĐT-11.3', 'Tổng hợp danh sách sinh viên thuộc diện cảnh báo học vụ', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-15)', 'Các bộ môn, Trung tâm CNTT', 1, 1, 'Riêng'],
    ),
  },
  {
    code: '12',
    name: 'Tổ chức thi học kỳ phụ bảo đảm đúng quy trình',
    orgUnitId: 'u401',
    children: items('phòng thi',
      ['ĐT-12.1', 'Tiếp nhận đơn đăng ký học kỳ phụ và phân lớp học trực tuyến', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-08)', 'Các khoa đào tạo, Trung tâm Khảo thí & ĐBCLGD', 350, 350, 'Chung'],
      ['ĐT-12.2', 'Lập lịch thi và phân công giám thị coi thi học kỳ phụ', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-15)', 'Các khoa đào tạo, Trung tâm Khảo thí & ĐBCLGD', 30, 30, 'Chung'],
      ['ĐT-12.3', 'Tổ chức coi thi, quét bài thi trắc nghiệm và nạp điểm lên hệ thống', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-25)', 'Các khoa đào tạo, Trung tâm Khảo thí & ĐBCLGD', 30, 30, 'Chung'],
    ),
  },
];
