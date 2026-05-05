import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './DatePicker.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function DatePicker({ value, onChange, placeholder = 'Select date', multiple = false }) {
  const [show, setShow] = useState(false);

  const getArrayValue = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  const arrayValue = multiple ? getArrayValue(value) : [];
  const initialView = multiple ? (arrayValue[0] ? new Date(arrayValue[0]) : new Date()) : new Date(value || Date.now());
  const [viewDate, setViewDate] = useState(initialView);
  const containerRef = useRef(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (day) => {
    const selected = new Date(year, month, day);
    // Use local time to construct the string to avoid timezone shifts
    const y = selected.getFullYear();
    const m = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    if (multiple) {
      const isAlreadySelected = arrayValue.includes(dateStr);
      let newValue;
      if (isAlreadySelected) {
        newValue = arrayValue.filter(d => d !== dateStr);
      } else {
        newValue = [...arrayValue, dateStr].sort(); // Sort the dates
      }
      onChange(newValue.join(', '));
    } else {
      onChange(dateStr);
      setShow(false);
    }
  };

  const isToday = (day) => {
    const n = new Date();
    return day === n.getDate() && month === n.getMonth() && year === n.getFullYear();
  };

  const isSelected = (day) => {
    const selected = new Date(year, month, day);
    const y = selected.getFullYear();
    const m = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    if (multiple) {
      return arrayValue.includes(dateStr);
    } else {
      if (!value) return false;
      return value === dateStr;
    }
  };

  const isPast = (day) => {
    const d = new Date(year, month, day);
    const n = new Date();
    n.setHours(0,0,0,0);
    return d < n;
  };

  const displayValue = multiple ? arrayValue.join(', ') : (value || '');

  return (
    <div className="datepicker-container" ref={containerRef}>
      <div className="datepicker-input-wrapper" onClick={() => setShow(!show)}>
        <input 
          className="input-field" 
          readOnly 
          value={displayValue} 
          placeholder={placeholder}
          title={displayValue}
          style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
        />
        <CalendarIcon size={16} className="datepicker-icon" />
      </div>

      {show && (
        <div className="datepicker-dropdown">
          <div className="datepicker-header">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
              <ChevronLeft size={16} />
            </button>
            <div className="datepicker-title">{MONTHS[month]} {year}</div>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="datepicker-grid-header">
            {DAYS.map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="datepicker-grid">
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} className="empty" />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const past = isPast(day);
              return (
                <div 
                  key={day} 
                  className={`day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${past ? 'past' : ''}`}
                  onClick={() => !past && handleDateSelect(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
