// Ranking de gastos por local. Agrupa nomes equivalentes/parecidos:
// "Posto", "POSTO", "posTO", "Pôsto " caem todos no mesmo grupo.

export interface RankedExpense {
  label: string // forma exibida (variação mais frequente do nome)
  total: number
  count: number
}

interface ExpenseLike {
  location: string
  amount: number
}

// Normaliza: minúsculas, sem acento, sem pontuação, espaços colapsados.
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ") // pontuação -> espaço
    .trim()
    .replace(/\s+/g, " ")
}

// Distância de Levenshtein (para juntar nomes quase idênticos / typos).
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

// Dois nomes normalizados são "parecidos"?
function similar(a: string, b: string): boolean {
  if (a === b) return true
  // typos/variações curtas: tolera distância proporcional ao tamanho
  const dist = levenshtein(a, b)
  const minLen = Math.min(a.length, b.length)
  if (minLen >= 4 && dist <= 1) return true
  if (minLen >= 8 && dist <= 2) return true
  return false
}

export function buildRanking(expenses: ExpenseLike[]): RankedExpense[] {
  interface Cluster {
    key: string
    total: number
    count: number
    variants: Map<string, number> // forma original -> frequência
  }
  const clusters: Cluster[] = []

  for (const e of expenses) {
    const original = (e.location || "").trim() || "—"
    const key = normalize(original)

    let cluster = clusters.find((c) => similar(c.key, key))
    if (!cluster) {
      cluster = { key, total: 0, count: 0, variants: new Map() }
      clusters.push(cluster)
    }
    cluster.total += e.amount
    cluster.count += 1
    cluster.variants.set(original, (cluster.variants.get(original) || 0) + 1)
  }

  return clusters
    .map((c) => {
      // rótulo = variação mais frequente (desempate: mais longa)
      let label = "—"
      let best = -1
      for (const [variant, freq] of c.variants) {
        if (freq > best || (freq === best && variant.length > label.length)) {
          best = freq
          label = variant
        }
      }
      return { label, total: c.total, count: c.count }
    })
    .sort((a, b) => b.total - a.total)
}
