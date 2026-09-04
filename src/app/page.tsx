"use client";

import { useState, useEffect } from "react";
import {
  BarChart2,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Building,
  Clock,
  Award,
  BookOpen,
  Globe,
  Laptop,
  Landmark,
  Heart,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { calcCompletionRate } from "@/lib/kpi";
import indicatorsData from "@/data/indicators.json";
import kpiGroupsData from "@/data/kpi-groups.json";
import unitKPIsData from "@/data/unit-kpis.json";
import unitsData from "@/data/units.json";
import academicYears from "@/data/academic-years.json";
import progressData from "@/data/progress.json";

const groupConfig: Record<
  string,
  { label: string; short: string; icon: any; color: string }
> = {
  grp_dao_tao: {
    label: "Đào tạo & ĐBCLGD",
    short: "Đào tạo",
    icon: BookOpen,
    color: "#00afef",
  },
  grp_khcn: {
    label: "KHCN, ĐMST & SHTT",
    short: "KHCN",
    icon: Award,
    color: "#4caf50",
  },
  grp_doi_ngu: {
    label: "Đội ngũ & PT Giảng viên",
    short: "Đội ngũ",
    icon: Users,
    color: "#ff9800",
  },
  grp_quoc_te: {
    label: "Hợp tác Quốc tế",
    short: "Quốc tế",
    icon: Globe,
    color: "#9c27b0",
  },
  grp_quan_tri: {
    label: "Quản trị & Tài chính",
    short: "Quản trị",
    icon: Landmark,
    color: "#f44336",
  },
  grp_chuyen_so: {
    label: "Chuyển đổi Số",
    short: "CĐS",
    icon: Laptop,
    color: "#00bcd4",
  },
  grp_phuc_vu: {
    label: "Phục vụ Cộng đồng",
    short: "Phục vụ",
    icon: Heart,
    color: "#e91e63",
  },
};

const groupConfigByName: Record<
  string,
  { label: string; short: string; icon: any; color: string }
> = {};
kpiGroupsData.forEach((g) => {
  if (groupConfig[g.id]) groupConfigByName[g.name] = groupConfig[g.id];
});

// Palette biểu đồ theo theme CTU: xanh dương (#1f5ca9) + xanh ngọc (#00afef)
const CTU_BLUE = "#1f5ca9";
const CTU_TEAL = "#00afef";
const chartPalette = [
  CTU_BLUE,
  CTU_TEAL,
  "#174a86",
  "#5b93d1",
  "#66c6ea",
  "#0094cc",
];

const gradeColors: Record<string, string> = {
  "Xuất sắc": "#4caf50",
  Tốt: "#2196f3",
  Đạt: "#ff9800",
  "Cần cải thiện": "#ffc107",
  "Không đạt": "#f44336",
};

const recentActivities = [
  {
    id: 1,
    action: "Cập nhật kết quả",
    kpi: "HPU2-KPI-05",
    user: "Phòng Đào tạo",
    time: "2 giờ trước",
    type: "update",
  },
  {
    id: 2,
    action: "Nộp minh chứng",
    kpi: "HPU2-KPI-13",
    user: "Phòng KHCN",
    time: "3 giờ trước",
    type: "evidence",
  },
  {
    id: 3,
    action: "Duyệt đánh giá",
    kpi: "HPU2-KPI-22",
    user: "Trung tâm CNTT",
    time: "5 giờ trước",
    type: "approve",
  },
  {
    id: 4,
    action: "Yêu cầu chỉnh sửa",
    kpi: "HPU2-KPI-01",
    user: "Phòng TCCB",
    time: "1 ngày trước",
    type: "revision",
  },
  {
    id: 5,
    action: "Phê duyệt kế hoạch",
    kpi: "Kế hoạch Khoa CNTT",
    user: "Ban Giám hiệu",
    time: "2 ngày trước",
    type: "plan",
  },
  {
    id: 6,
    action: "Khóa kết quả",
    kpi: "Đánh giá TT CNTT",
    user: "Hội đồng KPI",
    time: "3 ngày trước",
    type: "lock",
  },
];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const step = Math.max(1, Math.ceil(end / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

export default function DashboardPage() {
  const [selectedYearId, setSelectedYearId] = useState("ay_hpu2_2025_2026");

  // Bản đồ từ id năm học hiển thị (academic-years.json) sang id dữ liệu hiện có
  // trong indicators.json / unit-kpis.json (vẫn dùng ay001/ay002/ay003).
  const yearToData: Record<string, string> = {
    ay_hpu2_2025_2026: "ay002",
    ay_hpu2_2026_2027: "ay003",
  };
  const dataYearId = yearToData[selectedYearId] ?? "ay002";
  const activeYear = academicYears.find((y) => y.id === selectedYearId)!;
  const yearIndicators = indicatorsData.filter(
    (i) => i.academicYearId === dataYearId,
  );
  const yearUnitKPIs = unitKPIsData.filter(
    (u) => u.academicYearId === dataYearId,
  );

  // Dữ liệu progress cũ có thể dùng ID khác với indicator hiện tại.
  // Ưu tiên khớp ID, sau đó khớp theo tên để dashboard luôn hiển thị đúng dữ liệu.
  const schoolProgress = (
    progressData as Array<{
      level: string;
      indicatorId: string;
      indicatorName: string;
      actualValue: number;
    }>
  ).filter((p) => p.level === "school");

  const progressById: Record<string, number> = {};
  const progressByName: Record<string, number> = {};
  schoolProgress.forEach((p) => {
    progressById[p.indicatorId] = p.actualValue;
    progressByName[p.indicatorName] = p.actualValue;
  });

  const indicatorRates = yearIndicators.map((ind) => {
    const actual = progressById[ind.id] ?? progressByName[ind.name] ?? 0;
    const target = ind.targetValue ?? 0;
    const rawRate =
      target > 0
        ? calcCompletionRate(
            actual,
            target,
            ind.direction as "higher_better" | "lower_better",
          )
        : 0;
    return {
      ...ind,
      actual,
      rawRate: Math.round(rawRate),
      displayRate: Math.min(Math.round(rawRate), 120),
    };
  });

  const totalWeight = indicatorRates.reduce((s, i) => s + i.weight, 0);
  const achieved = indicatorRates.filter((i) => i.rawRate >= 100).length;
  const warning = indicatorRates.filter(
    (i) => i.rawRate >= 80 && i.rawRate < 100,
  ).length;
  const notAchieved = indicatorRates.filter((i) => i.rawRate < 80).length;

  const overallRate =
    totalWeight > 0
      ? indicatorRates.reduce(
          (s, i) => s + Math.min(i.rawRate, 120) * i.weight,
          0,
        ) / totalWeight
      : 0;

  // Lĩnh vực được lấy trực tiếp từ các KPI đang hiển thị.
  // Cách này tránh tình trạng categoryId và kpi-groups dùng hai bộ ID khác nhau.
  const categoryIds = [...new Set(indicatorRates.map((i) => i.categoryId))];
  const groupStats = categoryIds
    .map((categoryId, index) => {
      const items = indicatorRates.filter((i) => i.categoryId === categoryId);
      const matchedGroup = kpiGroupsData.find((g) => g.id === categoryId);
      const fallbackConfig = {
        label: matchedGroup?.name || `Lĩnh vực ${index + 1}`,
        short: matchedGroup?.code || `LV ${index + 1}`,
        icon: BarChart2,
        color: [
          "#00afef",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
          "#f44336",
          "#00bcd4",
          "#e91e63",
        ][index % 7],
      };
      const cfg =
        groupConfig[categoryId] ||
        (matchedGroup ? groupConfigByName[matchedGroup.name] : undefined) ||
        fallbackConfig;
      const gw = items.reduce((s, i) => s + i.weight, 0);
      const rate =
        gw > 0
          ? items.reduce((s, i) => s + Math.min(i.rawRate, 120) * i.weight, 0) /
            gw
          : 0;
      return {
        id: categoryId,
        name: cfg.label,
        ...cfg,
        items,
        groupWeight: gw,
        rate: Math.round(rate),
      };
    })
    .filter((g) => g.items.length > 0);

  const pieData = [
    { name: "Đạt", value: achieved, color: CTU_TEAL },
    { name: "Cần cải thiện", value: warning, color: CTU_BLUE },
    { name: "Chưa đạt", value: notAchieved, color: "#174a86" },
  ].filter((d) => d.value > 0);

  const barData = groupStats.map((g, i) => ({
    name: g.short,
    rate: g.rate,
    fill: chartPalette[i % chartPalette.length],
  }));

  const radarData = groupStats.map((g) => ({
    category: g.short,
    "Thực tế": g.rate,
    "Mục tiêu": 100,
  }));

  const warningItems = indicatorRates
    .filter((i) => i.rawRate < 100)
    .sort((a, b) => a.rawRate - b.rawRate)
    .slice(0, 4);

  const typeColors: Record<string, string> = {
    update: "#2196f3",
    evidence: "#4caf50",
    approve: "#4caf50",
    revision: "#ff9800",
    plan: "#9c27b0",
    lock: "#607d8b",
  };

  // --- Heatmap so sánh đơn vị theo lĩnh vực (dùng Danh mục đơn vị HPU2) ---
  // Cột lĩnh vực dùng chung groupStats (category thực tế trong indicators) để
  // giá trị ô khớp đúng categoryId của từng KPI đơn vị, đồng bộ với phần còn lại.
  const heatmapGroups = groupStats.map((g) => ({
    id: g.id,
    name: g.name,
    short: g.short,
  }));

  const typeLabel: Record<string, string> = {
    department: "Phòng",
    faculty: "Khoa",
    research: "Viện",
    center: "Trung tâm",
    division: "Đơn vị khác",
  };
  const typeOrder = ["department", "faculty", "research", "center", "division"];
  const norm = (s: string) => s.trim().toLowerCase();

  const unitKpisByNorm: Record<string, any> = {};
  yearUnitKPIs.forEach((u) => {
    unitKpisByNorm[norm(u.name)] = u;
  });

  const indicatorById: Record<string, any> = {};
  yearIndicators.forEach((i) => {
    indicatorById[i.id] = i;
  });

  const heatmapUnitRows = unitsData
    .filter((u: any) => u.parentId !== null)
    .map((u: any) => {
      const matched = unitKpisByNorm[norm(u.name)];
      const groupRate: Record<string, number | null> = {};
      heatmapGroups.forEach((g) => {
        groupRate[g.id] = null;
      });
      if (matched) {
        const kpis = matched.kpis || [];
        const byGroup: Record<string, { actual: number; target: number }[]> = {};
        kpis.forEach((k: any) => {
          if (!k.indicatorId) return;
          const ind = indicatorById[k.indicatorId];
          if (!ind) return;
          const actual = progressById[ind.id] ?? progressByName[ind.name] ?? 0;
          const target = ind.targetValue ?? k.target ?? 0;
          if (target <= 0) return;
          (byGroup[ind.categoryId] ??= []).push({ actual, target });
        });
        heatmapGroups.forEach((g) => {
          const items = byGroup[g.id] || [];
          if (items.length === 0) return;
          const total = items.reduce((s, i) => s + i.target, 0);
          groupRate[g.id] = Math.round(
            (items.reduce((s, i) => s + Math.min((i.actual / i.target) * 100, 120) * i.target, 0) / total),
          );
        });
      }
      return {
        id: u.id,
        name: u.name,
        type: u.type,
        typeLabel: typeLabel[u.type] || "Khác",
        groupRate,
      };
    })
    .sort((a: any, b: any) => {
      const i = typeOrder.indexOf(a.type);
      const j = typeOrder.indexOf(b.type);
      return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
    });

  const gradeForScore = (score: number) => {
    if (score >= 90) return "Xuất sắc";
    if (score >= 75) return "Tốt";
    if (score >= 60) return "Đạt";
    if (score >= 40) return "Cần cải thiện";
    return "Không đạt";
  };

  const unitRanking = heatmapUnitRows
    .map((unit: any) => {
      const rates = Object.values(unit.groupRate).filter(
        (v): v is number => v !== null,
      ) as number[];
      const score =
        rates.length > 0
          ? Math.round(rates.reduce((s, v) => s + v, 0) / rates.length)
          : null;
      return {
        id: unit.id,
        name: unit.name,
        typeLabel: unit.typeLabel,
        score,
        grade: score === null ? "Chưa có dữ liệu" : gradeForScore(score),
      };
    })
    .sort((a: any, b: any) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });

  const completionStatus = (rate: number) => {
    if (rate >= 100)
      return {
        label: "Đạt",
        color: "text-accent-green",
        badge: "badge-success",
      };
    if (rate >= 80)
      return {
        label: "Cần cải thiện",
        color: "text-accent-yellow",
        badge: "badge-warning",
      };
    return {
      label: "Chưa đạt",
      color: "text-accent-red",
      badge: "badge-danger",
    };
  };

  const healthColor = (rate: number) => {
    if (rate >= 100) return "bg-accent-green";
    if (rate >= 80) return "bg-accent-yellow";
    return "bg-accent-red";
  };

  const sortedIndicators = [...indicatorRates].sort(
    (a, b) => a.rawRate - b.rawRate,
  );

  const unitCount = yearUnitKPIs.length;

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">
            Tổng quan Hệ thống KPI
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-border rounded-lg overflow-hidden">
            {academicYears.map((ay) => (
              <button
                key={ay.id}
                onClick={() => setSelectedYearId(ay.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${selectedYearId === ay.id ? "bg-primary text-white" : "text-text-dark hover:bg-bg-cream"}`}
              >
                {ay.name}
              </button>
            ))}
          </div>
          <a
            href="/api/reports/export?type=dashboard&format=csv"
            className="btn-secondary text-sm flex items-center gap-1"
            download
          >
            Xuất báo cáo
          </a>
          <a href="/kpi/progress" className="btn-primary text-sm">
            Cập nhật KPI
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            label: "Tổng KPI cấp Trường",
            value: indicatorRates.length,
            icon: BarChart2,
            color: "bg-primary",
          },
          {
            label: "KPI đã đạt",
            value: achieved,
            icon: CheckCircle,
            color: "bg-accent-green",
          },
          {
            label: "Cần cải thiện",
            value: warning,
            icon: AlertTriangle,
            color: "bg-accent-yellow",
          },
          {
            label: "KPI chưa đạt",
            value: notAchieved,
            icon: AlertTriangle,
            color: "bg-accent-red",
          },
          {
            label: "Đơn vị tham gia",
            value: unitCount,
            icon: Building,
            color: "bg-primary",
          },
          {
            label: "Điểm tổng thể",
            value: Math.round(overallRate),
            icon: Target,
            color: "bg-primary",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card dashboard-stat-card p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-text-light text-xs font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-heading font-bold text-primary mt-1">
                  {stat.label === "Điểm tổng thể" ? (
                    <>
                      <AnimatedNumber value={stat.value as number} />%
                    </>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} shrink-0`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card dashboard-card dashboard-chart-card p-4 flex flex-col items-center justify-center">
          <h3 className="font-heading font-bold text-sm text-text-dark mb-3 self-start">
            Phân loại KPI
          </h3>
          <div className="relative">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={
                    pieData.length > 0
                      ? pieData
                      : [
                          {
                            name: "Chưa có dữ liệu",
                            value: 1,
                            color: "#e0e0e0",
                          },
                        ]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {(pieData.length > 0
                    ? pieData
                    : [{ name: "Chưa có dữ liệu", value: 1, color: "#e0e0e0" }]
                  ).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} KPI`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-heading font-bold text-primary">
                <AnimatedNumber value={Math.round(overallRate)} />%
              </span>
              <span className="text-[10px] text-text-light mt-0.5">
                hoàn thành
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span>{d.name}</span>
                <span className="font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card dashboard-card dashboard-chart-card p-4 lg:col-span-1">
          <h3 className="font-heading font-bold text-sm text-text-dark mb-3">
            Hoàn thành theo lĩnh vực
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={barData}
              margin={{ top: 0, right: 0, bottom: 0, left: -12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 120]}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v) => [`${v}%`, "Hoàn thành"]} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card dashboard-card dashboard-chart-card p-4">
          <h3 className="font-heading font-bold text-sm text-text-dark mb-3">
            Đa chiều lĩnh vực
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart
              data={radarData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 120]}
                tick={{ fontSize: 9 }}
              />
              <Radar
                name="Mục tiêu"
                dataKey="Mục tiêu"
                stroke="#e0e0e0"
                fill="#e0e0e0"
                fillOpacity={0.1}
              />
              <Radar
                name="Thực tế"
                dataKey="Thực tế"
                stroke="#0d47a1"
                fill="#0d47a1"
                fillOpacity={0.15}
              />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card dashboard-card dashboard-data-card flex flex-col overflow-hidden">
          <div className="card-header shrink-0 flex items-center justify-between">
            <h3 className="text-white">Bảng theo dõi KPI</h3>
            <span className="text-white/80 text-sm">
              {indicatorRates.length} chỉ tiêu
            </span>
          </div>
          <div className="dashboard-card-body p-4 flex-1 min-h-0 overflow-y-auto">
            {groupStats.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.id} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} style={{ color: g.color }} />
                    <span className="text-sm font-medium text-text-dark">
                      {g.label}
                    </span>
                    <span className="text-xs text-text-light">
                      ({g.items.length} KPI · {g.groupWeight}%)
                    </span>
                    <span
                      className={`ml-auto text-xs font-bold ${g.rate >= 100 ? "text-accent-green" : g.rate >= 80 ? "text-accent-yellow" : "text-accent-red"}`}
                    >
                      {g.rate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                    {g.items.map((ind) => (
                      <a
                        key={ind.id}
                        href={`/kpi/progress?indicatorId=${ind.code}`}
                        className={`${healthColor(ind.rawRate)} rounded-lg p-2 text-white hover:brightness-110 transition-all`}
                      >
                        <div className="text-[10px] font-bold opacity-80">
                          {ind.code}
                        </div>
                        <div className="text-sm font-bold">
                          {Math.min(ind.rawRate, 999)}%
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card dashboard-card dashboard-data-card flex flex-col overflow-hidden">
          <div className="card-header shrink-0">
            <h3 className="text-white">Cảnh báo sớm</h3>
          </div>
          <div className="dashboard-card-body p-4 flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-3">
              {warningItems.length === 0 && (
                <p className="text-sm text-text-light text-center py-4">
                  Không có cảnh báo
                </p>
              )}
              {warningItems.map((w) => {
                const st = completionStatus(w.rawRate);
                return (
                  <div
                    key={w.id}
                    className="p-3 bg-bg-cream rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={14} className="text-accent-yellow" />
                      <a
                        href={`/kpi/progress?indicatorId=${w.code}`}
                        className="font-medium text-sm text-primary hover:underline"
                      >
                        {w.code}
                      </a>
                    </div>
                    <p className="text-sm text-text-dark line-clamp-2">
                      {w.name}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-light">
                          Hoàn thành
                        </span>
                        <span className="text-xs font-medium">
                          {w.displayRate}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(w.displayRate, 100)}%`,
                            backgroundColor:
                              w.displayRate >= 80 ? "#ffc107" : "#f44336",
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`badge ${st.badge} text-[10px]`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card dashboard-top-card flex flex-col overflow-hidden">
          <div className="card-header shrink-0">
            <h3 className="text-white">Xếp hạng đơn vị</h3>
          </div>
          <div className="p-4 flex-1 min-h-0" style={{ overflowY: "auto" }}>
            <div className="space-y-3">
              {unitRanking.map((unit, idx) => (
                <div
                  key={unit.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-cream"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx < 3
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-text-light"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <a
                        href="/kpi/evaluation"
                        className="font-medium text-sm text-text-dark hover:text-primary truncate"
                      >
                        {unit.name}
                      </a>
                      {unit.score !== null && (
                        <span
                          className="text-sm font-bold shrink-0 ml-2"
                          style={{
                            color:
                              unit.grade === "Chưa có dữ liệu"
                                ? "#9ca3af"
                                : gradeColors[unit.grade],
                          }}
                        >
                          {unit.score}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="progress-bar flex-1">
                        <div
                          className="progress-fill"
                          style={{
                            width:
                              unit.score === null ? "0%" : `${unit.score}%`,
                            backgroundColor:
                              unit.grade === "Chưa có dữ liệu"
                                ? "#e5e7eb"
                                : gradeColors[unit.grade],
                          }}
                        />
                      </div>
                      <span
                        className="text-xs shrink-0"
                        style={{
                          color:
                            unit.grade === "Chưa có dữ liệu"
                              ? "#9ca3af"
                              : gradeColors[unit.grade],
                        }}
                      >
                        {unit.grade}
                      </span>
                    </div>
                  </div>
                  {unit.score === null && (
                    <span className="text-xs text-text-light ml-1">
                      Chưa có dữ liệu
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card dashboard-top-card flex flex-col overflow-hidden">
          <div className="card-header shrink-0">
            <h3 className="text-white">Hoạt động gần đây</h3>
          </div>
          <div className="p-4 flex-1 min-h-0" style={{ overflowY: "auto" }}>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-bg-cream"
                >
                  <div className="mt-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: typeColors[activity.type] }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={
                          activity.type === "update"
                            ? "/kpi/progress"
                            : activity.type === "evidence"
                              ? "/kpi/evidences"
                              : activity.type === "lock"
                                ? "/kpi/evaluation"
                                : "/kpi/approvals"
                        }
                        className="font-medium text-sm text-text-dark hover:text-primary truncate"
                      >
                        {activity.action}
                      </a>
                      <span className="badge badge-info text-[10px] shrink-0">
                        {activity.kpi}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-light">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card dashboard-table-card flex flex-col overflow-hidden">
        <div className="card-header shrink-0 flex items-center justify-between">
          <h3 className="text-white">Bảng xếp loại KPI cấp Trường</h3>
          <span className="text-white/80 text-sm">
            Sắp xếp theo tỷ lệ hoàn thành
          </span>
        </div>
        <div className="dashboard-table-scroll flex-1 min-h-0 overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã KPI</th>
                <th>Tên KPI</th>
                <th>Lĩnh vực</th>
                <th className="text-right">Chỉ tiêu</th>
                <th className="text-right">Thực tế</th>
                <th className="text-right">Tỷ lệ</th>
                <th className="text-right">Trọng số</th>
                <th className="text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {sortedIndicators.map((kpi) => {
                const st = completionStatus(kpi.rawRate);
                const grp = groupConfig[kpi.categoryId];
                return (
                  <tr key={kpi.id}>
                    <td>
                      <a href={`/kpi/progress?indicatorId=${kpi.code}`}>
                        <span className="badge badge-info hover:bg-primary-light cursor-pointer">
                          {kpi.code}
                        </span>
                      </a>
                    </td>
                    <td
                      className="font-medium max-w-xs truncate"
                      title={kpi.name}
                    >
                      {kpi.name}
                    </td>
                    <td className="text-sm">{grp?.short || kpi.categoryId}</td>
                    <td className="text-right font-mono text-sm">
                      {kpi.targetValue}
                      {kpi.unit}
                    </td>
                    <td className="text-right font-bold font-mono text-sm">
                      {kpi.actual}
                      {kpi.unit}
                    </td>
                    <td className="text-right">
                      <span
                        className={`font-bold font-mono text-sm ${st.color}`}
                      >
                        {kpi.displayRate}%
                      </span>
                    </td>
                    <td className="text-right font-mono text-sm">
                      {kpi.weight}%
                    </td>
                    <td className="text-center">
                      <span className={`badge ${st.badge}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card dashboard-card dashboard-table-card flex flex-col overflow-hidden">
        <div className="card-header shrink-0">
          <h3 className="text-white flex items-center gap-2">
            <Building size={16} /> Heatmap so sánh đơn vị theo lĩnh vực
          </h3>
        </div>
        <div className="dashboard-card-body p-4 flex-1 min-h-0 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Đơn vị</th>
                {heatmapGroups.map((g) => (
                  <th
                    key={g.id}
                    className="text-center py-2 px-3 font-medium text-xs"
                    title={g.name}
                  >
                    {g.short}
                  </th>
                ))}
                <th className="text-center py-2 px-3 font-medium">TB</th>
              </tr>
            </thead>
            <tbody>
              {heatmapUnitRows.map((unit) => {
                const rates = Object.values(unit.groupRate).filter(
                  (v): v is number => v !== null,
                ) as number[];
                const avg =
                  rates.length > 0
                    ? Math.round(rates.reduce((s, v) => s + v, 0) / rates.length)
                    : null;
                return (
                  <tr key={unit.id} className="border-b">
                    <td className="py-2 px-3">
                      <span className="font-medium text-xs">{unit.name}</span>
                      <span className="ml-2 text-[10px] text-text-light">
                        {unit.typeLabel}
                      </span>
                    </td>
                    {heatmapGroups.map((g) => {
                      const v = unit.groupRate[g.id];
                      const bg =
                        v === null
                          ? "bg-gray-50 text-gray-400"
                          : v >= 100
                            ? "bg-green-100 text-green-700"
                            : v >= 80
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-600";
                      return (
                        <td
                          key={g.id}
                          className={`text-center py-2 px-3 text-xs font-medium ${bg}`}
                        >
                          {v === null ? "–" : `${v}%`}
                        </td>
                      );
                    })}
                    <td
                      className={`text-center py-2 px-3 text-xs font-bold ${
                        avg === null
                          ? "text-gray-400"
                          : avg >= 80
                            ? "text-green-600"
                            : avg >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                      }`}
                    >
                      {avg === null ? "–" : `${avg}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
