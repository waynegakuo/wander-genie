import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LoadingMessageService {
  private platformId = inject(PLATFORM_ID);
  private readonly messages = [
    'Packing your virtual bags... 🧳',
    'Consulting the travel oracles... 🔮',
    'Finding the best hidden gems... 💎',
    'Mapping out your adventure... 🗺️',
    'Checking weather patterns... ☀️',
    'Scouting local delicacies... 🍜',
    'Securing the best views... 🏔️',
    'Translating local phrases... 🗣️',
    'Calculating the perfect route... 📍',
    'Finding your home away from home... 🏠',
    'Checking for passports... 🛂',
    'Fueling the jet... ✈️',
    'Browsing through souvenirs... 🎭',
    'Booking window seats... 🪟',
    'Checking into your destination... 🏨',
  ];

  private messageSignal = signal(this.messages[0]);
  private interval: any;

  currentMessage = this.messageSignal.asReadonly();

  startCycling() {
    if (isPlatformBrowser(this.platformId) && !this.interval) {
      let index = 0;
      this.messageSignal.set(this.messages[index]);
      this.interval = setInterval(() => {
        index = (index + 1) % this.messages.length;
        this.messageSignal.set(this.messages[index]);
      }, 3000);
    }
  }

  stopCycling() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
