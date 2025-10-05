'use client'

import { useState } from 'react'
export default function NotificationsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Thông báo
              </h1>
              <p className="text-gray-600">
                Hệ thống thông báo sẽ được phát triển trong phiên bản tiếp theo.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
