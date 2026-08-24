// src/utils/parseCommand.test.js
import { describe, it, expect } from 'vitest';
import { fallbackParseCommand } from './parseCommand';

describe('fallbackParseCommand - NLP Intent Parsing', () => {
  it('correctly parses an ADD_ITEM intent with quantity', () => {
    const result = fallbackParseCommand('Add 3 apples to my list', 'en-US');
    expect(result.intent).toBe('ADD_ITEM');
    expect(result.item).toBe('apples');
    expect(result.quantity).toBe(3);
  });

  it('correctly parses a REMOVE_ITEM intent', () => {
    const result = fallbackParseCommand('Remove milk', 'en-US');
    expect(result.intent).toBe('REMOVE_ITEM');
    expect(result.item).toBe('milk');
  });

  it('correctly extracts price limits for SEARCH_ITEM', () => {
    const result = fallbackParseCommand('Find toothpaste under $5', 'en-US');
    expect(result.intent).toBe('SEARCH_ITEM');
    expect(result.query).toBe('toothpaste');
    expect(result.maxPrice).toBe(5);
  });

  it('gracefully handles unknown commands', () => {
    const result = fallbackParseCommand('Do a barrel roll', 'en-US');
    expect(result.intent).toBe('UNKNOWN');
  });
});