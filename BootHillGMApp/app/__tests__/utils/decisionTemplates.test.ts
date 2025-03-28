import {
  getTemplatesForLocation,
  getRandomTemplateForLocation,
  townDecisionTemplates,
  wildernessDecisionTemplates,
  ranchDecisionTemplates,
  allDecisionTemplates
} from '../../utils/decisionTemplates';
import { DecisionImportance } from '../../types/narrative.types';

describe('decisionTemplates', () => {
  describe('template structure', () => {
    it('town templates have the correct structure', () => {
      townDecisionTemplates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.prompt).toBeDefined();
        expect(template.importance).toBeDefined();
        if (typeof template.locationType === 'object' && template.locationType !== null) {
          expect(template.locationType.type).toBe('town');
        } else {
          expect(template.locationType).toBe('any'); // Should not happen for town templates, but satisfies type checker
        }
        expect(template.options.length).toBeGreaterThan(0);
        
        template.options.forEach(option => {
          expect(option.id).toBeDefined();
          expect(option.text).toBeDefined();
          expect(option.impact).toBeDefined();
        });
      });
    });
    
    it('wilderness templates have the correct structure', () => {
      wildernessDecisionTemplates.forEach(template => {
        if (typeof template.locationType === 'object' && template.locationType !== null) {
          expect(template.locationType.type).toBe('wilderness');
        } else {
          expect(template.locationType).toBe('any'); // Should not happen for wilderness templates, but satisfies type checker
        }
      });
    });
    it('ranch templates have the correct structure', () => {
      ranchDecisionTemplates.forEach(template => {
        if (typeof template.locationType === 'object' && template.locationType !== null) {
          expect(template.locationType.type).toBe('landmark');
        } else {
          expect(template.locationType).toBe('any'); // Should not happen for ranch templates, but satisfies type checker
        }
      });
    });
  });
  
  describe('getTemplatesForLocation', () => {
    it('returns town templates when town location specified', () => {
      const templates = getTemplatesForLocation({ type: 'town', name: 'Any Town' });
      
      // Should include all town templates
      expect(templates.length).toBeGreaterThanOrEqual(townDecisionTemplates.length);
      
      // Check if all town templates are included
      townDecisionTemplates.forEach(townTemplate => {
        const found = templates.some(template => template.id === townTemplate.id);
        expect(found).toBe(true);
      });
    });
    
    it('returns wilderness templates when wilderness location specified', () => {
      const templates = getTemplatesForLocation({ type: 'wilderness', description: 'Any Wilderness' });
      
      // Check if all wilderness templates are included
      wildernessDecisionTemplates.forEach(wildernessTemplate => {
        const found = templates.some(template => template.id === wildernessTemplate.id);
        expect(found).toBe(true);
      });
    });
    
    it('includes templates with locationType "any" for all locations', () => {
      // Create a test template with locationType "any"
      const anyLocationTemplate = {
        id: 'test-any-location',
        prompt: 'This can happen anywhere',
        importance: 'moderate' as DecisionImportance,
        locationType: 'any' as const,
        options: [{
          id: 'test-option',
          text: 'Test',
          impact: 'Test impact'
        }],
        contextDescription: 'Test context'
      };
      
      // Add this template to allDecisionTemplates temporarily for the test
      const originalAllTemplates = [...allDecisionTemplates];
      allDecisionTemplates.push(anyLocationTemplate);

      try {
        // Check if this template appears in multiple location types
        const townTemplates = getTemplatesForLocation({ type: 'town', name: 'Any Town' });
        const wildernessTemplates = getTemplatesForLocation({ type: 'wilderness', description: 'Any Wilderness' });
        
        const foundInTown = townTemplates.some(t => t.id === 'test-any-location');
        const foundInWilderness = wildernessTemplates.some(t => t.id === 'test-any-location');
        
        expect(foundInTown).toBe(true);
        expect(foundInWilderness).toBe(true);
      } finally {
        // Restore original templates
        allDecisionTemplates.length = 0;
        originalAllTemplates.forEach(t => allDecisionTemplates.push(t));
      }
    });
  });
  
  describe('getRandomTemplateForLocation', () => {
    it('returns a valid template for known location type', () => {
      const template = getRandomTemplateForLocation({ type: 'town', name: 'Some Town' });
      
      expect(template).not.toBeNull();
      expect(typeof template?.locationType === 'object' ? template?.locationType?.type : template?.locationType).toMatch(/(town|any)/);
    });
    
    it('returns null for unknown location type', () => {
      const template = getRandomTemplateForLocation({ type: 'unknown' });
      expect(template).toBeNull();
    });
  });
});