export interface EvaluationSubTask {
  code: string;
  name: string;
  responsible: string;
  kpiCode: string;
  kpiName: string;
  unit: string;
  target: number | string;
  actual: number | string;
  ratio: number | string;
  status: string;
  evidence: string;
}

export interface EvaluationTask {
  code: string;
  name: string;
  responsible: string;
  kpiCode: string;
  kpiName: string;
  unit: string;
  target: number | string;
  actual: number | string;
  ratio: number | string;
  status: string;
  evidence: string;
  children: EvaluationSubTask[];
}

type Row = [
  string, string, string, string, string,
  string, number | string, number | string, number | string, string, string,
];

const sub = (...rows: Row[]): EvaluationSubTask[] =>
  rows.map(([code, name, responsible, kpiCode, kpiName, unit, target, actual, ratio, status, evidence]) => ({
    code: code.trim(),
    name: name.trim(),
    responsible,
    kpiCode,
    kpiName,
    unit,
    target,
    actual,
    ratio,
    status,
    evidence,
  }));

export const KPI_EVALUATION: EvaluationTask[] = [
  {
    code: '1',
    name: 'Rà soát chuẩn đầu ra các CTĐT theo hướng bổ sung năng lực số, AI, ĐMST',
    responsible: 'Quản lý chương trình đào tạo',
    kpiCode: 'ĐMST01',
    kpiName: 'Số dự án khởi nghiệp sáng tạo, đổi mới sáng tạo hoặc EdTech của giảng viên, sinh viên, học viên, nghiên cứu sinh được hình thành, tuyển chọn, ươm tạo hoặc hỗ trợ trong năm học.',
    unit: '%',
    target: 1,
    actual: 1,
    ratio: 1,
    status: 'ĐẠT',
    evidence: 'Báo cáo rà soát chuẩn đầu ra & danh mục 15 ngành cần cập nhật đã ký số',
    children: sub(
      ['ĐT-01.1', 'Thành lập tổ công tác rà soát CĐR cho 15 CTĐT chính quy', 'Chủ trì: Trần Văn A (Hạn: 2026-08-10)', 'ĐMST01', 'Số dự án khởi nghiệp sáng tạo, đổi mới sáng tạo hoặc EdTech của giảng viên, sinh viên, học viên, nghiên cứu sinh được hình thành, tuyển chọn, ươm tạo hoặc hỗ trợ trong năm học.', '%', 1, 1, 1, 'ĐẠT', 'Quyết định thành lập tổ công tác (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-01.2', 'Xây dựng khung tiêu chuẩn năng lực số, AI làm căn cứ cập nhật', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-15)', 'ĐMST01', 'Số dự án khởi nghiệp sáng tạo, đổi mới sáng tạo hoặc EdTech của giảng viên, sinh viên, học viên, nghiên cứu sinh được hình thành, tuyển chọn, ươm tạo hoặc hỗ trợ trong năm học.', '%', 1, 1, 1, 'ĐẠT', 'Khung tiêu chuẩn năng lực số (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-01.3', 'Thu thập và tổng hợp báo cáo đề xuất sửa đổi từ 13 khoa đào tạo', 'Chủ trì: Lê Văn C (Hạn: 2026-08-25)', 'ĐMST01', 'Số dự án khởi nghiệp sáng tạo, đổi mới sáng tạo hoặc EdTech của giảng viên, sinh viên, học viên, nghiên cứu sinh được hình thành, tuyển chọn, ươm tạo hoặc hỗ trợ trong năm học.', '%', 1, 1, 1, 'ĐẠT', 'Báo cáo tổng hợp ý kiến khoa (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-01.4', 'Trình Hội đồng Khoa học phê duyệt danh mục CTĐT tích hợp số', 'Chủ trì: Trần Văn A (Hạn: 2026-08-30)', 'ĐMST01', 'Số dự án khởi nghiệp sáng tạo, đổi mới sáng tạo hoặc EdTech của giảng viên, sinh viên, học viên, nghiên cứu sinh được hình thành, tuyển chọn, ươm tạo hoặc hỗ trợ trong năm học.', '%', 1, 1, 1, 'ĐẠT', 'Biên bản thông qua danh mục (Duyệt: Hiệu trưởng)'],
    ),
  },
  {
    code: '2',
    name: 'Rà soát, cập nhật đề cương chi tiết học phần học kỳ I hướng tích hợp công nghệ số',
    responsible: 'Quản lý chương trình đào tạo',
    kpiCode: 'ĐT01',
    kpiName: 'Tỷ lệ chương trình đào tạo được rà soát, cập nhật theo hướng tích hợp năng lực số, đổi mới sáng tạo, AI và công nghệ giáo dục đáp ứng Thông tư 54/2026/TT-BGDĐT và Thông tư 56/2026/TT-BGDĐT của Bộ Giáo dục và Đào tạo.',
    unit: '%',
    target: 1,
    actual: 1,
    ratio: 1,
    status: 'ĐẠT',
    evidence: 'Danh mục đề cương HP HK1 rà soát kèm báo cáo tổng hợp',
    children: sub(
      ['ĐT-02.1', 'Ban hành văn bản hướng dẫn các khoa cập nhật đề cương HK1', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-08)', 'ĐT01', 'Tỷ lệ chương trình đào tạo được rà soát, cập nhật theo hướng tích hợp năng lực số, đổi mới sáng tạo, AI và công nghệ giáo dục đáp ứng Thông tư 54/2026/TT-BGDĐT và Thông tư 56/2026/TT-BGDĐT của Bộ Giáo dục và Đào tạo.', '%', 1, 1, 1, 'ĐẠT', 'Hướng dẫn cập nhật đề cương (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-02.2', 'Kiểm duyệt đề cương học phần tích hợp AI, kỹ năng số', 'Chủ trì: Lê Văn C (Hạn: 2026-08-20)', 'ĐT01', 'Tỷ lệ chương trình đào tạo được rà soát, cập nhật theo hướng tích hợp năng lực số, đổi mới sáng tạo, AI và công nghệ giáo dục đáp ứng Thông tư 54/2026/TT-BGDĐT và Thông tư 56/2026/TT-BGDĐT của Bộ Giáo dục và Đào tạo.', '%', 1, 1, 1, 'ĐẠT', 'Danh sách đề cương đã duyệt (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-02.3', 'Đồng bộ đề cương chi tiết đã duyệt lên cổng thông tin', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-25)', 'ĐT01', 'Tỷ lệ chương trình đào tạo được rà soát, cập nhật theo hướng tích hợp năng lực số, đổi mới sáng tạo, AI và công nghệ giáo dục đáp ứng Thông tư 54/2026/TT-BGDĐT và Thông tư 56/2026/TT-BGDĐT của Bộ Giáo dục và Đào tạo.', '%', 1, 0.95, 0.95, 'CHƯA ĐẠT', 'Link cập nhật trên cổng học vụ (Duyệt: Trưởng phòng Đào tạo)'],
    ),
  },
  {
    code: '3',
    name: 'Xác định danh mục học phần triển khai trên hệ thống LMS học kỳ I',
    responsible: 'Quản lý xếp thời khóa biểu',
    kpiCode: 'ĐT02',
    kpiName: 'Tỷ lệ học phần vận hành trên hệ thống LMS có dữ liệu học tập chuẩn theo quy định của Trường.',
    unit: '%',
    target: 0.6,
    actual: 0.65,
    ratio: 1.0833333333333335,
    status: 'ĐẠT',
    evidence: 'Hệ thống LMS ghi nhận 65% học phần có không gian số học tập chuẩn',
    children: sub(
      ['ĐT-03.1', 'Trích xuất danh sách lớp học phần HK1 mở trực tiếp', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-10)', 'ĐT02', 'Tỷ lệ học phần vận hành trên hệ thống LMS có dữ liệu học tập chuẩn theo quy định của Trường.', '%', 1, 1, 1, 'ĐẠT', 'Danh sách lớp học phần xuất từ SIS (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-03.2', 'Khởi tạo lớp học phần ảo và phân quyền giảng viên trên LMS', 'Chủ trì: Hoàng Văn E (Hạn: 2026-08-15)', 'ĐT02', 'Tỷ lệ học phần vận hành trên hệ thống LMS có dữ liệu học tập chuẩn theo quy định của Trường.', '%', 1, 1, 1, 'ĐẠT', 'Danh sách lớp học phần LMS sẵn sàng (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-03.3', 'Hỗ trợ giảng viên tải học liệu số tiêu chuẩn lên hệ thống', 'Chủ trì: Hoàng Văn E (Hạn: 2026-08-25)', 'ĐT02', 'Tỷ lệ học phần vận hành trên hệ thống LMS có dữ liệu học tập chuẩn theo quy định của Trường.', '%', 1, 0.9, 0.9, 'CHƯA ĐẠT', '65% lớp LMS có đủ học liệu chuẩn (Duyệt: Trưởng phòng Đào tạo)'],
    ),
  },
  {
    code: '4',
    name: 'Xét tuyển và tiếp nhận học sinh, sinh viên khóa mới K52 nhập học',
    responsible: 'Tiếp nhận sinh viên nhập học',
    kpiCode: 'TS02',
    kpiName: 'Tỷ lệ thí sinh nhập học thực tế trên tổng số trúng tuyển (giảm tỷ lệ “ảo”).',
    unit: '%',
    target: 0.8,
    actual: 0.835,
    ratio: 1.04375,
    status: 'ĐẠT',
    evidence: 'Hệ thống nhập học trực tuyến ghi nhận 83.5% TS trúng tuyển nhập học',
    children: sub(
      ['ĐT-04.1', 'Cấu hình cổng nhập học trực tuyến K52 trên phần mềm', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-05)', 'TS02', 'Tỷ lệ thí sinh nhập học thực tế trên tổng số trúng tuyển (giảm tỷ lệ “ảo”).', '%', 1, 1, 1, 'ĐẠT', 'Cổng nhập học online hoạt động (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-04.2', 'Tích hợp cổng thanh toán trực tuyến lệ phí nhập học', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-12)', 'TS02', 'Tỷ lệ thí sinh nhập học thực tế trên tổng số trúng tuyển (giảm tỷ lệ “ảo”).', '%', 1, 1, 1, 'ĐẠT', 'API gạch nợ học phí tự động liên thông (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-04.3', 'Hỗ trợ kỹ thuật và giải quyết vướng mắc nhập học số', 'Chủ trì: Hoàng Văn E (Hạn: 2026-08-20)', 'TS02', 'Tỷ lệ thí sinh nhập học thực tế trên tổng số trúng tuyển (giảm tỷ lệ “ảo”).', '%', 1, 0.9, 0.9, 'CHƯA ĐẠT', 'Nhật ký hỗ trợ kỹ thuật online (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-04.4', 'Tổng hợp và đối soát số liệu nhập học thực tế', 'Chủ trì: Trần Văn A (Hạn: 2026-08-28)', 'TS02', 'Tỷ lệ thí sinh nhập học thực tế trên tổng số trúng tuyển (giảm tỷ lệ “ảo”).', '%', 1, 1, 1, 'ĐẠT', 'Báo cáo sĩ số K52 thực tế đạt 83.5% (Duyệt: Hiệu trưởng)'],
    ),
  },
  {
    code: '5',
    name: 'Xét tuyển nghiên cứu sinh K16 đợt 2',
    responsible: 'Quản lý kết quả học tập',
    kpiCode: 'TS07',
    kpiName: 'Tốc độ tăng trưởng quy mô tuyển sinh sau đại học (thạc sĩ, tiến sĩ).',
    unit: '%/năm',
    target: 0.05,
    actual: 0.062,
    ratio: 1.24,
    status: 'ĐẠT',
    evidence: 'Quyết định phê duyệt danh sách trúng tuyển NCS K16 đợt 2 tăng 6.2%',
    children: sub(
      ['ĐT-05.1', 'Tiếp nhận hồ sơ dự tuyển NCS K16 trực tuyến', 'Chủ trì: Lê Văn C (Hạn: 2026-08-10)', 'TS07', 'Tốc độ tăng trưởng quy mô tuyển sinh sau đại học (thạc sĩ, tiến sĩ).', '%', 1, 0.95, 0.95, 'CHƯA ĐẠT', 'Hồ sơ số hóa trên phân hệ SĐH (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-05.2', 'Thành lập Hội đồng xét tuyển chuyên môn cho từng ngành', 'Chủ trì: Trần Văn A (Hạn: 2026-08-15)', 'TS07', 'Tốc độ tăng trưởng quy mô tuyển sinh sau đại học (thạc sĩ, tiến sĩ).', '%', 1, 1, 1, 'ĐẠT', 'Quyết định thành lập hội đồng xét tuyển (Duyệt: Hiệu trưởng)'],
      ['ĐT-05.3', 'Tổ chức bảo vệ đề cương nghiên cứu và tổng hợp kết quả', 'Chủ trì: Lê Văn C (Hạn: 2026-08-25)', 'TS07', 'Tốc độ tăng trưởng quy mô tuyển sinh sau đại học (thạc sĩ, tiến sĩ).', '%', 1, 1, 1, 'ĐẠT', 'Biên bản điểm xét tuyển NCS K16 (Duyệt: Hội đồng tuyển sinh)'],
    ),
  },
  {
    code: '6',
    name: 'Nghiên cứu sinh K16 đợt 2 nhập học thực tế',
    responsible: 'Tiếp nhận sinh viên nhập học',
    kpiCode: 'TS02',
    kpiName: 'Tỷ lệ thí sinh nhập học thực tế trên tổng số trúng tuyển (giảm tỷ lệ “ảo”).',
    unit: '%',
    target: 0.8,
    actual: 0.85,
    ratio: 1.0625,
    status: 'ĐẠT',
    evidence: 'Biên bản nhập học thực tế của 17 NCS K16 đợt 2 đạt tỷ lệ 85%',
    children: sub(
      ['ĐT-06.1', 'Hướng dẫn làm thủ tục nhập học và đóng học phí trực tuyến', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-26)', 'TS02', 'Tỷ lệ thí sinh nhập học thực tế trên tổng số trúng tuyển (giảm tỷ lệ “ảo”).', '%', 1, 1, 1, 'ĐẠT', 'Email thông báo nhập học và gạch nợ tự động (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-06.2', 'Thu nhận hồ sơ gốc và bàn giao cho Phòng TCCB', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-30)', 'TS02', 'Tỷ lệ thí sinh nhập học thực tế trên tổng số trúng tuyển (giảm tỷ lệ “ảo”).', '%', 1, 1, 1, 'ĐẠT', 'Biên bản bàn giao hồ sơ NCS (Duyệt: Trưởng phòng TCCB)'],
    ),
  },
  {
    code: '7',
    name: 'Thông báo tuyển sinh đào tạo trình độ tiến sĩ K16 đợt 3',
    responsible: 'Tiếp nhận sinh viên nhập học',
    kpiCode: 'TS01',
    kpiName: 'Tỷ lệ hoàn thành chỉ tiêu tuyển sinh được giao.',
    unit: '%',
    target: 1,
    actual: 1,
    ratio: 1,
    status: 'ĐẠT',
    evidence: 'Thông báo tuyển sinh số 102/TB-ĐHSPHN2 đã phát hành công khai',
    children: sub(
      ['ĐT-07.1', 'Xây dựng dự thảo thông báo tuyển sinh TS K16 đợt 3', 'Chủ trì: Lê Văn C (Hạn: 2026-08-15)', 'TS01', 'Tỷ lệ hoàn thành chỉ tiêu tuyển sinh được giao.', '%', 1, 1, 1, 'ĐẠT', 'Dự thảo thông báo tuyển sinh (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-07.2', 'Trình BGH phê duyệt và phát hành thông báo chính thức', 'Chủ trì: Trần Văn A (Hạn: 2026-08-20)', 'TS01', 'Tỷ lệ hoàn thành chỉ tiêu tuyển sinh được giao.', '%', 1, 1, 1, 'ĐẠT', 'Thông báo tuyển sinh đóng dấu ký số (Duyệt: Hiệu trưởng)'],
    ),
  },
  {
    code: '8',
    name: 'Xét tốt nghiệp cho SV ĐH hệ chính quy đợt tháng 8',
    responsible: 'Quản lý xét tốt nghiệp',
    kpiCode: 'ĐT03',
    kpiName: 'Tỷ lệ sinh viên tốt nghiệp có việc làm, tự tạo việc làm hoặc tiếp tục học tập trong vòng 12 tháng sau tốt nghiệp.',
    unit: '%',
    target: 1,
    actual: 1,
    ratio: 1,
    status: 'ĐẠT',
    evidence: 'Quyết định công nhận tốt nghiệp hệ CQ đợt tháng 8',
    children: sub(
      ['ĐT-08.1', 'Chạy công cụ tự động quét điều kiện tốt nghiệp của sinh viên', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-10)', 'ĐT03', 'Tỷ lệ sinh viên tốt nghiệp có việc làm, tự tạo việc làm hoặc tiếp tục học tập trong vòng 12 tháng sau tốt nghiệp.', '%', 1, 1, 1, 'ĐẠT', 'Danh sách kết xuất đạt chuẩn tích lũy (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-08.2', 'Đối soát chuẩn đầu ra ngoại ngữ, tin học với tổ chức cấp chứng chỉ', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-15)', 'ĐT03', 'Tỷ lệ sinh viên tốt nghiệp có việc làm, tự tạo việc làm hoặc tiếp tục học tập trong vòng 12 tháng sau tốt nghiệp.', '%', 1, 0.9, 0.9, 'CHƯA ĐẠT', 'Báo cáo xác thực văn bằng chứng chỉ số (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-08.3', 'Trình Hội đồng xét tốt nghiệp thông qua quyết định chính thức', 'Chủ trì: Trần Văn A (Hạn: 2026-08-20)', 'ĐT03', 'Tỷ lệ sinh viên tốt nghiệp có việc làm, tự tạo việc làm hoặc tiếp tục học tập trong vòng 12 tháng sau tốt nghiệp.', '%', 1, 1, 1, 'ĐẠT', 'Quyết định tốt nghiệp kèm danh sách SV (Duyệt: Hiệu trưởng)'],
    ),
  },
  {
    code: '9',
    name: 'Xét tốt nghiệp cho học viên cao học đợt tháng 8',
    responsible: 'Quản lý xét tốt nghiệp',
    kpiCode: 'ĐT03',
    kpiName: 'Tỷ lệ sinh viên tốt nghiệp có việc làm, tự tạo việc làm hoặc tiếp tục học tập trong vòng 12 tháng sau tốt nghiệp.',
    unit: '%',
    target: 1,
    actual: 1,
    ratio: 1,
    status: 'ĐẠT',
    evidence: 'Quyết định công nhận tốt nghiệp thạc sĩ đợt tháng 8',
    children: sub(
      ['ĐT-09.1', 'Thu nhận và thẩm định hồ sơ luận văn/đề án thạc sĩ', 'Chủ trì: Lê Văn C (Hạn: 2026-08-12)', 'ĐT03', 'Tỷ lệ sinh viên tốt nghiệp có việc làm, tự tạo việc làm hoặc tiếp tục học tập trong vòng 12 tháng sau tốt nghiệp.', '%', 1, 1, 1, 'ĐẠT', 'Danh sách học viên đủ điều kiện bảo vệ (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-09.2', 'Tổ chức chấm luận văn thạc sĩ và tổng hợp điểm số', 'Chủ trì: Trần Văn A (Hạn: 2026-08-22)', 'ĐT03', 'Tỷ lệ sinh viên tốt nghiệp có việc làm, tự tạo việc làm hoặc tiếp tục học tập trong vòng 12 tháng sau tốt nghiệp.', '%', 1, 0.95, 0.95, 'CHƯA ĐẠT', 'Biên bản điểm chấm Luận văn tốt nghiệp (Duyệt: Hội đồng đánh giá)'],
      ['ĐT-09.3', 'Lập tờ trình công nhận tốt nghiệp và cấp bằng thạc sĩ', 'Chủ trì: Lê Văn C (Hạn: 2026-08-28)', 'ĐT03', 'Tỷ lệ sinh viên tốt nghiệp có việc làm, tự tạo việc làm hoặc tiếp tục học tập trong vòng 12 tháng sau tốt nghiệp.', '%', 1, 1, 1, 'ĐẠT', 'Tờ trình kèm danh sách học viên tốt nghiệp (Duyệt: Hiệu trưởng)'],
    ),
  },
  {
    code: '10',
    name: 'Triển khai kế hoạch công tác kiến tập, thực tập sư phạm (TTSP), thực tập chuyên ngành',
    responsible: 'Quản lý kết quả học tập',
    kpiCode: 'HT02',
    kpiName: 'Số trường phổ thông ký kết/duy trì phối hợp thực chất với các đơn vị đào tạo trong thực hành, thực tập sư phạm, đổi mới phương pháp dạy học, NCKH ứng dụng và chuyển đổi số giáo dục.',
    unit: '%',
    target: 1,
    actual: 1,
    ratio: 1,
    status: 'ĐẠT',
    evidence: 'Kế hoạch TTSP năm học 2026-2027 và danh sách 40 trường liên kết đã ký kết',
    children: sub(
      ['ĐT-10.1', 'Xây dựng kế hoạch khung TTSP và liên hệ các trường phổ thông', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-15)', 'HT02', 'Số trường phổ thông ký kết/duy trì phối hợp thực chất với các đơn vị đào tạo trong thực hành, thực tập sư phạm, đổi mới phương pháp dạy học, NCKH ứng dụng và chuyển đổi số giáo dục.', '%', 1, 1, 1, 'ĐẠT', 'Kế hoạch phối hợp thực tập (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-10.2', 'Tổ chức phân đoàn thực tập và phân công giảng viên hướng dẫn', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-22)', 'HT02', 'Số trường phổ thông ký kết/duy trì phối hợp thực chất với các đơn vị đào tạo trong thực hành, thực tập sư phạm, đổi mới phương pháp dạy học, NCKH ứng dụng và chuyển đổi số giáo dục.', '%', 1, 0.9, 0.9, 'CHƯA ĐẠT', 'Quyết định cử đoàn thực tập của Trường (Duyệt: Hiệu trưởng)'],
      ['ĐT-10.3', 'Ban hành tài liệu hướng dẫn sinh viên rèn luyện nghiệp vụ sư phạm', 'Chủ trì: Lê Văn C (Hạn: 2026-08-28)', 'HT02', 'Số trường phổ thông ký kết/duy trì phối hợp thực chất với các đơn vị đào tạo trong thực hành, thực tập sư phạm, đổi mới phương pháp dạy học, NCKH ứng dụng và chuyển đổi số giáo dục.', '%', 1, 1, 1, 'ĐẠT', 'Sổ tay hướng dẫn thực tập số hóa (Duyệt: Trưởng phòng Đào tạo)'],
    ),
  },
  {
    code: '11',
    name: 'Xét kết quả học tập học kỳ 2 năm học 2025-2026',
    responsible: 'Quản lý kết quả học tập',
    kpiCode: 'ĐT02',
    kpiName: 'Tỷ lệ học phần vận hành trên hệ thống LMS có dữ liệu học tập chuẩn theo quy định của Trường.',
    unit: '%',
    target: 1,
    actual: 1,
    ratio: 1,
    status: 'ĐẠT',
    evidence: 'Bảng điểm tổng hợp học kỳ 2 đã phê duyệt và khóa dữ liệu trên SIS',
    children: sub(
      ['ĐT-11.1', 'Đôn đốc các bộ môn hoàn thành nhập điểm học kỳ 2 trên hệ thống', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-05)', 'ĐT02', 'Tỷ lệ học phần vận hành trên hệ thống LMS có dữ liệu học tập chuẩn theo quy định của Trường.', '%', 1, 1, 1, 'ĐẠT', '100% điểm học phần được nạp lên SIS (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-11.2', 'Chạy tính năng tự động tính điểm trung bình học kỳ và tích lũy', 'Chủ trì: Hoàng Văn E (Hạn: 2026-08-10)', 'ĐT02', 'Tỷ lệ học phần vận hành trên hệ thống LMS có dữ liệu học tập chuẩn theo quy định của Trường.', '%', 1, 0.9, 0.9, 'CHƯA ĐẠT', 'Bảng điểm tổng hợp học kỳ 2 (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-11.3', 'Tổng hợp danh sách sinh viên thuộc diện cảnh báo học vụ', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-15)', 'ĐT02', 'Tỷ lệ học phần vận hành trên hệ thống LMS có dữ liệu học tập chuẩn theo quy định của Trường.', '%', 1, 1, 1, 'ĐẠT', 'Danh sách sinh viên bị cảnh báo học tập (Duyệt: Trưởng phòng Đào tạo)'],
    ),
  },
  {
    code: '12',
    name: 'Tổ chức thi học kỳ phụ bảo đảm đúng quy trình',
    responsible: 'Quản lý kết quả học tập',
    kpiCode: 'ĐBCL09',
    kpiName: 'Tỷ lệ kỳ thi/đánh giá kết thúc học phần được tổ chức trên nền tảng khảo thí số (thi trên máy tính/trực tuyến có giám sát).',
    unit: '%',
    target: 1,
    actual: 1,
    ratio: 1,
    status: 'ĐẠT',
    evidence: 'Báo cáo tổ chức thi học kỳ phụ không có trường hợp vi phạm quy chế',
    children: sub(
      ['ĐT-12.1', 'Tiếp nhận đơn đăng ký học kỳ phụ và phân lớp học trực tuyến', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-08)', 'ĐBCL09', 'Tỷ lệ kỳ thi/đánh giá kết thúc học phần được tổ chức trên nền tảng khảo thí số (thi trên máy tính/trực tuyến có giám sát).', '%', 1, 1, 1, 'ĐẠT', 'Danh sách lớp học kỳ phụ (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-12.2', 'Lập lịch thi và phân công giám thị coi thi học kỳ phụ', 'Chủ trì: Nguyễn Thị B (Hạn: 2026-08-15)', 'ĐBCL09', 'Tỷ lệ kỳ thi/đánh giá kết thúc học phần được tổ chức trên nền tảng khảo thí số (thi trên máy tính/trực tuyến có giám sát).', '%', 1, 0.9, 0.9, 'CHƯA ĐẠT', 'Lịch thi học kỳ phụ trên hệ thống (Duyệt: Trưởng phòng Đào tạo)'],
      ['ĐT-12.3', 'Tổ chức coi thi, quét bài thi trắc nghiệm và nạp điểm lên hệ thống', 'Chủ trì: Phạm Văn D (Hạn: 2026-08-25)', 'ĐBCL09', 'Tỷ lệ kỳ thi/đánh giá kết thúc học phần được tổ chức trên nền tảng khảo thí số (thi trên máy tính/trực tuyến có giám sát).', '%', 1, 1, 1, 'ĐẠT', 'Kết quả thi học kỳ phụ hoàn tất (Duyệt: Trưởng phòng Đào tạo)'],
    ),
  },
];
