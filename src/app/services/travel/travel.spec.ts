import { TestBed } from '@angular/core/testing';

import { TravelService } from './travel.service';
import { extractPreferences } from '../../utils/utility-methods';

describe('TravelService', () => {
  let service: TravelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TravelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('extractPreferences (from Utility)', () => {
    it('should extract groupSize from digits', () => {
      const prefs = extractPreferences('trip for 5 people');
      expect(prefs.groupSize).toBe(5);
    });

    it('should extract groupSize from words as a string', () => {
      const prefs = extractPreferences('A family trip of five people');
      expect(prefs.groupSize).toBe('five');
    });

    it('should extract groupSize from "family of" with digits', () => {
      const prefs = extractPreferences('family of 4 to Paris');
      expect(prefs.groupSize).toBe(4);
    });

    it('should extract groupSize from "family of" with words', () => {
      const prefs = extractPreferences('family of three to Tokyo');
      expect(prefs.groupSize).toBe('three');
    });

    it('should handle "passengers" with words', () => {
      const prefs = extractPreferences('seven passengers from London');
      expect(prefs.groupSize).toBe('seven');
    });

    it('should handle larger number words', () => {
      const prefs = extractPreferences('fifteen people to Bali');
      expect(prefs.groupSize).toBe('fifteen');
    });

    it('should handle complex number words', () => {
      const prefs = extractPreferences('twenty-five people to New York');
      expect(prefs.groupSize).toBe('twenty-five');
    });

    it('should handle "thirty two" without hyphen', () => {
      const prefs = extractPreferences('thirty two passengers to London');
      expect(prefs.groupSize).toBe('thirty two');
    });

    it('should handle "one hundred" people', () => {
      const prefs = extractPreferences('one hundred people to Paris');
      expect(prefs.groupSize).toBe('one hundred');
    });
  });

  describe('TravelService.extractPreferences (wrapper)', () => {
    it('should call the utility method', () => {
      const prefs = service.extractPreferences('trip for 5 people');
      expect(prefs.groupSize).toBe(5);
    });
  });
});
