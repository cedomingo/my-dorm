import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '../../Shared/ModalWrapper';
import { Trash2 } from 'lucide-react';

export function ExamModal({ isOpen, onClose, exams, onAddExam, onDeleteExam }) {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [label, setLabel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddExam({
      id: `exam_${Date.now()}`,
      subject,
      date,
      label: label || 'Exam',
    });
    setSubject('');
    setDate('');
    setLabel('');
  };

  const sortedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Exams & Deadlines">
      <form onSubmit={handleSubmit} className="space-y-3 mb-6 bg-blue-50 p-4 rounded-lg">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Label (Exam, Assignment, Project...)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add Exam
        </button>
      </form>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedExams.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No exams yet</p>
        ) : (
          sortedExams.map(exam => (
            <div key={exam.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-bold text-slate-900">{exam.subject}</p>
                <p className="text-xs text-slate-500">{exam.date} - {exam.label}</p>
              </div>
              <button
                onClick={() => onDeleteExam(exam.id)}
                className="text-slate-300 hover:text-red-500 transition p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </ModalWrapper>
  );
}
