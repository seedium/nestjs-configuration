export default (): Record<string, unknown> => ({
  string: 'value',
  testFalse: false,
  testTrue: true,
  undefined: undefined,
  nested: {
    string: 'value',
    testFalse: false,
    undefined: undefined,
  },
});
