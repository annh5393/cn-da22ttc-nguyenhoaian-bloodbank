"use client"

import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar } from "@/components/ui/calendar"

export default function TestCalendarPage() {
  const [date, setDate] = useState<Date>()
  const [calendarDate, setCalendarDate] = useState<Date>()

  return (
    <div className="space-y-12 p-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">🗓️ Shadcn/ui Calendar Demo</h1>
        <p className="text-red-100 text-lg">Modern, đẹp, professional - Không còn cùi bắp nữa!</p>
      </div>

      {/* DatePicker Demo */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-600">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <span className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            📅
          </span>
          DatePicker Component
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Chọn ngày sinh
            </label>
            <DatePicker
              value={date}
              onChange={setDate}
              placeholder="Chọn ngày sinh của bạn"
            />
            {date && (
              <p className="mt-3 text-sm text-gray-600">
                Bạn đã chọn: <span className="font-bold text-red-600">{date.toLocaleDateString('vi-VN')}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Disabled DatePicker
            </label>
            <DatePicker
              disabled
              placeholder="Không thể chọn"
            />
          </div>
        </div>
      </div>

      {/* Calendar Demo */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-purple-600">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <span className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            📆
          </span>
          Calendar Component (Inline)
        </h2>
        
        <div className="flex flex-col items-center">
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={setCalendarDate}
            className="rounded-xl border-2 border-gray-200 shadow-lg"
          />
          {calendarDate && (
            <p className="mt-6 text-lg text-gray-700">
              Ngày được chọn: <span className="font-bold text-purple-600">{calendarDate.toLocaleDateString('vi-VN')}</span>
            </p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Đẹp & Modern</h3>
          <p className="text-sm text-gray-600">Tailwind CSS, animations mượt mà, responsive 100%</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
          <div className="text-4xl mb-3">🇻🇳</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Tiếng Việt</h3>
          <p className="text-sm text-gray-600">Hỗ trợ locale tiếng Việt với date-fns</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Customizable</h3>
          <p className="text-sm text-gray-600">Dễ dàng tùy chỉnh màu sắc, style theo ý muốn</p>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">💻 Cách sử dụng</h2>
        <pre className="bg-gray-800 rounded-xl p-4 overflow-x-auto text-sm">
{`import { DatePicker } from "@/components/ui/date-picker"

const [date, setDate] = useState<Date>()

<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Chọn ngày"
/>`}
        </pre>
      </div>
    </div>
  )
}
