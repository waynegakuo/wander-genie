import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Define the interface for the browser API as it's not in standard types yet
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

@Injectable({
  providedIn: 'root',
})
export class SpeechRecognitionService {
  isListening = signal<boolean>(false);
  transcript = signal<string>('');
  error = signal<string | null>(null);
  isSupported = signal<boolean>(false);

  private recognition: any;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeRecognition();
    }
  }

  private initializeRecognition(): void {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const Recognition = SpeechRecognition || webkitSpeechRecognition;

    if (Recognition) {
      this.isSupported.set(true);
      this.recognition = new Recognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening.set(true);
        this.error.set(null);
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // We prefer final transcript, but show interim if that's all we have
        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          this.transcript.set(currentText);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening.set(false);
        this.error.set(event.error);
        console.error('Speech recognition error', event.error);
      };
    } else {
      this.isSupported.set(false);
      console.warn('Speech recognition not supported in this browser');
    }
  }

  start(): void {
    if (this.isSupported() && !this.isListening()) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  }

  stop(): void {
    if (this.isSupported() && this.isListening()) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
  }

  toggle(): void {
    if (this.isListening()) {
      this.stop();
    } else {
      this.start();
    }
  }
}
