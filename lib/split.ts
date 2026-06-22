/**
 * Divide um valor (em reais) entre N pagantes de forma exata em centavos.
 * O total dividido sempre soma exatamente o valor original — sem perder
 * nem criar centavos. O(s) primeiro(s) pagante(s) absorvem o centavo extra.
 *
 * Ex.: splitAmount(185.61, 2) => [92.81, 92.80]  (soma = 185.61)
 *      splitAmount(100, 3)    => [33.34, 33.33, 33.33]
 */
export function splitAmount(amount: number, parts: number): number[] {
  if (parts <= 0) return []

  const totalCents = Math.round(amount * 100)
  const base = Math.floor(totalCents / parts)
  const remainder = totalCents - base * parts // 0..parts-1 centavos extras

  const result: number[] = []
  for (let i = 0; i < parts; i++) {
    const cents = base + (i < remainder ? 1 : 0)
    result.push(cents / 100)
  }
  return result
}
