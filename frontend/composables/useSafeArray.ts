import { ref, computed, ComputedRef } from 'vue'

/**
 * Composable to safely work with arrays that might be null or undefined.
 * Prevents "is not iterable" errors when accessing array methods.
 */
export function useSafeArray<T>(arraySource: ComputedRef<T[] | null | undefined> | T[] | null | undefined) {
  // Create a computed property that ensures the array is valid
  const safeArray = computed<T[]>(() => {
    // Handle computed refs or direct values
    let sourceArray: T[] | null | undefined;
    
    if (arraySource && 'value' in arraySource) {
      // This is a computed ref
      sourceArray = arraySource.value;
    } else {
      // This is a direct value
      sourceArray = arraySource;
    }
    
    // Ensure we have a valid array
    if (!sourceArray || !Array.isArray(sourceArray)) {
      return [];
    }
    return sourceArray;
  });

  // Helper methods that safely wrap common array operations
  const isEmpty = computed(() => safeArray.value.length === 0);
  
  const first = computed<T | undefined>(() => 
    safeArray.value.length > 0 ? safeArray.value[0] : undefined
  );
  
  const last = computed<T | undefined>(() => 
    safeArray.value.length > 0 ? safeArray.value[safeArray.value.length - 1] : undefined
  );
  
  // Safe slice method
  const slice = (start: number, end?: number) => {
    return safeArray.value.slice(start, end);
  };

  // Safe sort method (returns a new sorted array)
  const sort = (compareFn?: (a: T, b: T) => number) => {
    return [...safeArray.value].sort(compareFn);
  };

  // Safe map method
  const map = <U>(callback: (item: T, index: number, array: T[]) => U): U[] => {
    return safeArray.value.map(callback);
  };

  // Safe filter method
  const filter = (predicate: (item: T, index: number, array: T[]) => boolean): T[] => {
    return safeArray.value.filter(predicate);
  };

  // Length property
  const length = computed(() => safeArray.value.length);

  return {
    safeArray,
    isEmpty,
    first,
    last,
    slice,
    sort,
    map,
    filter,
    length
  };
}