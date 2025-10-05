/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import * as React from 'react';
import { ProductionTask } from '@/lib/productionEngine';
import { Check, Droplets, Thermometer, Wind, Sprout, Bug } from 'lucide-react';

interface ProductionChecklistProps {
  tasks: ProductionTask[];
  onTaskComplete: (taskId: string) => void;
  lang: 'pt' | 'en';
}

export const ProductionChecklist = ({ tasks, onTaskComplete, lang }: ProductionChecklistProps) => {
  console.log('ProductionChecklist rendered with tasks:', tasks.length);

  const handleTaskClick = (taskId: string, completed: boolean) => {
    console.log('🔵 Task clicked:', { taskId, completed });
    if (!completed) {
      console.log('🟢 Calling onTaskComplete for task:', taskId);
      onTaskComplete(taskId);
    } else {
      console.log('🟡 Task already completed, ignoring click');
    }
  };

  const getIcon = (type: ProductionTask['type']) => {
    switch (type) {
      case 'irrigation':
        return <Droplets className="w-5 h-5" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5" />;
      case 'humidity':
        return <Wind className="w-5 h-5" />;
      case 'nutrition':
        return <Sprout className="w-5 h-5" />;
      case 'pest':
        return <Bug className="w-5 h-5" />;
      default:
        return <Check className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-game-bg border-4 border-game-fg rounded-xl p-4">
      <h3 className="font-pixel text-base text-game-fg mb-4">
        {lang === 'pt' ? 'Tarefas da Semana' : 'Weekly Tasks'}
      </h3>

      <div className="space-y-2">
        {tasks.map((task) => {
          console.log('🔷 Rendering task:', task.id, 'completed:', task.completed);
          return (
            <button
              key={task.id}
              type="button"
              disabled={task.completed}
              className={`w-full text-left border-2 rounded-lg p-3 transition-all ${
                task.completed
                  ? 'bg-game-green-400/20 border-game-green-700 cursor-default'
                  : 'bg-game-gray-200 border-game-fg hover:border-game-green-700 cursor-pointer active:scale-[0.98]'
              }`}
              onClick={() => {
                console.log('🔴 BUTTON CLICKED for task:', task.id);
                handleTaskClick(task.id, task.completed);
              }}
              onPointerUp={() => {
                console.log('🟣 POINTER UP for task:', task.id);
                handleTaskClick(task.id, task.completed);
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded border-2 ${
                    task.completed
                      ? 'bg-game-green-700 border-game-green-700'
                      : 'bg-white border-game-fg'
                  }`}
                >
                  {task.completed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <div className="text-game-fg">{getIcon(task.type)}</div>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-pixel text-xs ${
                      task.completed ? 'text-game-green-700 line-through' : 'text-game-fg'
                    }`}
                  >
                    {task.title[lang]}
                  </p>
                  <p className="font-sans text-xs text-game-gray-700 mt-1">
                    {task.description[lang]}
                  </p>
                </div>

                {!task.completed && (
                  <div className="text-right">
                    <p className="font-pixel text-xs text-game-green-700">+{task.reward}</p>
                    <p className="font-sans text-xs text-game-gray-600">
                      {lang === 'pt' ? 'saúde' : 'health'}
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-game-green-400/20 border-2 border-game-green-700 rounded-lg">
        <p className="font-sans text-xs text-game-gray-700">
          {lang === 'pt'
            ? 'Complete todas as tarefas para maximizar a saúde da sua produção!'
            : 'Complete all tasks to maximize your production health!'}
        </p>
      </div>
    </div>
  );
};
