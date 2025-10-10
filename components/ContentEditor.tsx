'use client';

import { useState } from 'react';
import {
  Save,
  Download,
  Share2,
  MoreVertical,
  Bold,
  Italic,
  List,
  Heading
} from 'lucide-react';

interface ContentEditorProps {
  selectedProject: string | null;
}

export default function ContentEditor({ selectedProject }: ContentEditorProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');

  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun Progetto Selezionato</h3>
          <p className="text-gray-500">Seleziona un progetto dalla lista per iniziare a modificare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded" title="Bold">
              <Bold size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Italic">
              <Italic size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Heading">
              <Heading size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="List">
              <List size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
              <Share2 size={16} />
              <span>Condividi</span>
            </button>
            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
              <Download size={16} />
              <span>Esporta</span>
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2">
              <Save size={16} />
              <span>Salva</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold border-none outline-none mb-4 focus:ring-0"
            placeholder="Titolo del Documento"
          />

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-4 border-b border-gray-200">
            <span>Ultima modifica: Adesso</span>
            <span>•</span>
            <span>1.234 parole</span>
            <span>•</span>
            <span>5 min di lettura</span>
          </div>

          {/* Content Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[600px] text-lg leading-relaxed border-none outline-none resize-none focus:ring-0"
            placeholder="Inizia a scrivere il tuo contenuto qui..."
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-6 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Salvataggio automatico alle {new Date().toLocaleTimeString('it-IT')}</span>
          <span>Conteggio caratteri: {content.length}</span>
        </div>
      </div>
    </div>
  );
}

function FileText({ className, ...props }: { className?: string;[key: string]: any }) {
  return (
    <svg
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
