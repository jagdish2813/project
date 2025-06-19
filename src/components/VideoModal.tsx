import React from 'react';
import { X, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Sample video showcasing different designers' work
  const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Replace with actual video

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        <div className="aspect-video">
          <iframe
            src={videoUrl}
            title="TheHomeDesigners Story - Interior Design Portfolio"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-secondary-800 mb-3">
            Our Design Journey
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Watch how our talented designers transform ordinary spaces into extraordinary homes. 
            From traditional Indian aesthetics to modern contemporary designs, see the magic 
            of interior design come to life across different projects and styles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;