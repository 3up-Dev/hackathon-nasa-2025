import { ReactNode } from 'react';

interface TutorialSlideProps {
  icon: ReactNode;
  title: string;
  body: string;
}

export const TutorialSlide = ({ icon, title, body }: TutorialSlideProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center h-full">
      <div className="text-8xl mb-8 animate-bounce">{icon}</div>
      <h2 className="font-pixel text-base text-game-fg mb-6 leading-relaxed">
        {title}
      </h2>
      <p className="font-sans text-game-gray-700 text-base max-w-sm leading-relaxed">
        {body}
      </p>
    </div>
  );
};
