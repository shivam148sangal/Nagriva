import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  language: Language;
  currentValue?: string;
  fieldLabel?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  language,
  currentValue = '',
  fieldLabel,
  size = 'md',
  className = '',
}) => {
  const t = translations[language];
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          const updated = currentValue ? `${currentValue.trim()} ${finalTranscript.trim()}` : finalTranscript.trim();
          onTranscript(updated);
          setInterimText('');
        } else {
          setInterimText(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init failed:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [language, currentValue, onTranscript]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      alert(t.speechNotSupported);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
      setInterimText('');
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
        // If already started, stop and restart
        try {
          recognitionRef.current?.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
            setIsListening(true);
          }, 150);
        } catch (_) {}
      }
    }
  };

  const buttonDimensions = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3 text-xs md:text-sm gap-2',
    lg: 'h-11 px-4 text-sm md:text-base gap-2.5',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  }[size];

  return (
    <div className="relative inline-flex items-center">
      <button
        id={fieldLabel ? `voice-btn-${fieldLabel.toLowerCase().replace(/\s+/g, '-')}` : 'voice-input-btn'}
        type="button"
        onClick={toggleListening}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={isListening ? t.clickToStop : t.speakBtn}
        className={`inline-flex items-center justify-center font-medium rounded-lg transition-all shadow-sm select-none ${buttonDimensions} ${
          isListening
            ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 hover:border-emerald-400 active:scale-95'
        } ${className}`}
      >
        {isListening ? (
          <>
            <MicOff size={iconSizes} className="animate-bounce text-white" />
            <span className="font-semibold tracking-wide">{language === 'hi' ? 'बोल रहे हैं...' : 'Listening...'}</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </>
        ) : (
          <>
            <Mic size={iconSizes} className="text-emerald-700" />
            <span>{language === 'hi' ? '🎙️ बोलें' : '🎙️ Speak'}</span>
          </>
        )}
      </button>

      {/* Floating active voice transcription pill */}
      {isListening && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 max-w-lg w-11/12 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-600 animate-pulse shrink-0">
            <Mic size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-rose-300 font-medium mb-1">
              <span>{language === 'hi' ? '🎙️ हिंदी आवाज पहचान सक्रिय' : '🎙️ English Speech-to-Text Active'}</span>
              <span className="text-slate-400">{t.clickToStop}</span>
            </div>
            <p className="text-sm font-medium text-slate-100 truncate italic">
              {interimText ? `"${interimText}"` : language === 'hi' ? 'कृपया बोलें... (जैसे: सड़क पर गड्ढा है)' : 'Please speak clearly...'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg shrink-0 transition"
          >
            {language === 'hi' ? 'पूरा हुआ' : 'Done'}
          </button>
        </div>
      )}

      {/* Subtle hover tooltip if not listening */}
      {!isListening && showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-800 text-white text-[11px] rounded-md shadow-lg whitespace-nowrap pointer-events-none z-30 opacity-90">
          {language === 'hi' ? 'बोलकर टाइप करने के लिए क्लिक करें (हिन्दी/English)' : 'Click to Speak via Web Speech API (Hindi/English)'}
        </div>
      )}
    </div>
  );
};
