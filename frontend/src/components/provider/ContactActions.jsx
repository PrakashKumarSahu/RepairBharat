import React from 'react'
import { Phone, MessageCircle, FileText } from 'lucide-react'

export function ContactActions({ onCall, onWhatsApp, onCreateRequest, phoneNumber, isLoading }) {
  return (
    <>
      <div className="hidden md:fixed md:bottom-6 md:right-6 md:flex md:flex-col md:gap-3">
        <button onClick={onCall} disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
          <Phone className="w-5 h-5" />
          Call
        </button>
        <button onClick={onWhatsApp} disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </button>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="grid grid-cols-3 gap-2 p-4">
          <button onClick={onCall} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <Phone className="w-4 h-4" />
            Call
          </button>
          <button onClick={onWhatsApp} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button onClick={onCreateRequest} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <FileText className="w-4 h-4" />
            Request
          </button>
        </div>
      </div>

      <div className="md:hidden h-20" />
    </>
  )
}
