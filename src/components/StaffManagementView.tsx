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
  Fingerprint,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Crown,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import { StaffMember, AttendanceRecord, AttendanceStatus } from '../types';
import { FaceAttendanceScanner } from './FaceAttendanceScanner';
import { FaceEnrollmentModal } from './FaceEnrollmentModal';
import staffFamilyBg from '../assets/images/staff_family_bg_1788891496170.jpg';

interface StaffManagementViewProps {
  staff: StaffMember[];
  attendance: AttendanceRecord[];
  onAddStaff: (newStaff: StaffMember) => void;
  onUpdateAttendance: (
    staffId: string,
    status: AttendanceStatus,
    method?: 'Face Recognition' | 'Fingerprint Biometric' | 'Manual',
    notes?: string,
    actionType?: 'IN' | 'OUT' | 'MANUAL'
  ) => void;
  onDeleteStaff: (staffId: string) => void;
  onEnrollFace?: (staffId: string, photoDataUrl: string, descriptor?: number[]) => void;
  onEnrollFingerprint?: (staffId: string, templateHash: string) => void;
  onToggleStaffLogin?: (staffId: string) => void;
  onUpdateStaffLoginCredentials?: (staffId: string, updates: Partial<StaffMember>) => void;
  onToggleRequireFaceLogin?: (required: boolean) => void;
  requireFaceLogin?: boolean;
  lang: 'en' | 'hi';
  userRole?: string;
  ownerFacePhoto?: string;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staff,
  attendance,
  onAddStaff,
  onUpdateAttendance,
  onDeleteStaff,
  onEnrollFace,
  onEnrollFingerprint,
  onToggleStaffLogin,
  onUpdateStaffLoginCredentials,
  onToggleRequireFaceLogin,
  requireFaceLogin = true,
  lang,
  userRole,
  ownerFacePhoto,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'directory' | 'biometrics' | 'login_control'>('attendance');
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Face / Fingerprint Enrollment Modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollTargetStaffId, setEnrollTargetStaffId] = useState<string | undefined>(undefined);

  // Quick Biometric Punch Modal state
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [punchModalStaffId, setPunchModalStaffId] = useState<string | undefined>(undefined);
  const [punchModalInitialMode, setPunchModalInitialMode] = useState<'FACE' | 'FINGERPRINT'>('FACE');

  // Today's date string YYYY-MM-DD
  const todayDateStr = new Date().toISOString().substring(0, 10);

  // New staff form state
  const [staffIdInput, setStaffIdInput] = useState('');
  const [enrollFaceNow, setEnrollFaceNow] = useState(true);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
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

  const handleOpenEnrollment = (staffId?: string) => {
    setEnrollTargetStaffId(staffId || staff[0]?.staff_id);
    setIsEnrollModalOpen(true);
  };

  const handleOpenPunchModal = (staffId: string, initialMode: 'FACE' | 'FINGERPRINT' = 'FACE') => {
    setPunchModalStaffId(staffId);
    setPunchModalInitialMode(initialMode);
    setIsPunchModalOpen(true);
  };

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

    const roleMap: Record<string, any> = {
      Manager: 'Manager',
      Cashier: 'Cashier',
      Waiter: 'Waiter',
      'Cab Driver': 'Waiter',
      Driver: 'Waiter',
      Chef: 'Kitchen',
      'Kitchen Helper': 'Kitchen',
      Cleaner: 'Waiter',
    };
    const assignedRole = roleMap[designation] || 'Waiter';

    onAddStaff({
      staff_id: generatedStaffId,
      full_name: name,
      mobile_number: mobile.trim() || '9999999999',
      email: email.trim() || undefined,
      home_address: address.trim() || 'Bareilly, UP',
      designation,
      monthly_salary: sal,
      joining_date: todayDateStr,
      employment_status: 'Active',
      face_enrolled: false,
      login_enabled: true,
      login_role: assignedRole,
    });

    setIsAddModalOpen(false);
    setStaffIdInput('');
    setEnrollFaceNow(true);
    setFullName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setSalary('');

    // If user checked enroll face now, open enrollment modal immediately
    if (enrollFaceNow) {
      setTimeout(() => {
        handleOpenEnrollment(generatedStaffId);
      }, 300);
    }
  };

  const getAttendanceBadge = (status?: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Present' };
      case 'Late':
        return { bg: 'bg-amber-100 text-amber-900 border-amber-300', label: 'Late' };
      case 'Half Day':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Half Day' };
      case 'Absent':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Absent' };
      case 'On Leave':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-300', label: 'On Leave' };
      default:
        return { bg: 'bg-slate-100 text-slate-600 border-slate-300', label: 'Not Logged' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with AI Staff Family Background */}
      <div className="relative overflow-hidden rounded-3xl p-6 shadow-lg border border-slate-800 text-white min-h-[140px] flex flex-col justify-between">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={staffFamilyBg}
            alt="Restaurant Staff Family AI"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-900/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'राम तारा स्टाफ परिवार • Biometric V2' : 'Ram Tara Staff Directory & Biometrics V2'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow">
              <Users className="w-6 h-6 text-amber-400" />
              <span>{lang === 'hi' ? 'बायोमेट्रिक अटेंडेंस व स्टाफ प्रबंधन' : 'Biometric Attendance & Staff Operations'}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 drop-shadow">
              {lang === 'hi'
                ? 'सुरक्षित चेहरे की पहचान (HAAR Cascade) और फिंगरप्रिंट पंच द्वारा सत्यापित उपस्थिति प्रणाली।'
                : 'Secure face recognition and optical fingerprint punches ensuring authentic and tamper-proof attendance.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Owner Face ID Button */}
            <button
              id="header-owner-face-id-btn"
              type="button"
              onClick={() => handleOpenEnrollment('OWNER')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-lg transition active:scale-95 border border-amber-400/40 cursor-pointer"
              title="Enroll or re-verify Owner Face ID"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span>{lang === 'hi' ? 'ओनर फ़ेस ID' : 'Owner Face ID'}</span>
              {ownerFacePhoto ? (
                <span className="text-[10px] bg-emerald-500/80 px-1.5 py-0.2 rounded text-white font-bold">✓ एनरोल्ड</span>
              ) : (
                <span className="text-[10px] bg-amber-300 text-slate-950 px-1.5 py-0.2 rounded font-black">+ जोड़ें</span>
              )}
            </button>

            {/* Quick Register Face Button */}
            <button
              id="header-register-face-btn"
              type="button"
              onClick={() => handleOpenEnrollment()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition"
            >
              <Scan className="w-4 h-4" />
              <span>{lang === 'hi' ? 'फ़ेस रजिस्टर करें' : 'Register Face'}</span>
            </button>

            {/* Quick Fingerprint Punch Button */}
            <button
              id="header-fingerprint-punch-btn"
              type="button"
              onClick={() => {
                setActiveSubTab('biometrics');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-lg transition"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{lang === 'hi' ? 'बायोमेट्रिक पंच टर्मिनल' : 'Biometric Terminal'}</span>
            </button>

            <button
              id="open-add-staff-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition"
            >
              <Plus className="w-4 h-4 text-slate-950 font-black" />
              <span>{lang === 'hi' ? '+ नया कर्मचारी' : '+ Add Staff'}</span>
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
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeSubTab === 'attendance'
              ? 'bg-[#174a70] text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{lang === 'hi' ? 'दैनिक उपस्थिति रजिस्टर' : "Today's Attendance Register"}</span>
        </button>

        <button
          id="tab-biometric-terminal"
          onClick={() => setActiveSubTab('biometrics')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeSubTab === 'biometrics'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
          }`}
        >
          <Scan className="w-4 h-4 text-emerald-500" />
          <span>{lang === 'hi' ? 'बायोमेट्रिक पंच टर्मिनल (फ़ेस / फिंगरप्रिंट)' : 'Biometric Terminal (Face & Fingerprint)'}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-950">
            OpenCV & WebAuthn
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeSubTab === 'directory'
              ? 'bg-[#174a70] text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{lang === 'hi' ? 'कर्मचारी विवरण व बायोमेट्रिक प्रोफाइल' : 'Staff Profiles & Directory'}</span>
        </button>

        <button
          id="tab-staff-login-control"
          onClick={() => setActiveSubTab('login_control')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeSubTab === 'login_control'
              ? 'bg-[#b14c33] text-white shadow-sm'
              : 'bg-white hover:bg-orange-50 text-[#b14c33] border border-[#e5d8c5]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>{lang === 'hi' ? '🔐 लॉगिन अधिकार व फ़ेस सुरक्षा' : '🔐 Staff Login & Face Security'}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-950">
            {staff.filter((s) => s.login_enabled).length} {lang === 'hi' ? 'चालू' : 'Active'}
          </span>
        </button>
      </div>

      {/* SUBTAB 2: FULL BIOMETRIC ATTENDANCE TERMINAL */}
      {activeSubTab === 'biometrics' && (
        <FaceAttendanceScanner
          staff={staff}
          attendance={attendance}
          onMarkAttendance={(staffId, status, method, notes, actionType) => {
            onUpdateAttendance(staffId, status, method, notes, actionType);
          }}
          onEnrollFace={onEnrollFace}
          onEnrollFingerprint={onEnrollFingerprint}
          onOpenEnrollModal={(staffId) => handleOpenEnrollment(staffId)}
          lang={lang}
        />
      )}

      {/* SUBTAB 4: STAFF LOGIN & BIOMETRIC CONTROL CENTER */}
      {activeSubTab === 'login_control' && (
        <div className="space-y-6">
          {/* Top Control Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-[#b14c33] text-white rounded-2xl shadow-md shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#5c3a21]">
                    {lang === 'hi'
                      ? 'कर्मचारी लॉगिन अधिकार एवं फ़ेस प्रमाणीकरण नियंत्रण'
                      : 'Staff Login Access & Face Verification Control'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-300">
                    {lang === 'hi' ? 'एडमिन सुरक्षा' : 'Admin Security'}
                  </span>
                </div>
                <p className="text-xs text-[#7d5334] mt-1 max-w-2xl leading-relaxed">
                  {lang === 'hi'
                    ? 'एडमिन अपनी इच्छा से किसी भी वेटर, कैब ड्राइवर, कैशियर या अन्य स्टाफ को लॉगिन दे सकता है या बंद कर सकता है। जब भी कोई स्टाफ (या ओनर) लॉगिन करेगा, तो सिस्टम कैमरे से उसका चेहरा मिलाएगा ताकि कोई अन्य व्यक्ति लॉगिन न कर सके।'
                    : 'Admin can grant or revoke login privileges to any waiter, cab driver, cashier, or manager at will. Face verification ensures only the real person can log in.'}
                </p>
              </div>
            </div>

            {/* Strict Face Login Toggle */}
            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-300 shadow-xs flex items-center justify-between gap-4 shrink-0 w-full md:w-auto">
              <div>
                <span className="block text-[11px] font-black text-slate-800">
                  {lang === 'hi' ? 'लॉगिन में फ़ेस वेरिफिकेशन' : 'Login Face Verification'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {requireFaceLogin
                    ? (lang === 'hi' ? 'सख्त नियम चालू ✓' : 'Strict Face ID Enforced')
                    : (lang === 'hi' ? 'वैकल्पिक (Optional)' : 'Optional')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onToggleRequireFaceLogin && onToggleRequireFaceLogin(!requireFaceLogin)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                  requireFaceLogin
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{requireFaceLogin ? (lang === 'hi' ? 'चालू ✓' : 'Active ✓') : (lang === 'hi' ? 'बंद' : 'Off')}</span>
              </button>
            </div>
          </div>

          {/* Owner Face Profile Status Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                {ownerFacePhoto ? (
                  <img
                    src={ownerFacePhoto}
                    alt="Owner Face"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg border-2 border-amber-400">
                    A
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-full shadow">
                  <Crown className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">Ankur gangwar (Owner / मुख्य प्रशासक)</h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  मोबाइल: 7599791753 • a.ankur.gangwar.05@gmail.com
                </p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'ओनर का चेहरा पंजीकृत है। लॉगिन पर ओनर का चेहरा सत्यापित होगा।' : 'Owner biometric enrolled. Face will be verified on login.'}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEnrollment('OWNER')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Scan className="w-4 h-4" />
              <span>{lang === 'hi' ? '📸 ओनर का फ़ेस अपडेट करें' : '📸 Re-Scan Owner Face'}</span>
            </button>
          </div>

          {/* Staff List for Login Control */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {lang === 'hi' ? 'स्टाफ लॉगिन व फ़ेस अधिकार सूची' : 'Staff Login & Biometric Roster'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'hi'
                    ? 'प्रत्येक वेटर, कैशियर, कैब ड्राइवर आदि का लॉगिन चालू/बंद करें और उनकी भूमिका तय करें।'
                    : 'Toggle login access and assigned roles for each staff member.'}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                {staff.length} {lang === 'hi' ? 'कर्मचारी' : 'Staff Members'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.map((s) => {
                const isCab = s.designation === 'Cab Driver' || s.designation === 'Driver';
                const isWaiter = s.designation === 'Waiter';
                const isCashier = s.designation === 'Cashier';
                const isManager = s.designation === 'Manager';
                const isChef = s.designation === 'Chef' || s.designation === 'Kitchen Helper';

                return (
                  <div
                    key={s.staff_id}
                    className={`p-4 rounded-2xl border transition relative flex flex-col justify-between gap-3 ${
                      s.login_enabled
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 opacity-90'
                    }`}
                  >
                    {/* Top Row: Photo + Name + Designation + Login Toggle */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {s.face_photo ? (
                            <img
                              src={s.face_photo}
                              alt={s.full_name}
                              referrerPolicy="no-referrer"
                              className={`w-12 h-12 rounded-2xl object-cover border-2 shadow-xs ${
                                s.face_enrolled ? 'border-emerald-500' : 'border-amber-400'
                              }`}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-black text-sm">
                              {s.full_name.charAt(0)}
                            </div>
                          )}
                          {s.face_enrolled && (
                            <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-600 text-white shadow">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="text-xs font-black text-slate-900">{s.full_name}</h5>
                            <span className="text-[10px] font-mono text-slate-400">({s.staff_id})</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isCab ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                              isWaiter ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                              isCashier ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                              isManager ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {isCab ? '🚖 Cab Driver' : isWaiter ? '🍽️ Waiter' : isCashier ? '💳 Cashier' : isManager ? '👔 Manager' : isChef ? '👨‍🍳 Kitchen' : s.designation}
                            </span>
                            <span className="text-[11px] font-mono text-slate-600">{s.mobile_number}</span>
                          </div>
                        </div>
                      </div>

                      {/* Login Access Switch */}
                      <button
                        type="button"
                        id={`btn-toggle-login-${s.staff_id}`}
                        onClick={() => onToggleStaffLogin && onToggleStaffLogin(s.staff_id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
                          s.login_enabled
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                        }`}
                        title={s.login_enabled ? 'लॉगिन चालू है - क्लिक करके बंद करें' : 'लॉगिन बंद है - क्लिक करके चालू करें'}
                      >
                        {s.login_enabled ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>{lang === 'hi' ? 'लॉगिन चालू ✓' : 'Enabled ✓'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>{lang === 'hi' ? 'लॉगिन बंद ❌' : 'Disabled ❌'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Middle: Assigned Role & PIN / Password */}
                    <div className="grid grid-cols-2 gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          {lang === 'hi' ? 'लॉगिन भूमिका (App Role)' : 'Assigned Role'}
                        </label>
                        <select
                          value={s.login_role || (isCashier ? 'Cashier' : isManager ? 'Manager' : isChef ? 'Kitchen' : 'Waiter')}
                          onChange={(e) => {
                            if (onUpdateStaffLoginCredentials) {
                              onUpdateStaffLoginCredentials(s.staff_id, { login_role: e.target.value as any });
                            }
                          }}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none"
                        >
                          <option value="Waiter">Waiter (ऑर्डर व कैब)</option>
                          <option value="Cashier">Cashier (बिलिंग व कैश)</option>
                          <option value="Manager">Manager (प्रबंधक)</option>
                          <option value="Kitchen">Kitchen (रसोई KOT)</option>
                          <option value="Admin">Admin (पूर्ण अधिकार)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          {lang === 'hi' ? 'लॉगिन पिन / पासवर्ड' : 'Login PIN / Pass'}
                        </label>
                        <input
                          type="text"
                          defaultValue={s.login_pin || (isCab ? 'cab123' : isWaiter ? 'waiter123' : isCashier ? 'cashier123' : '1234')}
                          onBlur={(e) => {
                            if (onUpdateStaffLoginCredentials && e.target.value.trim()) {
                              onUpdateStaffLoginCredentials(s.staff_id, { login_pin: e.target.value.trim() });
                            }
                          }}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none"
                          placeholder="PIN / Pass"
                        />
                      </div>
                    </div>

                    {/* Bottom: Biometric Face Status & Scan Button */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {s.face_enrolled ? (
                          <span className="font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === 'hi' ? 'फ़ेस बायोमेट्रिक पंजीकृत ✓' : 'Face Biometric Enrolled ✓'}</span>
                          </span>
                        ) : (
                          <span className="font-bold text-rose-700 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{lang === 'hi' ? 'फ़ेस बाकी ⚠️ (रजिस्टर करें)' : 'Face Not Enrolled ⚠️'}</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        id={`btn-enroll-face-${s.staff_id}`}
                        onClick={() => handleOpenEnrollment(s.staff_id)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                          s.face_enrolled
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300'
                            : 'bg-[#b14c33] hover:bg-[#8a3824] text-white shadow-xs'
                        }`}
                      >
                        <Scan className="w-3 h-3" />
                        <span>{s.face_enrolled ? (lang === 'hi' ? '📸 री-स्कैन' : 'Re-Scan') : (lang === 'hi' ? '📸 फ़ेस जोड़ें' : 'Enroll Face')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 1 & 3 FILTER BAR */}
      {activeSubTab !== 'biometrics' && activeSubTab !== 'login_control' && (
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
              {['All', 'Manager', 'Chef', 'Waiter', 'Cashier', 'Cab Driver', 'Cleaner', 'Kitchen Helper'].map((des) => (
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

          {/* SUBTAB 1: TODAY'S ATTENDANCE REGISTER */}
          {activeSubTab === 'attendance' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              {/* Table Header Notice */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                    <Scan className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {lang === 'hi'
                          ? `बायोमेट्रिक दैनिक उपस्थिति रजिस्टर • दिनांक: ${todayDateStr}`
                          : `Biometric Attendance Register • Date: ${todayDateStr}`}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {lang === 'hi' ? 'सख्त बायोमेट्रिक नियम' : 'Strict Biometrics'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lang === 'hi'
                        ? 'केवल कैमरे से चेहरे के सत्यापन (Face Scan) या फिंगरप्रिंट से ही IN/OUT दर्ज होगा। कोई मैनुअल बाईपास मान्य नहीं।'
                        : 'Tamper-proof attendance enforced via live camera facial verification or optical fingerprint.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                    {presentCount} / {staff.length} {lang === 'hi' ? 'उपस्थित' : 'Present'}
                  </span>
                  <button
                    id="btn-register-face-top"
                    onClick={() => handleOpenEnrollment()}
                    className="text-xs font-black text-white bg-emerald-700 hover:bg-emerald-600 px-3.5 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{lang === 'hi' ? '📸 फ़ेस रजिस्टर करें' : '📸 Register Face'}</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Staff ID</th>
                      <th className="px-4 py-3">{lang === 'hi' ? 'कर्मचारी' : 'Staff Member'}</th>
                      <th className="px-4 py-3">{lang === 'hi' ? 'पद (Role)' : 'Role'}</th>
                      <th className="px-4 py-3">{lang === 'hi' ? 'फ़ेस रजिस्ट्रेशन' : 'Face Registration'}</th>
                      <th className="px-4 py-3">{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                      <th className="px-4 py-3">{lang === 'hi' ? 'पंच समय (IN / OUT)' : 'Punch Log'}</th>
                      <th className="px-4 py-3 text-right">
                        {lang === 'hi' ? 'सत्यापित बायोमेट्रिक हाजिरी' : 'Verified Biometric Punch'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStaff.map((member) => {
                      const todayRec = todayRecords.find((r) => r.staff_id === member.staff_id);
                      const currentStatus = todayRec?.attendance_status || (todayRec?.check_in_time ? 'Present' : 'Not Logged');
                      const badge = getAttendanceBadge(currentStatus as AttendanceStatus);
                      const hasCheckedIn = !!todayRec?.check_in_time;
                      const hasCheckedOut = !!todayRec?.check_out_time;

                      return (
                        <tr key={member.staff_id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono font-bold text-[#174a70]">
                            {member.staff_id}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              {member.face_photo ? (
                                <img
                                  src={member.face_photo}
                                  alt={member.full_name}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                                  {member.full_name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="block leading-tight text-slate-900 font-bold">{member.full_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{member.mobile_number}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                              {member.designation}
                            </span>
                          </td>

                          {/* DEDICATED FACE REGISTRATION COLUMN */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {member.face_enrolled ? (
                                <div className="flex items-center gap-1">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>{lang === 'hi' ? 'फ़ेस रजिस्टर है' : 'Face Registered'}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEnrollment(member.staff_id)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                                    title={lang === 'hi' ? 'फ़ेस फोटो अपडेट करें' : 'Update face photo'}
                                  >
                                    {lang === 'hi' ? 'अपडेट' : 'Update'}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  id={`btn-enroll-face-row-${member.staff_id}`}
                                  onClick={() => handleOpenEnrollment(member.staff_id)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-black text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition flex items-center gap-1.5 active:scale-95 animate-pulse"
                                  title={lang === 'hi' ? 'इस कर्मचारी का चेहरा रजिस्टर करें' : 'Register face for this staff'}
                                >
                                  <Scan className="w-3.5 h-3.5 text-white" />
                                  <span>{lang === 'hi' ? '📸 फ़ेस रजिस्टर करें' : '📸 Register Face'}</span>
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block max-w-max border border-emerald-100">
                                IN: {todayRec?.check_in_time || '--:--'}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block max-w-max border border-amber-100">
                                OUT: {todayRec?.check_out_time || '--:--'}
                              </span>
                              {todayRec?.verification_method && (
                                <span className="text-[9px] text-slate-400 font-mono">
                                  via {todayRec.verification_method}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* STRICT BIOMETRIC PUNCH ACTIONS (FACE & FINGERPRINT ONLY) */}
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                              {/* If face not enrolled, advise to enroll first */}
                              {!member.face_enrolled ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEnrollment(member.staff_id)}
                                  className="px-3 py-1.5 text-xs font-black text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition flex items-center gap-1.5"
                                  title="Must enroll face before punch"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  <span>{lang === 'hi' ? 'पहले फ़ेस रजिस्टर करें' : 'Enroll Face First'}</span>
                                </button>
                              ) : (
                                <>
                                  {/* Face Punch Button: IN if not IN, OUT if already IN */}
                                  {!hasCheckedIn ? (
                                    <button
                                      id={`btn-face-punch-in-${member.staff_id}`}
                                      onClick={() => handleOpenPunchModal(member.staff_id, 'FACE')}
                                      className="px-3 py-1.5 text-[11px] font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-1.5 active:scale-95"
                                      title={lang === 'hi' ? 'कैमरा स्कैनर से फ़ेस पंच IN करें' : 'Verify via live camera for Punch IN'}
                                    >
                                      <Scan className="w-3.5 h-3.5" />
                                      <span>{lang === 'hi' ? 'फ़ेस पंच IN' : 'Face Punch IN'}</span>
                                    </button>
                                  ) : !hasCheckedOut ? (
                                    <button
                                      id={`btn-face-punch-out-${member.staff_id}`}
                                      onClick={() => handleOpenPunchModal(member.staff_id, 'FACE')}
                                      className="px-3 py-1.5 text-[11px] font-black text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-1.5 active:scale-95"
                                      title={lang === 'hi' ? 'कैमरा स्कैनर से फ़ेस पंच OUT करें' : 'Verify via live camera for Punch OUT'}
                                    >
                                      <Scan className="w-3.5 h-3.5" />
                                      <span>{lang === 'hi' ? 'फ़ेस पंच OUT' : 'Face Punch OUT'}</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenPunchModal(member.staff_id, 'FACE')}
                                      className="px-2.5 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition flex items-center gap-1"
                                      title="Already punched IN and OUT today. Click to re-verify if needed."
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>{lang === 'hi' ? 'पंच पूर्ण ✓' : 'Punched ✓'}</span>
                                    </button>
                                  )}

                                  {/* Fingerprint Punch Button */}
                                  <button
                                    id={`btn-fp-punch-${member.staff_id}`}
                                    onClick={() => handleOpenPunchModal(member.staff_id, 'FINGERPRINT')}
                                    className="px-2.5 py-1.5 text-[11px] font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition flex items-center gap-1 active:scale-95"
                                    title={lang === 'hi' ? 'फिंगरप्रिंट बायोमेट्रिक सेंसर से हाजिरी लगाएं' : 'Punch via Optical/Hardware Fingerprint Sensor'}
                                  >
                                    <Fingerprint className="w-3.5 h-3.5" />
                                    <span>{lang === 'hi' ? 'फिंगरप्रिंट' : 'FP Punch'}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 3: FULL STAFF DIRECTORY WITH BIOMETRIC STATUS */}
          {activeSubTab === 'directory' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">{lang === 'hi' ? 'कर्मचारी' : 'Full Name'}</th>
                      <th className="px-5 py-3.5">{lang === 'hi' ? 'पद' : 'Designation'}</th>
                      <th className="px-5 py-3.5">{lang === 'hi' ? 'बायोमेट्रिक स्थिति' : 'Biometrics'}</th>
                      <th className="px-5 py-3.5">{lang === 'hi' ? 'संपर्क' : 'Contact'}</th>
                      <th className="px-5 py-3.5">{lang === 'hi' ? 'मासिक वेतन' : 'Salary (₹)'}</th>
                      <th className="px-5 py-3.5">{lang === 'hi' ? 'लॉगिन अनुमति' : 'Login Access'}</th>
                      <th className="px-5 py-3.5">{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                      <th className="px-5 py-3.5 text-right">{lang === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStaff.map((s) => (
                      <tr key={s.staff_id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-[#174a70]">{s.staff_id}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            {s.face_photo ? (
                              <img
                                src={s.face_photo}
                                alt={s.full_name}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover border border-emerald-500 shadow-xs"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                {s.full_name.charAt(0)}
                              </div>
                            )}
                            <span>{s.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                            {s.designation}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {/* Face status badge */}
                            <button
                              type="button"
                              onClick={() => handleOpenEnrollment(s.staff_id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition flex items-center gap-1 ${
                                s.face_enrolled
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              <Scan className="w-3 h-3" />
                              <span>{s.face_enrolled ? (lang === 'hi' ? 'फ़ेस ✓' : 'Face ✓') : (lang === 'hi' ? '+ फ़ेस जोड़ें' : '+ Enroll Face')}</span>
                            </button>

                            {/* Fingerprint badge */}
                            <button
                              type="button"
                              onClick={() => handleOpenEnrollment(s.staff_id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition flex items-center gap-1 ${
                                s.fingerprint_enrolled
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              <Fingerprint className="w-3 h-3" />
                              <span>{s.fingerprint_enrolled ? (lang === 'hi' ? 'FP ✓' : 'FP ✓') : (lang === 'hi' ? '+ FP जोड़ें' : '+ FP')}</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">{s.mobile_number}</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          ₹{s.monthly_salary.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => onToggleStaffLogin && onToggleStaffLogin(s.staff_id)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                              s.login_enabled
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                                : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={s.login_enabled ? 'लॉगिन चालू है - क्लिक करके बंद करें' : 'लॉगिन बंद है - क्लिक करके अनुमति दें'}
                          >
                            {s.login_enabled ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{lang === 'hi' ? `चालू ✓ (${s.designation})` : `Active (${s.designation})`}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{lang === 'hi' ? 'लॉगिन बंद' : 'Disabled'}</span>
                              </>
                            )}
                          </button>
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEnrollment(s.staff_id)}
                              className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                              title="Register or update Face / Fingerprint"
                            >
                              {lang === 'hi' ? 'बायोमेट्रिक' : 'Biometrics'}
                            </button>

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
                          </div>
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

      {/* POPUP: MODAL BIOMETRIC PUNCH TERMINAL (Triggered when staff clicks Face/FP Punch) */}
      {isPunchModalOpen && punchModalStaffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <FaceAttendanceScanner
              staff={staff}
              attendance={attendance}
              targetStaffId={punchModalStaffId}
              initialMode={punchModalInitialMode}
              onMarkAttendance={(staffId, status, method, notes, actionType) => {
                onUpdateAttendance(staffId, status, method, notes, actionType);
              }}
              onEnrollFace={onEnrollFace}
              onEnrollFingerprint={onEnrollFingerprint}
              onOpenEnrollModal={(staffId) => {
                setIsPunchModalOpen(false);
                handleOpenEnrollment(staffId);
              }}
              onClose={() => setIsPunchModalOpen(false)}
              lang={lang}
            />
          </div>
        </div>
      )}

      {/* MODAL: FACE & FINGERPRINT ENROLLMENT */}
      <FaceEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        staff={staff}
        selectedStaffId={enrollTargetStaffId}
        onSaveFaceEnrollment={(staffId, photoDataUrl, descriptor) => {
          if (onEnrollFace) onEnrollFace(staffId, photoDataUrl, descriptor);
        }}
        onSaveFingerprintEnrollment={(staffId, templateHash) => {
          if (onEnrollFingerprint) onEnrollFingerprint(staffId, templateHash);
        }}
        lang={lang}
        ownerFacePhoto={ownerFacePhoto}
      />

      {/* MODAL: REGISTER NEW STAFF */}
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
                      {lang === 'hi' ? 'फ़ेस एनरोल करें' : 'Enroll Face Now'}
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
                    {lang === 'hi' ? 'मोबाइल नंबर (SMS OTP)' : 'Mobile Number'}
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
                    {lang === 'hi' ? 'ईमेल / Gmail (वैकल्पिक)' : 'Email / Gmail'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@ramtara.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    <option value="Cab Driver">Cab Driver / Driver</option>
                    <option value="Kitchen Helper">Kitchen Helper</option>
                    <option value="Cleaner">Cleaner</option>
                  </select>
                </div>

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

              {/* Face Enrollment Prompt: Default Checked */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="enroll-face-now-checkbox"
                  checked={enrollFaceNow}
                  onChange={(e) => setEnrollFaceNow(e.target.checked)}
                  className="mt-0.5 rounded text-[#174a70] focus:ring-[#174a70] cursor-pointer"
                />
                <label htmlFor="enroll-face-now-checkbox" className="text-xs text-slate-800 cursor-pointer">
                  <span className="font-bold block text-slate-900">
                    {lang === 'hi' ? '📸 नंबर जोड़ने के तुरंत बाद फ़ेस (चेहरा) रजिस्टर करें' : '📸 Register Face immediately after saving'}
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {lang === 'hi'
                      ? 'स्टाफ लॉगिन करने के लिए सिर्फ अपने मोबाइल नंबर और इस चेहरे का उपयोग करेगा।'
                      : 'Staff will only need their mobile number and this face to log in.'}
                  </span>
                </label>
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
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === 'hi' ? 'राम तारा - हमारा स्टाफ परिवार' : 'Ram Tara Restaurant • Staff Family'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                      AI Portrait
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden max-h-[70vh]">
              <img
                src={staffFamilyBg}
                alt="Ram Tara Staff Family Portrait"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {lang === 'hi' ? 'राम तारा रेस्तरां ईआरपी सिस्टम' : 'Ram Tara Restaurant ERP'}
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
