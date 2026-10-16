import { moveItem } from '../instructor/studio/studio-utils';
import { contrastRatio, parseEmails } from './organization-utils';

describe('organization and studio utilities', () => {
  it('computes WCAG contrast ratios', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
    expect(contrastRatio('#0f766e', '#ffffff')).toBeGreaterThan(4.5);
    expect(contrastRatio('#facc15', '#ffffff')).toBeLessThan(4.5);
  });

  it('splits, deduplicates, and validates invitation emails', () => {
    const result = parseEmails('a@x.com, b@x.com\nA@x.com; not-an-email');
    expect(result.valid).toEqual(['a@x.com', 'b@x.com']);
    expect(result.invalid).toEqual(['not-an-email']);
  });

  it('moves curriculum items without mutating the source', () => {
    const source = ['a', 'b', 'c'];
    expect(moveItem(source, 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(source, 0, -1)).toEqual(['a', 'b', 'c']);
    expect(source).toEqual(['a', 'b', 'c']);
  });
});
