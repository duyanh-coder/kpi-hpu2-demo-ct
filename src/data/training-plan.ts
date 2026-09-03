export interface TimetableCell {
  activity: string;
  color?: 'teal' | 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray';
}

export interface UndergraduateWeek {
  week: number;
  range: string;
  k52: string;
  k51: string;
  k50: string;
  k49: string;
}

export interface GraduateWeek {
  week: number;
  range: string;
  k30Dot1: string;
  k30Dot2: string;
  k29: string;
  phd: string;
}

export interface Abbreviation {
  abbr: string;
  full: string;
}

export const UNDERGRADUATE_TIMETABLE: UndergraduateWeek[] = [
  { week: 1, range: '17.8-23.8.2026', k52: '', k51: 'Học HK3', k50: 'Học HK5', k49: 'Học HK7' },
  { week: 2, range: '24.8-30.8', k52: 'Nhập học và SHCD-SV (Dự kiến)', k51: '', k50: '', k49: '' },
  { week: 3, range: '31.8-06.9', k52: '', k51: '', k50: '', k49: '' },
  { week: 4, range: '07.9-13.9', k52: 'Học HK1', k51: '', k50: '', k49: '' },
  { week: 5, range: '14.9-20.9', k52: '', k51: '', k50: '', k49: '' },
  { week: 6, range: '21.9-27.9', k52: '', k51: '', k50: '', k49: '' },
  { week: 7, range: '28.9-04.10', k52: '', k51: '', k50: '', k49: '' },
  { week: 8, range: '05.10-11.10', k52: '', k51: 'KTGHK', k50: 'KTGHK', k49: 'KTGHK' },
  { week: 9, range: '12.10-18.10', k52: '', k51: '', k50: '', k49: '' },
  { week: 10, range: '19.10-25.10', k52: '', k51: '', k50: '', k49: '' },
  { week: 11, range: '26.10-01.11', k52: 'KTGHK', k51: '', k50: '', k49: '' },
  { week: 12, range: '02.11-08.11', k52: 'TTSP (Đợt 1 - 5T)', k51: '', k50: '', k49: '' },
  { week: 13, range: '09.11-15.11', k52: '', k51: '', k50: '', k49: '' },
  { week: 14, range: '16.11-22.11', k52: '', k51: '', k50: '', k49: '' },
  { week: 15, range: '23.11-29.11', k52: '', k51: '', k50: '', k49: '' },
  { week: 16, range: '30.11-06.12', k52: '(15T)', k51: '(15T)', k50: '(15T)', k49: '(15T)' },
  { week: 17, range: '07.12-13.12', k52: '', k51: 'Thi HK3', k50: 'Thi HK5', k49: 'Thi HK7' },
  { week: 18, range: '14.12-20.12', k52: '', k51: '', k50: '', k49: '' },
  { week: 19, range: '21.12-27.12', k52: '(15T)', k51: '(15T)', k50: '', k49: '' },
  { week: 20, range: '28.12.2026-03.01.2027', k52: 'Thi HK1', k51: 'Học HK4', k50: 'Học HK6', k49: 'Học HK8' },
  { week: 21, range: '04.01-10.01', k52: '(15T)', k51: '', k50: '', k49: '' },
  { week: 22, range: '11.01-17.01', k52: '', k51: '', k50: 'Thi HK5', k49: 'HT. NVSP (Theo kế hoạch)' },
  { week: 23, range: '18.01-24.01', k52: 'Học HK2', k51: 'Học HK2', k50: '', k49: '' },
  { week: 24, range: '25.01-31.01', k52: '', k51: '', k50: '', k49: '' },
  { week: 25, range: '01.02-07.02', k52: 'Nghỉ Tết Đinh Mùi (Dự kiến)', k51: '', k50: '', k49: '' },
  { week: 26, range: '08.02-14.02', k52: '', k51: '', k50: '', k49: '' },
  { week: 27, range: '15.02-21.02', k52: 'TTSP (Đợt 2 - 7T)', k51: 'TTCN (Đợt 1 - 5T)', k50: '', k49: '' },
  { week: 28, range: '22.02-28.02', k52: '', k51: '', k50: 'Học HK6', k49: '' },
  { week: 29, range: '01.3-07.3', k52: '', k51: '', k50: '', k49: '' },
  { week: 30, range: '08.3-14.3', k52: '', k51: 'KTGHK', k50: 'KTGHK', k49: 'KTGHK' },
  { week: 31, range: '15.3-21.3', k52: 'Học GDQP&AN (Đợt 1)', k51: '', k50: '', k49: '' },
  { week: 32, range: '22.3-28.3', k52: '', k51: '', k50: 'TTCN (Đợt 2 - 7T)', k49: '' },
  { week: 33, range: '29.3-04.4', k52: 'KTGHK', k51: 'KTGHK', k50: '', k49: '' },
  { week: 34, range: '05.4-11.4', k52: '', k51: '', k50: '', k49: '' },
  { week: 35, range: '12.4-18.4', k52: 'Học GDQP&AN (Đợt 2)', k51: '', k50: 'KTGHK', k49: '' },
  { week: 36, range: '19.4-25.4', k52: '', k51: '', k50: '', k49: '' },
  { week: 37, range: '26.4-02.5', k52: '', k51: '', k50: '', k49: '' },
  { week: 38, range: '03.5-09.5', k52: '', k51: '', k50: '(15T)', k49: 'Bảo vệ KLTN/Thi HK8' },
  { week: 39, range: '10.5-16.5', k52: '', k51: '', k50: 'Thi HK6', k49: 'Bảo vệ KLTN/Thi HK8' },
  { week: 40, range: '17.5-23.5', k52: '', k51: '', k50: 'SHCD-SV', k49: 'Lễ tốt nghiệp' },
  { week: 41, range: '24.5-30.5', k52: '(15T)', k51: '(15T)', k50: '', k49: '' },
  { week: 42, range: '31.5-06.6', k52: 'Thi HK2', k51: 'Thi HK2', k50: '(15T)', k49: '(15T)' },
  { week: 43, range: '07.6-13.6', k52: 'HK2 + DT', k51: 'HK2 + DT (15T)', k50: '', k49: '' },
  { week: 44, range: '14.6-20.6', k52: 'Thi HK4', k51: 'Thi HK4', k50: 'Thi HK6', k49: '' },
  { week: 45, range: '21.6-27.6', k52: '', k51: '', k50: '', k49: '' },
  { week: 46, range: '28.6-04.7', k52: '', k51: '', k50: '', k49: '' },
  { week: 47, range: '05.7-11.7', k52: 'Học HK phụ', k51: '', k50: '', k49: '' },
  { week: 48, range: '12.7-18.7', k52: '', k51: '', k50: '', k49: '' },
  { week: 49, range: '19.7-25.7', k52: '', k51: '', k50: '', k49: '' },
  { week: 50, range: '26.7-01.8', k52: '', k51: '', k50: '', k49: '' },
  { week: 51, range: '02.8-08.8', k52: '', k51: '', k50: '', k49: '' },
  { week: 52, range: '09.8-15.8', k52: 'Thi HK phụ', k51: '', k50: '', k49: '' },
];

export const GRADUATE_TIMETABLE: GraduateWeek[] = [
  { week: 1, range: '17.8-23.8.2026', k30Dot1: 'Học HK1', k30Dot2: '', k29: 'Học HK3', phd: 'Theo KH học tập, NCKH toàn khóa' },
  { week: 2, range: '24.8-30.8', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 3, range: '31.8-06.9', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 4, range: '07.9-13.9', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 5, range: '14.9-20.9', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 6, range: '21.9-27.9', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 7, range: '28.9-04.10', k30Dot1: '', k30Dot2: 'Xét tuyển đợt 2', k29: '', phd: '' },
  { week: 8, range: '05.10-11.10', k30Dot1: 'KTGHK', k30Dot2: '', k29: 'KTGHK', phd: '' },
  { week: 9, range: '12.10-18.10', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 10, range: '19.10-25.10', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 11, range: '26.10-01.11', k30Dot1: '', k30Dot2: 'Nhập học đợt 2', k29: '', phd: '' },
  { week: 12, range: '02.11-08.11', k30Dot1: '', k30Dot2: 'Học HK1', k29: '', phd: '' },
  { week: 13, range: '09.11-15.11', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 14, range: '16.11-22.11', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 15, range: '23.11-29.11', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 16, range: '30.11-06.12', k30Dot1: '15T', k30Dot2: '', k29: '15T', phd: '' },
  { week: 17, range: '07.12-13.12', k30Dot1: 'Thi HK1', k30Dot2: '', k29: 'TQĐC luận văn, đề án', phd: '' },
  { week: 18, range: '14.12-20.12', k30Dot1: 'Học HK2', k30Dot2: '', k29: '', phd: '' },
  { week: 19, range: '21.12-27.12', k30Dot1: '', k30Dot2: 'KTGHK', k29: 'Thi HK3', phd: '' },
  { week: 20, range: '28.12.2026-03.01.2027', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 21, range: '04.01-10.01', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 22, range: '11.01-17.01', k30Dot1: '', k30Dot2: '', k29: '', phd: 'Thực hiện luận văn, đề án tốt nghiệp' },
  { week: 23, range: '18.01-24.01', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 24, range: '25.01-31.01', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 25, range: '01.02-07.02', k30Dot1: 'Nghỉ Tết Đinh Mùi (Dự kiến)', k30Dot2: '', k29: '', phd: '' },
  { week: 26, range: '08.02-14.02', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 27, range: '15.02-21.02', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 28, range: '22.02-28.02', k30Dot1: 'KTGHK', k30Dot2: '', k29: '', phd: 'Thực hiện luận văn, đề án tốt nghiệp' },
  { week: 29, range: '01.3-07.3', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 30, range: '08.3-14.3', k30Dot1: '', k30Dot2: '15T', k29: '', phd: '' },
  { week: 31, range: '15.3-21.3', k30Dot1: '', k30Dot2: 'DT', k29: '', phd: '' },
  { week: 32, range: '22.3-28.3', k30Dot1: '', k30Dot2: 'Thi HK1', k29: '', phd: '' },
  { week: 33, range: '29.3-04.4', k30Dot1: '', k30Dot2: 'Học HK2', k29: '', phd: '' },
  { week: 34, range: '05.4-11.4', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 35, range: '12.4-18.4', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 36, range: '19.4-25.4', k30Dot1: '15T', k30Dot2: '', k29: '', phd: '' },
  { week: 37, range: '26.4-02.5', k30Dot1: 'DT', k30Dot2: '', k29: '', phd: '' },
  { week: 38, range: '03.5-09.5', k30Dot1: 'Thi HK2', k30Dot2: '', k29: '', phd: '' },
  { week: 39, range: '10.5-16.5', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 40, range: '17.5-23.5', k30Dot1: 'KTGHK', k30Dot2: '', k29: '', phd: '' },
  { week: 41, range: '24.5-30.5', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 42, range: '31.5-06.6', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 43, range: '07.6-13.6', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 44, range: '14.6-20.6', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 45, range: '21.6-27.6', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 46, range: '28.6-04.7', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 47, range: '05.7-11.7', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 48, range: '12.7-18.7', k30Dot1: '', k30Dot2: '15T', k29: '', phd: '' },
  { week: 49, range: '19.7-25.7', k30Dot1: '', k30Dot2: 'DT', k29: '', phd: 'Bảo vệ luận văn, đề án tốt nghiệp' },
  { week: 50, range: '26.7-01.8', k30Dot1: '', k30Dot2: 'Thi HK2', k29: '', phd: '' },
  { week: 51, range: '02.8-08.8', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
  { week: 52, range: '09.8-15.8', k30Dot1: '', k30Dot2: '', k29: '', phd: '' },
];

export const UNDERGRAD_ABBREVIATIONS: Abbreviation[] = [
  { abbr: 'HK', full: 'Học kỳ' },
  { abbr: 'DT', full: 'Dự trữ' },
  { abbr: 'TTSP', full: 'Thực tập sư phạm' },
  { abbr: 'TTCN', full: 'Thực tập chuyên ngành' },
  { abbr: 'KLTN', full: 'Khóa luận tốt nghiệp' },
  { abbr: 'GDQP&AN', full: 'Giáo dục quốc phòng và An ninh' },
  { abbr: 'SHCD-SV', full: 'Tuần sinh hoạt Công dân - Học sinh, SV' },
  { abbr: 'HT. NVSP', full: 'Hội thi nghiệp vụ sư phạm cấp trường' },
];

export const UNDERGRAD_NOTES: string[] = [
  'Tuần SHCD-SV: K50, K51 (tuần 1, tuần 2), K52 (tuần 3, tuần 4); KTGHK và HT. NVSP không lấy vào quỹ thời gian học văn hóa.',
  'Học kỳ phụ (nếu tổ chức): Từ tuần 47 đến hết tuần 52; KTGHK học kỳ phụ vào tuần 49.',
  'SV K49 CNKH nghỉ Tết Đinh Mùi theo lịch của doanh nghiệp đến thực tập.',
  'Học GDQP&AN (Đợt 1): Gồm các ngành cử nhân ngoài sư phạm và 04 ngành cử nhân sư phạm (GDMN, GDCD, SP Lịch sử, SP Lịch sử-Địa lý).',
  'Học GDQP&AN (Đợt 2): Gồm các ngành cử nhân sư phạm còn lại (GDTH, SP Hóa học, GDTC, SP Sinh học, SP KHTN, SP Tiếng Anh, SP Toán học, SP Vật lý, SP Tin học).',
  'Năm học 2027 - 2028 bắt đầu từ ngày 16.8.2027.',
];

export const GRAD_ABBREVIATIONS: Abbreviation[] = [
  { abbr: 'NCKH', full: 'Nghiên cứu khoa học' },
  { abbr: 'NCS', full: 'Nghiên cứu sinh' },
  { abbr: 'TQĐC', full: 'Thông qua đề cương' },
];

export const GRAD_NOTES: string[] = [
  'K28 bảo vệ Luận văn, Đề án tốt nghiệp đợt 1 (tháng 7-8/2026), đợt 2 (tháng 9-10/2026).',
  'K29 đợt 1 và đợt 2 bắt đầu HK1 năm học 2026 - 2027 từ ngày 17/8/2025; K29 TQĐC Luận văn, Đề án tốt nghiệp tháng 12/2026.',
  'K29 (ĐHƯD) Thực tập tháng (3-4/2027); K29 bảo vệ Luận văn, Đề án tốt nghiệp đợt 1 tháng (7-8/2027).',
  'K30 đợt 1 nhập học trong Tuần 1 năm học 2026 - 2027; K29, K30 kiểm tra giữa học kỳ (không lấy vào quỹ thời gian học văn hóa).',
  'NCS K15, K16 học các học phần bổ sung (nếu có) thuộc chương trình đào tạo trình độ thạc sĩ cùng với các lớp thạc sĩ tương ứng.',
  'NCS K13, K14, K15, K16 thực hiện kế hoạch học tập, NCKH và viết luận án tiến sĩ theo tiến độ đã đăng ký.',
  'Năm học 2027 - 2028 bắt đầu từ ngày 16/8/2027.',
];
