'use client';
import React, { useState, useRef } from 'react';
import { Edit, Paperclip, Image as ImageIcon, X, File as FileIcon } from 'lucide-react';

export default function AdditionalNotes() {
  const initialNotesData = [
    {
      id: 1,
      name: "Abebe Kebede",
      initials: "AK",
      tag: "Field Visit",
      date: "May 24, 2026 - 10:30 AM",
      content: "I am a farmer from Kapashera village. I have all my documents ready, and I would like to apply for a fertilizer loan to purchase inputs for my farm.",
      attachments: [] as string[]
    },
    {
      id: 2,
      name: "John Doe",
      initials: "JD",
      tag: "Office Visit",
      date: "May 22, 2026 - 1:15 PM",
      content: "Client dropped by the office to submit the missing land ownership certificates.",
      attachments: [] as string[]
    }
  ];

  const [notes, setNotes] = useState(initialNotesData);
  const [newNote, setNewNote] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleAddNote = () => {
    if (!newNote.trim() && attachments.length === 0) return;

    const newNoteObj = {
      id: Date.now(),
      name: "Current User",
      initials: "CU",
      tag: "Agent Note",
      date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', ' -'),
      content: newNote,
      attachments: attachments.map(f => f.name)
    };

    setNotes([newNoteObj, ...notes]);
    setNewNote("");
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
    // Reset input value so same file can be selected again if removed
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getAvatarColor = (initials: string) => {
    switch (initials) {
      case 'AK':
        return 'bg-blue-50 text-blue-600';
      case 'JD':
        return 'bg-orange-50 text-orange-600';
      case 'CU':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Field Visit':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Office Visit':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Agent Note':
        return 'bg-green-50 text-green-600 border-green-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="border-b border-gray-200 pb-4 mb-6 -mx-6 px-6 flex items-center gap-2">
        <Edit className="w-5 h-5 text-gray-900" />
        <h3 className="text-lg font-bold text-gray-900">Additional Notes</h3>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this lead..."
          className="w-full h-32 px-4 py-3 text-gray-700 focus:outline-none resize-none placeholder:text-gray-400"
        ></textarea>
        
        {attachments.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-sm">
                <FileIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 max-w-[150px] truncate">{file.name}</span>
                <button onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              onChange={handleFileChange} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Attach files"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={imageInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
            />
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Attach images"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleAddNote}
            disabled={!newNote.trim() && attachments.length === 0}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium px-4 py-1.5 rounded-lg text-sm transition-colors"
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {notes.map((note) => (
          <div key={note.id} className="border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getAvatarColor(note.initials)} flex items-center justify-center font-bold text-xs`}>
                  {note.initials}
                </div>
                <div className="font-bold text-gray-900 text-sm">{note.name}</div>
                <span className={`${getTagColor(note.tag)} text-xs font-medium px-2.5 py-0.5 rounded border`}>
                  {note.tag}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {note.date}
              </div>
            </div>
            {note.content && (
              <p className="text-sm text-gray-700 leading-relaxed pl-11 mb-3">
                {note.content}
              </p>
            )}
            
            {note.attachments && note.attachments.length > 0 && (
              <div className="pl-11 flex flex-wrap gap-2 mt-2">
                {note.attachments.map((fileName, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm">
                    <FileIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 text-xs font-medium max-w-[200px] truncate">{fileName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
