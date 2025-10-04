import * as React from 'react';
import { ProductionTask } from '@/lib/productionEngine';
import { Check, Droplets, Thermometer, Wind, Sprout, Bug } from 'lucide-react';

interface ProductionChecklistProps {
  tasks: ProductionTask[];
  onTaskComplete: (taskId: string) => void;
  lang: 'pt' | 'en';
}

export const ProductionChecklist = ({ tasks, onTaskComplete, lang }: ProductionChecklistProps) => {

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
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`border-2 rounded-lg p-3 transition-all ${
              task.completed
                ? 'bg-game-green-400/20 border-game-green-700'
                : 'bg-game-gray-200 border-game-fg hover:border-game-green-700 cursor-pointer'
            }`}
            onClick={() => !task.completed && onTaskComplete(task.id)}
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
          </div>
        ))}
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
