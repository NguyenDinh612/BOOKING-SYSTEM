'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, Mail, Lock, AlertCircle, Loader2, CheckCircle2, 
  Globe, Bell, User, ChevronDown, Calendar, Clock, Users,
  Info, Search, MapPin
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import Image from 'next/image';

// --- Types & Data ---

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const ROOMS = [
  { id: 'rm-a-4f', name: 'Meeting Room A - 4F', capacity: 15, floor: '4th floor', image: 'https://picsum.photos/seed/room2/400/300' },
  { id: 'rm-b-4f', name: 'Meeting room B - 4F', capacity: 10, floor: '4th floor', image: 'https://picsum.photos/seed/room3/400/300' },
  { id: 'rm-c-4f', name: 'Meeting room C - 4F', capacity: 7, floor: '4th floor', image: 'https://picsum.photos/seed/room5/400/300' },
  { id: 'rm-a-5f', name: 'Meeting Room A - 5F', capacity: 15, floor: '5th floor', image: 'https://picsum.photos/seed/room1/400/300' },
  { id: 'rm-b-5f', name: 'Meeting Room B - 5F', capacity: 10, floor: '5th floor', image: 'https://picsum.photos/seed/room4/400/300' },
  { id: 'rm-c-5f', name: 'Meeting Room C - 5F', capacity: 7, floor: '5th floor', image: 'https://picsum.photos/seed/room6/400/300' },
];

const TIME_OPTIONS = (() => {
  const options = [];
  for (let h = 6; h <= 22; h++) {
    for (let m of ['00', '15', '30', '45']) {
      if (h === 22 && m !== '00') continue;
      options.push(`${h.toString().padStart(2, '0')}:${m}`);
    }
  }
  return options;
})();

// --- Components ---

const Navbar = ({ user, isAdmin, onLogout, setView }: { user: any, isAdmin: boolean, onLogout: () => void, setView: (v: 'booking' | 'history' | 'admin') => void }) => {
  const { lang, setLang, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.email) return;
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else if (data) {
        setNotifications(data);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user?.email]);

  const markAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_email', user.email)
      .eq('is_read', false);
    
    // Update local state to reflect read status immediately
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(isAdmin ? 'admin' : 'booking')}>
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold leading-none text-center">COBI<br/>WORK</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {!isAdmin && (
            <button 
              onClick={() => setView('booking')}
              className="text-sm font-semibold border-b-2 border-[#FFD700] pb-1"
            >
              {t('booking')}
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => setView('admin')}
              className="text-sm font-semibold border-b-2 border-[#FFD700] pb-1"
            >
              Dashboard
            </button>
          )}
          
          {!isAdmin && (
            <div className="relative">
              <button 
                onMouseEnter={() => setShowHistoryMenu(true)}
                onMouseLeave={() => setShowHistoryMenu(false)}
                onClick={() => setView('history')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                {t('my_history')}
              </button>
              <AnimatePresence>
                {showHistoryMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseEnter={() => setShowHistoryMenu(true)}
                    onMouseLeave={() => setShowHistoryMenu(false)}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden"
                  >
                    <button onClick={() => setView('history')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors">
                      {t('view_history')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4" />
          <span>COBI WORK</span>
          <ChevronDown className="w-4 h-4" />
        </div>

        <div className="relative">
          <button 
            onClick={() => setLang(lang === 'EN' ? 'VN' : 'EN')}
            className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            <span>{lang}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAsRead();
            }}
            className="p-2 bg-slate-100 rounded-full text-slate-600 relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50"
              >
                <h3 className="font-bold text-slate-900 mb-3">Notifications</h3>
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-xl text-xs border transition-all ${
                          n.is_read 
                            ? 'bg-white text-slate-400 border-slate-100 opacity-60' 
                            : 'bg-slate-50 text-slate-700 border-[#FFD700]/30 font-medium'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="line-clamp-2">{n.message}</span>
                          {!n.is_read && <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shrink-0 mt-1" />}
                        </div>
                        <span className="text-[10px] opacity-60">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-[#FFD700] transition-all"
          >
            <User className="w-6 h-6 text-slate-500" />
          </button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
              >
                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                  <p className="text-xs text-slate-500">{isAdmin ? 'Administrator' : 'User'}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogIn className="w-4 h-4 rotate-180" />
                  {t('logout')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

const BookingView = ({ user, onBookingSuccess }: { user: any, onBookingSuccess: () => void }) => {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [guests, setGuests] = useState(1);
  const [userNote, setUserNote] = useState('');
  const [confirmingRoom, setConfirmingRoom] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>(ROOMS);
  const [isSearching, setIsSearching] = useState(false);

  const checkAvailability = async () => {
    setIsSearching(true);
    try {
      const selectedStart = new Date(`${date}T${startTime}:00`).getTime();
      const selectedEnd = new Date(`${date}T${endTime}:00`).getTime();

      if (selectedEnd <= selectedStart) {
        setAvailableRooms([]);
        return;
      }

      // Fetch bookings for the selected date to check for overlaps
      // We check for any booking that isn't 'Cancelled'
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('resource_id, start_time, end_time, status')
        .neq('status', 'Cancelled');

      if (error) throw error;

      const unavailableRoomIds = new Set();
      
      bookings?.forEach(b => {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();

        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        if (selectedStart < bEnd && selectedEnd > bStart) {
          unavailableRoomIds.add(b.resource_id);
        }
      });

      const filtered = ROOMS.filter(room => !unavailableRoomIds.has(room.id));
      setAvailableRooms(filtered);
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Check availability on initial load and when date/time changes
  useEffect(() => {
    const check = async () => {
      await checkAvailability();
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, startTime, endTime]);

  const handleBooking = async () => {
    if (!confirmingRoom) return;
    setIsBooking(true);
    try {
      // Explicitly add +07:00 offset to treat input as GMT+7
      const startDateTime = new Date(`${date}T${startTime}:00+07:00`).toISOString();
      const endDateTime = new Date(`${date}T${endTime}:00+07:00`).toISOString();

      const { error } = await supabase.from('bookings').insert({
        user_email: user.email,
        resource_id: confirmingRoom.id,
        resource_name: confirmingRoom.name,
        start_time: startDateTime,
        end_time: endDateTime,
        status: 'Pending',
        user_note: userNote
      });

      if (error) throw error;

      // Notify Admins
      const { data: admins } = await supabase.from('admins').select('email');
      if (admins) {
        const adminNotifications = admins.map(admin => ({
          user_email: admin.email,
          message: `New booking request from ${user.email} for ${confirmingRoom.name}`,
          type: 'admin'
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }
      
      setUserNote('');
      setConfirmingRoom(null);
      onBookingSuccess();
    } catch (err) {
      console.error(err);
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const isPastDate = (d: string) => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    return d < today;
  };

  const getFilteredStartTimeOptions = () => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    if (date !== today) return TIME_OPTIONS;

    const now = new Date();
    const vnTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    
    const [currentH, currentM] = vnTime.split(':').map(Number);

    return TIME_OPTIONS.filter(time => {
      const [h, m] = time.split(':').map(Number);
      if (h > currentH) return true;
      if (h === currentH && m > currentM) return true;
      return false;
    });
  };

  const filteredStartTimeOptions = getFilteredStartTimeOptions();

  const filteredEndTimeOptions = TIME_OPTIONS.filter(time => {
    const [h, m] = time.split(':').map(Number);
    const [startH, startM] = startTime.split(':').map(Number);
    if (h > startH) return true;
    if (h === startH && m > startM) return true;
    return false;
  });

  useEffect(() => {
    if (filteredStartTimeOptions.length > 0 && !filteredStartTimeOptions.includes(startTime)) {
      setStartTime(filteredStartTimeOptions[0]);
    }
  }, [date, filteredStartTimeOptions, startTime]);

  useEffect(() => {
    if (filteredEndTimeOptions.length > 0 && !filteredEndTimeOptions.includes(endTime)) {
      setEndTime(filteredEndTimeOptions[0]);
    }
  }, [startTime, filteredEndTimeOptions, endTime]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{t('booking')}</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button className="px-6 py-2 bg-[#FFD700] rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
            <Search className="w-4 h-4" /> {t('list_view')}
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          className="px-6 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap bg-[#FFD700]/20 border-[#FFD700] text-slate-900"
        >
          {t('meeting_room')}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10 grid grid-cols-1 md:grid-cols-[1.2fr_1.5fr_0.8fr] gap-6 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('date')}</label>
          <div className="relative">
            <input 
              type="date" 
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFD700]/20 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('time')} (GMT+7)</label>
          <div className="flex items-center gap-2">
            <select 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFD700]/20 outline-none appearance-none"
            >
              {filteredStartTimeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <span className="text-slate-400">—</span>
            <select 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFD700]/20 outline-none appearance-none"
            >
              {filteredEndTimeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('guests')}</label>
          <div className="relative">
            <select 
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#FFD700]/20 outline-none appearance-none"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-10">
        <span className="text-sm font-medium text-slate-500">{t('quick_selection')}:</span>
        {['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t_val => (
          <button 
            key={t_val}
            onClick={() => {
              setStartTime(t_val);
              const [h, m] = t_val.split(':');
              setEndTime(`${String(parseInt(h) + 1).padStart(2, '0')}:${m}`);
            }}
            className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:border-[#FFD700] hover:bg-[#FFD700]/5 transition-all"
          >
            {t_val}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        <AnimatePresence>
          {isSearching && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-3xl"
            >
              <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
            </motion.div>
          )}
        </AnimatePresence>

        {availableRooms.map((room) => (
          <motion.div 
            key={room.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group"
          >
            <div className="relative h-48">
              <Image 
                src={room.image} 
                alt={room.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                <Users className="w-3 h-3" /> {room.capacity}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-slate-900 leading-tight text-lg">{room.name}</h3>
                <Info className="w-4 h-4 text-slate-300 cursor-pointer hover:text-slate-600" />
              </div>
              <button 
                onClick={() => setConfirmingRoom(room)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                {t('booking_btn')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmingRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingRoom(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#FFD700]/20 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-slate-900" />
                </div>
                
                <h2 className="text-3xl font-black tracking-tighter mb-4">{t('confirm_booking')}</h2>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <MapPin className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('resource')}</p>
                      <p className="font-bold text-slate-900">{confirmingRoom.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('date')}</p>
                      <p className="font-bold text-slate-900">{date}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('time')}</p>
                      <p className="font-bold text-slate-900">{startTime} - {endTime}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Note for Admin</p>
                    <textarea 
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="Special requests..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FFD700]/20 outline-none min-h-[80px] resize-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setConfirmingRoom(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="flex-1 py-4 bg-[#FFD700] text-slate-900 rounded-2xl font-black hover:bg-[#FFC800] transition-all shadow-xl shadow-[#FFD700]/20 uppercase tracking-widest text-xs flex items-center justify-center"
                  >
                    {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : t('confirm')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HistoryView = ({ user }: { user: any }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_email', user.email)
      .order('start_time', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setIsLoading(false);
  }, [user.email]);

  useEffect(() => {
    const init = async () => {
      await fetchBookings();
    };
    init();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const formatDateTime = (isoString: string) => {
    // Display in GMT+7
    return new Date(isoString).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold tracking-tight mb-8">{t('my_history')}</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500">{t('no_history')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('resource')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('start_time')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('end_time')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Note</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-slate-900">{b.resource_name}</td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {formatDateTime(b.start_time)}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {formatDateTime(b.end_time)}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                      b.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 italic">
                    {b.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = ({ user }: { user: any }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  
  // Lấy ngày hiện tại theo giờ Việt Nam (GMT+7)
  const getTodayVN = () => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  };
  
  const [selectedDate, setSelectedDate] = useState(getTodayVN());
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [collapsedFloors, setCollapsedFloors] = useState<Set<string>>(new Set());

  const toggleFloor = (floor: string) => {
    const newCollapsed = new Set(collapsedFloors);
    if (newCollapsed.has(floor)) {
      newCollapsed.delete(floor);
    } else {
      newCollapsed.add(floor);
    }
    setCollapsedFloors(newCollapsed);
  };

  const fetchAllBookings = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('start_time', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchAllBookings();
    };
    init();
    const interval = setInterval(fetchAllBookings, 10000);
    return () => clearInterval(interval);
  }, [fetchAllBookings]);

  const handleAction = async (booking: any, status: 'Confirmed' | 'Rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status, notes: note })
        .eq('id', booking.id);

      if (updateError) {
        console.error('Update error:', updateError);
        alert(`Lỗi cập nhật booking: ${updateError.message}\n\nHãy đảm bảo bạn đã chạy lệnh SQL tạo cột 'notes' trong bảng 'bookings'.`);
        return;
      }

      // Notify User (Optional - don't let it block if table missing)
      try {
        await supabase.from('notifications').insert({
          user_email: booking.user_email,
          message: `Your booking for ${booking.resource_name} has been ${status.toLowerCase()}.${note ? ` Note: ${note}` : ''}`,
          type: 'user'
        });
      } catch (nErr) {
        console.warn('Notification failed:', nErr);
      }

      setNote('');
      setActioningId(null);
      await fetchAllBookings();
      alert('Cập nhật thành công!');
    } catch (err: any) {
      console.error('Action error:', err);
      alert('Đã có lỗi xảy ra: ' + err.message);
    }
  };

  const formatDateTime = (isoString: string) => {
    const dateObj = new Date(isoString);
    const time = dateObj.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
    const date = dateObj.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    return { time, date };
  };

  // Availability Grid Logic: 06:00 to 22:00
  const timeSlots = Array.from({ length: 17 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);
  
  const getRoomStatus = (roomId: string, slot: string) => {
    // Tạo mốc thời gian bắt đầu và kết thúc của slot (theo GMT+7)
    const slotStart = new Date(`${selectedDate}T${slot}:00+07:00`).getTime();
    const slotEnd = slotStart + 3600000; // +1 giờ

    const booking = bookings.find(b => {
      // Kiểm tra đúng phòng
      if (b.resource_id !== roomId) return false;
      
      // Bỏ qua các booking đã bị từ chối
      const status = b.status?.toLowerCase();
      if (status === 'rejected') return false;
      
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      
      // Kiểm tra chồng lấn thời gian
      return slotStart < bEnd && slotEnd > bStart;
    });

    if (!booking) return { status: 'free' };
    const status = booking.status?.toLowerCase();
    
    return { 
      status: status === 'confirmed' ? 'booked' : 'pending',
      userName: booking.user_email.split('@')[0],
      booking
    };
  };

  const roomsByFloor = ROOMS.reduce((acc: any, room) => {
    const floor = room.floor || 'Other';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const filteredRoomsByFloor = Object.entries(roomsByFloor).reduce((acc: any, [floor, rooms]: [string, any]) => {
    const filtered = rooms.filter((room: any) => {
      const matchesRoom = selectedRoomId === 'all' || room.id === selectedRoomId;
      return matchesRoom;
    });
    if (filtered.length > 0) acc[floor] = filtered;
    return acc;
  }, {});

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Reservation</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium shadow-sm outline-none focus:border-[#FFD700] w-48"
            />
          </div>
          <select 
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium shadow-sm outline-none focus:border-[#FFD700] w-48"
          >
            <option value="all">All Rooms</option>
            {ROOMS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button 
            onClick={() => {
              setSelectedDate(getTodayVN());
              setSelectedRoomId('all');
            }}
            className="text-sm font-medium text-slate-400 hover:text-slate-600 underline underline-offset-4"
          >
            Clear all
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm mb-6">
          <div className="flex gap-1">
            <button className="px-6 py-2 rounded-lg text-sm font-bold bg-white shadow-md border border-slate-100 text-slate-900">
              Today
            </button>
          </div>
          
          <div className="flex items-center gap-8">
            <h2 className="text-lg font-bold text-slate-900">
              {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </h2>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <div className="w-4 h-4 bg-[#FFD700] rounded" /> Pending
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <div className="w-4 h-4 bg-blue-400 rounded" /> Confirmed
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm relative">
          <div className="overflow-x-auto">
            <div className="min-w-[1800px] relative">
              {/* Grid Header */}
              <div className="flex border-b border-slate-200">
                <div className="w-[200px] p-4 font-bold text-sm text-slate-900 border-r border-slate-200 flex items-center gap-2">
                  Room <ChevronDown className="w-4 h-4" />
                </div>
                {timeSlots.map(slot => (
                  <div key={slot} className="flex-1 p-4 text-xs font-bold text-slate-900 text-center border-r border-slate-200 last:border-r-0">
                    {slot}
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              {Object.entries(filteredRoomsByFloor).map(([floor, rooms]: [string, any]) => (
                <div key={floor}>
                  <div 
                    onClick={() => toggleFloor(floor)}
                    className="bg-slate-50 px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <span>— {floor}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${collapsedFloors.has(floor) ? '-rotate-90' : ''}`} />
                  </div>
                  {!collapsedFloors.has(floor) && rooms.map((room: any) => (
                    <div key={room.id} className="flex border-b border-slate-200 last:border-b-0 group">
                      <div className="w-[200px] p-4 text-xs font-bold text-slate-700 border-r border-slate-200 group-hover:bg-slate-50 transition-colors">
                        {room.name}
                      </div>
                      <div className="flex-1 flex relative">
                        {timeSlots.map(slot => {
                          const info = getRoomStatus(room.id, slot);
                          return (
                            <div 
                              key={slot} 
                              className={`flex-1 border-r border-slate-100 last:border-r-0 min-h-[60px] transition-all relative ${
                                info.status === 'free' ? 'hover:bg-slate-50/50' : ''
                              }`}
                            >
                              {info.status !== 'free' && (
                                <div className={`absolute inset-1 rounded-md flex items-center justify-start px-3 text-[11px] font-bold truncate shadow-sm z-10 ${
                                  info.status === 'booked' ? 'bg-blue-400 text-white' : 'bg-[#FFD700] text-slate-900'
                                }`}>
                                  {info.userName}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <h2 className="text-xl font-black mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#FFD700]" /> Recent Requests
      </h2>
      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time Slot</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Note</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const start = formatDateTime(b.start_time);
              const end = formatDateTime(b.end_time);
              return (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs">
                        {b.user_email[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{b.user_email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-700">{b.resource_name}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900">{start.time} - {end.time}</span>
                      <span className="text-[10px] font-bold text-slate-400">{start.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[200px] text-xs text-slate-600 font-medium truncate" title={b.user_note}>
                      {b.user_note || '-'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                      b.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {b.status === 'Pending' ? (
                      <div className="flex flex-col gap-2">
                        {actioningId === b.id ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 min-w-[250px]"
                          >
                            <textarea 
                              placeholder="Reason/Note for user..." 
                              className="text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#FFD700] min-h-[60px] resize-none font-medium"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAction(b, 'Confirmed')}
                                className="flex-1 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => handleAction(b, 'Rejected')}
                                className="flex-1 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => setActioningId(null)}
                                className="p-2 bg-white text-slate-400 rounded-xl border border-slate-200"
                              >
                                <LogIn className="w-4 h-4 rotate-180" />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <button 
                            onClick={() => setActioningId(b.id)}
                            className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                          >
                            Review Request
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400 italic font-medium">
                        <Info className="w-3 h-3" /> {b.notes || 'No notes provided'}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LoginView = ({ onLogin }: { onLogin: (user: any, isAdmin?: boolean) => void }) => {
  const { t, lang, setLang } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    console.log(`Attempting ${isAdminLogin ? 'Admin' : 'User'} login for:`, data.email);
    
    try {
      const table = isAdminLogin ? 'admins' : 'users';
      const { data: users, error: supabaseError } = await supabase
        .from(table)
        .select('*')
        .eq('email', data.email.trim())
        .eq('password', data.password)
        .single();

      if (supabaseError) {
        console.error('Login error:', supabaseError);
        const errorMsg = lang === 'EN' 
          ? `Login failed: ${supabaseError.message}` 
          : `Đăng nhập thất bại: ${supabaseError.message}. Hãy đảm bảo bạn đã tắt RLS cho bảng '${table}'.`;
        setError(errorMsg);
      } else if (users) {
        onLogin(users, isAdminLogin);
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fcfcfc]">
      <div className="absolute top-8 right-8">
        <button 
          onClick={() => setLang(lang === 'EN' ? 'VN' : 'EN')}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold shadow-sm hover:border-[#FFD700] transition-all"
        >
          <Globe className="w-4 h-4" />
          <span>{lang}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-3xl shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-white text-sm font-black leading-tight text-center">COBI<br/>WORK</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
            {isAdminLogin ? 'Admin Portal' : t('login_title')}
          </h1>
          <p className="text-slate-500 font-medium">
            {isAdminLogin ? 'Management access only' : t('login_subtitle')}
          </p>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 ${isAdminLogin ? 'bg-red-500/10' : 'bg-[#FFD700]/10'} rounded-full -mr-16 -mt-16 blur-3xl transition-colors`} />
          
          {/* Mode Toggle Tab */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 relative z-10">
            <button 
              onClick={() => setIsAdminLogin(false)}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isAdminLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
              User
            </button>
            <button 
              onClick={() => setIsAdminLogin(true)}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isAdminLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                {t('email')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 text-slate-300 group-focus-within:${isAdminLogin ? 'text-red-500' : 'text-[#FFD700]'} transition-colors`} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-current transition-all font-medium"
                  placeholder="name@company.com"
                  style={{ borderColor: 'transparent' }}
                  onFocus={(e) => e.target.style.borderColor = isAdminLogin ? '#ef4444' : '#FFD700'}
                  onBlur={(e) => e.target.style.borderColor = 'transparent'}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1 ml-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                {t('password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 text-slate-300 group-focus-within:${isAdminLogin ? 'text-red-500' : 'text-[#FFD700]'} transition-colors`} />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-current transition-all font-medium"
                  placeholder="••••••••"
                  style={{ borderColor: 'transparent' }}
                  onFocus={(e) => e.target.style.borderColor = isAdminLogin ? '#ef4444' : '#FFD700'}
                  onBlur={(e) => e.target.style.borderColor = 'transparent'}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1 ml-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-4 px-4 ${isAdminLogin ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-[#FFD700] text-slate-900 hover:bg-[#FFC800]'} rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70`}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {isAdminLogin ? 'Admin Login' : t('login_btn')}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-300 uppercase tracking-[0.3em] font-black">
            &copy; 2024 COBI Group &bull; Premium Workspace
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Page ---

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'booking' | 'history' | 'admin'>('booking');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { t } = useLanguage();

  const handleLogin = (userData: any, admin: boolean = false) => {
    setUser(userData);
    setIsAdmin(admin);
    if (admin) setView('admin');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setView('booking');
  };

  const onBookingSuccess = () => {
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setView('history');
    }, 2000);
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} setView={isAdmin ? (v) => setView(v === 'booking' ? 'admin' : v) : setView} />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          {view === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminDashboard user={user} />
            </motion.div>
          ) : view === 'booking' ? (
            <motion.div
              key="booking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <BookingView user={user} onBookingSuccess={onBookingSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HistoryView user={user} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
            >
              <CheckCircle2 className="w-6 h-6" />
              {t('success_msg')}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
