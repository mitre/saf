import {describe, expect, it} from 'vitest'
import {getNestedValue, setNestedValue} from '../../../src/utils/threshold/helpers.js'

describe('getNestedValue', () => {
  const testObj = {
    simple: 42,
    nested: {
      level1: {
        level2: 'deep value',
        number: 123,
      },
      array: [1, 2, 3],
    },
    compliance: {
      min: 80,
      max: 100,
    },
  }

  it('should get simple property', () => {
    expect(getNestedValue(testObj, 'simple')).toBe(42)
  })

  it('should get nested property', () => {
    expect(getNestedValue(testObj, 'nested.level1.level2')).toBe('deep value')
  })

  it('should get number from nested path', () => {
    expect(getNestedValue<number>(testObj, 'nested.level1.number')).toBe(123)
  })

  it('should get compliance.min', () => {
    expect(getNestedValue(testObj, 'compliance.min')).toBe(80)
  })

  it('should return undefined for non-existent path', () => {
    expect(getNestedValue(testObj, 'does.not.exist')).toBeUndefined()
  })

  it('should return undefined for partial path', () => {
    expect(getNestedValue(testObj, 'nested.level1.level2.tooDeep')).toBeUndefined()
  })

  it('should handle null/undefined safely', () => {
    expect(getNestedValue(null, 'any.path')).toBeUndefined()
    expect(getNestedValue(undefined, 'any.path')).toBeUndefined()
  })

  it('should handle non-object values in path', () => {
    expect(getNestedValue(testObj, 'simple.cannotGoDeeper')).toBeUndefined()
  })

  it('should work with generic type parameter', () => {
    const result = getNestedValue<string>(testObj, 'nested.level1.level2')
    expect(result).toBe('deep value')
    expect(typeof result).toBe('string')
  })
})

describe('setNestedValue', () => {
  it('should set simple property', () => {
    const obj: Record<string, unknown> = {}
    setNestedValue(obj, 'simple', 42)
    expect(obj.simple).toBe(42)
  })

  it('should set nested property (creates intermediate objects)', () => {
    const obj: Record<string, unknown> = {}
    setNestedValue(obj, 'nested.level1.level2', 'deep value')
    expect(getNestedValue(obj, 'nested.level1.level2')).toBe('deep value')
  })

  it('should update existing property', () => {
    const obj: Record<string, unknown> = {existing: 'old'}
    setNestedValue(obj, 'existing', 'new')
    expect(obj.existing).toBe('new')
  })

  it('should create compliance structure', () => {
    const obj: Record<string, unknown> = {}
    setNestedValue(obj, 'compliance.min', 80)
    setNestedValue(obj, 'compliance.max', 100)
    expect(getNestedValue(obj, 'compliance.min')).toBe(80)
    expect(getNestedValue(obj, 'compliance.max')).toBe(100)
  })

  it('should create status.severity.type structure', () => {
    const obj: Record<string, unknown> = {}
    setNestedValue(obj, 'passed.critical.min', 5)
    setNestedValue(obj, 'failed.high.max', 10)
    expect(getNestedValue(obj, 'passed.critical.min')).toBe(5)
    expect(getNestedValue(obj, 'failed.high.max')).toBe(10)
  })

  it('should handle status.total paths', () => {
    const obj: Record<string, unknown> = {}
    setNestedValue(obj, 'passed.total', 19)
    setNestedValue(obj, 'failed.total', 55)
    expect(getNestedValue(obj, 'passed.total')).toBe(19)
    expect(getNestedValue(obj, 'failed.total')).toBe(55)
  })

  it('should overwrite primitive with object if needed', () => {
    const obj: Record<string, unknown> = {nested: 'primitive'}
    setNestedValue(obj, 'nested.newKey', 'value')
    expect(getNestedValue(obj, 'nested.newKey')).toBe('value')
  })

  it('should handle deep nesting (5+ levels)', () => {
    const obj: Record<string, unknown> = {}
    setNestedValue(obj, 'a.b.c.d.e.f', 'deep')
    expect(getNestedValue(obj, 'a.b.c.d.e.f')).toBe('deep')
  })

  it('should set arrays', () => {
    const obj: Record<string, unknown> = {}
    setNestedValue(obj, 'controls', ['V-1', 'V-2'])
    expect(getNestedValue<string[]>(obj, 'controls')).toEqual(['V-1', 'V-2'])
  })

  it('should work with ThresholdValues type', () => {
    const thresholds: Record<string, unknown> = {}
    setNestedValue(thresholds, 'passed.critical.min', 10)
    setNestedValue(thresholds, 'failed.high.max', 5)
    expect(getNestedValue(thresholds, 'passed.critical.min')).toBe(10)
    expect(getNestedValue(thresholds, 'failed.high.max')).toBe(5)
  })
})
