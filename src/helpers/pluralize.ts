export function pluralize(value: number, choices: string[], prependWithValue: boolean = true): string {
  const word1 = choices[0];
  const word2 = choices[1];
  const word5 = choices[2];

  if (!Number.isInteger(value)) {
    return prependWithValue ? `${value} ${word2}` : word2;
  }

  let n = value % 100;

  if (n >= 5 && n <= 20) {
    return prependWithValue ? `${value} ${word5}` : word5;
  }

  if (n > 19) {
    n %= 10;
  }

  if (n > 4 || n === 0) {
    return prependWithValue ? `${value} ${word5}` : word5;
  }

  if (n === 1) {
    return prependWithValue ? `${value} ${word1}` : word1;
  }

  return prependWithValue ? `${value} ${word2}` : word2;
}
