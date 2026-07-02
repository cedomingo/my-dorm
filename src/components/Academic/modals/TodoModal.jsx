import React, { useState } from 'react';
import { ModalWrapper } from '../../Shared/ModalWrapper';

export function TodoModal({ isOpen, onClose, selectedDate, todos, onAddTodo }) {
  const [text, setText] = useState('');
  const dayTodos = todos[selectedDate] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddTodo(selectedDate, text);
    setText('');
    onClose();
  };

  const toggleTodo = (id) => {
    const updated = dayTodos.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    );
    // This will be handled in parent
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Todos - ${selectedDate}`}>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Add a todo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white font-bold px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {dayTodos.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No todos yet</p>
        ) : (
          dayTodos.map(todo => (
            <label key={todo.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                className="rounded text-indigo-500 focus:ring-indigo-400 w-4 h-4 cursor-pointer"
              />
              <span className={`flex-1 text-sm ${todo.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {todo.text}
              </span>
            </label>
          ))
        )}
      </div>
    </ModalWrapper>
  );
}
