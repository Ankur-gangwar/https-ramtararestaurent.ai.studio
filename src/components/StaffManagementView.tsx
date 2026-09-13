import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  IndianRupee,
  Briefcase,
  X,
  Trash2,
  UserCheck,
  Scan,
  Sparkles,
  Maximize2,
  Eye,
  Heart,
} from 'lucide-react';
import { StaffMember, AttendanceRecord, AttendanceStatus } from '../types';
import { FaceAttendanceScanner } from './FaceAttendanceScanner';
import staffFamilyBg from '../assets/images/staff_family_bg_1788891496170.jpg';

interface StaffManagementViewProps {
  staff: StaffMember[];
  attendance: AttendanceRecord[];
  onAddStaff: (newStaff: StaffMember) => void;
  onUpdateAttendance: (staffId: string, status: AttendanceStatus, method?: 'Face Recognition' | 'Manual', notes?: string, actionType?: 'IN' | 'OUT' | 'MANUAL') => void;
  onDeleteStaff: (staffId: string) => void;
  onEnrollFace?: (staffId: string, photoDataUrl: string) => void;
  lang: 'en' | 'hi';
  userRole?: string;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staff,
  attendance,
  onAddStaff,
  onUpdateAttendance,
  onDeleteStaff,
  onEnrollFace,
  lang,
  userRole,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'directory' | 'faceAttendance'>('attendance');
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Today's date string YYYY-MM-DD
  const todayDateStr = new Date().toISOString().substring(0, 10);

  // New staff form state
  const [staffIdInput, setStaffIdInput] = useState('');
  const [enrollFaceNow, setEnrollFaceNow] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState<StaffMember['designation']>('Waiter');
  const [salary, setSalary] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Metrics
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.employment_status === 'Active');
  const totalPayroll = staff.reduce((sum, s) => sum + s.monthly_salary, 0);

  const todayRecords = attendance.filter((a) => a.log_date === todayDateStr);
  const presentCount = staff.filter((s) => {
    const rec = todayRecords.find((r) => r.staff_id === s.staff_id);
    return rec?.attendance_status === 'Present';
  }).length;

  const lateCount = staff.filter((s) => {
    const rec = todayRecords.find((r) => r.staff_id === s.staff_id);
    return rec?.attendance_status === 'Late';
  }).length;

  const absentCount = staff.filter((s) => {
    const rec = todayRecords.find((r) => r.staff_id === s.staff_id);
    return rec?.attendance_status === 'Absent';
  }).length;

  const filteredStaff = staff.filter((s) => {
    const matchesDes = designationFilter === 'All' || s.designation === designationFilter;
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staff_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile_number.includes(searchQuery);
    return matchesDes && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = fullName.trim();
    const sal = parseFloat(salary);

    if (!name || isNaN(sal) || sal <= 0) {
      setFormError(
        lang === 'hi'
          ? 'कृपया पूरा नाम और मान्य वेतन दर्ज करें।'
          : 'Please enter a valid staff name and monthly salary.'
      );
      return;
    }

    const nextIdNumber = staff.length + 101;
    const generatedStaffId = staffIdInput.trim() || `STF-${nextIdNumber}`;

    onAddStaff({
      staff_id: generatedStaffId,
      full_name: name,
      mobile_number: mobile.trim() || '9999999999',
      home_address: address.trim() || 'Bareilly, UP',
      designation,
      monthly_salary: sal,
      joining_date: todayDateStr,
      employment_status: 'Active',
      face_enrolled: enrollFaceNow,
    });

    setIsAddModalOpen(false);
    setStaffIdInput('');
    setEnrollFaceNow(false);
    setEnrollFaceNow(false);
    setFullName('');
    setMobile('');
    setAddress('');
    setSalary('');
  };

  const getAttendanceBadge = (status?: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return { bg: 'bg-emerald-100 text-emerald-800', label: 'Present' };
      case 'Late':
        return { bg: 'bg-amber-100 text-amber-900', label: 'Late' };
      case 'Half Day':
        return { bg: 'bg-blue-100 text-blue-800', label: 'Half Day' };
      case 'Absent':
        return { bg: 'bg-rose-100 text-rose-800', label: 'Absent' };
      case 'On Leave':
        return { bg: 'bg-purple-100 text-purple-800', label: 'On Leave' };
      default:
        return { bg: 'bg-slate-100 text-slate-600', label: 'Not Logged' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Staff Family Background */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-md border border-slate-800 text-white min-h-[140px] flex flex-col justify-between">
        {/* Background Image with Dark & Amber Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={staffFamilyBg}
            alt="Restaurant Staff Family AI"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-900/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'राम तारा स्टाफ परिवार • Staff Family' : 'Ram Tara Culinary & Floor Family'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow">
              <Users className="w-6 h-6 text-amber-400" />
              <span>{lang === 'hi' ? 'कर्मचारी रोस्टर व उपस्थिति रजिस्टर' : 'Staff Directory & Attendance Tracker'}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 drop-shadow">
              {lang === 'hi'
                ? 'हमारे शेफ, वेटर, सर्विस कैप्टन और प्रबंधन टीम - सब मिलकर एक परिवार की तरह काम करते हैं।'
                : 'Executive chefs, service captains, cashiers & helpers working with hospitality pride and dedication.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="view-staff-family-pic-btn"
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/90 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition"
              title="View Staff Family AI Picture in full resolution"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'स्टाफ फैमिली फोटो' : 'Staff Family Pic'}</span>
              <Maximize2 className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            <button
              id="open-add-staff-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
            >
              <Plus className="w-4 h-4 text-slate-950 font-black" />
              <span>{lang === 'hi' ? '+ नया कर्मचारी जोड़ें' : '+ Register Staff'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase">{lang === 'hi' ? 'कुल कर्मचारी' : 'Total Staff'}</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{totalStaff}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-800 font-bold uppercase">{lang === 'hi' ? 'आज उपस्थित' : 'Present Today'}</div>
            <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">{presentCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-amber-900 font-bold uppercase">{lang === 'hi' ? 'देरी से (Late)' : 'Late Arrivals'}</div>
            <div className="text-xl font-black text-amber-900 font-mono mt-0.5">{lateCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase">{lang === 'hi' ? 'मासिक पेरोल' : 'Monthly Payroll'}</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">₹{totalPayroll.toLocaleString()}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Subtab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'attendance'
              ? 'bg-[#174a70] text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{lang === 'hi' ? 'दैनिक उपस्थिति रजिस्टर' : "Today's Attendance Register"}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'directory'
              ? 'bg-[#174a70] text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{lang === 'hi' ? 'कर्मचारी विवरण तालिका' : 'Full Staff Directory'}</span>
        </button>

        <button
          id="face-attendance-tab-btn"
          onClick={() => setActiveSubTab('faceAttendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'faceAttendance'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
          }`}
        >
          <Scan className="w-4 h-4 text-emerald-500" />
          <span>{lang === 'hi' ? 'फेस अटेंडेंस (AI / ML)' : 'Face Attendance (ML & HAAR)'}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-950">
            OpenCV
          </span>
        </button>
      </div>

      {/* Face Attendance ML Scanner View */}
      {activeSubTab === 'faceAttendance' && (
        <FaceAttendanceScanner
          staff={staff}
          attendance={attendance}
          onMarkAttendance={(staffId, status, method, notes) => {
            onUpdateAttendance(staffId, status, method, notes);
          }}
          onEnrollFace={onEnrollFace}
          lang={lang}
        />
      )}

      {/* Filter and Search Bar for attendance & directory */}
      {activeSubTab !== 'faceAttendance' && (
      <>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'नाम या आईडी से खोजें...' : 'Search staff by name, ID or mobile...'}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Manager', 'Chef', 'Waiter', 'Cashier', 'Cleaner', 'Kitchen Helper'].map((des) => (
            <button
              key={des}
              onClick={() => setDesignationFilter(des)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                designationFilter === des
                  ? 'bg-[#174a70] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {des}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on sub-tab */}
      {activeSubTab === 'attendance' ? (
        /* Attendance Marking View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {lang === 'hi' ? `उपस्थिति तिथि: ${todayDateStr}` : `Daily Attendance Log: ${todayDateStr}`}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {presentCount} of {staff.length} Present
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Staff ID</th>
                  <th className="px-5 py-3">{lang === 'hi' ? 'नाम' : 'Staff Name'}</th>
                  <th className="px-5 py-3">{lang === 'hi' ? 'पद (Role)' : 'Designation'}</th>
                  <th className="px-5 py-3">{lang === 'hi' ? 'वर्तमान स्थिति' : 'Current Status'}</th>
                  <th className="px-5 py-3">{lang === 'hi' ? 'समय (IN/OUT)' : 'Punch Time'}</th>
                  <th className="px-5 py-3 text-right">{lang === 'hi' ? 'हाजिरी लगाएं' : 'Mark Attendance Today'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.map((member) => {
                  const todayRec = todayRecords.find((r) => r.staff_id === member.staff_id);
                  const currentStatus = todayRec?.attendance_status || 'Present';
                  const badge = getAttendanceBadge(currentStatus);

                  return (
                    <tr key={member.staff_id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3 font-mono font-bold text-[#174a70]">{member.staff_id}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{member.full_name}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                          {member.designation}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                                            <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block max-w-max border border-emerald-100">
                            IN: {todayRec?.check_in_time || '--:--'}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block max-w-max border border-amber-100">
                            OUT: {todayRec?.check_out_time || '--:--'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateAttendance(member.staff_id, 'Present', 'Manual', undefined, 'IN')}
                            title="Manual Punch IN"
                            className="px-2.5 py-1 text-[10px] font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded shadow-sm transition uppercase"
                          >
                            IN
                          </button>
                          <button
                            onClick={() => onUpdateAttendance(member.staff_id, 'Present', 'Manual', undefined, 'OUT')}
                            title="Manual Punch OUT"
                            className="px-2.5 py-1 text-[10px] font-black text-white bg-amber-500 hover:bg-amber-600 rounded shadow-sm transition uppercase"
                          >
                            OUT
                          </button>
                          <span className="w-px h-4 bg-slate-300 mx-1"></span>
                          <button
                            onClick={() => onUpdateAttendance(member.staff_id, 'Absent', 'Manual', undefined, 'MANUAL')}
                            className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded transition uppercase"
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Full Staff Directory Table */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">{lang === 'hi' ? 'कर्मचारी' : 'Full Name'}</th>
                  <th className="px-5 py-3.5">{lang === 'hi' ? 'पद' : 'Designation'}</th>
                  <th className="px-5 py-3.5">{lang === 'hi' ? 'संपर्क' : 'Contact'}</th>
                  <th className="px-5 py-3.5">{lang === 'hi' ? 'पता' : 'Address'}</th>
                  <th className="px-5 py-3.5">{lang === 'hi' ? 'मासिक वेतन' : 'Salary (₹)'}</th>
                  <th className="px-5 py-3.5">{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                  <th className="px-5 py-3.5 text-right">{lang === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.map((s) => (
                  <tr key={s.staff_id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#174a70]">{s.staff_id}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{s.full_name}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                        {s.designation}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{s.mobile_number}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.home_address}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      ₹{s.monthly_salary.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.employment_status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.employment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {userRole === 'Admin' && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                lang === 'hi'
                                  ? `क्या आप ${s.full_name} को रिकॉर्ड से हटाना चाहते हैं?`
                                  : `Remove ${s.full_name} from staff directory?`
                              )
                            ) {
                              onDeleteStaff(s.staff_id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                          title="Remove staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#174a70] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? 'नया कर्मचारी पंजीकृत करें' : 'Register New Staff Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'स्टाफ ID' : 'Staff ID'}
                  </label>
                  <input
                    type="text"
                    value={staffIdInput}
                    onChange={(e) => setStaffIdInput(e.target.value)}
                    placeholder={lang === 'hi' ? 'STF-*** (वैकल्पिक)' : 'Auto-generated'}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'फ़ेस हाजिरी' : 'Face Attendance'}
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 text-xs bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={enrollFaceNow}
                      onChange={(e) => setEnrollFaceNow(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-emerald-800">
                      {lang === 'hi' ? 'रजिस्टर करें' : 'Enroll Face Now'}
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'पूरा नाम (Full Name)' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'पद (Designation)' : 'Designation'}
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Chef">Chef</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Kitchen Helper">Kitchen Helper</option>
                    <option value="Cleaner">Cleaner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'मासिक वेतन (₹)' : 'Monthly Salary (₹)'}
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="18000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'निवास का पता' : 'Home Address'}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Civil Lines, Bareilly"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#174a70] hover:bg-[#123956] text-white rounded-xl text-xs font-bold shadow"
                >
                  {lang === 'hi' ? 'कर्मचारी सहेजें' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Family AI Photo Lightbox Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === 'hi' ? 'राम तारा - हमारा स्टाफ परिवार' : 'Ram Tara Restaurant • Staff Family'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                      AI Generated
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'hi'
                      ? 'रसोई शेफ, सर्विस टीम और प्रबंधन का सौहार्दपूर्ण पारिवारिक चित्र'
                      : 'Hospitality team portrait featuring our head chef, kitchen brigade & service crew'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - High Res Image */}
            <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden max-h-[70vh]">
              <img
                src={staffFamilyBg}
                alt="Ram Tara Staff Family Portrait"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{lang === 'hi' ? 'समर्पित सेवा और आतिथ्य की भावना' : 'Dedicated to warm hospitality & culinary excellence'}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">16:9 Cinematic Ultra HD</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {lang === 'hi' ? 'स्टाफ प्रबंधन डैशबोर्ड में बैकग्राउंड के रूप में सक्रिय है।' : 'Active as hero background in Staff Directory.'}
              </span>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
