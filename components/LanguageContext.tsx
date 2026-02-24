'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'EN' | 'VN';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  EN: {
    login_title: 'COBI WORK',
    login_subtitle: 'Login to continue your work',
    email: 'Email',
    password: 'Password',
    login_btn: 'Login',
    no_account: "Don't have an account?",
    contact_admin: 'Contact Admin',
    booking: 'Booking',
    my_history: 'My history',
    meeting_room: 'Meeting room',
    list_view: 'List view',
    calendar_view: 'Calendar view',
    floor_plan: 'Floor plan',
    package: 'Package',
    date: 'Date',
    time: 'Time',
    guests: 'Guests',
    quick_selection: 'Quick selection for time',
    hourly: 'Hourly',
    booking_btn: 'Booking',
    room_hour: 'room/hour',
    excluding_tax: 'Excluding tax',
    confirm_booking: 'Confirm Booking',
    confirm_msg: 'Are you sure you want to book {room} from {start} to {end}?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    success_msg: 'Booking successful!',
    view_history: 'View History',
    status: 'Status',
    resource: 'Resource',
    start_time: 'Start Time',
    end_time: 'End Time',
    no_history: 'No booking history found.',
    max_guests: 'Max 15 guests',
    past_date_error: 'Cannot select a date in the past',
    past_time_error: 'Cannot select a time in the past',
    logout: 'Logout',
  },
  VN: {
    login_title: 'COBI WORK',
    login_subtitle: 'Đăng nhập để tiếp tục công việc',
    email: 'Email',
    password: 'Mật khẩu',
    login_btn: 'Đăng nhập',
    no_account: 'Chưa có tài khoản?',
    contact_admin: 'Liên hệ quản trị viên',
    booking: 'Đặt chỗ',
    my_history: 'Lịch sử của tôi',
    meeting_room: 'Phòng họp',
    list_view: 'Dạng danh sách',
    calendar_view: 'Dạng lịch',
    floor_plan: 'Sơ đồ tầng',
    package: 'Gói',
    date: 'Ngày',
    time: 'Thời gian',
    guests: 'Số người',
    quick_selection: 'Chọn nhanh thời gian',
    hourly: 'Theo giờ',
    booking_btn: 'Đặt chỗ',
    room_hour: 'phòng/giờ',
    excluding_tax: 'Chưa bao gồm thuế',
    confirm_booking: 'Xác nhận đặt chỗ',
    confirm_msg: 'Bạn có chắc chắn muốn đặt {room} từ {start} đến {end}?',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    success_msg: 'Đặt chỗ thành công!',
    view_history: 'Xem lịch sử',
    status: 'Trạng thái',
    resource: 'Phòng',
    start_time: 'Bắt đầu',
    end_time: 'Kết thúc',
    no_history: 'Không tìm thấy lịch sử đặt chỗ.',
    max_guests: 'Tối đa 15 người',
    past_date_error: 'Không thể chọn ngày trong quá khứ',
    past_time_error: 'Không thể chọn thời gian trong quá khứ',
    logout: 'Đăng xuất',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('EN');

  const t = (key: string) => {
    return (translations[lang] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
