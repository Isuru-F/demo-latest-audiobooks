export function useSorting<T>() {
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const compareStrings = (a: string, b: string, direction: 'asc' | 'desc'): number => {
    const comparison = a.localeCompare(b, undefined, { sensitivity: 'base' })
    return direction === 'asc' ? comparison : -comparison
  }

  const compareDates = (a: string, b: string, direction: 'asc' | 'desc'): number => {
    const dateA = new Date(a).getTime()
    const dateB = new Date(b).getTime()
    const comparison = dateA - dateB
    return direction === 'asc' ? comparison : -comparison
  }

  const sortBy = (
    items: T[],
    key: keyof T | string,
    direction: 'asc' | 'desc' = 'asc',
    type: 'string' | 'date' = 'string'
  ): T[] => {
    if (!items || items.length === 0) {
      return items
    }

    return [...items].sort((a, b) => {
      const valueA = getNestedValue(a, key as string)
      const valueB = getNestedValue(b, key as string)

      if (valueA == null && valueB == null) return 0
      if (valueA == null) return 1
      if (valueB == null) return -1

      if (type === 'date') {
        return compareDates(valueA, valueB, direction)
      }

      return compareStrings(String(valueA), String(valueB), direction)
    })
  }

  return {
    sortBy,
    getNestedValue,
    compareStrings,
    compareDates
  }
}
